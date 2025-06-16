import {Component, OnInit, signal} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {ChangeProcess} from '../../../changes/model/change-process.entity';
import {ChangeProcessStatus} from '../../../changes/model/change-process-status.vo';
import {ChangeProcessService} from '../../../changes/services/change-process.service';
import {SessionService} from '../../../iam/services/session.service';
import {UserRole} from '../../../iam/model/user-role.vo';
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
export class ChangeManagementComponent{
  changeProcess = signal<ChangeProcess[]>([]);

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
    private sessionService: SessionService
  ) {
  }

  ngOnInit(): void {
    this.projectId = Number(this.route.snapshot.paramMap.get('projectId'));
    console.log('🛠️ Proyecto actual (contractor):', this.projectId);

    this.resetForm();
    this.loadUserRole();

    console.log('🧑‍🔧 Rol detectado:', {
      isClient: this.isClient,
      isContractor: this.isContractor
    });

    if (this.isContractor) {
      console.log('🔄 Cargando solicitudes de cambio...');
      this.loadChangeRequests();
    }
  }

  private loadUserRole(): void {
    const userType = this.sessionService.getUserType();
    this.isClient = userType === UserRole.TYPE_CLIENT;
    this.isContractor = userType === UserRole.TYPE_WORKER;
  }

  private async loadChangeRequests(): Promise<void> {
    const projectId = this.sessionService.getProjectId();

    if (!projectId) {
      console.warn('No project ID found in session. Aborting load.');
      return;
    }

    try {
      this.loading = true;
      console.log('📥 GET cambios para projectId:', projectId);

      this.changeProcessService.getAll().subscribe({
        next: (requests: ChangeProcess[]) => {
          console.log('🔍 Todos los cambios recibidos:', requests);

          const myRequests = requests.filter(r =>
            r.projectId?.toString() === projectId.toString()
          );

          this.changeProcess.set(myRequests); // ✅ Aquí haces el set al signal

          console.log('📄 Cambios filtrados por proyecto:', myRequests);
        },
        error: (err: any) => {
          console.error('❌ Error al cargar cambios:', err);
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
        console.warn('❌ No se encontró el projectId en la sesión.');
        this.error = 'No se puede enviar el cambio porque no hay proyecto activo.';
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

      console.log('📤 Enviando nuevo cambio a json-server:', newChangeProcess);

      this.changeProcessService.create(newChangeProcess).subscribe({
        next: (createdChange: ChangeProcess) => {
          console.log('✅ Cambio creado exitosamente:', createdChange);

          this.success = true;
          this.resetForm();
          this.showForm = false;
          this.loadChangeRequests();
        },
        error: (err: any) => {
          console.error('❌ Error al crear el change request:', err);
          this.error = 'Ocurrió un error al crear la solicitud de cambio.';
        }
      });

    } catch (error) {
      console.error('❌ Error inesperado:', error);
      this.error = 'Error inesperado al procesar el cambio.';
    } finally {
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

  async approveChangeRequest(request: ChangeProcess): Promise<void> {
    try {
      this.loading = true;
      const updated = {
        ...request,
        status: 'APPROVED',
        approvedAt: new Date().toISOString(),
        approvedBy: 'Contractor'
      };
      await this.changeProcessService.update(updated); // PUT hacia /change-processes/:id
      await this.loadChangeRequests();
    } catch {
      this.error = 'Error al aprobar solicitud.';
    } finally {
      this.loading = false;
    }
  }

  async rejectChangeRequest(request: ChangeProcess): Promise<void> {
    try {
      this.loading = true;
      const updated = {
        ...request,
        status: 'REJECTED',
        approvedAt: new Date().toISOString(),
        approvedBy: 'Contractor'
      };
      await this.changeProcessService.update(updated);
      await this.loadChangeRequests();
    } catch {
      this.error = 'Error al rechazar solicitud.';
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

  getStatusTranslation(status: ChangeProcessStatus): string {
    return `change-management.status.${status.toLowerCase()}`;
  }
}
