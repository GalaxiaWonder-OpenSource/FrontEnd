import { Component } from '@angular/core';
import {FormsModule} from "@angular/forms";
import {MatButton} from "@angular/material/button";
import {MatDialogActions, MatDialogContent, MatDialogRef, MatDialogTitle} from "@angular/material/dialog";
import {MatInput, MatLabel} from "@angular/material/input";
import {TranslatePipe} from "@ngx-translate/core";
import {MatFormFieldModule} from '@angular/material/form-field';

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
        TranslatePipe
    ],
  templateUrl: './create-project-modal.component.html',
  styleUrl: './create-project-modal.component.css'
})
export class CreateProjectModalComponent {
  name='';
  description='';
  startingDate=new Date();
  endingDate=new Date();

  constructor(private dialogRef: MatDialogRef<CreateProjectModalComponent>) {}

  close(): void {
    this.dialogRef.close();
  }

  submit(): void {
    if (this.name && this.endingDate) {
      const data = {
        name: this.name,
        description: this.description,
        startingDate: this.startingDate,
        endingDate: this.endingDate
      };
      this.dialogRef.close(data);
    }
  }
}
