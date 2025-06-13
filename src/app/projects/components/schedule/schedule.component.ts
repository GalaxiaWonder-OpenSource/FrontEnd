// filepath: /Users/mariolopez/Documents/Universidad/OpenSource/FrontEnd/src/app/projects/components/schedule/schedule.component.ts
import { Component, OnDestroy, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDialog, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSelectModule } from '@angular/material/select';
import { MatExpansionModule } from '@angular/material/expansion';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { Subscription, forkJoin } from 'rxjs';
import { Project } from '../../model/project.entity';
import { Milestone } from '../../model/milestone.entity';
import { Task } from '../../model/task.entity';
import { Specialty } from '../../model/specialty.vo';
import { TaskStatus } from '../../model/task-status.vo';
import { MilestoneService } from '../../services/milestone.service';
import { TaskService } from '../../services/task.service';
import { ProjectService } from '../../services/project.service';
import { SessionService } from '../../../iam/services/session.service';
import { ProjectTeamMemberService } from '../../services/project-team-member.service';
import { ProjectTeamMember } from '../../model/project-team-member.entity';
import { PersonService } from '../../../iam/services/person.service';

@Component({
  selector: 'app-schedule',
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatCardModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatSnackBarModule,
    MatProgressSpinnerModule,
    MatIconModule,
    MatTooltipModule,
    MatSelectModule,
    MatExpansionModule,
    TranslateModule
  ],
  standalone: true,
  templateUrl: './schedule.component.html',
  styleUrl: './schedule.component.css'
})
export class ScheduleComponent implements OnInit, OnDestroy {
  @ViewChild('addMilestoneDialog') addMilestoneDialog!: TemplateRef<any>;
  @ViewChild('editMilestoneDialog') editMilestoneDialog!: TemplateRef<any>;
  @ViewChild('addTaskDialog') addTaskDialog!: TemplateRef<any>;
  @ViewChild('editTaskDialog') editTaskDialog!: TemplateRef<any>;
  @ViewChild('assignResponsibleDialog') assignResponsibleDialog!: TemplateRef<any>;
  
  milestones: Milestone[] = [];
  milestoneTasksMap: Map<string, Task[]> = new Map<string, Task[]>();
  project: Project | null = null;
  milestoneForm: FormGroup;
  taskForm: FormGroup;
  loading = true;
  error: string | null = null;
  
  // Para edición
  currentMilestone: Milestone | null = null;
  currentTask: Task | null = null;
  
  // Especialidades disponibles para las tareas
  specialties = Object.values(Specialty);
  
  // Estados disponibles para tareas
  taskStatuses = Object.values(TaskStatus);
  
  // Para asignación de responsables
  teamMembers: ProjectTeamMember[] = [];
  filteredTeamMembers: ProjectTeamMember[] = [];
  responsibleForm: FormGroup;
  
  // Para almacenar nombres de personas (cache)
  personNames: Map<string, string> = new Map<string, string>();
  
  private subscriptions: Subscription[] = [];
  private dialogRef: MatDialogRef<any> | null = null;
  
  constructor(
    private fb: FormBuilder,
    private milestoneService: MilestoneService,
    private taskService: TaskService,
    private projectService: ProjectService,
    private sessionService: SessionService,
    private teamMemberService: ProjectTeamMemberService,
    private personService: PersonService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar,
    private translate: TranslateService
  ) {
    this.milestoneForm = this.fb.group({
      name: ['', [Validators.required]],
      startingDate: [new Date(), [Validators.required]],
      endingDate: [new Date(), [Validators.required]],
      description: ['']
    });
    
    this.taskForm = this.fb.group({
      name: ['', [Validators.required]],
      specialty: ['', [Validators.required]],
      status: [TaskStatus.DRAFT, [Validators.required]],
      startingDate: [new Date(), [Validators.required]],
      dueDate: [new Date(), [Validators.required]],
      description: ['']
    });
    
    // Formulario para asignación de responsables
    this.responsibleForm = this.fb.group({
      responsibleId: ['', [Validators.required]]
    });
  }
  
  ngOnInit(): void {
    this.loadProject();
  }
  
  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }
  
  loadTeamMembers(projectId: string): void {
    const teamSub = this.teamMemberService.getByProjectId({ projectId }).subscribe({
      next: (members: ProjectTeamMember[]) => {
        this.teamMembers = members;
      },
      error: (error: any) => {
        console.error('Error loading team members:', error);
      }
    });
    
    this.subscriptions.push(teamSub);
  }

  loadProject(): void {
    const projectId = this.sessionService.getProjectId();
    if (!projectId) {
      this.error = this.translate.instant('schedule.errors.no-project-id');
      this.loading = false;
      return;
    }
    
    const projectSub = this.projectService.getById(null, { id: projectId }).subscribe({
      next: (project: Project) => {
        this.project = project;
        this.loadMilestones();
        this.loadTeamMembers(projectId);
      },
      error: (error: any) => {
        console.error('Error loading project:', error);
        this.error = this.translate.instant('schedule.errors.load-project');
        this.loading = false;
      }
    });
    
    this.subscriptions.push(projectSub);
  }
  
  loadMilestones(): void {
    if (!this.project) {
      return;
    }
    
    const projectId = typeof this.project.id === 'object' 
      ? this.project.id.value 
      : String(this.project.id);
      
    const milestonesSub = this.milestoneService.getMilestonesByProjectId(projectId).subscribe({
      next: (milestones: Milestone[]) => {
        this.milestones = milestones;
        // Cargar las tareas para cada hito
        this.milestones.forEach(milestone => {
          this.loadTasksForMilestone(milestone);
        });
        this.loading = false;
      },
      error: (error: any) => {
        console.error('Error loading milestones:', error);
        this.error = this.translate.instant('schedule.errors.load-milestones');
        this.loading = false;
      }
    });
    
    this.subscriptions.push(milestonesSub);
  }
  
  loadTasksForMilestone(milestone: Milestone): void {
    const milestoneId = typeof milestone.id === 'object' ? milestone.id.value : String(milestone.id);
    
    const tasksSub = this.taskService.getTasksByMilestoneId(milestoneId).subscribe({
      next: (tasks: Task[]) => {
        this.milestoneTasksMap.set(milestoneId, tasks);
      },
      error: (error: any) => {
        console.error(`Error loading tasks for milestone ${milestoneId}:`, error);
      }
    });
    
    this.subscriptions.push(tasksSub);
  }
  
  getTasksForMilestone(milestone: Milestone): Task[] {
    const milestoneId = typeof milestone.id === 'object' ? milestone.id.value : String(milestone.id);
    return this.milestoneTasksMap.get(milestoneId) || [];
  }
  
  openAddMilestoneDialog(): void {
    // Reset form
    this.milestoneForm.reset({
      name: '',
      startingDate: new Date(),
      endingDate: new Date(),
      description: ''
    });
    
    this.dialog.open(this.addMilestoneDialog);
  }
  
  openEditMilestoneDialog(milestone: Milestone): void {
    this.currentMilestone = milestone;
    
    // Establecer los valores del formulario con los valores del hito seleccionado
    this.milestoneForm.reset({
      name: milestone.name,
      startingDate: new Date(milestone.startingDate),
      endingDate: new Date(milestone.endingDate),
      description: milestone.description || ''
    });
    
    this.dialogRef = this.dialog.open(this.editMilestoneDialog);
  }
  
  onSubmit(): void {
    if (this.milestoneForm.invalid || !this.project) {
      return;
    }
    
    const formValues = this.milestoneForm.value;
    const startingDate = new Date(formValues.startingDate);
    const endingDate = new Date(formValues.endingDate);
    
    // Validate dates
    const projectStartDate = new Date(this.project.startingDate);
    const projectEndDate = new Date(this.project.endingDate);
    
    // Validation 1: Start date must be before end date
    if (startingDate > endingDate) {
      // Auto adjust - make end date same as start date
      endingDate.setTime(startingDate.getTime());
      this.milestoneForm.get('endingDate')?.setValue(endingDate);
      this.snackBar.open(
        this.translate.instant('schedule.warnings.adjusted-dates'),
        this.translate.instant('schedule.actions.close'),
        { duration: 5000 }
      );
    }
    
    // Validation 2: Dates must be within project range
    let datesAdjusted = false;
    
    if (startingDate < projectStartDate) {
      startingDate.setTime(projectStartDate.getTime());
      this.milestoneForm.get('startingDate')?.setValue(startingDate);
      datesAdjusted = true;
    }
    
    if (endingDate > projectEndDate) {
      endingDate.setTime(projectEndDate.getTime());
      this.milestoneForm.get('endingDate')?.setValue(endingDate);
      datesAdjusted = true;
    }
    
    if (datesAdjusted) {
      this.snackBar.open(
        this.translate.instant('schedule.warnings.dates-adjusted-to-project'),
        this.translate.instant('schedule.actions.close'),
        { duration: 5000 }
      );
      return; // Let the user confirm the adjusted dates
    }
    
    // Create milestone
    const projectId = typeof this.project.id === 'object' 
      ? this.project.id.value 
      : String(this.project.id);
    
    const milestone = new Milestone({
      name: formValues.name,
      startingDate: startingDate,
      endingDate: endingDate,
      projectId: projectId,
      description: formValues.description
    });
    
    this.loading = true;
    const createSub = this.milestoneService.createMilestone(milestone).subscribe({
      next: (createdMilestone: Milestone) => {
        this.milestones.push(createdMilestone);
        this.loading = false;
        this.dialog.closeAll();
        
        this.snackBar.open(
          this.translate.instant('schedule.success.milestone-created'),
          this.translate.instant('schedule.actions.close'),
          { duration: 3000 }
        );
      },
      error: (error: any) => {
        console.error('Error creating milestone:', error);
        this.loading = false;
        this.snackBar.open(
          `${this.translate.instant('schedule.errors.create-milestone')}: ${error.message}`,
          this.translate.instant('schedule.actions.close'),
          { duration: 5000 }
        );
      }
    });
    
    this.subscriptions.push(createSub);
  }

  onUpdateSubmit(): void {
    if (this.milestoneForm.invalid || !this.project || !this.currentMilestone) {
      return;
    }
    
    const formValues = this.milestoneForm.value;
    const startingDate = new Date(formValues.startingDate);
    const endingDate = new Date(formValues.endingDate);
    
    // Validate dates
    const projectStartDate = new Date(this.project.startingDate);
    const projectEndDate = new Date(this.project.endingDate);
    
    // Validation 1: Start date must be before end date
    if (startingDate > endingDate) {
      // Auto adjust - make end date same as start date
      endingDate.setTime(startingDate.getTime());
      this.milestoneForm.get('endingDate')?.setValue(endingDate);
      this.snackBar.open(
        this.translate.instant('schedule.warnings.adjusted-dates'),
        this.translate.instant('schedule.actions.close'),
        { duration: 5000 }
      );
    }
    
    // Validation 2: Dates must be within project range
    let datesAdjusted = false;
    
    if (startingDate < projectStartDate) {
      startingDate.setTime(projectStartDate.getTime());
      this.milestoneForm.get('startingDate')?.setValue(startingDate);
      datesAdjusted = true;
    }
    
    if (endingDate > projectEndDate) {
      endingDate.setTime(projectEndDate.getTime());
      this.milestoneForm.get('endingDate')?.setValue(endingDate);
      datesAdjusted = true;
    }
    
    if (datesAdjusted) {
      this.snackBar.open(
        this.translate.instant('schedule.warnings.dates-adjusted-to-project'),
        this.translate.instant('schedule.actions.close'),
        { duration: 5000 }
      );
      return; // Let the user confirm the adjusted dates
    }
    
    // Update milestone with new values but keep the same ID
    const updatedMilestone = new Milestone({
      id: this.currentMilestone.id,
      name: formValues.name,
      startingDate: startingDate,
      endingDate: endingDate,
      projectId: this.currentMilestone.projectId,
      description: formValues.description
    });
    
    this.loading = true;
    const updateSub = this.milestoneService.updateMilestone(updatedMilestone).subscribe({
      next: (updated: Milestone) => {
        // Actualizar el hito en la lista de hitos
        const index = this.milestones.findIndex(m => 
          (typeof m.id === 'object' ? m.id.value : String(m.id)) === 
          (typeof updated.id === 'object' ? updated.id.value : String(updated.id))
        );
        
        if (index !== -1) {
          this.milestones[index] = updated;
        }
        
        this.loading = false;
        if (this.dialogRef) {
          this.dialogRef.close();
        }
        
        this.snackBar.open(
          this.translate.instant('schedule.success.milestone-updated'),
          this.translate.instant('schedule.actions.close'),
          { duration: 3000 }
        );
      },
      error: (error: any) => {
        console.error('Error updating milestone:', error);
        this.loading = false;
        this.snackBar.open(
          `${this.translate.instant('schedule.errors.update-milestone')}: ${error.message}`,
          this.translate.instant('schedule.actions.close'),
          { duration: 5000 }
        );
      }
    });
    
    this.subscriptions.push(updateSub);
  }
  
  deleteMilestone(milestone: Milestone): void {
    if (confirm(this.translate.instant('schedule.confirm-delete'))) {
      this.loading = true;
      const milestoneId = typeof milestone.id === 'object' ? milestone.id.value : String(milestone.id);
      
      const deleteSub = this.milestoneService.deleteMilestone(milestoneId).subscribe({
        next: () => {
          // Eliminar el hito de la lista
          this.milestones = this.milestones.filter(m => 
            (typeof m.id === 'object' ? m.id.value : String(m.id)) !== milestoneId
          );
          this.loading = false;
          
          this.snackBar.open(
            this.translate.instant('schedule.success.milestone-deleted'),
            this.translate.instant('schedule.actions.close'),
            { duration: 3000 }
          );
        },
        error: (error: any) => {
          console.error('Error deleting milestone:', error);
          
          // Aún así actualizamos la UI para reflejar la eliminación ya que el backend podría 
          // haber eliminado el hito a pesar del error
          this.milestones = this.milestones.filter(m => 
            (typeof m.id === 'object' ? m.id.value : String(m.id)) !== milestoneId
          );
          
          this.loading = false;
          this.snackBar.open(
            `${this.translate.instant('schedule.errors.delete-milestone')}: ${error.message}`,
            this.translate.instant('schedule.actions.close'),
            { duration: 5000 }
          );
        }
      });
      
      this.subscriptions.push(deleteSub);
    }
  }
  
  openAddTaskDialog(milestone: Milestone): void {
    this.currentMilestone = milestone;
    
    // Reset form y configurar fechas predeterminadas dentro del rango del hito
    const startingDate = new Date(milestone.startingDate);
    const dueDate = new Date(milestone.endingDate);
    
    this.taskForm.reset({
      name: '',
      specialty: '',
      status: TaskStatus.DRAFT,
      startingDate: startingDate,
      dueDate: dueDate,
      description: ''
    });
    
    this.dialogRef = this.dialog.open(this.addTaskDialog);
  }
  
  openEditTaskDialog(task: Task, milestone: Milestone): void {
    this.currentTask = task;
    this.currentMilestone = milestone;
    
    // Set form values from the selected task
    this.taskForm.reset({
      name: task.name,
      specialty: task.specialty,
      status: task.status, // Add status field to the form
      startingDate: new Date(task.startingDate),
      dueDate: new Date(task.dueDate),
      description: task.description || ''
    });
    
    this.dialogRef = this.dialog.open(this.editTaskDialog);
  }
  
  onTaskSubmit(): void {
    if (this.taskForm.invalid || !this.currentMilestone) {
      return;
    }
    
    const formValues = this.taskForm.value;
    const startingDate = new Date(formValues.startingDate);
    const dueDate = new Date(formValues.dueDate);
    
    // Validar fechas
    const milestoneStartDate = new Date(this.currentMilestone.startingDate);
    const milestoneEndDate = new Date(this.currentMilestone.endingDate);
    
    // Validation 1: Start date must be before due date
    if (startingDate > dueDate) {
      // Auto adjust - make due date same as start date
      dueDate.setTime(startingDate.getTime());
      this.taskForm.get('dueDate')?.setValue(dueDate);
      this.snackBar.open(
        this.translate.instant('schedule.warnings.task-adjusted-dates'),
        this.translate.instant('schedule.actions.close'),
        { duration: 5000 }
      );
    }
    
    // Validation 2: Dates must be within milestone range
    let datesAdjusted = false;
    
    if (startingDate < milestoneStartDate) {
      startingDate.setTime(milestoneStartDate.getTime());
      this.taskForm.get('startingDate')?.setValue(startingDate);
      datesAdjusted = true;
    }
    
    if (dueDate > milestoneEndDate) {
      dueDate.setTime(milestoneEndDate.getTime());
      this.taskForm.get('dueDate')?.setValue(dueDate);
      datesAdjusted = true;
    }
    
    if (datesAdjusted) {
      this.snackBar.open(
        this.translate.instant('schedule.warnings.dates-adjusted-to-milestone'),
        this.translate.instant('schedule.actions.close'),
        { duration: 5000 }
      );
      return; // Let the user confirm the adjusted dates
    }
    
    // Create task
    const milestoneId = typeof this.currentMilestone.id === 'object' 
      ? this.currentMilestone.id.value 
      : String(this.currentMilestone.id);
    
    const task = new Task({
      name: formValues.name,
      specialty: formValues.specialty,
      status: formValues.status,
      startingDate: startingDate,
      dueDate: dueDate,
      milestoneId: milestoneId,
      description: formValues.description
    });
    
    this.loading = true;
    const createSub = this.taskService.createTask(task).subscribe({
      next: (createdTask: Task) => {
        // Actualizar la lista de tareas para este hito
        const tasks = this.milestoneTasksMap.get(milestoneId) || [];
        tasks.push(createdTask);
        this.milestoneTasksMap.set(milestoneId, tasks);
        
        this.loading = false;
        if (this.dialogRef) {
          this.dialogRef.close();
        }
        
        this.snackBar.open(
          this.translate.instant('schedule.success.task-created'),
          this.translate.instant('schedule.actions.close'),
          { duration: 3000 }
        );
      },
      error: (error: any) => {
        console.error('Error creating task:', error);
        this.loading = false;
        this.snackBar.open(
          `${this.translate.instant('schedule.errors.create-task')}: ${error.message}`,
          this.translate.instant('schedule.actions.close'),
          { duration: 5000 }
        );
      }
    });
    
    this.subscriptions.push(createSub);
  }
  
  onTaskUpdateSubmit(): void {
    if (this.taskForm.invalid || !this.currentTask || !this.currentMilestone) {
      return;
    }
    
    const formValues = this.taskForm.value;
    const startingDate = new Date(formValues.startingDate);
    const dueDate = new Date(formValues.dueDate);
    
    // Validate dates
    const milestoneStartDate = new Date(this.currentMilestone.startingDate);
    const milestoneEndDate = new Date(this.currentMilestone.endingDate);
    
    // Validation 1: Start date must be before due date
    if (startingDate > dueDate) {
      // Auto adjust - make due date same as start date
      dueDate.setTime(startingDate.getTime());
      this.taskForm.get('dueDate')?.setValue(dueDate);
      this.snackBar.open(
        this.translate.instant('schedule.warnings.task-adjusted-dates'),
        this.translate.instant('schedule.actions.close'),
        { duration: 5000 }
      );
    }
    
    // Validation 2: Dates must be within milestone range
    let datesAdjusted = false;
    
    if (startingDate < milestoneStartDate) {
      startingDate.setTime(milestoneStartDate.getTime());
      this.taskForm.get('startingDate')?.setValue(startingDate);
      datesAdjusted = true;
    }
    
    if (dueDate > milestoneEndDate) {
      dueDate.setTime(milestoneEndDate.getTime());
      this.taskForm.get('dueDate')?.setValue(dueDate);
      datesAdjusted = true;
    }
    
    if (datesAdjusted) {
      this.snackBar.open(
        this.translate.instant('schedule.warnings.dates-adjusted-to-milestone'),
        this.translate.instant('schedule.actions.close'),
        { duration: 5000 }
      );
      return; // Let the user confirm the adjusted dates
    }
    
    // Update task with new values but keep the same ID, milestone and responsible
    const updatedTask = new Task({
      id: this.currentTask.id,
      name: formValues.name,
      specialty: formValues.specialty,
      status: formValues.status,
      startingDate: startingDate,
      dueDate: dueDate,
      milestoneId: this.currentTask.milestoneId,
      description: formValues.description,
      responsibleId: this.currentTask.responsibleId // Preserve the responsibleId when updating
    });
    
    this.loading = true;
    const updateSub = this.taskService.updateTask(updatedTask).subscribe({
      next: (updated: Task) => {
        // Update the task in the list of tasks for the corresponding milestone
        const milestoneId = typeof this.currentTask!.milestoneId === 'object' 
          ? this.currentTask!.milestoneId.value 
          : String(this.currentTask!.milestoneId);
        
        const tasks = this.milestoneTasksMap.get(milestoneId) || [];
        const index = tasks.findIndex(t => 
          typeof t.id === 'object' && typeof updated.id === 'object' 
            ? t.id.value === updated.id.value
            : String(t.id) === String(updated.id)
        );
        
        if (index !== -1) {
          tasks[index] = updated;
          this.milestoneTasksMap.set(milestoneId, tasks);
        }
        
        this.loading = false;
        if (this.dialogRef) {
          this.dialogRef.close();
        }
        
        this.snackBar.open(
          this.translate.instant('schedule.success.task-updated'),
          this.translate.instant('schedule.actions.close'),
          { duration: 3000 }
        );
      },
      error: (error: any) => {
        console.error('Error updating task:', error);
        this.loading = false;
        this.snackBar.open(
          `${this.translate.instant('schedule.errors.update-task')}: ${error.message}`,
          this.translate.instant('schedule.actions.close'),
          { duration: 5000 }
        );
      }
    });
    
    this.subscriptions.push(updateSub);
  }
  
  deleteTask(task: Task): void {
    if (confirm(this.translate.instant('schedule.confirm-delete-task'))) {
      this.loading = true;
      const taskId = typeof task.id === 'object' ? task.id.value : String(task.id);
      
      const deleteSub = this.taskService.deleteTask(taskId).subscribe({
        next: () => {
          // Remove the task from its milestone's task list
          const milestoneId = typeof task.milestoneId === 'object' 
            ? task.milestoneId.value 
            : String(task.milestoneId);
            
          const tasks = this.milestoneTasksMap.get(milestoneId) || [];
          this.milestoneTasksMap.set(
            milestoneId, 
            tasks.filter(t => 
              typeof t.id === 'object' && typeof task.id === 'object'
              ? t.id.value !== task.id.value
              : String(t.id) !== String(task.id)
            )
          );
          
          this.loading = false;
          this.snackBar.open(
            this.translate.instant('schedule.success.task-deleted'),
            this.translate.instant('schedule.actions.close'),
            { duration: 3000 }
          );
        },
        error: (error: any) => {
          console.error('Error deleting task:', error);
          
          // Still update UI to reflect deletion since backend might have deleted it despite error
          const milestoneId = typeof task.milestoneId === 'object' 
            ? task.milestoneId.value 
            : String(task.milestoneId);
          
          const tasks = this.milestoneTasksMap.get(milestoneId) || [];
          this.milestoneTasksMap.set(
            milestoneId, 
            tasks.filter(t => 
              typeof t.id === 'object' && typeof task.id === 'object'
                ? t.id.value !== task.id.value
                : String(t.id) !== String(task.id)
            )
          );
          
          this.loading = false;
          this.snackBar.open(
            `${this.translate.instant('schedule.errors.delete-task')}: ${error.message}`,
            this.translate.instant('schedule.actions.close'),
            { duration: 5000 }
          );
        }
      });
      
      this.subscriptions.push(deleteSub);
    }
  }
  
  getSpecialtyTranslation(specialty: Specialty): string {
    return this.translate.instant(`schedule.specialties.${specialty}`);
  }

  // Método para mostrar el diálogo de asignación de responsable
  openAssignResponsibleDialog(task: Task): void {
    this.currentTask = task;
    
    // Filtrar los miembros del equipo que coinciden con la especialidad requerida para la tarea
    this.filteredTeamMembers = this.teamMembers.filter(
      member => member.specialty === task.specialty
    );
    
    // Resetear el formulario
    this.responsibleForm.reset({
      responsibleId: task.responsibleId || ''
    });
    
    this.dialogRef = this.dialog.open(this.assignResponsibleDialog, { 
      width: '400px'
    });
  }

  // Método para guardar la asignación del responsable
  onAssignResponsibleSubmit(): void {
    if (this.responsibleForm.invalid || this.filteredTeamMembers.length === 0) {
      this.snackBar.open(
        this.translate.instant('schedule.errors.no-responsible'),
        this.translate.instant('schedule.actions.close'),
        { duration: 5000 }
      );
      return;
    }

    if (!this.currentTask) {
      return;
    }

    const responsibleId = this.responsibleForm.value.responsibleId;
    
    // Clone the current task to avoid direct mutation
    const updatedTask = new Task({
      id: this.currentTask.id,
      name: this.currentTask.name,
      specialty: this.currentTask.specialty,
      startingDate: this.currentTask.startingDate,
      dueDate: this.currentTask.dueDate,
      milestoneId: this.currentTask.milestoneId,
      status: TaskStatus.PENDING, // Cambiar estado a PENDING cuando se asigna un responsable
      description: this.currentTask.description,
      responsibleId: responsibleId
    });

    // Update the task with the assigned responsible
    this.taskService.updateTask(updatedTask).subscribe({
      next: (result: Task) => {
        // Update the task in the local collection
        const milestoneId = typeof result.milestoneId === 'object' ? result.milestoneId.value : String(result.milestoneId);
        const tasks = this.milestoneTasksMap.get(milestoneId) || [];
        const index = tasks.findIndex(t => t.id.toString() === result.id.toString());
        
        if (index !== -1) {
          tasks[index] = result;
          this.milestoneTasksMap.set(milestoneId, [...tasks]);
        }
        
        // Close dialog and show success message
        if (this.dialogRef) {
          this.dialogRef.close();
        }
        
        this.snackBar.open(
          this.translate.instant('schedule.success.task-assigned'),
          this.translate.instant('schedule.actions.close'),
          { duration: 3000 }
        );
      },
      error: (error: any) => {
        console.error('Error assigning responsible:', error);
        this.snackBar.open(
          `${this.translate.instant('schedule.errors.assign-task')}: ${error.message}`,
          this.translate.instant('schedule.actions.close'),
          { duration: 5000 }
        );
      }
    });
  }

  // Método para obtener el nombre del responsable de una tarea
  getResponsibleName(responsibleId: string | undefined): string {
    if (!responsibleId) {
      return '-';
    }
    
    // Find the team member by comparing personId strings
    const member = this.teamMembers.find(m => {
      // Handle both value object and primitive string cases
      const memberPersonId = typeof m.personId === 'object' 
        ? m.personId.toString() 
        : String(m.personId);
      
      return memberPersonId === responsibleId;
    });
    
    if (!member) {
      return responsibleId;
    }
    
    // Use cache to store and retrieve person names
    if (!this.personNames.has(responsibleId)) {
      // Load the person's details if not already in cache
      this.loadPersonName(responsibleId);
      return this.translate.instant('schedule.loading-person-name');
    }
    
    return this.personNames.get(responsibleId) || responsibleId;
  }
  
  // Método para cargar el nombre de una persona
  private loadPersonName(personId: string): void {
    // Use the personId as is for the API call - it expects a string ID
    const personSub = this.personService.getById(null, { id: personId }).subscribe({
      next: (person: any) => {
        // Create a full name from the person's details
        const fullName = `${person.firstName} ${person.lastName}`;
        // Store in our cache
        this.personNames.set(personId, fullName);
      },
      error: (error: any) => {
        console.error('Error loading person details:', error);
        // If there's an error, at least show the ID
        this.personNames.set(personId, `ID: ${personId}`);
      }
    });
    
    this.subscriptions.push(personSub);
  }
}
