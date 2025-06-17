import { Component, OnInit, OnDestroy, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatDialog, MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { RouterModule } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { Subscription } from 'rxjs';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

import { Milestone } from '../../model/milestone.entity';
import { Project } from '../../model/project.entity';
import { MilestoneService } from '../../services/milestone.service';
import { ProjectService } from '../../services/project.service';
import { SessionService } from '../../../iam/services/session.service';
import { TaskService } from '../../services/task.service';
import { Task } from '../../model/task.entity';
import { Specialty } from '../../model/specialty.vo';
import { TaskStatus } from '../../model/task-status.vo';

@Component({
  selector: 'app-milestone-configuration',
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatIconModule,
    MatTableModule,
    MatDialogModule,
    RouterModule,
    TranslateModule
  ],
  providers: [MilestoneService, TaskService],
  standalone: true,
  templateUrl: './milestone-configuration.component.html',
  styleUrl: './milestone-configuration.component.css'
})
export class MilestoneConfigurationComponent implements OnInit, OnDestroy {
  milestones: Milestone[] = [];
  project: Project | null = null;
  displayedColumns: string[] = ['name', 'startingDate', 'endingDate', 'description', 'actions'];
  loading = true;
  error: string | null = null;

  private subscriptions: Subscription[] = [];

  constructor(
    private milestoneService: MilestoneService,
    private projectService: ProjectService,
    private sessionService: SessionService,
    private snackBar: MatSnackBar,
    private translate: TranslateService,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.loadProject();
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  loadProject(): void {
    const projectId = this.sessionService.getProjectId();
    if (!projectId) {
      this.error = this.translate.instant('milestone-configuration.errors.no-project-id');
      this.loading = false;
      return;
    }

    const projectSub = this.projectService.getById(null, { id: projectId }).subscribe({
      next: (project: Project) => {
        this.project = project;
        this.loadMilestones();
      },
      error: (error: any) => {
        console.error('Error loading project:', error);
        this.error = this.translate.instant('milestone-configuration.errors.load-project');
        this.loading = false;
      }
    });

    this.subscriptions.push(projectSub);
  }

  loadMilestones(): void {
    if (!this.project) {
      return;
    }

    // Los ids son de tipo number en las entidades
    const projectId = this.project.id;

    const milestonesSub = this.milestoneService.getMilestonesByProjectId(projectId).subscribe({
      next: (milestones: Milestone[]) => {
        this.milestones = milestones;
        this.loading = false;
      },
      error: (error: any) => {
        console.error('Error loading milestones:', error);
        this.error = this.translate.instant('milestone-configuration.errors.load-milestones');
        this.loading = false;
      }
    });

    this.subscriptions.push(milestonesSub);
  }

  deleteMilestone(milestone: Milestone): void {
    if (confirm(this.translate.instant('milestone-configuration.confirm-delete'))) {
      this.loading = true;
      const milestoneId = milestone.id;

      const deleteSub = this.milestoneService.deleteMilestone(milestoneId).subscribe({
        next: () => {
          this.milestones = this.milestones.filter(m => m.id !== milestoneId);

          this.loading = false;
          this.snackBar.open(
            this.translate.instant('milestone-configuration.success.milestone-deleted'),
            this.translate.instant('milestone-configuration.actions.close'),
            { duration: 3000 }
          );
        },
        error: (error: any) => {
          console.error('Error deleting milestone:', error);
          
          // Aún así actualizamos la UI para reflejar la eliminación ya que el backend podría 
          // haber eliminado el hito a pesar del error
          this.milestones = this.milestones.filter(m => m.id !== milestoneId);
          
          this.loading = false;
          this.snackBar.open(
            `${this.translate.instant('milestone-configuration.errors.delete-milestone')}: ${error.message}`,
            this.translate.instant('milestone-configuration.actions.close'),
            { duration: 5000 }
          );
        }
      });

      this.subscriptions.push(deleteSub);
    }
  }

  navigateToSchedule(): void {
    // This will be implemented with RouterLink in the template
  }

  openAddTaskDialogForMilestone(milestone: Milestone): void {
    console.log('Open add task dialog for milestone', milestone);
    
    // Creamos un diálogo inline para no necesitar archivos adicionales
    const dialogRef = this.dialog.open(
      // Definimos un componente anónimo inline
      (function() {
        @Component({
          template: `
            <h2 mat-dialog-title>Añadir nueva tarea</h2>
            <mat-dialog-content>
              <form [formGroup]="taskForm">
                <mat-form-field appearance="fill" style="width: 100%; margin-bottom: 15px;">
                  <mat-label>Nombre</mat-label>
                  <input matInput formControlName="name" required>
                </mat-form-field>

                <mat-form-field appearance="fill" style="width: 100%; margin-bottom: 15px;">
                  <mat-label>Descripción</mat-label>
                  <textarea matInput formControlName="description" rows="3"></textarea>
                </mat-form-field>

                <mat-form-field appearance="fill" style="width: 100%; margin-bottom: 15px;">
                  <mat-label>Especialidad</mat-label>
                  <mat-select formControlName="specialty" required>
                    <mat-option *ngFor="let spec of specialties" [value]="spec">{{spec}}</mat-option>
                  </mat-select>
                </mat-form-field>

                <div style="display: flex; flex-direction: row;">
                  <mat-form-field appearance="fill" style="width: 48%; margin-right: 2%;">
                    <mat-label>Fecha de inicio</mat-label>
                    <input matInput [matDatepicker]="startPicker" formControlName="startingDate" required>
                    <mat-datepicker-toggle matSuffix [for]="startPicker"></mat-datepicker-toggle>
                    <mat-datepicker #startPicker></mat-datepicker>
                  </mat-form-field>

                  <mat-form-field appearance="fill" style="width: 48%;">
                    <mat-label>Fecha de vencimiento</mat-label>
                    <input matInput [matDatepicker]="duePicker" formControlName="dueDate" required>
                    <mat-datepicker-toggle matSuffix [for]="duePicker"></mat-datepicker-toggle>
                    <mat-datepicker #duePicker></mat-datepicker>
                  </mat-form-field>
                </div>
              </form>
            </mat-dialog-content>
            <mat-dialog-actions align="end">
              <button mat-button (click)="onCancel()">Cancelar</button>
              <button mat-raised-button color="primary" (click)="onSubmit()" [disabled]="taskForm.invalid">
                Guardar
              </button>
            </mat-dialog-actions>
          `,
          standalone: true,
          imports: [
            CommonModule, FormsModule, ReactiveFormsModule, MatDialogModule, MatButtonModule,
            MatFormFieldModule, MatInputModule, MatSelectModule, MatDatepickerModule, MatNativeDateModule
          ]
        })
        class AddTaskDialogComponent {
          taskForm: FormGroup;
          specialties = Object.values(Specialty);

          constructor(
            private fb: FormBuilder,
            private taskService: TaskService,
            private dialogRef: MatDialogRef<any>,
            @Inject(MAT_DIALOG_DATA) public milestone: Milestone
          ) {
            console.log('Dialog initialized with milestone:', milestone);
            
            this.taskForm = this.fb.group({
              name: ['', Validators.required],
              description: [''],
              specialty: ['', Validators.required],
              startingDate: [new Date(), Validators.required],
              dueDate: [new Date(), Validators.required],
            });
          }

          onSubmit(): void {
            if (this.taskForm.valid) {
              const formValue = this.taskForm.value;
              
              const task = new Task({
                name: formValue.name,
                description: formValue.description,
                specialty: formValue.specialty,
                startingDate: formValue.startingDate,
                dueDate: formValue.dueDate,
                milestoneId: this.milestone.id,
                status: TaskStatus.PENDING
              });
              
              this.taskService.createTask(task).subscribe({
                next: (createdTask) => {
                  console.log('Task created:', createdTask);
                  this.dialogRef.close(createdTask);
                },
                error: (error) => {
                  console.error('Error creating task:', error);
                }
              });
            }
          }

          onCancel(): void {
            this.dialogRef.close();
          }
        }
        return AddTaskDialogComponent;
      })(),
      { 
        data: milestone,
        width: '500px'
      }
    );

    dialogRef.afterClosed().subscribe(result => {
      // Si se creó exitosamente una tarea, actualizamos la vista
      if (result) {
        this.snackBar.open('Tarea creada exitosamente', 'Cerrar', { duration: 3000 });
        // Aquí podrías actualizar la lista de tareas si lo necesitas
      }
    });
  }
}
