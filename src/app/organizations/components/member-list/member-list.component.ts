import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { SessionService } from '../../../iam/services/session.service';
import { OrganizationMemberService } from '../../services/organization-member.service';
import { PersonService } from '../../../iam/services/person.service';
import { OrganizationService } from '../../services/organization.service';
import { OrganizationMember } from '../../model/organization-member.entity';
import { CreateMemberModalComponent } from '../create-member-modal/create-member-modal.component';
import { MemberCardComponent } from '../member-card/member-card.component';
import { OrganizationInvitationService } from '../../services/organization-invitation.service';
import { DeleteMemberModalComponent } from '../delete-member-modal/delete-member-modal.component';

@Component({
  selector: 'app-member-list',
  standalone: true,
  imports: [
    CommonModule, 
    MatButtonModule, 
    MatDialogModule,
    MemberCardComponent
    // No incluir DeleteMemberModalComponent aquí, solo importación arriba
  ],
  templateUrl: './member-list.component.html',
  styleUrls: ['./member-list.component.css']
})
export class MemberListComponent implements OnInit {
  // Datos para la vista
  members = signal<MemberDisplay[]>([]);
  isCreator = signal<boolean>(false);
  currentPersonId = signal<string | null>(null);

  constructor(
    private session: SessionService,
    private organizationMemberService: OrganizationMemberService,
    private organizationService: OrganizationService,
    private personService: PersonService,
    private dialog: MatDialog,
    private organizationInvitationService: OrganizationInvitationService, // nuevo servicio para invitaciones
    private snackBar: MatSnackBar // para notificaciones
  ) {}

  ngOnInit(): void {
    this.loadMembers();
    this.checkCreatorStatus();
  }

  /**
   * Verifica si el usuario actual es el creador de la organización
   */
  private checkCreatorStatus(): void {
    const organizationId = this.session.getOrganizationId();
    const personId = this.session.getPersonId();
    
    if (!organizationId || !personId) {
      this.isCreator.set(false);
      return;
    }
    
    this.currentPersonId.set(personId.toString());
    
    this.organizationService.isOrganizationCreator(organizationId, personId.toString()).subscribe({
      next: (isCreator) => {
        this.isCreator.set(isCreator);
      },
      error: (err: unknown) => {
        console.error('Error al verificar si es creador:', err);
        this.isCreator.set(false);
      }
    });
  }

  /**
   * Carga la lista de miembros de la organización actual
   */
  private loadMembers() {
    const organizationId = this.session.getOrganizationId();

    if (!organizationId) {
      console.warn('No organization ID found in session. Aborting members load.');
      return;
    }

    this.organizationMemberService.getByOrganizationId({ organizationId }).subscribe({
      next: (allMembers: OrganizationMember[]) => {
        //members by organization
        const myOrganizationMembers = allMembers.filter(m =>
          m.organizationId.toString() === organizationId.toString()
        );

        //eliminate duplicates of personID
        const uniqueMembers = myOrganizationMembers.filter((member, index) => {
          const personIdStr = member.personId.toString();
          //keep first member with ID
          const firstIndex = myOrganizationMembers.findIndex(m => m.personId.toString() === personIdStr);
          return firstIndex === index;
        });

        if (uniqueMembers.length === 0) {
          console.warn('No se encontraron miembros únicos para esta organización');
          this.members.set([]);
          return;
        }

        Promise.all(
          uniqueMembers.map((member: OrganizationMember) =>
            this.personService.getById({}, { id: member.personId })
              .toPromise()
              .then((person: any) => {
                return {
                  member: member,
                  person: person
                };
              })
          )
        ).then(
          (memberPersonPairs: Array<{member: OrganizationMember, person: any}>) => {
            const enrichedMembers = memberPersonPairs.map(({ member, person }) => {
              let joinedAt: Date = new Date();
              if (member.joinedAt) {
                joinedAt = new Date(member.joinedAt);
                if (isNaN(joinedAt.getTime())) {
                  joinedAt = new Date(); // fallback a ahora si la fecha es inválida
                }
              }
              return {
                memberType: member.memberType,
                joinedAt,
                fullName: `${person.firstName} ${person.lastName}`,
                email: person.email,
                member: member // para compatibilidad con el método actual
              };
            });

            this.members.set(enrichedMembers);
          },
          (error) => {
            console.error('Failed to load one or more persons:', error);
            this.members.set([]);
          }
        );
      },
      error: (err: any) => {
        console.error('Failed to load organization members:', err);
        this.members.set([]);
      }
    });
  }

  /**
   * Ordenar miembros por nombre
   */
  readonly sortedMembers = computed(() =>
    this.members().slice().sort((a, b) => a.fullName.localeCompare(b.fullName))
  );

  /**
   * Abre el modal para invitar a un nuevo miembro
   */
  openInvitationModal(): void {
    const dialogRef = this.dialog.open(CreateMemberModalComponent, {
      width: '500px',
      disableClose: true
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.createMember(result);
      }
    });
  }

  /**
   * Crea una invitación para un nuevo miembro en la organización
   */
  private createMember(memberData: any): void {
    const organizationId = this.session.getOrganizationId();
    const invitedBy = this.session.getPersonId();

    if (!organizationId || !invitedBy) {
      console.error('No organization ID or invitedBy found in session');
      return;
    }

    // Asegurar que los IDs sean strings simples
    const invitation = {
      organizationId: organizationId.toString(),
      personId: memberData.personId.toString(),
      invitedBy: invitedBy.toString()
    };

    this.organizationInvitationService.create(invitation).subscribe({
      next: () => {
        this.snackBar.open('Invitación enviada con éxito', 'Cerrar', { duration: 3000, panelClass: ['snackbar-success'] });
      },
      error: (err: unknown) => {
        this.snackBar.open('Error al enviar invitación', 'Cerrar', { duration: 3000, panelClass: ['snackbar-error'] });
        console.error('Error al enviar invitación:', err);
      }
    });
  }

  /**
   * Muestra diálogo de confirmación y elimina un miembro si se confirma
   */
  removeMember(member: OrganizationMember): void {
    // Si el usuario no es el creador o intenta eliminarse a sí mismo siendo creador, no permitirlo
    if (!this.isCreator() || 
        (member.memberType === 'CONTRACTOR' && member.personId.toString() === this.currentPersonId())) {
      console.warn('No tienes permisos para eliminar este miembro o estás intentando eliminar al creador');
      return;
    }

    const dialogRef = this.dialog.open(DeleteMemberModalComponent, {
      width: '400px'
    });

    dialogRef.afterClosed().subscribe(confirmed => {
      if (confirmed) {
        this.organizationMemberService.delete({}, { id: member.id }).subscribe({
          next: () => {
            // Eliminar invitaciones asociadas a este miembro (por personId y organizationId)
            this.organizationInvitationService.getAll().subscribe((invitations: any[]) => {
              const toDelete = invitations.filter(inv => inv.personId === member.personId && inv.organizationId === member.organizationId);
              toDelete.forEach(inv => {
                this.organizationInvitationService.delete({}, { id: inv.id }).subscribe();
              });
            });
            console.log('Miembro eliminado con éxito');
            this.loadMembers(); // Recargar la lista de miembros
          },
          error: (err: unknown) => {
            console.error('Error al eliminar miembro:', err);
          }
        });
      }
    });
  }
}

// Interfaz para los datos de miembros en la vista
interface MemberDisplay {
  memberType: string;
  joinedAt: Date;
  fullName: string;
  email: string;
  member: OrganizationMember;
}
