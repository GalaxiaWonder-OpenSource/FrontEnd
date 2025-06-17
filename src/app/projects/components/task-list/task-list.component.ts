import { Component, Input, Output, EventEmitter, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { TranslatePipe } from '@ngx-translate/core';
import { MatDialog } from '@angular/material/dialog';
import { TaskService } from '../../services/task.service';
import { CreateTaskModalComponent } from '../create-task-modal/create-task-modal.component';
import { Task } from '../../model/task.entity';
import { Specialty } from '../../model/specialty.vo';
import { TaskStatus } from '../../model/task-status.vo';

@Component({
  selector: 'app-task-list',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    TranslatePipe
  ],
  templateUrl: './task-list.component.html',
  styleUrl: './task-list.component.css'
})
export class TaskListComponent {
  @Input() tasks: Task[] = [];
  @Input() milestoneId!: string;

  @Output() editTask = new EventEmitter<Task>();
  @Output() deleteTask = new EventEmitter<Task>();
  @Output() assignResponsible = new EventEmitter<Task>();

  constructor(
    private dialog: MatDialog,
    private taskService: TaskService
  ) {}

  getSpecialtyTranslation(specialty: Specialty): string {
    return `schedule.specialties.${specialty}`;
  }

  getStatusTranslation(status: TaskStatus): string {
    return `schedule.task-statuses.${status}`;
  }

  getResponsibleName(responsibleId?: number): string {
    return responsibleId ? `#${responsibleId}` : '-';
  }

  onEdit(task: Task) {
    this.editTask.emit(task);
  }

  onDelete(task: Task) {
    this.deleteTask.emit(task);
  }

  onAssign(task: Task) {
    this.assignResponsible.emit(task);
  }

  onCreate(): void {
    const dialogRef = this.dialog.open(CreateTaskModalComponent, {
      data: { milestoneId: this.milestoneId },
      width: '500px'
    });

    dialogRef.afterClosed().subscribe((createdTask: Task | undefined) => {
      if (createdTask) {
        this.taskService.create({}, createdTask).subscribe({
          next: () => {
            // ⚠️ Aquí deberías usar una función como reloadTasks() o emitir un evento
            this.tasks = [...this.tasks, createdTask];
          }
        });
      }
    });
  }
}
