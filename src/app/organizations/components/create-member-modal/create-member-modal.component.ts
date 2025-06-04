import { Component } from '@angular/core';
import { MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { TranslatePipe } from '@ngx-translate/core';
import { OrganizationMemberType } from '../../../organizations/model/organization-member-type.vo';

@Component({
  selector: 'app-create-member-modal',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatSelectModule,
    TranslatePipe
  ],
  templateUrl: './create-member-modal.component.html',
  styleUrl: './create-member-modal.component.css'
})
export class CreateMemberModalComponent {
  email = '';
  firstName = '';
  lastName = '';
  memberType: OrganizationMemberType = OrganizationMemberType.CONTRACTOR;

  // Opciones disponibles para el tipo de miembro
  memberTypes = [
    { value: OrganizationMemberType.CONTRACTOR, label: 'create-member.contractor' },
    { value: OrganizationMemberType.WORKER, label: 'create-member.worker' }
  ];

  constructor(private dialogRef: MatDialogRef<CreateMemberModalComponent>) {}

  close(): void {
    this.dialogRef.close();
  }

  submit(): void {
    if (this.email && this.firstName && this.lastName) {
      const data = {
        email: this.email,
        firstName: this.firstName,
        lastName: this.lastName,
        memberType: this.memberType
      };
      this.dialogRef.close(data);
    }
  }

  // Validación para habilitar/deshabilitar el botón de envío
  get isFormValid(): boolean {
    return !!(this.email && this.firstName && this.lastName && this.email.includes('@'));
  }
}
