import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { SessionService } from '../../../iam/services/session.service';
import { OrganizationMemberService } from '../../services/organization-member.service';
import { PersonService } from '../../../iam/services/person.service';
import { OrganizationMember } from '../../model/organization-member.entity';

@Component({
  selector: 'app-members',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatIconModule, MatButtonModule],
  templateUrl: './members.component.html',
  styleUrls: ['./members.component.css']
})
export class MembersComponent implements OnInit {

  //for view
  members = signal<MemberDisplay[]>([]);

  constructor(
    private session: SessionService,
    private organizationMemberService: OrganizationMemberService,
    private personService: PersonService
  ) {}

  ngOnInit(): void {
    this.loadMembers();
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
    console.log('Abrir modal de invitación 📨');
    // aquí abrirás tu diálogo más adelante
  }

  removeMember(member: OrganizationMember): void {
    console.log('Eliminar miembro:', member);
    // lógica futura para eliminar o revocar acceso
  }

}

//for view
interface MemberDisplay {
  member: OrganizationMember;
  fullName: string;
  email: string;
  joinedAt: Date;
}
