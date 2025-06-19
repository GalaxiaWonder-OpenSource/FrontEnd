import {Component, OnInit, signal} from '@angular/core';
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
import {ProjectStatus} from '../../model/project-status.vo';
import {ProjectRole} from '../../model/project-role.vo';
import {Specialty} from '../../model/specialty.vo';
import {OrganizationService} from '../../../organizations/services/organization.service';

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
  loading = signal<boolean>(true);
  organizationId: number | null = null;

  constructor(
    private projectService: ProjectService,
    private dialog: MatDialog,
    private session: SessionService,
    private projectTeamMemberService: ProjectTeamMemberService,
    private organizationService: OrganizationService
  ) {}
  ngOnInit(): void {
    const orgId = this.session.getOrganizationId() ?? null;

    if (!orgId) {
      this.loading.set(false);
      return;
    }

    this.organizationService.getById({}, {id: orgId}).subscribe({
      error: (err: Error) => {
        console.error(`Failed to load organization with ID ${orgId}:`, err);
        this.loading.set(false);
      }
    });

    this.organizationId = orgId;
    this.loadProjectsForOrganization(orgId);
  }

  loadProjectsForOrganization(organizationId: number): void {
    this.loading.set(true);

    this.projectService.getAll().subscribe({
      next: (allProjects: Project[]) => {
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
    if (!this.organizationId) {
      console.error("Cannot create a project without an organization");
      return;
    }

    const dialogRef = this.dialog.open(CreateProjectModalComponent, {
      width: '500px',
      disableClose: true,
      data: {
        preselectedOrganizationId: this.organizationId
      }
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        try {
          if (!this.session.getPersonId()) {
            throw new Error("No person ID available in session");
          }

          if (!this.organizationId) {
            throw new Error("Organization ID is required");
          }

          const personIdNum = this.organizationId; // ???

          const newPro = new Project({
            name: result.name,
            description: result.description,
            startingDate: new Date(result.startingDate),
            endingDate: new Date(result.endingDate),
            status: ProjectStatus.BASIC_STUDIES,
            organizationId: this.organizationId,
            contractingEntityId: personIdNum, // ???
            currentUserRoleOnProject: ProjectRole.COORDINATOR
          });

          this.projectService.create(newPro).subscribe({
            next: (createdProject: Project) => {
              const member = new ProjectTeamMember({
                role: ProjectRole.COORDINATOR,
                specialty: Specialty.ARCHITECTURE,
                memberId: personIdNum,
                personId: personIdNum,
                projectId: createdProject.id
              });

              this.projectTeamMemberService.create(member).subscribe({
                next: () => {
                  if(this.organizationId) this.loadProjectsForOrganization(this.organizationId);
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
