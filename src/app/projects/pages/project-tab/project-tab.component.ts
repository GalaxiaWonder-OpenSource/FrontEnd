import {Component, signal} from '@angular/core';
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
import {Ruc} from '../../../organizations/model/ruc.vo';
import {OrganizationStatus} from '../../../organizations/model/organization-status.vo';
import {OrganizationMember} from '../../../organizations/model/organization-member.entity';
import {OrganizationMemberType} from '../../../organizations/model/organization-member-type.vo';
import {ProjectStatus} from '../../model/project-status.vo';
import {ProjectTeamMemberId} from '../../../shared/model/project-team-member-id.vo';
import {ProjectId} from '../../../shared/model/project-id.vo';

@Component({
  selector: 'app-project-tab',
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
export class ProjectTabComponent {
    projects = signal<Project[]>([]);

    constructor(
      private projectService: ProjectService,
      private dialog: MatDialog,
      private session: SessionService,
      private projectTeamMemberService: ProjectTeamMemberService,
    ){
      this.loadProjects();
    }

    loadProjects(): void {
      const projectTeamMemberId = this.session.getPersonId();

      if (!projectTeamMemberId) {
        console.warn('No project team member ID found in session. Aborting project load.');
        return;
      }

      this.projectTeamMemberService.getAll().subscribe({
        next: (memberships: ProjectTeamMember[]) => {
          const myMemberships = memberships.filter(m =>
            m.personId.toString() === projectTeamMemberId.toString()
          );

          const proIds = myMemberships.map(m => m.projectId);

          const projectRequests = proIds.map(id =>
            this.projectService.getById({}, {id})
          );

          Promise.all(projectRequests.map(obs => obs.toPromise())).then(
            (projects) => {
              this.projects.set(projects);
            },
            (error) => {
              console.error('Failed to load one or more projects:', error);
            }
          );
        },
        error: (err: any) => {
          console.error('Failed to load project memberships:', err);
        }
      });
    }

  openCreateDialog(): void {
    const dialogRef = this.dialog.open(CreateProjectModalComponent, {
      width: '500px',
      disableClose: true
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        try {
          const creatorId = new PersonId(this.session.getPersonId()?.toString());
          const newPro = new Project({
            name: result.name,
            description: result.description,
            startingDate: new Date(result.startingDate),
            endingDate: new Date(result.endingDate),
            status: ProjectStatus.BASIC_STUDIES,
            organizationId: result.organizationId,
            contractor: new ProjectTeamMemberId(),
            contractingEntityId: result.creator
          });

          this.projectService.create(newPro).subscribe({
            next: (createdOrg: Organization) => {
              const member = new OrganizationMember({
                personId: creatorId,
                organizationId: createdOrg.id,
                memberType: OrganizationMemberType.CONTRACTOR
              });

              /*this.organizationMemberService.create(member).subscribe({
                next: () => this.loadOrganizations(),
                error: (err: any) => console.error('Failed to create organization member:', err)
              });*/
            },
            error: (err: any) => console.error('Failed to create organization:', err)
          });

        } catch (err) {
          console.error('Validation failed when creating organization:', err);
        }
      }
    });
  }
}
