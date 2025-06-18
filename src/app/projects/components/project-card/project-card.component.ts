import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { Router } from '@angular/router';
import { Project } from '../../model/project.entity';
import { TranslatePipe } from '@ngx-translate/core';
import { ProjectStatus } from '../../model/project-status.vo';
import { SessionService } from '../../../iam/services/session.service';
import { UserType } from '../../../iam/model/user-type.vo';
import { OrganizationMemberType } from '../../../organizations/model/organization-member-type.vo';
import { ProjectRole } from '../../model/project-role.vo';

@Component({
  selector: 'app-project-card',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatButtonModule, MatIconModule, TranslatePipe],
  templateUrl: './project-card.component.html',
  styleUrl: './project-card.component.css'
})
export class ProjectCardComponent {
  @Input() project!: Project;
  @Input() projectRole: 'Client' | 'Contractor' | 'Coordinator' | 'Specialist' = 'Client';
  @Input() userType?: UserType;
  @Input() organizationRole?: OrganizationMemberType;

  constructor(
    private router: Router,
    private sessionService: SessionService
  ) {}

  navigateToProject(): void {
    if (this.project && this.project.id) {
      // Preservar el tipo de usuario actual si no se especifica uno nuevo
      if (!this.userType) {
        this.userType = this.sessionService.getUserType() as UserType;
      }

      // Convertir projectRole string al tipo ProjectRoleType esperado por setProject
      let projectRoleEnum: ProjectRole | undefined = undefined;
      if (this.projectRole === 'Coordinator') {
        projectRoleEnum = ProjectRole.COORDINATOR;
      } else if (this.projectRole === 'Specialist') {
        projectRoleEnum = ProjectRole.SPECIALIST;
      }

      // Establecer el ID del proyecto y su rol en la sesión
      // Ya que project.id es ahora directamente un número, lo usamos sin conversiones
      const projectIdValue = this.project.id;

      this.sessionService.setProject(projectIdValue, projectRoleEnum);

      // Asegurarnos de que el tipo de usuario también esté establecido
      if (this.userType) {
        this.sessionService.setUserType(this.userType);
      }

      // Si tenemos un rol de organización, asegurémonos de establecerlo
      if (this.organizationRole && this.sessionService.getOrganizationId()) {
        this.sessionService.setOrganization(
          this.sessionService.getOrganizationId()!,
          this.organizationRole as OrganizationMemberType
        );
      }

      // Navegar a la página de información del proyecto
      this.router.navigate([`/projects/${projectIdValue}/information`]);
    }
  }

  getStatusTranslation(): string {
    // Usamos el sistema de traducción i18n mediante interpolación de la ruta completa
    // La clave será por ejemplo: "project-card.status-types.BASIC_STUDIES"
    const translationKey = `project-card.status-types.${this.project.status}`;

    // La traducción se aplica en el HTML a través del pipe 'translate'
    return translationKey;
  }

  getStatusClass(): string {
    // Asignar clases CSS según el estado del proyecto
    const statusClassMap: Record<string, string> = {
      [ProjectStatus.BASIC_STUDIES]: 'status-planning',
      [ProjectStatus.DESIGN_IN_PROCESS]: 'status-in-progress',
      [ProjectStatus.REJECT]: 'status-rejected',
      [ProjectStatus.APPROVED]: 'status-approved'
    };

    return statusClassMap[this.project.status] || 'status-default';
  }
}
