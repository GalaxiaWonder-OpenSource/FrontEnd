import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatCardModule } from '@angular/material/card';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { TranslateModule } from '@ngx-translate/core';
import { ActivatedRoute } from '@angular/router';

import { Project } from '../../model/project.entity';
import { ProjectStatus } from '../../model/project-status.vo';
import { ProjectService } from '../../services/project.service';
import { SessionService } from '../../../iam/services/session.service';

@Component({
  selector: 'app-project-configuration',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatCardModule,
    MatSnackBarModule,
    TranslateModule
  ],
  templateUrl: './project-configuration.component.html',
  styleUrl: './project-configuration.component.css'
})
export class ProjectConfigurationComponent implements OnInit {
  projectForm: FormGroup;
  project: Project | null = null;
  loading = true;
  projectStatus = Object.values(ProjectStatus);
  today = new Date();
  
  constructor(
    private fb: FormBuilder,
    private projectService: ProjectService,
    private sessionService: SessionService,
    private snackBar: MatSnackBar,
    private route: ActivatedRoute
  ) {
    // Inicializar el formulario vacío
    this.projectForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      status: ['', Validators.required],
      endingDate: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    console.log('ProjectConfigurationComponent initialized');
    
    // Intentar cargar el proyecto utilizando la ruta
    this.loadProject();
    
    // También escuchar cambios en los parámetros de la ruta
    this.route.parent?.paramMap.subscribe(params => {
      console.log('Route parameters changed:', params);
      const projectId = params.get('projectId');
      if (projectId) {
        console.log('Project ID from route subscription:', projectId);
        this.loadProjectById(projectId);
      }
    });
  }

  loadProject(): void {
    console.log('Loading project...');
    
    // Intentar obtener el ID del proyecto desde varias fuentes
    let projectId: string | null = null;
    
    // 1. Primero intentar desde la ruta padre (más probable)
    if (this.route.parent?.snapshot.paramMap.has('projectId')) {
      projectId = this.route.parent?.snapshot.paramMap.get('projectId');
      console.log('Project ID from parent route:', projectId);
    }
    
    // 2. Si no está en la ruta padre, buscar en la sesión
    if (!projectId) {
      projectId = this.sessionService.getProjectId();
      console.log('Project ID from session:', projectId);
    }
    
    // Si encontramos un ID, cargar el proyecto
    if (projectId) {
      this.loadProjectById(projectId);
    } else {
      console.error('No project ID found in routes or session');
      this.snackBar.open('No se encontró el ID del proyecto', 'Cerrar', { duration: 3000 });
      this.loading = false;
    }
  }
  
  loadProjectById(projectId: string): void {
    this.loading = true;
    console.log('Loading project with ID:', projectId);
    
    this.projectService.getById(null, { id: projectId }).subscribe({
      next: (project: Project) => {
        console.log('Project loaded successfully:', project);
        this.project = project;
        this.updateForm();
        this.loading = false;
      },
      error: (error: any) => {
        console.error('Error loading project:', error);
        this.snackBar.open('Error al cargar el proyecto', 'Cerrar', { duration: 3000 });
        this.loading = false;
      }
    });
  }

  updateForm(): void {
    if (this.project) {
      console.log('Updating form with project data:', this.project);
      this.projectForm.patchValue({
        name: this.project.name,
        status: this.project.status,
        endingDate: this.project.endingDate ? new Date(this.project.endingDate) : null
      });
    }
  }

  getStatusTranslation(status: string): string {
    return `project-card.status-types.${status}`;
  }

  onSubmit(): void {
    if (this.projectForm.invalid || !this.project) {
      console.warn('Form is invalid or project is null');
      return;
    }

    console.log('Submitting form with values:', this.projectForm.value);
    
    // Obtener el ID del proyecto desde la ruta o la sesión
    const projectId = this.route.parent?.snapshot.paramMap.get('projectId') || 
                      this.sessionService.getProjectId();
    
    if (!projectId) {
      console.error('No project ID found for update');
      this.snackBar.open('ID del proyecto no encontrado para actualizar', 'Cerrar', { duration: 3000 });
      return;
    }
    
    try {
      // Asegurar que el estado sea del tipo correcto
      const status = this.projectForm.value.status as ProjectStatus;
      
      // Crear una copia del proyecto actual con los datos actualizados
      const updatedProject = new Project({
        ...this.project,
        name: this.projectForm.value.name,
        status: status,
        endingDate: this.projectForm.value.endingDate
      });
      
      console.log('Update request will be sent with project:', updatedProject);
      
      // Actualizar el proyecto
      this.projectService.update(updatedProject, { id: projectId }).subscribe({
        next: (result: Project) => {
          console.log('Project updated successfully:', result);
          this.snackBar.open('Proyecto actualizado con éxito', 'Cerrar', { duration: 3000 });
          // Recargar el proyecto para asegurarse de tener la última versión
          this.loadProjectById(projectId);
        },
        error: (error: any) => {
          console.error('Error updating project:', error);
          this.snackBar.open('Error al actualizar el proyecto', 'Cerrar', { duration: 3000 });
        }
      });
    } catch (error) {
      console.error('Error creating updated project object:', error);
      this.snackBar.open('Error al crear el objeto del proyecto actualizado', 'Cerrar', { duration: 3000 });
    }
  }
}