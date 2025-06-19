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
import { Task } from '../../model/task.entity';

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
  providers: [TranslatePipe],  // Add TranslatePipe as a provider
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
    @Inject(MAT_DIALOG_DATA) public data: { milestoneId?: number, task?: Task },
    private teamService: ProjectTeamMemberService
  ) {
    this.loadTeamMembers();
    this.initializeFromTask();
  }

  private loadTeamMembers() {
    this.teamService.getAll().subscribe({
      next: (members: any) => {
        // Process the members to ensure they have the required properties
        this.teamMembers = members.map((member: any) => {
          // If team member is missing fullName property, construct it from firstName and lastName
          if (!member.fullName && (member.firstName || member.lastName)) {
            member.fullName = `${member.firstName || ''} ${member.lastName || ''}`.trim();
          }

          // If no name is available, use a placeholder
          if (!member.fullName) {
            member.fullName = `Member #${member.id}`;
          }

          return member;
        });
      },
      error: (err: any) => console.error('Error loading team members:', err)
    });
  }

  close(): void {
    this.dialogRef.close();
  }

  submit(): void {
    if (!this.name.trim() || !this.specialty || !this.startDate || !this.endDate) return;

    this.dialogRef.close({
      id: this.data.task?.id, // Preserve the ID if editing an existing task
      name: this.name.trim(),
      description: this.description.trim(),
      specialty: this.specialty as Specialty,
      startingDate: new Date(this.startDate + 'T00:00:00'), // Add time portion set to midnight
      dueDate: new Date(this.endDate + 'T00:00:00'),        // Add time portion set to midnight
      status: this.status,
      responsibleId: this.responsibleId,
      milestoneId: this.data.task?.milestoneId || this.data.milestoneId // Use existing milestone ID if available
    });
  }

  private initializeFromTask() {
    if (this.data.task) {
      const task = this.data.task;
      this.name = task.name;
      this.description = task.description || '';
      this.specialty = task.specialty;
      this.status = task.status;
      this.responsibleId = task.responsibleId;

      // Format dates for datetime-local input
      if (task.startingDate) {
        const startDate = new Date(task.startingDate);
        this.startDate = this.formatDateForInput(startDate);
      }

      if (task.dueDate) {
        const dueDate = new Date(task.dueDate);
        this.endDate = this.formatDateForInput(dueDate);
      }
    }
  }

  private formatDateForInput(date: Date): string {
    return date.toISOString().slice(0, 10); // Only keep YYYY-MM-DD part
  }
}
