import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { OrganizationMember } from '../../model/organization-member.entity';

@Component({
  selector: 'app-member-card',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatIconModule, MatButtonModule],
  templateUrl: './member-card.component.html',
  styleUrls: ['./member-card.component.css']
})
export class MemberCardComponent {
  @Input() member!: {
    memberType: string;
    joinedAt: Date;
    fullName: string;
    email: string;
    member: OrganizationMember;
  };

  @Input() isCreator: boolean = false;
  @Input() currentPersonId: string | null = null;

  @Output() removeMember = new EventEmitter<OrganizationMember>();

  getInitials(fullName: string): string {
    return fullName
      .split(' ')
      .map(p => p[0])
      .join('')
      .toUpperCase();
  }

  /**
   * Determines if the current member can be removed.
   * The creator cannot remove themselves if they are a CONTRACTOR.
   * @returns {boolean} Whether the member is eligible for removal.
   */
  canBeRemoved(): boolean {
    const personId = this.member.member.personId;

    return this.isCreator &&
           !(this.member.memberType === 'CONTRACTOR' &&
             personId != null && personId.toString() === this.currentPersonId);
  }

  /**
   * Emits the removeMember event with the current OrganizationMember.
   */
  onRemoveMember(): void {
    this.removeMember.emit(this.member.member);
  }
}
