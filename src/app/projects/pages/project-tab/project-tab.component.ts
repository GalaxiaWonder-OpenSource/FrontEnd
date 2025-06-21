import { Component, OnInit, signal } from '@angular/core';
import { MatButtonModule } from "@angular/material/button";
import { MatDividerModule } from "@angular/material/divider";
import { TranslatePipe } from "@ngx-translate/core";
import { CommonModule } from '@angular/common';
import { MatTabsModule } from '@angular/material/tabs';
import { ProjectListComponent } from '../../components/project-list/project-list.component';
import { Project } from '../../model/project.entity';
import { MatDialog } from '@angular/material/dialog';
import { SessionService } from '../../../iam/services/session.service';
import { ProjectService } from '../../services/project.service';
import { ProjectTeamMemberService } from '../../services/project-team-member.service';
import { ProjectTeamMember } from '../../model/project-team-member.entity';
import { CreateProjectModalComponent } from '../../components/create-project-modal/create-project-modal.component';
import { ProjectStatus } from '../../model/project-status.vo';
import { ProjectRole } from '../../model/project-role.vo';
import { Specialty } from '../../model/specialty.vo';
import { OrganizationService } from '../../../organizations/services/organization.service';
import { Person } from '../../../iam/model/person.entity';
import { PersonService } from '../../../iam/services/person.service';
import {UserType} from '../../../iam/model/user-type.vo';


@Component({
  selector: 'app-project-tab',
  standalone: true,
  imports: [
    CommonModule,
    MatTabsModule,
    MatDividerModule,
    MatButtonModule,
    ProjectListComponent,
    TranslatePipe
  ],
  templateUrl: './project-tab.component.html',
  styleUrl: './project-tab.component.css'
})
export class ProjectTabComponent implements OnInit {
  projects = signal<Project[]>([]);
  loading = signal<boolean>(true);
  organizationId: number | null = null;
  private contractingEntity: Person | undefined;

  constructor(
    private projectService: ProjectService,
    private dialog: MatDialog,
    private session: SessionService,
    private projectTeamMemberService: ProjectTeamMemberService,
    private organizationService: OrganizationService,
    private personService: PersonService
  ) {}

  ngOnInit(): void {
    const orgId = this.session.getOrganizationId() ?? null;

    console.log('[DEBUG] ORG ID:', orgId);

    if (!orgId) {
      this.loading.set(false);
      return;
    }

    this.organizationService.getById({}, { id: orgId }).subscribe({
      error: (err: Error) => {
        console.error(`Failed to load organization with ID ${orgId}:`, err);
        this.loading.set(false);
      }
    });

    this.organizationId = orgId;
    this.loadProjectsForOrganization(orgId);
  }

  loadProjectsForOrganization(organizationId: number): void {
    this.loading.set(true);

    const currentPersonId = this.session.getPersonId();

    this.projectTeamMemberService.getByPersonId({}, { personId: currentPersonId }).subscribe({
      next: (allProjects: Project[]) => {
        const userType = this.session.getUserType();
        const currentPersonId = this.session.getPersonId();

        console.log('[DEBUG] userType:', userType);
        console.log('[DEBUG] currentPersonId:', currentPersonId);

        // Filtrar por organización
        const orgProjects = allProjects.filter(project => project.organizationId === organizationId);

        // Si es cliente, filtra solo los que contrató
        const visibleProjects = (userType === UserType.TYPE_CLIENT)
          ? orgProjects.filter(p => p.contractingEntity?.id === currentPersonId)
          : orgProjects;

        // Logging para ver qué se va a mostrar
        console.log('[DEBUG] Proyectos para mostrar:');
        visibleProjects.forEach(p => {
          console.log({
            id: p.id,
            name: p.name,
            contractingEntityId: p.contractingEntity?.id,
            currentUser: currentPersonId,
            match: p.contractingEntity?.id === currentPersonId
          });
        });

        this.projects.set(visibleProjects);
        this.loading.set(false);
      },
      error: (err: any) => {
        console.error('[ERROR] Cargando proyectos:', err);
        this.loading.set(false);
      }
    });

  }

  openCreateDialog(): void {
    if (!this.organizationId) {
      console.error("Cannot create a project without an organization");
      return;
    }

    const dialogRef = this.dialog.open(CreateProjectModalComponent, {
      width: '500px',
      disableClose: true,
      data: {
        preselectedOrganizationId: this.organizationId
      }
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        // Asegúrate de que result tenga las claves correctas:
        // projectName, description, startDate, endDate, organizationId, contractingEntityEmail

        const payload = {
          projectName: result.projectName,
          description: result.description,
          startDate: result.startDate,
          endDate: result.endDate,
          organizationId: this.organizationId,
          contractingEntityEmail: result.contractingEntityEmail
        };

        this.projectService.create(payload).subscribe({
          next: (createdProject: Project) => {
            console.log('Project created successfully:', createdProject);
            this.loadProjectsForOrganization(this.organizationId!);
          },
          error: (err: Error) => {
            console.error('Failed to create project:', err);
          }
        });

      }
    });
  }

}
