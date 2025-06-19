import {Component, OnInit, signal} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {ChangeProcess} from '../../../changes/model/change-process.entity';
import {ChangeProcessStatus} from '../../../changes/model/change-process-status.vo';
import {ChangeProcessService} from '../../../changes/services/change-process.service';
import {SessionService} from '../../../iam/services/session.service';
import {UserType} from '../../../iam/model/user-type.vo';
import {
  MatCard,
  MatCardModule,
  MatCardTitle
} from '@angular/material/card';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatInputModule} from '@angular/material/input';
import {FormsModule} from '@angular/forms';
import {DatePipe, NgClass, NgForOf, NgIf} from '@angular/common';
import {MatButton} from '@angular/material/button';
import {MatProgressSpinner} from '@angular/material/progress-spinner';
import {ChangeOrigin} from '../../../changes/model/change-origin.vo';
import {TranslatePipe} from '@ngx-translate/core';
import {MatSnackBar} from '@angular/material/snack-bar';

@Component({
  selector: 'app-change-management',
  templateUrl: './change-management.component.html',
  styleUrls: ['./change-management.component.css'],
  standalone: true,
  imports: [
    MatFormFieldModule,
    MatInputModule,
    FormsModule,
    MatCard,
    MatCardTitle,
    NgIf,
    NgForOf,
    MatButton,
    MatProgressSpinner,
    NgClass,
    TranslatePipe,
    DatePipe,
    MatCardModule
  ],
})
export class ChangeManagementComponent {
  changeProcess = signal<ChangeProcess[]>([]);

  pendingRequest = signal<ChangeProcess | null>(null);
  resolvedRequests = signal<ChangeProcess[]>([]);

  changeRequest: any = {title: '', description: ''};
  changeRequests: ChangeProcess[] = [];
  loading = false;
  error: string | null = null;
  success = false;
  showForm = false;

  projectId!: number;
  isClient = false;
  isContractor = false;

  constructor(
    private route: ActivatedRoute,
    private changeProcessService: ChangeProcessService,
    private sessionService: SessionService,
    private snackBar: MatSnackBar
  ) {
  }

  ngOnInit(): void {
    this.projectId = Number(this.route.snapshot.paramMap.get('projectId'));

    this.resetForm();
    this.loadUserRole();

    if (this.isContractor) {
      this.loadChangeRequests();
    }
  }

  private loadUserRole(): void {
    const userType = this.sessionService.getUserType();
    this.isClient = userType === UserType.TYPE_CLIENT;
    this.isContractor = userType === UserType.TYPE_WORKER;
    console.log('💼 User type:', this.sessionService.getUserType());

  }

  private async loadChangeRequests(): Promise<void> {
    const projectId = this.sessionService.getProjectId();

    if (!projectId) {
      console.warn('No project ID found in session. Aborting load.');
      return;
    }

    try {
      this.loading = true;

      this.changeProcessService.getAll().subscribe({
        next: (requests: ChangeProcess[]) => {

          const myRequests = requests.filter(r =>
            r.projectId?.toString() === projectId.toString()
          );
          this.changeProcess.set(myRequests);

        },
        error: (err: any) => {
          console.error('Error al cargar cambios:', err);
          this.error = 'Error al cargar las solicitudes de cambio.';
        }
      });
    } catch (error) {
      this.error = 'Error inesperado al cargar solicitudes de cambio.';
    } finally {
      this.loading = false;
    }
  }

  startNewChangeRequest(): void {
    this.resetForm();
    this.success = false;
    this.error = null;
    this.showForm = true;
  }

  onCancel(): void {
    this.resetForm();
    this.showForm = false;
  }

  async onSubmit(): Promise<void> {
    if (!this.isFormValid()) return;

    this.loading = true;
    this.error = null;
    this.success = false;

    try {
      const projectId = this.sessionService.getProjectId();
      if (!projectId) {
        this.error = 'No se puede enviar el cambio porque no hay proyecto activo.';
        this.loading = false;
        return;
      }

      this.changeProcessService.getAll().subscribe({
        next: (allChanges: ChangeProcess[]) => {
          const alreadyPending = allChanges.find(
            (c) => c.projectId === projectId && c.status === ChangeProcessStatus.PENDING
          );

          if (alreadyPending) {
            this.error = 'Ya existe una solicitud pendiente. Debe resolverse antes de crear una nueva.';
            this.loading = false;
            return;
          }

          const newChangeProcess = {
            projectId,
            origin: ChangeOrigin.CHANGE_REQUEST,
            status: ChangeProcessStatus.PENDING,
            justification: this.changeRequest.title,
            description: this.changeRequest.description,
            approvedAt: null,
            approvedBy: null
          };

          this.changeProcessService.create(newChangeProcess).subscribe({
            next: () => {
              this.success = true;
              this.resetForm();
              this.showForm = false;
              this.loadChangeRequests();
            },
            error: () => {
              this.error = 'Ocurrió un error al crear la solicitud de cambio.';
            }
          });
        },
        error: () => {
          this.error = 'Error al verificar si ya existe una solicitud pendiente.';
          this.loading = false;
        }
      });
    } catch {
      this.error = 'Error inesperado al procesar el cambio.';
      this.loading = false;
    }
  }

  private resetForm(): void {
    this.changeRequest = { title: '', description: '' };
    this.error = null;
    this.success = false;
  }

  isFormValid(): boolean {
    return this.changeRequest.title.trim().length >= 3 &&
      this.changeRequest.description.trim().length >= 10;
  }

  private showSnackBar(message: string, type: 'success' | 'error' | 'info' | 'warn'): void {
    this.snackBar.open(message, 'Cerrar', {
      duration: 3000,
      panelClass: [`snackbar-${type}`]
    });
  }

  async approveChangeRequest(request: ChangeProcess): Promise<void> {
    try {
      this.loading = true;

      const updated = {
        ...request,
        status: ChangeProcessStatus.APPROVED,
        approvedAt: new Date().toISOString(),
        approvedBy: 'Contractor'
      };

      await this.changeProcessService.update(updated, { id: request.id }).toPromise();

      await this.loadChangeRequests();


      this.showSnackBar('Cambio aprobado y eliminado', 'success');
      await this.loadChangeRequests();
    } catch (error) {
      console.error('Error al aprobar y eliminar cambio:', error);
      this.showSnackBar('Error al aprobar solicitud', 'error');
    } finally {
      this.loading = false;
    }
  }

  async rejectChangeRequest(request: ChangeProcess): Promise<void> {
    try {
      this.loading = true;

      const updated = {
        ...request,
        status: ChangeProcessStatus.REJECTED,
        approvedAt: new Date().toISOString(),
        approvedBy: 'Contractor'
      };

      console.log('Actualizando cambio con ID:', request.id);

      await this.changeProcessService.update(updated, { id: request.id }).toPromise();
      await this.loadChangeRequests();

      this.showSnackBar('Cambio rechazado correctamente', 'info');
    } catch (error) {
      console.error('Error al rechazar cambio:', error);
      this.showSnackBar('Error al rechazar solicitud', 'error');
    } finally {
      this.loading = false;
    }
  }

  getStatusColor(status: ChangeProcessStatus): string {
    switch (status) {
      case ChangeProcessStatus.PENDING: return 'warn';
      case ChangeProcessStatus.APPROVED: return 'primary';
      case ChangeProcessStatus.REJECTED: return 'accent';
      default: return 'basic';
    }
  }

}
