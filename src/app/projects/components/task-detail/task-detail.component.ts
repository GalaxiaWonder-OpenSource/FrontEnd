import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

import { Task } from '../../model/task.entity';
import { TaskService } from '../../services/task.service';
import { TaskStatus } from '../../model/task-status.vo';
import { Specialty } from '../../model/specialty.vo';
import { SessionService } from '../../../iam/services/session.service';

@Component({
  selector: 'app-task-detail',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    TranslateModule
  ],
  templateUrl: './task-detail.component.html',
  styleUrl: './task-detail.component.css'
})
export class TaskDetailComponent implements OnInit {
  @Input() task: Task | undefined;
  @Output() saved = new EventEmitter<Task>();
  @Output() canceled = new EventEmitter<void>();

  taskForm: FormGroup;
  loading = false;
  error: string | null = null;
  isNewTask = true;

  // Enums
  TaskStatus = TaskStatus;
  Specialty = Specialty;

  constructor(
    private fb: FormBuilder,
    private taskService: TaskService,
    private sessionService: SessionService,
    private snackBar: MatSnackBar,
    private translate: TranslateService
  ) {
    this.taskForm = this.createForm();
  }

  ngOnInit(): void {
    if (this.task) {
      this.isNewTask = false;
      this.populateForm();
    }
  }

  createForm(): FormGroup {
    return this.fb.group({
      name: ['', [Validators.required, Validators.maxLength(100)]],
      specialty: ['', Validators.required],
      startingDate: [new Date(), Validators.required],
      dueDate: [new Date(), Validators.required],
      status: [TaskStatus.DRAFT, Validators.required],
      description: [''],
      responsibleId: ['']
    });
  }

  populateForm(): void {
    if (!this.task) return;

    this.taskForm.patchValue({
      name: this.task.name,
      specialty: this.task.specialty,
      startingDate: this.task.startingDate,
      dueDate: this.task.dueDate,
      status: this.task.status,
      description: this.task.description || '',
      responsibleId: this.task.responsibleId
    });
  }

  onSubmit(): void {
    if (this.taskForm.invalid) {
      this.markFormGroupTouched(this.taskForm);
      return;
    }

    this.loading = true;
    const formValues = this.taskForm.value;
    const milestoneId = this.task?.milestoneId || this.sessionService.getMilestoneId();

    if (!milestoneId) {
      this.error = this.translate.instant('tasks.errors.noMilestone');
      this.loading = false;
      return;
    }

    const task = new Task({
      id: this.task?.id,
      name: formValues.name,
      specialty: formValues.specialty,
      startingDate: formValues.startingDate,
      dueDate: formValues.dueDate,
      milestoneId,
      status: formValues.status,
      description: formValues.description,
      responsibleId: formValues.responsibleId
    });

    if (this.isNewTask) {
      this.taskService.create(task).subscribe({
        next: (saved: Task) => {
          this.loading = false;
          this.snackBar.open(
            this.translate.instant('tasks.created'),
            this.translate.instant('common.close'),
            { duration: 3000 }
          );
          this.saved.emit(saved);
        },
        error: () => {
          this.loading = false;
          this.error = this.translate.instant('tasks.errors.save');
        }
      });
    } else {
      this.taskService.update(task, { id: task.id?.toString()! }).subscribe({
        next: (updated: Task) => {
          this.loading = false;
          this.snackBar.open(
            this.translate.instant('tasks.updated'),
            this.translate.instant('common.close'),
            { duration: 3000 }
          );
          this.saved.emit(updated);
        },
        error: () => {
          this.loading = false;
          this.error = this.translate.instant('tasks.errors.save');
        }
      });
    }
  }

  cancel(): void {
    this.canceled.emit();
  }

  private markFormGroupTouched(formGroup: FormGroup) {
    Object.values(formGroup.controls).forEach(control => {
      control.markAsTouched();
      if (control instanceof FormGroup) {
        this.markFormGroupTouched(control);
      }
    });
  }
}
