import { Component, ViewChild } from '@angular/core';
import { ConfigurationFormComponent } from '../../components/configuration-form/configuration-form.component';
import { OrganizationService } from '../../services/organization.service';
import { SessionService } from '../../../iam/services/session.service';
import { Organization } from '../../model/organization.entity';
import { NgIf } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import {TranslatePipe} from "@ngx-translate/core";

@Component({
  selector: 'app-configuration-tab',
  standalone: true,
    imports: [ConfigurationFormComponent, NgIf, MatButtonModule, TranslatePipe],
  templateUrl: './configuration-tab.component.html',
  styleUrls: ['./configuration-tab.component.css']
})
export class ConfigurationTabComponent {
  org: Organization | null = null;
  originalOrg: Organization | null = null;


  @ViewChild(ConfigurationFormComponent)
  private formComponent!: ConfigurationFormComponent;

  constructor(
    private organizationService: OrganizationService,
    private session: SessionService
  ) {
    this.loadOrganization();
  }

  loadOrganization() {
    const id = this.session.getOrganizationId();
    console.log("ORGANIZATION ID: ", id);
    if (!id) {
      console.warn('No organization ID found in session.');
      return;
    }

    this.organizationService.getById({}, { id }).subscribe({
      next: (org:Organization) => {
        this.org = JSON.parse(JSON.stringify(org));
        this.originalOrg = JSON.parse(JSON.stringify(org));
      }
    });
  }

  onSubmitChanges() {
    if (!this.org?.id) return;
    const updated = this.formComponent.getUpdatedOrganization();
    // Empty
    if (!updated.legalName || updated.legalName.trim() === '') {
      console.warn('Legal name is required');
      return;
    }

    // No changes
    const noChanges =
      updated.legalName === this.originalOrg?.legalName &&
      updated.commercialName === this.originalOrg?.commercialName;


    if (noChanges) {
      console.info('No changes in organization');
      return;
    }

    // Patch
    this.organizationService.update(updated, { id: this.org.id }).subscribe({
      next: () => console.log('Organization updated'),
      error: (err: any) => console.error('Error', err)
    });
  }
}
