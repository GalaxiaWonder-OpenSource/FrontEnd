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
import {Organization} from '../../../organizations/model/organization.entity';
import {ProjectStatus} from '../../model/project-status.vo';
import {ProjectRole} from '../../model/project-role.vo';
import {Specialty} from '../../model/specialty.vo';
import {OrganizationService} from '../../../organizations/services/organization.service';
import {ActivatedRoute} from '@angular/router';
import {UserRole} from '../../../iam/model/user-role.vo';
import {PersonId} from '../../../shared/model/person-id.vo';
import {OrganizationId} from '../../../shared/model/organization-id.vo';
import {ProjectId} from '../../../shared/model/project-id.vo';
import {OrganizationMemberId} from '../../../shared/model/organization-member-id.vo';
import {OrganizationMemberType} from '../../../organizations/model/organization-member-type.vo';

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
  userType = UserRole.TYPE_WORKER; // Utilizar el valor correcto definido en el enum
  organizationRole = OrganizationMemberType.CONTRACTOR;

  constructor(
    private projectService: ProjectService,
    private dialog: MatDialog,
    private session: SessionService,
    private projectTeamMemberService: ProjectTeamMemberService,
    private organizationService: OrganizationService,
    private route: ActivatedRoute
  ) {}
  ngOnInit(): void {
    // Obtener el ID de organización de la sesión
    const orgIdFromSession = this.session.getOrganizationId();
    const orgId = orgIdFromSession !== undefined ? String(orgIdFromSession) : null;

    if (!orgId) {
      console.error('No organization ID found in session');
      this.loading.set(false);
      return;
    }

    this.organizationId = orgId;

    this.organizationService.getById({}, {id: orgId}).subscribe({
      next: (organization: Organization) => {
        console.log("Organization loaded:", organization);
        this.currentOrganization.set(organization);
        // Usar el ID directamente en lugar de crear un objeto OrganizationId
        this.loadProjectsForOrganization(orgId);
      },
      error: (err: Error) => {
        console.error(`Failed to load organization with ID ${orgId}:`, err);
        this.loading.set(false);
      }
    });
  }

  loadProjectsForOrganization(organizationId: string): void {
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
    const currentOrg = this.currentOrganization();
    const orgId = currentOrg && currentOrg.id ? String(currentOrg.id) : '';
                 
    const dialogRef = this.dialog.open(CreateProjectModalComponent, {
      width: '500px',
      disableClose: true,
      data: {
        preselectedOrganizationId: orgId
      }
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        try {
          // Obtener el ID de persona
          const personIdVal = this.session.getPersonId();
          if (!personIdVal) {
            throw new Error("No person ID available in session");
          }
          
          const currentOrg = this.currentOrganization();
          if (!currentOrg || !currentOrg.id) {
            throw new Error("Organization ID is required");
          }
          
          const orgIdStr = String(currentOrg.id);
          const personIdStr = String(personIdVal);
          
          const newPro = new Project({
            name: result.name,
            description: result.description,
            startingDate: new Date(result.startingDate),
            endingDate: new Date(result.endingDate),
            status: ProjectStatus.BASIC_STUDIES,
            organizationId: new OrganizationId(result.organizationId || orgIdStr),
            contractor: new OrganizationMemberId(personIdStr),
            contractingEntityId: new PersonId(personIdStr)
          });

          this.projectService.create(newPro).subscribe({
            next: (createdProject: Project) => {
              // Obtener el ID de persona nuevamente
              const personIdVal = this.session.getPersonId();
              if (!personIdVal) {
                console.error("No person ID available in session");
                return;
              }
              
              // Convertir ProjectId a number para ProjectTeamMember
              const projectIdNum = parseInt(createdProject.id.toString(), 10);
              const personIdNum = parseInt(String(personIdVal), 10);
              
              // Crear un nuevo miembro del equipo del proyecto
              const member = new ProjectTeamMember({
                id: 0, // ID temporal, será reemplazado por el backend
                role: ProjectRole.COORDINATOR,
                specialty: Specialty.ARCHITECTURE,
                memberId: personIdNum,
                personId: personIdNum,
                projectId: projectIdNum
              });

              console.log('Project created successfully:', createdProject);

              this.projectTeamMemberService.create(member).subscribe({
                next: () => {
                  console.log('Project team member created successfully');
                  // Recargar los proyectos de la organización actual
                  if (this.currentOrganization()) {
                    const orgIdStr = this.currentOrganization()!.id ? 
                                    String(this.currentOrganization()!.id) : '';
                    if (orgIdStr) {
                      this.loadProjectsForOrganization(orgIdStr);
                    }
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
