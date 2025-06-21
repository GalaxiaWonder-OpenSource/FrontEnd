import { Component, Output, EventEmitter } from '@angular/core';
import {MatButton} from '@angular/material/button';
import {NgIf} from '@angular/common';
import {FormsModule} from '@angular/forms';
import {MatError, MatFormField, MatInput, MatLabel} from '@angular/material/input';

@Component({
  selector: 'app-delete-organization-modal',
  templateUrl: './delete-organization-modal.component.html',
  imports: [
    MatButton,
    NgIf,
    FormsModule,
    MatInput,
    MatError,
    MatLabel,
    MatFormField
  ],
  styleUrls: ['./delete-organization-modal.component.css']
})
export class DeleteOrganizationModalComponent {
  ruc: string = '';

  @Output() deleteRequested = new EventEmitter<string>();

  get isFormValid(): boolean {
    return /^\d{11}$/.test(this.ruc); // Valida RUC de 11 dígitos
  }

  onDelete(): void {
    if (this.isFormValid) {
      this.deleteRequested.emit(this.ruc.trim());
    }
  }
}
