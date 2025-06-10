import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { Project } from '../../model/project.entity';
import { ProjectService } from '../../services/project.service';
import { SessionService } from '../../../iam/services/session.service';
import { TranslateModule } from '@ngx-translate/core';
import { ProjectStatus } from '../../model/project-status.vo';
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-project-info',
  imports: [CommonModule, MatCardModule, TranslateModule],
  standalone: true,
  templateUrl: './project-info.component.html',
  styleUrl: './project-info.component.css'
})
export class ProjectInfoComponent implements OnInit, OnDestroy {
  project: Project | null = null;
  loading = true;
  error: string | null = null;
  private routeSubscription: Subscription | null = null;

  constructor(
    private projectService: ProjectService,
    private sessionService: SessionService,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    // Cargar el proyecto inmediatamente usando la sesión o parámetro de ruta
    this.loadProject();
    
    // También suscribirse a cambios en la ruta
    const routeSub = this.route.parent?.paramMap.subscribe(params => {
      const projectId = params.get('projectId');
      if (projectId) {
        console.log('Detected route parameter change, projectId:', projectId);
        this.loadProjectById(projectId);
      }
    });
    
    if (routeSub) {
      this.routeSubscription = routeSub;
    }
  }
  
  ngOnDestroy(): void {
    // Limpiar suscripción para prevenir memory leaks
    if (this.routeSubscription) {
      this.routeSubscription.unsubscribe();
    }
  }
  
  loadProjectById(projectId: string): void {
    this.loading = true;
    this.error = null;
    console.log('Loading project with ID:', projectId);
    
    this.projectService.getById(null, { id: projectId }).subscribe({
      next: (project: Project) => {
        console.log('Project loaded successfully:', project);
        this.project = project;
        this.loading = false;
      },
      error: (error: any) => {
        console.error('Error loading project:', error);
        this.error = 'Error al cargar el proyecto';
        this.loading = false;
      }
    });
  }

  loadProject(): void {
    const projectId = this.sessionService.getProjectId();
    console.log('Loading project information, ID from session:', projectId);
    
    if (projectId) {
      this.projectService.getById(null, { id: projectId }).subscribe({
        next: (project: Project) => {
          console.log('Project loaded successfully:', project);
          this.project = project;
        },
        error: (error: Error) => {
          console.error('Error loading project:', error);
        }
      });
    } else {
      console.error('No project ID found in session');
    }
  }

  getStatusTranslation(status: string): string {
    // Mapeamos los estados del proyecto a cadenas legibles
    const statusMap: Record<string, string> = {
      [ProjectStatus.BASIC_STUDIES]: 'Estudios Básicos',
      [ProjectStatus.DESIGN_IN_PROCESS]: 'Diseño en Proceso',
      [ProjectStatus.UNDER_REVIEW]: 'En Revisión',
      [ProjectStatus.CHANGE_REQUEST]: 'Solicitud de Cambio',
      [ProjectStatus.CHANGE_PENDING]: 'Cambio Pendiente',
      [ProjectStatus.REJECT]: 'Rechazado',
      [ProjectStatus.APPROVED]: 'Aprobado'
    };

    return statusMap[status] || status;
  }
}
