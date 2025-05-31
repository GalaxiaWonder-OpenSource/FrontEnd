import { Component, OnInit, Inject } from '@angular/core';
import {FormsModule} from "@angular/forms";
import {MatButton} from "@angular/material/button";
import {MatDialogActions, MatDialogContent, MatDialogRef, MatDialogTitle, MAT_DIALOG_DATA} from "@angular/material/dialog";
import {MatInput, MatLabel} from "@angular/material/input";
import {TranslatePipe} from "@ngx-translate/core";
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatSelectModule} from '@angular/material/select';
import {CommonModule} from '@angular/common';
import { SessionService } from '../../../iam/services/session.service';
import { Organization } from '../../../organizations/model/organization.entity';
import { OrganizationService } from '../../../organizations/services/organization.service';
import { OrganizationId } from '../../../shared/model/organization-id.vo';

interface DialogData {
  preselectedOrganizationId?: string;
}

@Component({
  selector: 'app-create-project-modal',
    imports: [
        FormsModule,
        MatButton,
        MatDialogActions,
        MatDialogContent,
        MatDialogTitle,
        MatFormFieldModule,
        MatInput,
        MatLabel,
        TranslatePipe,
        MatSelectModule,
        CommonModule
    ],
  templateUrl: './create-project-modal.component.html',
  styleUrl: './create-project-modal.component.css'
})
export class CreateProjectModalComponent implements OnInit {
  name='';
  description='';
  startingDate=new Date();
  endingDate= '';
  organizations: Organization[] = [];
  selectedOrganization: string = '';
  selectedOrganizationName: string = '';
  showOrgSelection: boolean = false;

  constructor(
    private dialogRef: MatDialogRef<CreateProjectModalComponent>,
    private organizationService: OrganizationService,
    private session: SessionService,
    @Inject(MAT_DIALOG_DATA) private data: DialogData
  ) {
    // Si tenemos un ID preseleccionado, lo usamos directamente
    if (data?.preselectedOrganizationId) {
      this.selectedOrganization = data.preselectedOrganizationId;
      this.showOrgSelection = false;

      // Obtener el nombre de la organización
      this.loadSelectedOrganizationName();
    } else {
      this.showOrgSelection = true;
    }
  }

  ngOnInit(): void {
    // Solo cargamos las organizaciones si no tenemos una preseleccionada
    if (this.showOrgSelection) {
      this.loadOrganizations();
    }
  }

  loadOrganizations(): void {
    const personId = this.session.getPersonId();
    if (!personId) {
      console.warn('No person ID found in session');
      return;
    }

    this.organizationService.getAll().subscribe({
      next: (orgs: Organization[]) => {
        // Filtramos las organizaciones donde el usuario actual es un miembro
        this.organizations = orgs.filter(org =>
          org.createdBy.toString() === personId.toString()
        );

        // Buscar la organización GOLA y seleccionarla por defecto
        const golaOrg = this.organizations.find(org =>
          org.commercialName === "GOLASAC" ||
          org.legalName === "GOLA"
        );

        if (golaOrg) {
          console.log("Preselecting GOLA organization:", golaOrg);
          this.selectedOrganization = golaOrg.id.toString();
        } else if (this.organizations.length > 0) {
          // Si no hay GOLA, seleccionamos la primera organización
          this.selectedOrganization = this.organizations[0].id.toString();
        }
      },
      error: (err: Error) => console.error('Failed to load organizations:', err)
    });
  }

  loadSelectedOrganizationName(): void {
    if (!this.selectedOrganization) return;

    this.organizationService.getById({}, {id: this.selectedOrganization}).subscribe({
      next: (org: Organization) => {
        this.selectedOrganizationName = org.commercialName || org.legalName;
        console.log(`Selected organization: ${this.selectedOrganizationName}`);
      },
      error: (err: Error) => {
        console.error('Failed to load organization name:', err);
      }
    });
  }

  close(): void {
    this.dialogRef.close();
  }

  submit(): void {
    if (this.name && this.description && this.endingDate && this.selectedOrganization) {
      console.log("Submitting project creation form with organization:", this.selectedOrganization);

      const startDate = typeof this.startingDate === 'string'
        ? new Date(this.startingDate)
        : this.startingDate;

      const endDate = new Date(this.endingDate);

      const data = {
        name: this.name,
        description: this.description,
        startingDate: startDate,
        endingDate: endDate,
        organizationId: new OrganizationId(this.selectedOrganization),
        creator: this.session.getPersonId()
      };

      console.log("Project data:", data);
      this.dialogRef.close(data);
    } else {
      console.warn("Form validation failed:", {
        name: this.name,
        description: this.description,
        endingDate: this.endingDate,
        selectedOrganization: this.selectedOrganization
      });
    }
  }
}
