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
    MatProgressSpinnerModule
  ],
  templateUrl: './invitation-list.component.html',
  styleUrls: ['./invitation-list.component.css']
})
export class InvitationListComponent implements OnInit {
  // Usar signals para mejor performance
  invitations = signal<OrganizationInvitation[]>([]);
  loading = signal<boolean>(false);
  processingInvitation = signal<string | null>(null);

  invitationStatus = InvitationStatus;
  displayedColumns: string[] = ['organization', 'invitedBy', 'invitedAt', 'status', 'actions'];

  constructor(
    private invitationService: OrganizationInvitationService,
    private snackBar: MatSnackBar,
    private sessionService: SessionService,
    private organizationMemberService: OrganizationMemberService
  ) {}

  ngOnInit(): void {
    this.loadInvitations();
  }

  private async loadInvitations(): Promise<void> {
    this.loading.set(true);
    try {
      const currentPersonId = this.getCurrentPersonId();
      console.log('Loading invitations for person:', currentPersonId);

      if (!currentPersonId) {
        console.warn('No person ID found in session');
        this.invitations.set([]);
        this.showSnackBar('No se pudo obtener la información del usuario', 'error');
        return;
      }

      // Obtener invitaciones desde el servicio
      this.invitationService.getAll().subscribe({
        next: (allInvitations: any[]) => {
          console.log('All invitations from API:', allInvitations);

          if (!Array.isArray(allInvitations)) {
            console.warn('API response is not an array:', allInvitations);
            this.invitations.set([]);
            return;
          }

          // Filtrar invitaciones por personId
          const filteredInvitations = allInvitations.filter((inv: any) => {
            // Comparar tanto como string como objeto
            const invPersonId = typeof inv.personId === 'string' ? inv.personId : inv.personId?.value;
            return invPersonId === currentPersonId;
          });

          console.log('Filtered invitations:', filteredInvitations);

          // Mapear a entidades
          const mappedInvitations = filteredInvitations
            .map(data => this.mapToInvitation(data))
            .filter(inv => inv !== null); // Filtrar invitaciones que no se pudieron mapear

          console.log('Final mapped invitations:', mappedInvitations);
          this.invitations.set(mappedInvitations);
        },
        error: (error: any) => {
          console.error('Error loading invitations:', error);
          this.showSnackBar('Error al cargar las invitaciones', 'error');
          this.invitations.set([]);
        },
        complete: () => {
          this.loading.set(false);
        }
      });

    } catch (error) {
      console.error('Error in loadInvitations:', error);
      this.showSnackBar('Error al cargar las invitaciones', 'error');
      this.invitations.set([]);
      this.loading.set(false);
    }
  }

  async acceptInvitation(invitation: OrganizationInvitation): Promise<void> {
    const id = (invitation.invitationId.value || invitation.invitationId).toString();
    this.processingInvitation.set(id);
    try {
      await this.invitationService.update(
        { status: 'ACCEPTED', acceptedAt: new Date().toISOString() },
        { id }
      ).toPromise();

      // Crear el miembro en la organización
      await this.organizationMemberService.create({
        personId: invitation.personId,
        organizationId: invitation.organizationId,
        memberType: 'WORKER',
        joinedAt: new Date() // Guardar como Date, no string
      }).toPromise();

      
      invitation.accept();
      this.showSnackBar('¡Invitación aceptada!', 'success');
      await this.loadInvitations();
    } catch (error) {
      console.error('Error accepting invitation:', error);
      this.showSnackBar('Error al aceptar la invitación', 'error');
    } finally {
      this.processingInvitation.set(null);
    }
  }

  async rejectInvitation(invitation: OrganizationInvitation): Promise<void> {
    const id = (invitation.invitationId.value || invitation.invitationId).toString();
    this.processingInvitation.set(id);
    try {
      await this.invitationService.update(
        { status: 'REJECTED' },
        { id }
      ).toPromise();

      // Eliminar la invitación rechazada
      await this.invitationService.delete({}, { id }).toPromise();

      invitation.reject();
      this.showSnackBar('Invitación rechazada', 'info');
      await this.loadInvitations();
    } catch (error) {
      console.error('Error rejecting invitation:', error);
      this.showSnackBar('Error al rechazar la invitación', 'error');
    } finally {
      this.processingInvitation.set(null);
    }
  }

  getStatusText(status: InvitationStatus): string {
    switch (status) {
      case InvitationStatus.PENDING:
        return 'Pendiente';
      case InvitationStatus.ACCEPTED:
        return 'Aceptada';
      case InvitationStatus.REJECTED:
        return 'Rechazada';
      default:
        return 'Desconocido';
    }
  }

  getStatusColor(status: InvitationStatus): string {
    switch (status) {
      case InvitationStatus.PENDING:
        return 'accent';
      case InvitationStatus.ACCEPTED:
        return 'primary';
      case InvitationStatus.REJECTED:
        return 'warn';
      default:
        return '';
    }
  }

  private showSnackBar(message: string, type: 'success' | 'error' | 'info' | 'warn'): void {
    this.snackBar.open(message, 'Cerrar', {
      duration: 3000,
      panelClass: [`snackbar-${type}`]
    });
  }

  private getCurrentPersonId(): string | null {
    try {
      const personId = this.sessionService.getPersonId();
      console.log('Person ID from session:', personId);

      // Manejar diferentes formatos de PersonId
      if (!personId) return null;

      // Si es un objeto con propiedad value
      if (typeof personId === 'object' && personId.value) {
        return personId.value;
      }

      // Si es un string directamente
      if (typeof personId === 'string') {
        return personId;
      }

      console.warn('Unexpected personId format:', personId);
      return null;
    } catch (error) {
      console.error('Error getting person ID:', error);
      return null;
    }
  }

  private mapToInvitation(data: any): OrganizationInvitation | null {
    try {
      console.log('Mapping invitation data:', data);

      // Permitir 'id' como 'invitationId' para compatibilidad con json-server
      const invitationId = data.invitationId || data.id;
      if (!invitationId || !data.organizationId || !data.personId) {
        console.warn('Missing required fields in invitation data:', data);
        return null;
      }

      return new OrganizationInvitation({
        invitationId: invitationId,
        organizationId: data.organizationId,
        personId: data.personId,
        invitedBy: data.invitedBy || 'Sistema',
        invitedAt: data.invitedAt ? new Date(data.invitedAt) : new Date(),
        acceptedAt: data.acceptedAt ? new Date(data.acceptedAt) : undefined,
        status: data.status || InvitationStatus.PENDING
      });
    } catch (error) {
      console.error('Error mapping invitation data:', error, data);
      return null;
    }
  }

  getOrganizationName(organizationId: string): string {
    if (!organizationId) return 'Organización desconocida';

    // Si organizationId es un objeto, extraer el valor
    const id = typeof organizationId === 'object' && organizationId
      ? organizationId
      : organizationId;

    return `Organización ${id.toString().substring(0, 8)}...`;
  }

  getPersonName(personId: string): string {
    if (!personId) return 'Usuario desconocido';

    // Si personId es un objeto, extraer el valor
    const id = typeof personId === 'object' && personId
      ? personId
      : personId;

    return `Usuario ${id.toString().substring(0, 8)}...`;
  }

  get pendingInvitationsCount(): number {
    return this.invitations().filter(invitation =>
      invitation.status === InvitationStatus.PENDING
    ).length;
  }

}
