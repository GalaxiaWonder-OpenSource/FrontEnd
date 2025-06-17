import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatButtonModule } from '@angular/material/button';
import { TranslatePipe } from '@ngx-translate/core';

import { Task } from '../../model/task.entity';
import { Specialty } from '../../model/specialty.vo';
import { TaskStatus } from '../../model/task-status.vo';

@Component({
  selector: 'app-task-detail',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatButtonModule,
    TranslatePipe
  ],
  templateUrl: './task-detail.component.html',
  styleUrl: './task-detail.component.css'
})
export class TaskDetailComponent implements OnInit {
  @Input() task: Task | null = null;
  @Input() milestoneId!: number;
  @Input() isEdit = false;

  @Output() submitTask = new EventEmitter<Task>();
  @Output() cancel = new EventEmitter<void>();

  form!: FormGroup;

  specialties: Specialty[] = Object.values(Specialty) as Specialty[];
  statuses: TaskStatus[] = Object.values(TaskStatus) as TaskStatus[];


  constructor(private fb: FormBuilder) {}

  ngOnInit(): void {
    this.form = this.fb.group({
      name: [this.task?.name || '', Validators.required],
      specialty: [this.task?.specialty || '', Validators.required],
      status: [this.task?.status || TaskStatus.DRAFT, Validators.required],
      startingDate: [this.task?.startingDate || new Date(), Validators.required],
      dueDate: [this.task?.dueDate || new Date(), Validators.required],
      description: [this.task?.description || '']
    });
  }

  onSubmit(): void {
    if (this.form.invalid) return;
    const value = this.form.value;

    const task = new Task({
      id: this.task?.id,
      name: value.name,
      specialty: value.specialty,
      startingDate: value.startingDate,
      dueDate: value.dueDate,
      milestoneId: this.milestoneId,
      status: value.status,
      description: value.description
    });

    this.submitTask.emit(task);
  }

  onCancel(): void {
    this.cancel.emit();
  }

  getSpecialtyTranslation(specialty: Specialty): string {
    return `schedule.specialties.${specialty}`;
  }

  getStatusTranslation(status: TaskStatus): string {
    return `schedule.task-statuses.${status}`;
  }
}
