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
import {UserType} from '../../../iam/model/user-type.vo';
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
  organizationId: number | null = null;
  userType = UserType.TYPE_WORKER; // Utilizar el valor correcto definido en el enum
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
    const orgId = orgIdFromSession !== undefined ? Number(orgIdFromSession) : null;

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

  loadProjectsForOrganization(organizationId: number): void {
    this.loading.set(true);

    this.projectService.getAll().subscribe({
      next: (allProjects: Project[]) => {
        // Filtrar proyectos por organización
        const orgProjects = allProjects.filter(project =>
          project.organizationId && Number(project.organizationId) === organizationId
        );

        this.projects.set(orgProjects);
        this.loading.set(false);

        console.log(`Loaded ${orgProjects.length} projects for organization ${organizationId}`);
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
    const orgId = currentOrg && currentOrg.id ? Number(currentOrg.id) : 0;

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

          const orgIdNum = Number(currentOrg.id);
          const personIdNum = Number(personIdVal);

          const newPro = new Project({
            name: result.name,
            description: result.description,
            startingDate: new Date(result.startingDate),
            endingDate: new Date(result.endingDate),
            status: ProjectStatus.BASIC_STUDIES,
            organizationId: result.organizationId || orgIdNum,
            contractor: personIdNum,
            contractingEntityId: personIdNum
          });

          this.projectService.create(newPro).subscribe({
            next: (createdProject: Project) => {
              // Obtener el ID de persona nuevamente
              const personIdVal = this.session.getPersonId();
              if (!personIdVal) {
                console.error("No person ID available in session");
                return;
              }

              // Ya no es necesario convertir los IDs ya que ya son numbers
              const projectIdNum = createdProject.id;
              const personIdNum = Number(personIdVal);

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
                    const orgIdNum = this.currentOrganization()!.id ?
                                    Number(this.currentOrganization()!.id) : 0;
                    if (orgIdNum) {
                      this.loadProjectsForOrganization(orgIdNum);
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
