import {Component, signal} from '@angular/core';
import { CommonModule } from '@angular/common';
import {SessionService} from '../../../iam/services/session.service';
import {MatCard, MatCardContent, MatCardTitle} from '@angular/material/card';
import {OrganizationMember} from '../../model/organization-member.entity';
import {OrganizationMemberService} from '../../services/organization-member.service';

@Component({
  selector: 'app-members',
  standalone: true,
  imports: [CommonModule, MatCardContent, MatCardTitle, MatCard],
  templateUrl: './members.component.html',
  styleUrls: ['./members.component.css']
})
export class MembersComponent {

  members = signal<OrganizationMember[]>([]);

  constructor(
    private session: SessionService, private organizationMemberService: OrganizationMemberService
  ){
    this.loadMembers();
  }

  private loadMembers() {

    const organizationId = this.session.getOrganizationId();
    if (!organizationId) {
      console.warn('... Aborting members load.');
      return;
    }

    this.organizationMemberService.getByOrganizationId({ organizationId }).subscribe({
      next: (members: OrganizationMember[]) => {
        console.log('Members loaded:', members);
        this.members.set(members);
      },
      error: (err: any) => {
        console.error('Failed to load members', err);
      }
    });
  }
}
