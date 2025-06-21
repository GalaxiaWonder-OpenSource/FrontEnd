import { Component } from '@angular/core';
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
export class CreateProjectModalComponent {
  name='';
  description='';
  startingDate='';
  endingDate = '';
  organizations: Organization[] = [];
  contractingEntityEmail: string = '';

  constructor(
    private dialogRef: MatDialogRef<CreateProjectModalComponent>,
    private session: SessionService
  ) {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    this.startingDate = `${yyyy}-${mm}-${dd}`;
    this.endingDate = `${yyyy}-${mm}-${dd}`;
  }

  close(): void {
    this.dialogRef.close();
  }

  submit(): void {
    const orgId = this.session.getOrganizationId();

    if (this.name && this.description && this.endingDate && orgId) {

      const data = {
        projectName: this.name,
        description: this.description,
        startDate: this.startingDate,
        endDate: this.endingDate,
        organizationId: this.session.getOrganizationId(),
        contractingEntityEmail: this.contractingEntityEmail.trim()
      };

      this.dialogRef.close(data);
    } else {
      console.warn("Form validation failed:", {
        name: this.name,
        description: this.description,
        endingDate: this.endingDate,
        organizationId: orgId
      });
    }
  }

}
