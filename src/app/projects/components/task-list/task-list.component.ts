import { Component, OnInit, ViewChild, TemplateRef } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTabsModule } from '@angular/material/tabs';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDialogModule, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { MatTabChangeEvent } from '@angular/material/tabs';
import { TranslateModule, TranslatePipe } from '@ngx-translate/core';
import { NgClass, NgIf, NgFor } from '@angular/common';

import { TaskDetailComponent } from '../task-detail/task-detail.component';
import { TaskService } from '../../services/task.service';
import { Task } from '../../model/task.entity';
import { TaskStatus } from '../../model/task-status.vo';
import { SessionService } from '../../../iam/services/session.service';

@Component({
  selector: 'app-task-list',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatTabsModule,
    MatTooltipModule,
    MatProgressSpinnerModule,
    MatDialogModule,
    TranslateModule,
    DatePipe
  ],
  providers: [TaskService],
  templateUrl: './task-list.component.html',
  styleUrl: './task-list.component.css'
})
export class TaskListComponent implements OnInit {
  @ViewChild('taskDetailDialog') taskDetailDialog!: TemplateRef<any>;

  tasks: Task[] = [];
  filteredTasks: Task[] = [];
  loading = false;
  error: string | null = null;
  selectedTask: Task | null = null;
  isNewTask = false;

  // Expose TaskStatus enum to template
  TaskStatus = TaskStatus;

  constructor(
    private taskService: TaskService,
    private sessionService: SessionService,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.loadTasks();
  }

  loadTasks(): void {
    const milestoneId = this.sessionService.getMilestoneId();
    if (!milestoneId) {
      this.error = 'No milestone selected';
      return;
    }

    this.loading = true;
    this.taskService.getByMilestoneId(undefined, { milestoneId: String(milestoneId) })
      .subscribe({
        next: (tasks: any) => {
          this.tasks = tasks;
          this.filteredTasks = tasks;
          this.loading = false;
        },
        error: (err: any) => {
          console.error('Error loading tasks:', err);
          this.error = 'Failed to load tasks';
          this.loading = false;
        }
      });
  }

  filterTasksByStatus(event: MatTabChangeEvent): void {
    let status: TaskStatus | undefined;

    // Determine status based on tab label
    const tabLabel = event.tab.textLabel;
    if (tabLabel === 'pending') {
      status = TaskStatus.PENDING;
    } else if (tabLabel === 'inProgress') {
      status = TaskStatus.IN_PROGRESS;
    } else if (tabLabel === 'completed') {
      status = TaskStatus.COMPLETED;
    }

    // Filter tasks based on selected status
    if (!status) {
      this.filteredTasks = this.tasks;
      return;
    }

    this.filteredTasks = this.tasks.filter(task => task.status === status);
  }

  getStatusClass(status: TaskStatus): string {
    switch (status) {
      case TaskStatus.COMPLETED: return 'status-completed';
      case TaskStatus.IN_PROGRESS: return 'status-in-progress';
      case TaskStatus.PENDING: return 'status-pending';
      case TaskStatus.DRAFT: return 'status-draft';
      case TaskStatus.CANCELED: return 'status-canceled';
      default: return '';
    }
  }

  selectTask(task: Task): void {
    this.selectedTask = task;
    this.isNewTask = false;
    this.openTaskDialog();
  }

  createTask(): void {
    this.selectedTask = null;
    this.isNewTask = true;
    this.openTaskDialog();
  }

  openTaskDialog(): void {
    this.dialog.open(this.taskDetailDialog, {
      width: '800px',
      maxHeight: '90vh',
      panelClass: 'no-padding-dialog'
    });
  }

  closeTaskDetail(): void {
    this.dialog.closeAll();
  }

  onTaskSaved(task: Task): void {
    this.dialog.closeAll();
    this.loadTasks();
  }
}
