import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogActions, MatDialogContent, MatDialogTitle } from '@angular/material/dialog';
import { TranslatePipe } from '@ngx-translate/core';
import { Specialty } from '../../model/specialty.vo';
import { TaskStatus } from '../../model/task-status.vo';
import { ProjectTeamMember } from '../../model/project-team-member.entity';
import { ProjectTeamMemberService } from '../../services/project-team-member.service';

@Component({
  selector: 'app-create-task-modal',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatDialogTitle,
    MatDialogContent,
    MatDialogActions,
    TranslatePipe
  ],
  templateUrl: './create-task-modal.component.html',
  styleUrl: './create-task-modal.component.css'
})
export class CreateTaskModalComponent {
  name = '';
  description = '';
  startDate = '';
  endDate = '';
  specialty = '';
  status = TaskStatus.DRAFT;
  responsibleId: number | undefined;

  teamMembers: ProjectTeamMember[] = [];
  taskStatusValues = Object.keys(TaskStatus) as TaskStatus[];
  specialtyValues = Object.keys(Specialty) as Specialty[];

  constructor(
    private dialogRef: MatDialogRef<CreateTaskModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { milestoneId: number },
    private teamService: ProjectTeamMemberService
  ) {
    this.loadTeamMembers();
  }

  private loadTeamMembers() {
    this.teamService.getAll().subscribe({
      next: (members: any) => (this.teamMembers = members),
      error: (err: any) => console.error('Error loading team members:', err)
    });
  }

  close(): void {
    this.dialogRef.close();
  }

  submit(): void {
    if (!this.name.trim() || !this.specialty || !this.startDate || !this.endDate) return;

    this.dialogRef.close({
      name: this.name.trim(),
      description: this.description.trim(),
      specialty: this.specialty as Specialty,
      startingDate: new Date(this.startDate),
      dueDate: new Date(this.endDate),
      status: this.status,
      responsibleId: this.responsibleId,
      milestoneId: this.data.milestoneId
    });
  }
}
