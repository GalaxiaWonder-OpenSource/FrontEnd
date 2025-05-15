import { Component } from '@angular/core';
import {
  OrganizationInformationCardComponent
} from '../../components/organization-information-card/organization-information-card.component';
import {SessionService} from '../../../iam/services/session.service';
import {OrganizationService} from '../../services/organization.service';
import {Organization} from '../../model/organization.entity';
import {PersonService} from '../../../iam/services/person.service';
import {Person} from '../../../iam/model/person.entity';

@Component({
  selector: 'app-organization-information-tab',
  imports: [
    OrganizationInformationCardComponent
  ],
  templateUrl: './organization-information-tab.component.html',
  styleUrl: './organization-information-tab.component.css'
})
export class OrganizationInformationTabComponent {
  protected organization: Organization | undefined;
  protected contractor: Person | undefined;
  constructor(
    private sessionService: SessionService,
    private organizationService: OrganizationService,
    private personService: PersonService
  ) {
    this.getOrganization();
  }

  getOrganization(): void {
    const organizationId = this.sessionService.getOrganizationId();

    this.organizationService.getById({}, { id: organizationId }).subscribe({
      next: (organizationData: any) => {
        this.organization = new Organization(organizationData);
        this.getContractor();
      },
      error: (err: any) => {
        console.error('Error al obtener la organización', err);
      }
    });
  }


  getContractor() {
    // @ts-ignore
    const contractorId = this.organization.createdBy;

    this.personService.getById({}, { id: contractorId }).subscribe({
      next: (personData: any) => {
        this.contractor = new Person(personData);
      },
      error: (err: any) => {
        console.error('Error al obtener el contractor', err);
      }
    });
  }
}
