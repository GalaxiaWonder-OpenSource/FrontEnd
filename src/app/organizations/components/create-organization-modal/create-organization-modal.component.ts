import { Component } from '@angular/core';
import { MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
  selector: 'app-create-organization-modal',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    TranslatePipe
  ],
  templateUrl: './create-organization-modal.component.html',
  styleUrl: './create-organization-modal.component.css'
})
export class CreateOrganizationModalComponent {
  legalName = '';
  commercialName = '';
  ruc = '';

  constructor(private dialogRef: MatDialogRef<CreateOrganizationModalComponent>) {}

  close(): void {
    this.dialogRef.close();
  }

  submit(): void {
    if (this.legalName && this.ruc) {
      const data = {
        legalName: this.legalName,
        commercialName: this.commercialName,
        ruc: this.ruc
      };
      this.dialogRef.close(data);
    }
  }
}
