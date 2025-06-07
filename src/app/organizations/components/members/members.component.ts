import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { SessionService } from '../../../iam/services/session.service';
import { OrganizationMemberService } from '../../services/organization-member.service';
import { PersonService } from '../../../iam/services/person.service';
import { OrganizationMember } from '../../model/organization-member.entity';
import { CreateMemberModalComponent } from '../create-member-modal/create-member-modal.component';
import { OrganizationService } from '../../services/organization.service';
import { PersonId } from '../../../shared/model/person-id.vo';
import { OrganizationId } from '../../../shared/model/organization-id.vo';
import { DeleteMemberModalComponent } from '../delete-member-modal/delete-member-modal.component';

@Component({
  selector: 'app-members',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatIconModule, MatButtonModule, MatDialogModule],
  templateUrl: './members.component.html',
  styleUrls: ['./members.component.css']
})
export class MembersComponent implements OnInit {

  //for view
  members = signal<MemberDisplay[]>([]);
  isCreator = signal<boolean>(false);
  currentPersonId = signal<string | null>(null);

  constructor(
    private session: SessionService,
    private organizationMemberService: OrganizationMemberService,
    private organizationService: OrganizationService,
    private personService: PersonService,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.loadMembers();
    this.checkCreatorStatus();
  }

  private loadMembers() {
    const organizationId = this.session.getOrganizationId();

    if (!organizationId) {
      console.warn('No organization ID found in session. Aborting members load.');
      return;
    }

    this.organizationMemberService.getByOrganizationId({ organizationId }).subscribe({
      next: (allMembers: OrganizationMember[]) => {
        console.log('Todos los miembros recibidos:', allMembers);

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
            const enrichedMembers = memberPersonPairs.map(({ member, person }) => ({
              member,
              joinedAt: new Date(member.joinedAt),
              fullName: `${person.firstName} ${person.lastName}`,
              email: person.email
            }));

            console.log('Miembros enriquecidos:', enrichedMembers);
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

  //order
  readonly sortedMembers = computed(() =>
    this.members().slice().sort((a, b) => a.fullName.localeCompare(b.fullName))
  );

  //full name
  getInitials(fullName: string): string {
    return fullName
      .split(' ')
      .map(p => p[0])
      .join('')
      .toUpperCase();
  }

  openInvitationModal(): void {
    const dialogRef = this.dialog.open(CreateMemberModalComponent, {
      width: '500px',
      disableClose: true
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        console.log('Data received successfully! Ready to create invitation component');
        this.createMember(result)
      } else {
        console.log('No data received (user cancelled)')
      }
    });
  }
  /**
   * Crea un nuevo miembro en la organización
   */
  private createMember(memberData: any): void {
    const organizationId = this.session.getOrganizationId();

    if (!organizationId) {
      console.error('No organization ID found in session');
      return;
    }

    try {
      console.log('Datos del nuevo miembro:', memberData);

      // Crear un nuevo miembro de tipo WORKER (todos los miembros añadidos serán WORKER)
      const newMember = {
        personId: memberData.personId,
        organizationId: organizationId,
        memberType: 'WORKER' // Siempre será WORKER para miembros añadidos
      };      this.organizationMemberService.create(newMember).subscribe({
        next: (createdMember: OrganizationMember) => {
          console.log('Miembro creado con éxito:', createdMember);
          this.loadMembers(); // Recargar los miembros
        },
        error: (err: unknown) => {
          console.error('Error al crear miembro:', err);
        }
      });

    } catch (error) {
      console.error('Error creating member:', error);
    }
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
            console.log('Miembro eliminado con éxito');
            this.loadMembers(); // Recargar la lista de miembros
          },          error: (err: unknown) => {
            console.error('Error al eliminar miembro:', err);
          }
        });
      }
    });
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
      },      error: (err: unknown) => {
        console.error('Error al verificar si es creador:', err);
        this.isCreator.set(false);
      }
    });
  }
}

//for view
interface MemberDisplay {
  member: OrganizationMember;
  fullName: string;
  email: string;
  joinedAt: Date;
}
