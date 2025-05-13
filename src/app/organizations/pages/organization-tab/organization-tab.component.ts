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
import {PersonId} from '../../../shared/model/person-id.vo';
import {OrganizationMember} from '../../model/organization-member.entity';
import {OrganizationMemberType} from '../../model/organization-member-type.vo';
import {OrganizationMemberService} from '../../services/organization-member.service';

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
    private organizationMemberService: OrganizationMemberService
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
          m.personId.toString() === personId.toString()
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
          const creatorId = new PersonId(this.session.getPersonId()?.toString());
          const newOrg = new Organization({
            legalName: result.legalName,
            commercialName: result.commercialName,
            ruc: new Ruc(result.ruc),
            createdBy: creatorId,
            status: OrganizationStatus.ACTIVE
          });

          this.organizationService.create(newOrg).subscribe({
            next: (createdOrg: Organization) => {
              const member = new OrganizationMember({
                personId: creatorId,
                organizationId: createdOrg.id,
                memberType: OrganizationMemberType.CONTRACTOR
              });

              this.organizationMemberService.create(member).subscribe({
                next: () => this.loadOrganizations(),
                error: (err: any) => console.error('Failed to create organization member:', err)
              });
            },
            error: (err: any) => console.error('Failed to create organization:', err)
          });

        } catch (err) {
          console.error('Validation failed when creating organization:', err);
        }
      }
    });
  }
}
