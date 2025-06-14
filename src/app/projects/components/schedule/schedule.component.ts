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
    MatProgressSpinnerModule
  ],
  standalone: true,
  templateUrl: './schedule.component.html',
  styleUrl: './schedule.component.css'
})
export class ScheduleComponent implements OnInit {
  taskForm!: FormGroup;
  responsibleForm!: FormGroup;
  milestoneForm!: FormGroup;
  taskStatuses: string[] = ['pending', 'in-progress', 'completed', 'delayed'];
  filteredTeamMembers: any[] = [];
  
  // Properties referenced in the template
  project: any = null;
  loading: boolean = false;
  error: string | null = null;
  milestones: any[] = [];
  specialties: string[] = ['frontend', 'backend', 'design', 'devops', 'qa', 'ui', 'architecture']; 

  constructor(private fb: FormBuilder) {}

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
      specialty: ['', Validators.required],
      status: ['pending', Validators.required],
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
      { personId: 1, name: 'John Doe', role: 'Developer', specialty: 'frontend' },
      { personId: 2, name: 'Jane Smith', role: 'Designer', specialty: 'ui' },
      { personId: 3, name: 'Bob Johnson', role: 'Architect', specialty: 'backend' }
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

  getSpecialtyTranslation(specialty: string): string {
    // In a real application, this would use the translation service
    return specialty;
  }

  onTaskSubmit(): void {
    if (this.taskForm.valid) {
      console.log('Task submitted:', this.taskForm.value);
      // Handle task submission
    }
  }

  onTaskUpdateSubmit(): void {
    if (this.taskForm.valid) {
      console.log('Task updated:', this.taskForm.value);
      // Handle task update
    }
  }

  onAssignResponsibleSubmit(): void {
    if (this.responsibleForm.valid) {
      console.log('Responsible assigned:', this.responsibleForm.value);
      // Handle responsible assignment
    }
  }

  onUpdateSubmit(): void {
    if (this.milestoneForm.valid) {
      console.log('Milestone updated:', this.milestoneForm.value);
      // Handle milestone update
    }
  }

  getTasksForMilestone(milestone: any): any[] {
    // In a real application, this would filter tasks by milestone ID
    return [
      {
        id: '1',
        name: 'Create wireframes',
        specialty: 'design',
        status: 'in-progress',
        startingDate: new Date(),
        dueDate: new Date(new Date().setDate(new Date().getDate() + 7)),
        description: 'Create wireframes for the main UI components',
        responsibleId: '1'
      }
    ];
  }

  openAddMilestoneDialog(): void {
    // This would open a dialog to add a new milestone
    console.log('Open add milestone dialog');
  }

  openEditMilestoneDialog(milestone: any): void {
    // This would open a dialog to edit an existing milestone
    console.log('Open edit milestone dialog for', milestone);
  }

  deleteMilestone(milestone: any): void {
    // This would delete a milestone
    console.log('Delete milestone', milestone);
  }

  openAddTaskDialog(milestone: any): void {
    // This would open a dialog to add a new task
    console.log('Open add task dialog for milestone', milestone);
  }

  openEditTaskDialog(task: any, milestone: any): void {
    // This would open a dialog to edit an existing task
    console.log('Open edit task dialog for task', task, 'in milestone', milestone);
  }

  deleteTask(task: any): void {
    // This would delete a task
    console.log('Delete task', task);
  }

  openAssignResponsibleDialog(task: any): void {
    // This would open a dialog to assign a responsible person to a task
    console.log('Open assign responsible dialog for task', task);
  }

  getResponsibleName(responsibleId: string): string {
    // This would get the name of the responsible person for a task
    const teamMember = this.filteredTeamMembers.find(m => m.personId.toString() === responsibleId);
    return teamMember ? teamMember.name : 'Unassigned';
  }

  onSubmit(): void {
    // This would submit the milestone form
    if (this.milestoneForm.valid) {
      console.log('Milestone submitted:', this.milestoneForm.value);
    }
  }
}
