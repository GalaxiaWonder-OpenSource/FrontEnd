import {Component, signal} from '@angular/core';
import {ToolbarClientComponent} from '../../../public/components/toolbar-client/toolbar-client.component';
import {ProjectListComponent} from '../../components/project-list/project-list.component';
import {ProjectService} from '../../services/project.service';
import {Project} from '../../model/project.entity';
import {SessionService} from '../../../iam/services/session.service';
import {ProjectTeamMemberService} from '../../services/project-team-member.service';
import {ProjectTeamMember} from '../../model/project-team-member.entity';
import {UserType} from '../../../iam/model/user-type.vo';

@Component({
  selector: 'app-client-layout',
  standalone: true,
  imports: [
    ToolbarClientComponent,
    ProjectListComponent
  ],
  templateUrl: './client-layout.component.html',
  styleUrl: './client-layout.component.css'
})

export class ClientLayoutComponent {
  projects = signal<Project[]>([]);
  userType = UserType.TYPE_CLIENT; // Utilizar el valor correcto definido en el enum

  constructor(
    private projectService: ProjectService,
    private session: SessionService,
    private projectTeamMemberService: ProjectTeamMemberService
  ) {
    this.loadProjects();
  }

  loadProjects() {
    const personId = this.session.getPersonId();
    console.log("ANTES")
    /**
    if (!personId) {
      console.warn('No person ID found in session. Aborting project load.');
      return;
    }
     */
    console.log("DESPUES")
    this.projectService.getByClientId({},{clientId: personId}).subscribe({
      next: (projects: Project[]) => {
        console.log("PROYECTOS", projects);
        this.projects.set(projects);
      },
      error: (error: any) => {
        console.error('Error loading projects:', error);
      }
    });

  }

}
