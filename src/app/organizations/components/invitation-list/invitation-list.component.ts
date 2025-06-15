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
import { TranslatePipe } from '@ngx-translate/core';
import { OrganizationService } from '../../services/organization.service';
import { PersonService } from '../../../iam/services/person.service';

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
  ) {}

  ngOnInit(): void {
    this.loadInvitations();
  }

  private async loadInvitations() {
    this.loading.set(true);
    console.log('🚀 Starting to load invitations...');

    try {

      this.invitationService.getAll({}, {}).subscribe({
        next: (allInvitations: any[]) => {
          if (!Array.isArray(allInvitations)) {
            console.warn('API response is not an array:', allInvitations);
            this.invitations.set([]);
            return;
          }

          // Como el backend filtra por el usuario autenticado, no necesitamos filtrar aquí
          const filteredInvitations = allInvitations;

          const mappedInvitations = filteredInvitations
            .map(data => this.mapToInvitation(data))
            .filter(inv => inv !== null);

          this.invitations.set(mappedInvitations);
        },
        error: (error: any) => {
          console.error('Error loading invitations:', error);
          this.showSnackBar('Error loading Invitations', 'error');
          this.invitations.set([]);
        },
        complete: () => {
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
      await this.invitationService.acceptInvitation({}, { id }).toPromise();
      this.showSnackBar('¡Accepted invitation!', 'success');
      await this.loadInvitations();
    } catch (error) {
      console.error('Error accepting invitation:', error);
      this.showSnackBar('Error accepting Invitations', 'error');
    } finally {
      this.processingInvitation.set(null);
    }
  }

  async rejectInvitation(invitation: OrganizationInvitation): Promise<void> {
    const id = invitation.invitationId?.toString() ?? '';
    this.processingInvitation.set(id);

    try {
      await this.invitationService.rejectInvitation({}, { id }).toPromise();
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

  private getCurrentPersonId(): number | undefined {
    try {
      const personId = this.sessionService.getPersonId();

      if (!personId) return undefined;

      if (typeof personId === 'object' && personId) {
        return personId;
      }

      if (typeof personId === 'number') {
        return personId;
      }

      console.warn('Unexpected personId format:', personId);
      return undefined;
    } catch (error) {
      console.error('Error getting person ID:', error);
      return undefined;
    }
  }

  private mapToInvitation(data: any): OrganizationInvitation | null {
    try {
      console.log('Mapping invitation data:', data);

      const invitationId = data.invitationId || data.id;
      if (!invitationId || !data.organizationId || !data.personId) {
        console.warn('Missing required fields in invitation data:', data);
        return null;
      }

      return new OrganizationInvitation({
        invitationId: invitationId,
        organizationId: data.organizationId,
        personId: data.personId,
        invitedBy: data.invitedBy,
        invitedAt: data.invitedAt ? new Date(data.invitedAt) : new Date(),
        acceptedAt: data.acceptedAt ? new Date(data.acceptedAt) : undefined,
        status: data.status || InvitationStatus.PENDING
      });
    } catch (error) {
      console.error('Error mapping invitation data:', error, data);
      return null;
    }
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
