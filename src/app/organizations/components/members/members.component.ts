import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { SessionService } from '../../../iam/services/session.service';
import { OrganizationMemberService } from '../../services/organization-member.service';
import { PersonService } from '../../../iam/services/person.service';
import { OrganizationMember } from '../../model/organization-member.entity';
import { Person } from '../../../iam/model/person.entity';
import { OrganizationMemberType } from '../../model/organization-member-type.vo';

@Component({
  selector: 'app-members',
  standalone: true,
  imports: [CommonModule, MatCardModule],
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
    if (!organizationId) return;

    this.organizationMemberService.getByOrganizationId({ organizationId }).subscribe({
      next: (members: OrganizationMember[]) => {

        const currentOrgId = this.session.getOrganizationId();
        if(!currentOrgId) {
          console.warn('Organization is not defined')
          return
        }
        const filtered =members.filter(m=>m.organizationId.value === currentOrgId);

        console.log('Miembros filtrados', filtered);

        Promise.all(
          filtered.map(async (member) => {
            try {
              const person = await this.personService.getById({}, { id: member.personId }).toPromise();
              return {
                member,
                joinedAt: new Date(member.joinedAt),
                fullName: `${person.firstName} ${person.lastName}`,
                email: person.email
            };
            } catch (error) {
              console.error(`Error loading person ${member.personId}`, error);
              return {
                member,
                joinedAt: new Date(member.joinedAt),
                fullName: 'Usuario desconocido',
                email: 'email@desconocido.com'
              };
            }
          })
        ).then((enriched) => this.members.set(enriched));
      },
      error: (err: any) => {
        console.error('Failed:', err);
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
}

//for view
interface MemberDisplay {
  member: OrganizationMember;
  fullName: string;
  email: string;
  joinedAt: Date;
}
