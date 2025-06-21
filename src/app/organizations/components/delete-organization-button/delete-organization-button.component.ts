import { Component, Output, EventEmitter } from '@angular/core';
import {FormsModule} from '@angular/forms';
import {MatError, MatFormField, MatInput, MatLabel} from '@angular/material/input';
import {MatButton} from '@angular/material/button';
import {NgIf} from '@angular/common';
import {TranslatePipe} from '@ngx-translate/core';

@Component({
  selector: 'app-delete-organization-button',
  templateUrl: './delete-organization-button.component.html',
  imports: [
    MatFormField,
    MatLabel,
    FormsModule,
    MatFormField,
    MatLabel,
    MatInput,
    MatError,
    MatLabel,
    MatFormField,
    MatButton,
    NgIf,
    TranslatePipe
  ],
  styleUrls: ['./delete-organization-button.component.css']
})
export class DeleteOrganizationButtonComponent {
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
