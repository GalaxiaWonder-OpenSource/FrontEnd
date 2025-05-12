import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTabsModule } from '@angular/material/tabs';
import { MatDividerModule } from '@angular/material/divider';
import { MatDialog } from '@angular/material/dialog';
import { Organization } from '../../model/organization.entity';
import { OrganizationService } from '../../services/organization.service';
import { CreateOrganizationModalComponent } from '../create-organization-modal/create-organization-modal.component';
import { OrganizationListComponent } from '../organization-list/organization-list.component';
import { MatButtonModule } from '@angular/material/button';
import { TranslatePipe } from '@ngx-translate/core';
import {SessionService} from '../../../iam/services/session.service';
import {Ruc} from '../../model/ruc.vo';
import {OrganizationStatus} from '../../model/organization-status.vo';
import {PersonId} from '../../../shared/model/person-id.vo';

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
    private session: SessionService
  ) {
    this.loadOrganizations();
  }

  loadOrganizations() {
    this.organizationService.getAll().subscribe({
      next: (data: any) => this.organizations.set(data),
      error: (err: any) => console.error('Failed to load organizations:', err)
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
          const newOrg = new Organization({
            legalName: result.legalName,
            commercialName: result.commercialName,
            ruc: new Ruc(result.ruc),
            createdBy: new PersonId(this.session.getPersonId()?.toString()),
            status: OrganizationStatus.ACTIVE
          });

          this.organizationService.create(newOrg).subscribe({
            next: () => this.loadOrganizations(),
            error: (err: any) => console.error('Failed to create organization:', err)
          });

        } catch (err) {
          console.error('Validation failed when creating organization:', err);
        }
      }
    });
  }
}
