import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { OrganizationInvitation } from '../../model/organization-invitation.entity';
import { InvitationStatus } from '../../model/invitation-status.vo';
import { OrganizationInvitationService } from '../../services/organization-invitation.service';
import { SessionService } from '../../../iam/services/session.service';
import { OrganizationMemberService } from '../../services/organization-member.service';
import {TranslatePipe} from '@ngx-translate/core';
import {OrganizationService} from '../../services/organization.service';
import {PersonService} from '../../../iam/services/person.service';
import {Person} from '../../../iam/model/person.entity';

@Component({
  selector: 'app-invitation-list',
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatChipsModule,
    MatSnackBarModule,
    MatProgressSpinnerModule,
    TranslatePipe
  ],
  templateUrl: './invitation-list.component.html',
  styleUrls: ['./invitation-list.component.css']
})
export class InvitationListComponent implements OnInit {

  invitations = signal<OrganizationInvitation[]>([]);
  loading = signal<boolean>(false);
  processingInvitation = signal<string | null>(null);
  organizationNames = signal<Record<string, string>>({});
  personNames = signal<Record<string, string>>({});


  invitationStatus = InvitationStatus;
  displayedColumns: string[] = ['organization', 'invitedBy', 'invitedAt', 'status', 'actions'];


  constructor(
    private invitationService: OrganizationInvitationService,
    private snackBar: MatSnackBar,
    private sessionService: SessionService,
    private organizationMemberService: OrganizationMemberService,
    private organizationService: OrganizationService,
    private personService: PersonService

  ) {
  }

  ngOnInit(): void {
    this.loadInvitations();
  }

  loadInvitations() {
    this.loading.set(true);
    try {
      const currentPersonId = this.sessionService.getPersonId();

      if (!currentPersonId) {
        console.warn('No person ID found in session');
        this.invitations.set([]);
        this.showSnackBar('Could not get user information', 'error');
        this.loading.set(false);
        return;
      }

      this.invitationService.getByPersonId({}, { personId: currentPersonId }).subscribe({
        next: (invitations: any[]) => {
          console.log('[Invitations API Response]', invitations); // <-- Aquí el log

          const mappedInvitations = invitations
            .map(data => this.mapToInvitation(data))
            .filter(inv => inv !== null);

          this.invitations.set(mappedInvitations);
          this.loading.set(false);
        },
        error: (error: any) => {
          console.error('Error loading invitations:', error);
          this.showSnackBar('Error loading Invitations', 'error');
          this.invitations.set([]);
          this.loading.set(false);
        }
      });

    } catch (error) {
      console.error('Error loading Invitations:', error);
      this.showSnackBar('Error loading Invitations', 'error');
      this.invitations.set([]);
      this.loading.set(false);
    }
  }

  async acceptInvitation(invitation: OrganizationInvitation): Promise<void> {
    const id = invitation.invitationId?.toString() ?? '';
    this.processingInvitation.set(id);
    try {
      const person: Person = await this.personService.getById({}, { id: invitation.personId }).toPromise();

      const newMember = {
        personId: invitation.personId,
        organizationId: invitation.organizationId,
        memberType: 'WORKER',
        joinedAt: new Date(),
        firstName: person.firstName,
        lastName: person.lastName,
        email: person.email
      };

      await this.organizationMemberService.create(newMember).toPromise();

      await this.invitationService.delete({}, { id }).toPromise();

      invitation.accept();
      this.showSnackBar('¡Accepted invitation!', 'success');
      await this.loadInvitations();
    } catch (error) {
      console.error('Error accepting invitation:', error);
      this.showSnackBar('Error accepting invitation', 'error');
    } finally {
      this.processingInvitation.set(null);
    }
  }

  async rejectInvitation(invitation: OrganizationInvitation): Promise<void> {
    const id = invitation.invitationId?.toString() ?? '';
    this.processingInvitation.set(id);
    try {
      await this.invitationService.update(
        {status: 'REJECTED'},
        {id}
      ).toPromise();

      await this.invitationService.delete({}, {id}).toPromise();

      invitation.reject();
      this.showSnackBar('Rejected invitation', 'info');
      await this.loadInvitations();
    } catch (error) {
      console.error('Error rejecting invitation:', error);
      this.showSnackBar('Error rejecting invitation', 'error');
    } finally {
      this.processingInvitation.set(null);
    }
  }

  private showSnackBar(message: string, type: 'success' | 'error' | 'info' | 'warn'): void {
    this.snackBar.open(message, 'Cerrar', {
      duration: 3000,
      panelClass: [`snackbar-${type}`]
    });
  }

  private mapToInvitation(data: any): OrganizationInvitation | null {
    const invitationId = data.id;

    return new OrganizationInvitation({
      invitationId: invitationId,
      organizationId: data.organizationId,
      personId: data.personId,
      invitedBy: data.invitedBy,
      invitedAt: data.invitedAt ? new Date(data.invitedAt) : new Date(),
      acceptedAt: data.acceptedAt ? new Date(data.acceptedAt) : undefined,
      status: data.status || InvitationStatus.PENDING
    });
  }

  getOrganizationName(id: string): string {
    if (!id) return 'Organización desconocida';

    const cachedName = this.organizationNames()[id];
    if (cachedName) return cachedName;

    this.organizationService.getById({}, { id }).subscribe({
      next: (org: any) => {
        const updatedMap = { ...this.organizationNames(), [id]: org.legalName };
        this.organizationNames.set(updatedMap);
      },
    });
    return `Cargando...`;
  }

  getPersonName(personId: any): string {
    if (!personId) return 'Unknown user';

    const id = typeof personId === 'object' && 'value' in personId
      ? personId.value
      : personId;

    const cachedName = this.personNames()[id];
    if (cachedName) return cachedName;

    this.personService.getById({}, { id }).subscribe({
      next: (person: any) => {
        const fullName = person?.fullName || `${person?.firstName || ''} ${person?.lastName || ''}`.trim();
        const updatedMap = { ...this.personNames(), [id]: fullName || `Usuario ${id}` };
        this.personNames.set(updatedMap);
      },
      error: () => {
        const updatedMap = { ...this.personNames(), [id]: `Usuario ${id}` };
        this.personNames.set(updatedMap);
      }
    });
    return `Cargando...`;
  }

  get pendingInvitationsCount(): number {
    return this.invitations().filter(invitation =>
      invitation.status === InvitationStatus.PENDING
    ).length;
  }

}
