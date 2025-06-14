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
import { ProjectTeamMemberService } from '../../services/project-team-member.service';
import { ProjectTeamMember } from '../../model/project-team-member.entity';
import { SessionService } from '../../../iam/services/session.service';
import { PersonService } from '../../../iam/services/person.service';
import { Person } from '../../../iam/model/person.entity';
import { forkJoin, of } from 'rxjs';
import { mergeMap, map } from 'rxjs/operators';

// Interfaz para representar un miembro del equipo con datos de persona
interface TeamMemberDisplay {
  id: number;
  role: any; // Usando any para evitar errores con ProjectRole
  specialty: any; // Usando any para evitar errores con Specialty
  memberId: number;
  personId: number;
  projectId: number;
  firstName: string;
  lastName: string;
}

@Component({
  selector: 'app-task-detail',
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
  providers: [TaskService, ProjectTeamMemberService, PersonService],
  standalone: true,
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
  
  // Miembros del equipo con información de persona
  projectMembers: TeamMemberDisplay[] = [];
  
  // Expose enums to template
  TaskStatus = TaskStatus;
  Specialty = Specialty;
  
  constructor(
    private fb: FormBuilder,
    private taskService: TaskService,
    private teamMemberService: ProjectTeamMemberService,
    private personService: PersonService,
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
    
    this.loadProjectMembers();
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
  
  loadProjectMembers(): void {
    const projectId = this.sessionService.getProjectId();
    if (!projectId) return;
    
    this.loading = true;
    
    this.teamMemberService.getByProjectId({ projectId: String(projectId) })
      .pipe(
        mergeMap((members: ProjectTeamMember[]) => {
          if (members.length === 0) {
            return of([]);
          }
          
          // Para cada miembro, obtenemos la información de la persona
          const personRequests = members.map(member => 
            this.personService.getById(null, { id: String(member.personId) })
              .pipe(
                map((person: Person) => {
                  return {
                    id: member.id,
                    role: member.role,
                    specialty: member.specialty,
                    memberId: member.memberId,
                    personId: member.personId,
                    projectId: member.projectId,
                    firstName: person ? person.firstName : 'Unknown',
                    lastName: person ? person.lastName : 'User'
                  } as TeamMemberDisplay;
                })
              )
          );
          
          return forkJoin(personRequests);
        })
      )
      .subscribe({
        next: (teamMembers: TeamMemberDisplay[]) => {
          this.projectMembers = teamMembers;
          this.loading = false;
        },
        error: (err: Error) => {
          console.error('Error loading project team members:', err);
          this.loading = false;
        }
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
    
    const taskData = {
      id: this.task?.id,
      name: formValues.name,
      specialty: formValues.specialty,
      startingDate: formValues.startingDate,
      dueDate: formValues.dueDate,
      milestoneId: milestoneId,
      status: formValues.status,
      description: formValues.description,
      responsibleId: formValues.responsibleId
    };
    
    const task = new Task(taskData);
    
    const operation = this.isNewTask ? 
      this.taskService.createTask(task) : 
      this.taskService.updateTask(task);
    
    operation.subscribe({
      next: (savedTask: Task) => {
        this.loading = false;
        this.snackBar.open(
          this.translate.instant(this.isNewTask ? 'tasks.created' : 'tasks.updated'), 
          this.translate.instant('common.close'),
          { duration: 3000 }
        );
        this.saved.emit(savedTask);
      },
      error: (err: Error) => {
        console.error('Error saving task:', err);
        this.error = this.translate.instant('tasks.errors.save');
        this.loading = false;
      }
    });
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
