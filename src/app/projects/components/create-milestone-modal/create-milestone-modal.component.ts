import { Component, Inject } from '@angular/core';
import {
  MatDialogRef,
  MAT_DIALOG_DATA,
  MatDialogActions,
  MatDialogContent,
  MatDialogTitle
} from '@angular/material/dialog';
import {TranslatePipe} from '@ngx-translate/core';
import {FormsModule} from '@angular/forms';
import {MatFormField, MatInput, MatLabel} from '@angular/material/input';
import {MatButton} from '@angular/material/button';


@Component({
  selector: 'app-create-milestone-modal',
  standalone: true,
  templateUrl: './create-milestone-modal.component.html',
  imports: [
    TranslatePipe,
    FormsModule,
    MatFormField,
    MatLabel,
    MatButton,
    MatDialogActions,
    MatInput,
    MatDialogContent,
    MatDialogTitle
  ],
  styleUrl: './create-milestone-modal.component.css'
})
export class CreateMilestoneModalComponent {
  name = '';
  description = '';
  startingDate = '';
  endingDate = '';
  isLoading = false;

  constructor(
    private dialogRef: MatDialogRef<CreateMilestoneModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { projectId: number }
  ) {}

  close(): void {
    this.dialogRef.close();
  }

  submit(): void {
    if (!this.name || !this.startingDate || !this.endingDate) return;

    this.isLoading = true;

    const formData = {
      name: this.name,
      description: this.description,
      startingDate: new Date(this.startingDate),
      endingDate: new Date(this.endingDate),
      projectId: this.data.projectId
    };

    this.dialogRef.close(formData); // Entrega los datos al componente padre
  }
}
