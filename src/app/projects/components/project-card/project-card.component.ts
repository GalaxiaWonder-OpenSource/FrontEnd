import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { Router } from '@angular/router';
import { Project } from '../../model/project.entity';
import { TranslatePipe } from '@ngx-translate/core';
import { ProjectStatus } from '../../model/project-status.vo';
import { SessionService } from '../../../iam/services/session.service';
import { UserRole } from '../../../iam/model/user-role.vo';
import { OrganizationMemberType } from '../../../organizations/model/organization-member-type.vo';

@Component({
  selector: 'app-project-card',
  standalone: true,
  imports: [CommonModule, MatCardModule, TranslatePipe],
  templateUrl: './project-card.component.html',
  styleUrl: './project-card.component.css'
})
export class ProjectCardComponent {
  @Input() project!: Project;
  @Input() projectRole: 'Client' | 'Contractor' | 'Coordinator' | 'Specialist' = 'Client';
  @Input() userType?: UserRole;
  @Input() organizationRole?: OrganizationMemberType;
  
  constructor(
    private router: Router,
    private sessionService: SessionService
  ) {}
  
  navigateToProject(): void {
    if (this.project && this.project.id) {
      // Preservar el tipo de usuario actual si no se especifica uno nuevo
      if (!this.userType) {
        this.userType = this.sessionService.getUserType() as UserRole;
      }
      
      // Establecer el ID del proyecto y su rol en la sesión
      this.sessionService.setProject(this.project.id.value, this.projectRole);
      
      // Asegurarnos de que el tipo de usuario también esté establecido
      if (this.userType) {
        this.sessionService.setUserType(this.userType);
      }
      
      // Si tenemos un rol de organización, asegurémonos de establecerlo
      if (this.organizationRole && this.sessionService.getOrganizationId()) {
        this.sessionService.setOrganization(
          this.sessionService.getOrganizationId()!, 
          this.organizationRole
        );
      }
      
      // Navegar a la página de información del proyecto
      this.router.navigate([`/projects/${this.project.id.value}/information`]);
    }
  }
  
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
