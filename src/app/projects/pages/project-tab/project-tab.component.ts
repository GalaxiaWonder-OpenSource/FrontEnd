import {Component, signal, OnInit} from '@angular/core';
import {MatButtonModule} from "@angular/material/button";
import {MatDividerModule} from "@angular/material/divider";
import {TranslatePipe} from "@ngx-translate/core";
import {CommonModule} from '@angular/common';
import {MatTabsModule} from '@angular/material/tabs';
import {ProjectListComponent} from '../../components/project-list/project-list.component';
import {Project} from '../../model/project.entity';
import {MatDialog} from '@angular/material/dialog';
import {SessionService} from '../../../iam/services/session.service';
import {ProjectService} from '../../services/project.service';
import {ProjectTeamMemberService} from '../../services/project-team-member.service';
import {ProjectTeamMember} from '../../model/project-team-member.entity';
import {CreateProjectModalComponent} from '../../components/create-project-modal/create-project-modal.component';
import {PersonId} from '../../../shared/model/person-id.vo';
import {Organization} from '../../../organizations/model/organization.entity';
import {ProjectStatus} from '../../model/project-status.vo';
import {ProjectRole} from '../../model/project-role.vo';
import {Specialty} from '../../model/specialty.vo';
import {OrganizationId} from '../../../shared/model/organization-id.vo';
import {OrganizationService} from '../../../organizations/services/organization.service';
import {ActivatedRoute} from '@angular/router';

@Component({
  selector: 'app-project-tab',
    standalone: true,
    imports: [
      CommonModule,
      MatTabsModule,
      MatDividerModule,
      MatButtonModule,
      ProjectListComponent,
      TranslatePipe
    ],
  templateUrl: './project-tab.component.html',
  styleUrl: './project-tab.component.css'
})
export class ProjectTabComponent implements OnInit {
  projects = signal<Project[]>([]);
  currentOrganization = signal<Organization | null>(null);
  loading = signal<boolean>(true);
  organizationId: string | null = null;

  constructor(
    private projectService: ProjectService,
    private dialog: MatDialog,
    private session: SessionService,
    private projectTeamMemberService: ProjectTeamMemberService,
    private organizationService: OrganizationService,
    private route: ActivatedRoute
  ) {}
  ngOnInit(): void {
    // Obtener el ID de la organización desde la ruta
    this.route.parent?.paramMap.subscribe(params => {
      // En el contexto de la organización, buscamos 'orgId'
      this.organizationId = params.get('orgId');
      console.log("OrganizationId from route parent:", this.organizationId);
      
      if (this.organizationId) {
        this.loadOrganizationById(this.organizationId);
      } else {
        console.error("No organization ID provided in route");
        this.loading.set(false);
      }
    });
  }

  loadOrganizationById(orgId: string): void {
    const personId = this.session.getPersonId();
    if (!personId) {
      console.warn('No person ID found in session. Cannot load organization.');
      this.loading.set(false);
      return;
    }

    this.organizationService.getById({}, {id: orgId}).subscribe({
      next: (organization: Organization) => {
        console.log("Organization loaded:", organization);
        this.currentOrganization.set(organization);
        this.loadProjectsForOrganization(new OrganizationId(orgId));
      },
      error: (err: Error) => {
        console.error(`Failed to load organization with ID ${orgId}:`, err);
        this.loading.set(false);
      }
    });
  }

  loadProjectsForOrganization(organizationId: OrganizationId): void {
    this.loading.set(true);
    
    this.projectService.getAll().subscribe({
      next: (allProjects: Project[]) => {
        // Filtrar proyectos por organización
        const orgProjects = allProjects.filter(project => 
          project.organizationId && project.organizationId.toString() === organizationId.toString()
        );
        
        this.projects.set(orgProjects);
        this.loading.set(false);
        
        console.log(`Loaded ${orgProjects.length} projects for organization ${organizationId.toString()}`);
      },
      error: (err: Error) => {
        console.error(`Failed to load projects for organization ${organizationId.toString()}:`, err);
        this.loading.set(false);
      }
    });
  }

  openCreateDialog(): void {
    if (!this.currentOrganization()) {
      console.error("Cannot create a project without an organization");
      return;
    }

    console.log('Opening create project dialog');
    const dialogRef = this.dialog.open(CreateProjectModalComponent, {
      width: '500px',
      disableClose: true,
      data: {
        preselectedOrganizationId: this.currentOrganization()?.id.toString()
      }
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        try {
          const creatorId = new PersonId(this.session.getPersonId()?.toString() || '');
          const newPro = new Project({
            name: result.name,
            description: result.description,
            startingDate: new Date(result.startingDate),
            endingDate: new Date(result.endingDate),
            status: ProjectStatus.BASIC_STUDIES,
            organizationId: result.organizationId || this.currentOrganization()?.id,
            contractor: creatorId,
            contractingEntityId: creatorId
          });

          this.projectService.create(newPro).subscribe({
            next: (createdProject: Project) => {
              // Crear un nuevo miembro del equipo del proyecto
              const member = new ProjectTeamMember({
                role: ProjectRole.COORDINATOR,
                specialty: Specialty.ARCHITECTURE,
                memberId: creatorId,
                personId: creatorId,
                projectId: createdProject.id
              });

              console.log('Project created successfully:', createdProject);

              this.projectTeamMemberService.create(member).subscribe({
                next: () => {
                  console.log('Project team member created successfully');
                  // Recargar los proyectos de la organización actual
                  if (this.currentOrganization()) {
                    this.loadProjectsForOrganization(this.currentOrganization()!.id);
                  }
                },
                error: (err: Error) => console.error('Failed to create project team member:', err)
              });
            },
            error: (err: Error) => console.error('Failed to create project:', err)
          });

        } catch (err) {
          console.error('Validation failed when creating project:', err);
        }
      }
    });
  }
}
