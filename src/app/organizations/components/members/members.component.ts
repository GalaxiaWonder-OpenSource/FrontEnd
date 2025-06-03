import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCard, MatCardContent, MatCardTitle } from '@angular/material/card';
import { OrganizationMember } from '../../model/organization-member.entity';
import { OrganizationMemberService } from '../../services/organization-member.service';
import { PersonService } from '../../../iam/services/person.service';
import { SessionService } from '../../../iam/services/session.service';
import { Person } from '../../../iam/model/person.entity'; // Asegúrate de tener esta clase

interface MemberWithPerson {
  member: OrganizationMember;
  person: Person;
}

@Component({
  selector: 'app-members',
  standalone: true,
  imports: [CommonModule, MatCard, MatCardTitle, MatCardContent],
  templateUrl: './members.component.html',
  styleUrls: ['./members.component.css']
})
export class MembersComponent {

  membersWithPerson = signal<MemberWithPerson[]>([]);

  constructor(
    private session: SessionService,
    private organizationMemberService: OrganizationMemberService,
    private personService: PersonService
  ) {
    this.loadMembers();
  }

  private loadMembers(): void {
    const organizationId = this.session.getOrganizationId();
    if (!organizationId) {
      console.warn('No organization ID. Aborting.');
      return;
    }

    this.organizationMemberService.getByOrganizationId({ organizationId }).subscribe({
      next: (members: OrganizationMember[]) => {
        Promise.all(
          members.map(async member => {
            try {
              const personData = await this.personService.getById({}, { id: member.personId }).toPromise();
              const person = new Person(personData);
              return { member, person };
            } catch (error) {
              console.error('Error loading person for member:', member, error);
              return null;
            }
          })
        ).then(results => {
          const valid = results.filter((m): m is MemberWithPerson => m !== null);
          this.membersWithPerson.set(valid);
        });
      },
      error: (err: any) => {
        console.error('Error loading members:', err);
      }
    });
  }
}
