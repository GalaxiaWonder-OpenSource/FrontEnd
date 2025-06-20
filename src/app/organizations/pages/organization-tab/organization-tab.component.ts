import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTabsModule } from '@angular/material/tabs';
import { MatDividerModule } from '@angular/material/divider';
import { MatDialog } from '@angular/material/dialog';
import { Organization } from '../../model/organization.entity';
import { OrganizationService } from '../../services/organization.service';
import { CreateOrganizationModalComponent } from '../../components/create-organization-modal/create-organization-modal.component';
import { OrganizationListComponent } from '../../components/organization-list/organization-list.component';
import { MatButtonModule } from '@angular/material/button';
import { TranslatePipe } from '@ngx-translate/core';
import {SessionService} from '../../../iam/services/session.service';
import {Ruc} from '../../model/ruc.vo';
import {OrganizationStatus} from '../../model/organization-status.vo';
import {OrganizationMember} from '../../model/organization-member.entity';
import {OrganizationMemberType} from '../../model/organization-member-type.vo';
import {OrganizationMemberService} from '../../services/organization-member.service';
import {PersonService} from '../../../iam/services/person.service';
import {Person} from '../../../iam/model/person.entity';

@Component({
  selector: 'app-organization-tab',
  standalone: true,
  imports: [
    CommonModule,
    MatTabsModule,
    MatDividerModule,
    MatButtonModule,
    OrganizationListComponent,
    TranslatePipe
  ],
  templateUrl: './organization-tab.component.html',
  styleUrl: './organization-tab.component.css'
})
export class OrganizationTabComponent {
  organizations = signal<Organization[]>([]);


  constructor(
    private organizationService: OrganizationService,
    private dialog: MatDialog,
    private session: SessionService,
    private organizationMemberService: OrganizationMemberService,
    private personService: PersonService
  ) {
    this.loadOrganizations();
  }

  loadOrganizations() {
    const personId = this.session.getPersonId();

    if (!personId) {
      console.warn('No person ID found in session. Aborting organization load.');
      return;
    }

    this.organizationMemberService.getAll().subscribe({
      next: (memberships: OrganizationMember[]) => {
        const myMemberships = memberships.filter(m =>
          m.personId != undefined ? m.personId.toString() === personId.toString() : false
        );

        const orgIds = myMemberships.map(m => m.organizationId);

        const organizationRequests = orgIds.map(id =>
          this.organizationService.getById({}, { id })
        );

        Promise.all(organizationRequests.map(obs => obs.toPromise())).then(
          (organizations) => {
            this.organizations.set(organizations);
          },
          (error) => {
            console.error('Failed to load one or more organizations:', error);
          }
        );
      },
      error: (err: any) => {
        console.error('Failed to load organization memberships:', err);
      }
    });
  }

  openCreateDialog(): void {
    const dialogRef = this.dialog.open(CreateOrganizationModalComponent, {
      width: '500px',
      disableClose: true
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        try {
          const creatorId = this.session.getPersonId();

          const organizationPayload = {
            legalName: result.legalName,
            commercialName: result.commercialName,
            ruc: result.ruc,
            createdBy: creatorId,
          };

          console.log('Creando organización con payload:', organizationPayload);

          this.organizationService.create(organizationPayload).subscribe({
            next: (createdOrg: any) => {
              console.log('Organización creada exitosamente:', createdOrg);
              this.loadOrganizations(); // Si quieres recargar la lista después de crear
            },
            error: (err: any) => {
              console.error('Error al crear organización:', err);
            }
          });
        } catch (err) {
          console.error('Error de validación al crear organización:', err);
        }
      }
    });
  }

}
