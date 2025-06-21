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
    @Inject(MAT_DIALOG_DATA) public data: { projectId?: number, milestone?: any }
  ) {
    // Inicializar campos si se está editando un milestone existente
    if (this.data.milestone) {
      this.name = this.data.milestone.name || '';
      this.description = this.data.milestone.description || '';
      
      // Formatear fechas para los campos datetime-local
      if (this.data.milestone.startingDate) {
        const startDate = new Date(this.data.milestone.startingDate);
        this.startingDate = this.formatDateForInput(startDate);
      }
      
      if (this.data.milestone.endingDate) {
        const endDate = new Date(this.data.milestone.endingDate);
        this.endingDate = this.formatDateForInput(endDate);
      }
    }
  }
  
  private formatDateForInput(date: Date): string {
    return date.toISOString().slice(0, 10); // Only keep YYYY-MM-DD part
  }

  close(): void {
    this.dialogRef.close();
  }

  submit(): void {
    if (!this.name || !this.startingDate || !this.endingDate) return;

    this.isLoading = true;

    const formData: { 
      name: string; 
      description: string; 
      startingDate: Date; 
      endingDate: Date; 
      projectId: any;
      id?: number;  // Added optional id property
    } = {
      name: this.name,
      description: this.description,
      startingDate: new Date(this.startingDate + 'T00:00:00'), // Add time portion set to midnight
      endingDate: new Date(this.endingDate + 'T00:00:00'),     // Add time portion set to midnight
      projectId: this.data.projectId || (this.data.milestone ? this.data.milestone.projectId : null)
    };

    // Mantener el ID si estamos editando
    if (this.data.milestone && this.data.milestone.id) {
      formData.id = this.data.milestone.id;
    }

    this.dialogRef.close(formData); // Entrega los datos al componente padre
  }
}
