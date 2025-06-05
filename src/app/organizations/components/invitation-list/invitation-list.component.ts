import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { OrganizationInvitationService } from '../../services/organization-invitation.service';
import { OrganizationInvitation } from '../../model/organization-invitation.entity';
import { InvitationStatus } from '../../model/invitation-status.vo';
import { formatDate } from '@angular/common';
import { Person } from '../../../iam/model/person.entity';
import { PersonService } from '../../../iam/services/person.service';

@Component({
  selector: 'app-invitation-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './invitation-list.component.html'
})
export class InvitationListComponent implements OnInit {
  private invitationService = inject(OrganizationInvitationService);
  private personService = inject(PersonService);

  invitations: {
    invitation: OrganizationInvitation;
    person: Person;
  }[] = [];

  loading = false;

  async ngOnInit(): Promise<void> {
    this.loading = true;

    try {
      const rawInvitations = await this.invitationService.getAll().toPromise();
      const enriched = await Promise.all(
        rawInvitations.map(async (inv: any) => {
          const invitation = new OrganizationInvitation(inv);
          const person = await this.personService.getById(invitation.personId.value).toPromise();
          return { invitation, person };
        })
      );

      this.invitations = enriched;
    } catch (error) {
      console.error('Error loading invitations', error);
    } finally {
      this.loading = false;
    }
  }

  formatStatus(status: InvitationStatus): string {
    switch (status) {
      case InvitationStatus.PENDING: return 'Pendiente';
      case InvitationStatus.ACCEPTED: return 'Aceptada';
      case InvitationStatus.REJECTED: return 'Rechazada';
    }
  }

  formatDate(date: Date): string {
    return formatDate(date, 'medium', 'en-US'); // o 'es-PE'
  }
}
