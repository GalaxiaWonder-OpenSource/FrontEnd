import { Component } from '@angular/core';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { CreateOrganizationModalComponent } from '../create-organization-modal/create-organization-modal.component';
import {TranslatePipe} from '@ngx-translate/core';

@Component({
  selector: 'app-create-organization-button',
  standalone: true,
  imports: [MatButtonModule, MatDialogModule, TranslatePipe],
  template: `
    <button mat-raised-button color="primary" (click)="openDialog()">
      {{ 'organization-list.create-button' | translate }}
    </button>
  `
})
export class CreateOrganizationButtonComponent {
  constructor(private dialog: MatDialog) {}

  openDialog(): void {
    this.dialog.open(CreateOrganizationModalComponent, {
      width: '500px',
      disableClose: true
    });
  }
}
