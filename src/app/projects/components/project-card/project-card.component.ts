import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { Project } from '../../model/project.entity';
import { TranslatePipe } from '@ngx-translate/core';
import { ProjectStatus } from '../../model/project-status.vo';

@Component({
  selector: 'app-project-card',
  standalone: true,
  imports: [CommonModule, MatCardModule, TranslatePipe],
  templateUrl: './project-card.component.html',
  styleUrl: './project-card.component.css'
})
export class ProjectCardComponent {
  @Input() project!: Project;
  getStatusTranslation(): string {
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

    return statusMap[this.project.status] || this.project.status;
  }
}
