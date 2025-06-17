import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatExpansionModule } from '@angular/material/expansion';
import { TranslatePipe } from '@ngx-translate/core';
import { ActivatedRoute } from '@angular/router';
import {MatDialog, MatDialogActions, MatDialogClose, MatDialogContent, MatDialogTitle} from '@angular/material/dialog';

import { MilestoneService } from '../../services/milestone.service';
import { TaskService } from '../../services/task.service';
import { SessionService } from '../../../iam/services/session.service';

import { Milestone } from '../../model/milestone.entity';
import { Task } from '../../model/task.entity';

import { TaskListComponent } from '../task-list/task-list.component';
import { CreateTaskModalComponent } from '../create-task-modal/create-task-modal.component';
import { CreateMilestoneModalComponent } from '../create-milestone-modal/create-milestone-modal.component';
import {Specialty} from '../../model/specialty.vo';
import {TaskStatus} from '../../model/task-status.vo';

@Component({
  selector: 'app-schedule',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    MatSnackBarModule,
    MatProgressSpinnerModule,
    MatExpansionModule,
    TranslatePipe,
    TaskListComponent,
    MatDialogActions,
    MatDialogContent,
    MatDialogTitle,
    MatDialogClose
  ],
  templateUrl: './schedule.component.html',
  styleUrl: './schedule.component.css'
})
export class ScheduleComponent {
  milestones = signal<Milestone[]>([]);
  tasks = signal<Task[]>([]);
  loading = signal(false);
  error = signal<string | null>(null);

  private projectId: number;

  constructor(
    private route: ActivatedRoute,
    private milestoneService: MilestoneService,
    private taskService: TaskService,
    private sessionService: SessionService,
    private snackBar: MatSnackBar,
    private dialog: MatDialog
  ) {
    this.projectId = Number(this.route.snapshot.paramMap.get('id'));
    this.loadData();
  }

  loadData(): void {
    this.loading.set(true);
    this.error.set(null);

    const milestoneRequest = this.milestoneService.getByProjectId({ projectId: this.projectId });
    const tasksRequest = this.taskService.getAll();

    Promise.all([
      milestoneRequest.toPromise(),
      tasksRequest.toPromise()
    ]).then(
      ([milestones, rawTasks]: [Milestone[], any[]]) => {
        this.milestones.set(milestones);

        const filtered = rawTasks.filter(t =>
          milestones.some(m => m.id === t.milestoneId)
        );
        console.log('Filtered tasks:', filtered);
        console.log('Milestone IDs:', milestones.map(m => m.id));

        const parsedTasks = filtered.map(t => new Task({
          id: t.id,
          name: t.name,
          specialty: typeof t.specialty === 'string'
            ? Specialty[t.specialty as keyof typeof Specialty]
            : t.specialty,
          startingDate: new Date(t.startingDate),
          dueDate: new Date(t.dueDate),
          milestoneId: t.milestoneId,
          status: typeof t.status === 'string'
            ? TaskStatus[t.status as keyof typeof TaskStatus]
            : t.status,
          description: t.description,
          responsibleId: t.responsibleId
        }));

        this.tasks.set(parsedTasks);
      },
      (error) => {
        console.error('Failed to load schedule data:', error);
        this.error.set('schedule.loading-error');
        this.snackBar.open('Failed to load schedule data', 'Close', { duration: 3000 });
      }
    ).finally(() => {
      this.loading.set(false);
    });
  }

  getTasksForMilestone(milestone: Milestone): Task[] {
    return this.tasks().filter(task => task.milestoneId === milestone.id);
  }

  openCreateMilestoneModal(): void {
    const dialogRef = this.dialog.open(CreateMilestoneModalComponent, {
      data: { projectId: this.projectId },
      width: '500px',
      disableClose: true
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        try {
          const milestone = new Milestone(result);
          this.milestoneService.create(milestone).subscribe({
            next: () => {
              this.loadData();
              this.snackBar.open('Milestone creado exitosamente', 'Cerrar', { duration: 3000 });
            },
            error: (err: any) => {
              console.error('Failed to create milestone:', err);
              this.snackBar.open('Error al crear el milestone', 'Cerrar', { duration: 3000 });
            }
          });
        } catch (err) {
          console.error('Invalid milestone data:', err);
        }
      }
    });
  }

  openCreateTaskDialog(milestoneId: number): void {
    const dialogRef = this.dialog.open(CreateTaskModalComponent, {
      data: { milestoneId },
      width: '500px',
      disableClose: true
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        try {
          this.taskService.create(result).subscribe({
            next: () => this.loadData(),
            error: (err: any) => {
              console.error('Failed to create task:', err);
              this.snackBar.open('Error al crear la tarea', 'Cerrar', { duration: 3000 });
            }
          });
        } catch (err) {
          console.error('Validation failed when creating task:', err);
        }
      }
    });
  }

  openEditTaskDialog(task: Task): void {
    const dialogRef = this.dialog.open(CreateTaskModalComponent, {
      data: { task },
      width: '500px',
      disableClose: true
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.taskService.update({ id: task.id! }, result).subscribe({
          next: () => this.loadData(),
          error: (err: any) => {
            console.error('Error al actualizar la tarea:', err);
            this.snackBar.open('Error al actualizar la tarea', 'Cerrar', { duration: 3000 });
          }
        });
      }
    });
  }

  onDeleteTask(task: Task): void {
    if (!task.id) {
      console.warn('Cannot delete task without ID');
      return;
    }

    this.taskService.delete({ id: task.id }).subscribe({
      next: () => this.loadData(),
      error: (err: any) => {
        console.error('Failed to delete task:', err);
        this.snackBar.open('Error al eliminar la tarea', 'Cerrar', { duration: 3000 });
      }
    });
  }
  openEditMilestoneModal(milestone: Milestone): void {
    const dialogRef = this.dialog.open(CreateMilestoneModalComponent, {
      data: { milestone },
      width: '500px',
      disableClose: true
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        const updatedMilestone = new Milestone({ ...milestone, ...result });
        this.milestoneService.update({ id: updatedMilestone.id! }, updatedMilestone).subscribe({
          next: () => {
            this.loadData();
            this.snackBar.open('Milestone actualizado exitosamente', 'Cerrar', { duration: 3000 });
          },
          error: (err: any) => {
            console.error('Error al actualizar el milestone:', err);
            this.snackBar.open('Error al actualizar el milestone', 'Cerrar', { duration: 3000 });
          }
        });
      }
    });
  }

  deleteMilestone(id: number): void {
    this.milestoneService.delete({ id }).subscribe({
      next: () => {
        this.loadData();
        this.snackBar.open('Milestone eliminado correctamente', 'Cerrar', { duration: 3000 });
      },
      error: (err: any) => {
        console.error('Error al eliminar el milestone:', err);
        this.snackBar.open('Error al eliminar el milestone', 'Cerrar', { duration: 3000 });
      }
    });
  }
}
