import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
  selector: 'app-delete-member-modal',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    TranslatePipe
  ],
  templateUrl: './delete-member-modal.component.html',
  styleUrls: ['./delete-member-modal.component.css']
})
export class DeleteMemberModalComponent {
  constructor(
    public dialogRef: MatDialogRef<DeleteMemberModalComponent>
  ) {}
}
