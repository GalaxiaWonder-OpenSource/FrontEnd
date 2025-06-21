import { Component, ViewChild } from '@angular/core';
import { ConfigurationFormComponent } from '../../components/configuration-form/configuration-form.component';
import { OrganizationService } from '../../services/organization.service';
import { SessionService } from '../../../iam/services/session.service';
import { Organization } from '../../model/organization.entity';
import {NgClass, NgIf} from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBar } from '@angular/material/snack-bar';
import {TranslatePipe} from "@ngx-translate/core";
import {Router} from '@angular/router';
import {
  DeleteOrganizationButtonComponent
} from '../../components/delete-organization-button/delete-organization-button.component';

@Component({
  selector: 'app-configuration-tab',
  standalone: true,
  imports: [ConfigurationFormComponent, NgIf, MatButtonModule, TranslatePipe, NgClass, DeleteOrganizationButtonComponent],
  templateUrl: './configuration-tab.component.html',
  styleUrls: ['./configuration-tab.component.css']
})
export class ConfigurationTabComponent {
  org: Organization | null = null;
  originalOrg: Organization | null = null;


  @ViewChild(ConfigurationFormComponent)
  private formComponent!: ConfigurationFormComponent;
  message: string = '';
  messageType: 'success' | 'error' | '' = '';

  constructor(
    private organizationService: OrganizationService,
    private session: SessionService,
    private snackBar: MatSnackBar,
    private router: Router


  ) {
    this.loadOrganization();
  }

  loadOrganization() {
    const id = this.session.getOrganizationId();
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


    // Validación 1: legalName vacío
    if (!updated.legalName || updated.legalName.trim() === '') {
      this.message = 'organization-configuration.errors.empty-legal-name';
      this.messageType = 'error';
      return;
    }

    // Validación 2: sin cambios
    const noChanges =
        updated.legalName === this.originalOrg?.legalName &&
        updated.commercialName === this.originalOrg?.commercialName;

    if (noChanges) {
      this.message = 'organization-configuration.errors.no-changes';
      this.messageType = 'error';
      return;
    }

    // PATCH
    this.organizationService.update(
      {
        commercialName: updated.commercialName,
        legalName: updated.legalName
      },
      { id: this.org.id }
    ).subscribe({
      next: () => {
        this.message = 'organization-configuration.success.updated';
        this.messageType = 'success';
        this.originalOrg = JSON.parse(JSON.stringify(this.org));
      },
      error: (err: any) => {
        console.error('Error', err);
        this.message = 'organization-configuration.errors.api-failed';
        this.messageType = 'error';
      }
    });
  }

  onDeleteOrganization(ruc: string): void {
    this.organizationService.delete({}, { ruc }).subscribe({
      next: () => {
        this.snackBar.open('Organización eliminada exitosamente', 'Cerrar', { duration: 3000, panelClass: ['snackbar-success'] });
        this.router.navigate(['/organizations']);
      },
      error: (err: any) => {
        this.snackBar.open('Error al eliminar organización', 'Cerrar', { duration: 3000, panelClass: ['snackbar-error'] });
        console.error('Error al eliminar organización:', err);
      }
    });
  }
}
