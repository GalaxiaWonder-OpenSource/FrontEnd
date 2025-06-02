import {Component, signal} from '@angular/core';
import { CommonModule } from '@angular/common';
import {SessionService} from '../../../iam/services/session.service';
import {ProjectTeamMember} from '../../../projects/model/project-team-member.entity';
import {ProjectTeamMemberService} from '../../../projects/services/project-team-member.service';
import {MatCard, MatCardContent, MatCardTitle} from '@angular/material/card';

@Component({
  selector: 'app-members',
  standalone: true,
  imports: [CommonModule, MatCardContent, MatCardTitle, MatCard],
  templateUrl: './members.component.html',
  styleUrls: ['./members.component.css']
})
export class MembersComponent {

  members = signal<ProjectTeamMember[]>([]);

  constructor(
    private session: SessionService, private projectService: ProjectTeamMemberService
  ){
    this.loadMembers();
  }

  private loadMembers() {

    const projectId = this.session.getProjectId();
    if (!projectId) {
      console.warn('... Aborting members load.');
      return;
    }

    this.projectService.getByProjectId({ projectId }).subscribe({
      next: (members: ProjectTeamMember[]) => {
        console.log('[MembersComponent] Members loaded:', members);
        this.members.set(members);
      },
      error: (err: any) => {
        console.error('Failed to load members', err);
      }
    });
  }
}
