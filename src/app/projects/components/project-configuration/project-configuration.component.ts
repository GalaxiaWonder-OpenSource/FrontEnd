import { Component, OnInit, OnDestroy, ViewChild, TemplateRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormGroup, FormBuilder, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { Project } from '../../model/project.entity';
import { ProjectService } from '../../services/project.service';
import { SessionService } from '../../../iam/services/session.service';
import { ProjectStatus } from '../../model/project-status.vo';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-project-configuration',
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatButtonModule,
    MatCardModule,
    MatSnackBarModule,
    MatDialogModule,
    TranslateModule
  ],
  standalone: true,
  templateUrl: './project-configuration.component.html',
  styleUrl: './project-configuration.component.css'
})
export class ProjectConfigurationComponent implements OnInit, OnDestroy {
  @ViewChild('deleteConfirmDialog') deleteConfirmDialog!: TemplateRef<any>;
  projectForm: FormGroup;
  project: Project | null = null;
  projectStatuses = Object.values(ProjectStatus);
  loading = true;
  error: string | null = null;
  private routeSubscription: Subscription | null = null;

  constructor(
    private fb: FormBuilder,
    private projectService: ProjectService,
    private sessionService: SessionService,
    private route: ActivatedRoute,
    private router: Router,
    private snackBar: MatSnackBar,
    private http: HttpClient,
    private dialog: MatDialog,
    private translate: TranslateService
  ) {
    this.projectForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      description: [''],
      status: ['', Validators.required],
      endingDate: [new Date(), Validators.required]
    });
  }

  ngOnInit(): void {
    this.loadProject();

    const routeSub = this.route.parent?.paramMap.subscribe(params => {
      const projectId = params.get('projectId');
      if (projectId) {
        this.loadProjectById(projectId);
      }
    });

    if (routeSub) {
      this.routeSubscription = routeSub;
    }
  }

  ngOnDestroy(): void {
    if (this.routeSubscription) {
      this.routeSubscription.unsubscribe();
    }
  }

  loadProjectById(projectId: string): void {
    this.loading = true;
    this.error = null;

    this.projectService.getById(null, { id: projectId }).subscribe({
      next: (project: Project) => {
        this.project = project;
        this.updateForm(project);
        this.loading = false;
      },
      error: (error: any) => {
        console.error('Error loading project:', error);
        this.error = this.translate.instant('project-configuration.messages.load-error');
        this.loading = false;
      }
    });
  }

  loadProject(): void {
    const projectId = this.sessionService.getProjectId();

    if (projectId) {
      this.projectService.getById(null, { id: projectId }).subscribe({
        next: (project: Project) => {
          this.project = project;
          this.updateForm(project);
          this.loading = false;
        },
        error: (error: Error) => {
          console.error('Error loading project:', error);
          this.loading = false;
          this.error = 'Error al cargar el proyecto';
        }
      });
    } else {
      console.error('No project ID found in session');
      this.loading = false;
      this.error = 'No se encontró ID del proyecto en la sesión';
    }
  }

  updateForm(project: Project): void {
    this.projectForm.patchValue({
      name: project.name,
      description: project.description,
      status: project.status,
      endingDate: new Date(project.endingDate)
    });
  }

  getStatusTranslation(status: string): string {
    return this.translate.instant(`project-configuration.statuses.${status}`);
  }

  onSubmit(): void {
    if (this.projectForm.invalid || !this.project) {
      return;
    }
     const formValues = this.projectForm.value;

    // Usamos el ID directamente como número
    const projectId = Number(this.project.id);

    // Preparar los datos para actualizar como un objeto plano para JSON
    const projectData = {
      id: projectId, // Usamos el ID como número
      name: formValues.name,
      description: formValues.description || '',
      status: formValues.status,
      startingDate: this.project.startingDate,
      endingDate: new Date(formValues.endingDate).toISOString(),
      team: this.project.team || [],
      organizationId: this.project.organizationId || null,
      contractingEntityId: this.project.contractingEntityId || null
    };

    console.log('Enviando datos actualizados:', projectData);

    // Usar el servicio de proyectos para actualizar
    this.loading = true;

    // Usar HttpClient directamente con la ruta correcta
    // La ruta en el servidor es /projects/:id (sin /api/v1)
    const url = `${environment.propgmsApiBaseUrl}/projects/${projectId}`;
    console.log(`Enviando PUT a URL: ${url}`);

    const headers = new HttpHeaders().set('Content-Type', 'application/json');
    this.http.put<Project>(url, projectData, { headers }).subscribe({
      next: (updatedProject: Project) => {
        console.log('Proyecto actualizado exitosamente:', updatedProject);
        this.loading = false;

        this.snackBar.open('Proyecto actualizado correctamente', 'Cerrar', {
          duration: 3000,
          horizontalPosition: 'center',
          verticalPosition: 'bottom'
        });

        // Actualizar el objeto local con los datos actualizados
        this.project = updatedProject;
        this.updateForm(updatedProject);
      },
      error: (err: any) => {
        this.loading = false;
        console.error('Error updating project:', err);
        this.snackBar.open(`Error al actualizar el proyecto: ${err.message || 'Error desconocido'}`, 'Cerrar', {
          duration: 5000,
          horizontalPosition: 'center',
          verticalPosition: 'bottom'
        });
      }
    });
  }

  /**
   * Abre el diálogo de confirmación para eliminar el proyecto
   */
  deleteProject(): void {
    if (!this.project) {
      return;
    }

    const dialogRef = this.dialog.open(this.deleteConfirmDialog);

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.confirmDeleteProject();
      }
    });
  }

  /**
   * Realiza la eliminación del proyecto después de la confirmación
   */
  confirmDeleteProject(): void {
    if (!this.project) {
      return;
    }

    // Usamos el ID directamente como número
    const projectId = Number(this.project.id);

    console.log('Eliminando proyecto con ID:', projectId);
    this.loading = true;

    // Pasamos el ID como un simple string en el objeto params
    this.projectService.delete(null, { id: projectId }).subscribe({
      next: () => {
        this.loading = false;
        this.snackBar.open('Proyecto eliminado correctamente', 'Cerrar', {
          duration: 3000,
          horizontalPosition: 'center',
          verticalPosition: 'bottom'
        });

        // Limpiar sesión y navegar de regreso
        this.sessionService.clearProject();

        // Si el usuario es de una organización, volvemos a la lista de proyectos de la organización
        const orgId = this.sessionService.getOrganizationId();
        if (orgId) {
          this.router.navigate([`/organizations/${orgId}/projects`]);
        } else {
          // Si es un cliente, vamos a su lista de proyectos
          this.router.navigate(['/projects']);
        }
      },
      error: (err: any) => {
        this.loading = false;
        console.error('Error deleting project:', err);
        this.snackBar.open(`Error al eliminar el proyecto: ${err.message || 'Error desconocido'}`, 'Cerrar', {
          duration: 5000,
          horizontalPosition: 'center',
          verticalPosition: 'bottom'
        });
      }
    });
  }
}
