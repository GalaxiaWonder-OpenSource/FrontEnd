import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { Project } from '../../model/project.entity';
import { ProjectService } from '../../services/project.service';
import { SessionService } from '../../../iam/services/session.service';
import { TranslateModule } from '@ngx-translate/core';
import { ProjectStatus } from '../../model/project-status.vo';

@Component({
  selector: 'app-project-info',
  imports: [CommonModule, MatCardModule, TranslateModule],
  standalone: true,
  templateUrl: './project-info.component.html',
  styleUrl: './project-info.component.css'
})
export class ProjectInfoComponent implements OnInit {
  project: Project | null = null;

  constructor(
    private projectService: ProjectService,
    private sessionService: SessionService
  ) {}

  ngOnInit(): void {
    this.loadProject();
  }

  loadProject(): void {
    const projectId = this.sessionService.getProjectId();
    if (projectId) {
      this.projectService.getById({}, { id: projectId }).subscribe({
        next: (project: Project) => {
          this.project = project;
        },
        error: (error: Error) => {
          console.error('Error loading project:', error);
        }
      });
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
