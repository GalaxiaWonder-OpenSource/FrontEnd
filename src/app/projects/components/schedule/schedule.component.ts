import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatButtonModule } from '@angular/material/button';
import { MatNativeDateModule } from '@angular/material/core';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { Specialty } from '../../model/specialty.vo';
import { TaskStatus } from '../../model/task-status.vo';
import { MatDialog, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { ViewChild, TemplateRef } from '@angular/core';


@Component({
  selector: 'app-schedule',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    TranslateModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatDatepickerModule,
    MatButtonModule,
    MatNativeDateModule,
    MatIconModule,
    MatCardModule,
    MatExpansionModule,
    MatProgressSpinnerModule,
    MatDialogModule
  ],
  standalone: true,
  templateUrl: './schedule.component.html',
  styleUrl: './schedule.component.css'
})
export class ScheduleComponent implements OnInit {
  taskForm!: FormGroup;
  responsibleForm!: FormGroup;
  milestoneForm!: FormGroup;
  taskStatuses = Object.values(TaskStatus);
  filteredTeamMembers: any[] = [];
  
  
  // Properties referenced in the template
  project: any = null;
  loading: boolean = false;
  error: string | null = null;
  milestones: any[] = [];
  // Exponiendo los enums al template
  Specialty = Specialty; 
  TaskStatus = TaskStatus;
  specialties = Object.values(Specialty); // Array de valores del enum para el template
 @ViewChild('addTaskDialog') addTaskDialogTemplate!: TemplateRef<any>;
 @ViewChild('addMilestoneDialog') addMilestoneDialogTemplate!: TemplateRef<any>;
 @ViewChild('editMilestoneDialog') editMilestoneDialogTemplate!: TemplateRef<any>;
 @ViewChild('editTaskDialog') editTaskDialogTemplate!: TemplateRef<any>;
 @ViewChild('assignResponsibleDialog') assignResponsibleDialogTemplate!: TemplateRef<any>;
 
 private currentMilestone: any;
 private currentTask: any;

  constructor(private fb: FormBuilder, private dialog: MatDialog) {}

  ngOnInit(): void {
    this.initTaskForm();
    this.initResponsibleForm();
    this.initMilestoneForm();
    this.loadTeamMembers();
    this.loadProject();
  }

  initTaskForm(): void {
    this.taskForm = this.fb.group({
      name: ['', Validators.required],
      specialty: [Specialty.ARCHITECTURE, Validators.required],
      status: [TaskStatus.PENDING, Validators.required],
      startingDate: [new Date(), Validators.required],
      dueDate: [new Date(), Validators.required],
      description: ['']
    });
  }

  initResponsibleForm(): void {
    this.responsibleForm = this.fb.group({
      responsibleId: ['', Validators.required]
    });
  }

  initMilestoneForm(): void {
    this.milestoneForm = this.fb.group({
      name: ['', Validators.required],
      startingDate: [new Date(), Validators.required],
      endingDate: [new Date(), Validators.required],
      description: ['']
    });
  }

  loadTeamMembers(): void {
    // In a real application, this would be loaded from a service
    this.filteredTeamMembers = [
      { personId: 1, name: 'John Doe', role: 'Developer', specialty: Specialty.ARCHITECTURE },
      { personId: 2, name: 'Jane Smith', role: 'Designer', specialty: Specialty.COMMUNICATIONS },
      { personId: 3, name: 'Bob Johnson', role: 'Architect', specialty: Specialty.STRUCTURES }
    ];
  }

  loadProject(): void {
    // This would typically fetch project data from a service
    this.loading = true;
    // Simulate API call delay
    setTimeout(() => {
      this.project = {
        id: '1',
        name: 'Sample Project',
        description: 'This is a sample project description',
        startingDate: new Date(),
        endingDate: new Date(new Date().setMonth(new Date().getMonth() + 6))
      };
      this.milestones = [
        {
          id: '1',
          name: 'Planning Phase',
          description: 'Initial project planning',
          startingDate: new Date(),
          endingDate: new Date(new Date().setMonth(new Date().getMonth() + 1))
        }
      ];
      this.loading = false;
    }, 1000);
  }

  getSpecialtyTranslation(specialty: Specialty): string {
    // En una aplicación real, esto usaría el servicio de traducción
    return `specialties.${specialty}`;
  }
  
  getStatusTranslation(status: TaskStatus): string {
    // En una aplicación real, esto usaría el servicio de traducción
    return `task-statuses.${status}`;
  }

  onTaskSubmit(): void {
    if (this.taskForm.valid && this.currentMilestone) {
      console.log('Task submitted:', this.taskForm.value);
      
      // Create a new task object with form values and milestone ID
      const newTask = {
        id: Math.floor(Math.random() * 1000).toString(), // Generate a temporary ID
        name: this.taskForm.value.name,
        specialty: this.taskForm.value.specialty,
        status: this.taskForm.value.status,
        startingDate: this.taskForm.value.startingDate,
        dueDate: this.taskForm.value.dueDate,
        description: this.taskForm.value.description,
        milestoneId: this.currentMilestone.id,
        responsibleId: null
      };
      
      // In a real application, you would call a service to save the task
      console.log('New task to be saved:', newTask);
      
      // Close the dialog
      this.dialog.closeAll();
    }
  }

  onTaskUpdateSubmit(): void {
    if (this.taskForm.valid && this.currentTask) {
      console.log('Task updated:', this.taskForm.value);
      
      // Update the task with new values
      Object.assign(this.currentTask, {
        name: this.taskForm.value.name,
        specialty: this.taskForm.value.specialty,
        status: this.taskForm.value.status,
        startingDate: this.taskForm.value.startingDate,
        dueDate: this.taskForm.value.dueDate,
        description: this.taskForm.value.description
      });
      
      // In a real application, you would call a service to update the task
      console.log('Updated task to be saved:', this.currentTask);
      
      // Close the dialog
      this.dialog.closeAll();
    }
  }

  onAssignResponsibleSubmit(): void {
    if (this.responsibleForm.valid && this.currentTask) {
      console.log('Responsible assigned:', this.responsibleForm.value);
      
      // Update the task with the new responsible
      this.currentTask.responsibleId = this.responsibleForm.value.responsibleId;
      
      // In a real application, you would call a service to update the task
      console.log('Task with new responsible to be saved:', this.currentTask);
      
      // Close the dialog
      this.dialog.closeAll();
    }
  }

  onUpdateSubmit(): void {
    if (this.milestoneForm.valid && this.currentMilestone) {
      console.log('Milestone updated:', this.milestoneForm.value);
      
      // Update the milestone with new values
      Object.assign(this.currentMilestone, {
        name: this.milestoneForm.value.name,
        startingDate: this.milestoneForm.value.startingDate,
        endingDate: this.milestoneForm.value.endingDate,
        description: this.milestoneForm.value.description
      });
      
      // In a real application, you would call a service to update the milestone
      console.log('Updated milestone to be saved:', this.currentMilestone);
      
      // Close the dialog
      this.dialog.closeAll();
    }
  }

  getTasksForMilestone(milestone: any): any[] {
    // In a real application, this would filter tasks by milestone ID
    return [
      {
        id: '1',
        name: 'Create wireframes',
        specialty: Specialty.ARCHITECTURE,
        status: TaskStatus.IN_PROGRESS,
        startingDate: new Date(),
        dueDate: new Date(new Date().setDate(new Date().getDate() + 7)),
        description: 'Create wireframes for the main UI components',
        responsibleId: '1'
      }
    ];
  }

  openAddMilestoneDialog(): void {
    console.log('Opening add milestone dialog');
    this.milestoneForm.reset({
      name: '',
      startingDate: new Date(),
      endingDate: new Date(new Date().setMonth(new Date().getMonth() + 1)),
      description: ''
    });
    
    this.dialog.open(this.addMilestoneDialogTemplate, {
      width: '600px'
    });
  }

  openEditMilestoneDialog(milestone: any): void {
    console.log('Opening edit milestone dialog for', milestone);
    this.currentMilestone = milestone;
    
    // Populate the form with the milestone data
    this.milestoneForm.setValue({
      name: milestone.name,
      startingDate: new Date(milestone.startingDate),
      endingDate: new Date(milestone.endingDate),
      description: milestone.description || ''
    });
    
    this.dialog.open(this.editMilestoneDialogTemplate, {
      width: '600px'
    });
  }

  deleteMilestone(milestone: any): void {
    console.log('Deleting milestone', milestone);
    if (confirm('¿Estás seguro de que quieres eliminar este hito?')) {
      // Here you would call a service to delete the milestone
      // For now, we'll just filter it out of the array
      this.milestones = this.milestones.filter(m => m.id !== milestone.id);
    }
  }

  openAddTaskDialog(milestone: any): void {
    console.log('Opening add task dialog for milestone', milestone);
    this.currentMilestone = milestone;
    
    // Reset the form to initial values
    this.taskForm.reset({
      name: '',
      specialty: Specialty.ARCHITECTURE,
      status: TaskStatus.PENDING,
      startingDate: new Date(),
      dueDate: new Date(new Date().setDate(new Date().getDate() + 7)),
      description: ''
    });
    
    this.dialog.open(this.addTaskDialogTemplate, {
      width: '600px'
    });
  }

  openEditTaskDialog(task: any, milestone: any): void {
    console.log('Opening edit task dialog for task', task, 'in milestone', milestone);
    this.currentTask = task;
    this.currentMilestone = milestone;
    
    // Populate the form with the task data
    this.taskForm.setValue({
      name: task.name,
      specialty: task.specialty,
      status: task.status,
      startingDate: new Date(task.startingDate),
      dueDate: new Date(task.dueDate),
      description: task.description || ''
    });
    
    this.dialog.open(this.editTaskDialogTemplate, {
      width: '600px'
    });
  }

  deleteTask(task: any): void {
    console.log('Deleting task', task);
    if (confirm('¿Estás seguro de que quieres eliminar esta tarea?')) {
      // Here you would call a service to delete the task
      // For demonstration purposes, we'll just remove it from our test data
      // In a real application, you would call a service method
    }
  }

  openAssignResponsibleDialog(task: any): void {
    console.log('Opening assign responsible dialog for task', task);
    this.currentTask = task;
    
    // Reset the form and pre-select the current responsible if any
    this.responsibleForm.reset({
      responsibleId: task.responsibleId || ''
    });
    
    this.dialog.open(this.assignResponsibleDialogTemplate, {
      width: '500px'
    });
  }

  getResponsibleName(responsibleId: string): string {
    // This would get the name of the responsible person for a task
    const teamMember = this.filteredTeamMembers.find(m => m.personId.toString() === responsibleId);
    return teamMember ? teamMember.name : 'Unassigned';
  }

  onSubmit(): void {
    if (this.milestoneForm.valid && this.project) {
      console.log('Milestone submitted:', this.milestoneForm.value);
      
      // Create a new milestone object
      const newMilestone = {
        id: Math.floor(Math.random() * 1000).toString(), // Generate a temporary ID
        name: this.milestoneForm.value.name,
        startingDate: this.milestoneForm.value.startingDate,
        endingDate: this.milestoneForm.value.endingDate,
        description: this.milestoneForm.value.description,
        projectId: this.project.id
      };
      
      // In a real application, you would call a service to save the milestone
      console.log('New milestone to be saved:', newMilestone);
      
      // Add to the current list for demonstration purposes
      this.milestones.push(newMilestone);
      
      // Close the dialog
      this.dialog.closeAll();
    }
  }
}
