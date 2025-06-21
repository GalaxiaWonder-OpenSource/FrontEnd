import { Component } from '@angular/core';
import { MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { TranslatePipe } from '@ngx-translate/core';

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
    TranslatePipe
  ],
  templateUrl: './create-member-modal.component.html',
  styleUrl: './create-member-modal.component.css'
})
export class CreateMemberModalComponent {
  public emailInput: string = '';
  public searchError: string | null = null;

  constructor(private dialogRef: MatDialogRef<CreateMemberModalComponent>) {}

  public close(): void {
    this.dialogRef.close();
  }

  public submit(): void {
    this.searchError = null;
    if (!this.emailInput || !this.isValidEmail(this.emailInput)) {
      this.searchError = 'organization-members.invite-modal.invalid-email';
      return;
    }
    this.dialogRef.close(this.emailInput.trim());
  }

  private isValidEmail(email: string): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }
}
