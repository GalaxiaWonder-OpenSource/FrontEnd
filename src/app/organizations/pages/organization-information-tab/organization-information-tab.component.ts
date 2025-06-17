import { Component } from '@angular/core';
import {
  OrganizationInformationCardComponent
} from '../../components/organization-information-card/organization-information-card.component';
import {SessionService} from '../../../iam/services/session.service';
import {OrganizationService} from '../../services/organization.service';
import {Organization} from '../../model/organization.entity';
import {PersonService} from '../../../iam/services/person.service';
import {Person} from '../../../iam/model/person.entity';
import {NgIf} from '@angular/common';
import {EmailAddress} from '../../../shared/model/email-adress.vo';
import {PhoneNumber} from '../../../iam/model/phone-number.vo';

@Component({
  selector: 'app-organization-information-tab',
  standalone: true,
  imports: [
    OrganizationInformationCardComponent,
    NgIf
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

    if (!contractorId) {
      console.warn('No hay ID de contratista disponible');
      // Si no hay ID de contratista, usamos datos predeterminados
      this.createDefaultContractor();
      return;
    }

    // Corregimos la llamada al servicio para el formato correcto con json-server
    this.personService.getById({}, { id: contractorId }).subscribe({
      next: (personData: any) => {
        this.contractor = new Person(personData);
      },
      error: (err: any) => {
        console.error('Error al obtener el contractor', err);
        this.createDefaultContractor();
      }
    });
  }

  private createDefaultContractor(): void {
    try {
      // Creamos un contratista con datos predeterminados
      this.contractor = new Person({
        id: 0,
        email: new EmailAddress('no.disponible@example.com'),
        phone: new PhoneNumber('0000000000'),
        firstName: 'Información',
        lastName: 'No disponible'
      });
    } catch (e) {
      console.error('Error al crear persona por defecto', e);
    }
  }
}
