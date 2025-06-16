import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ChangeProcess } from '../../../changes/model/change-process.entity';
import { ChangeOrigin } from '../../../changes/model/change-origin.vo';
import { ChangeProcessStatus } from '../../../changes/model/change-process-status.vo';
import { ChangeProcessService } from '../../../changes/services/change-process.service';
import { SessionService } from '../../../iam/services/session.service';
import { UserRole } from '../../../iam/model/user-role.vo';
import {MatCard, MatCardTitle} from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import {FormsModule} from '@angular/forms';
import {NgForOf, NgIf} from '@angular/common';
import {MatButton} from '@angular/material/button';
import {MatProgressSpinner} from '@angular/material/progress-spinner';

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
    MatProgressSpinner
  ],
})
export class ChangeManagementComponent implements OnInit {
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
    this.resetForm();
    this.loadUserRole();

    if (this.isContractor) {
      this.loadChangeRequests();
    }
  }

  private loadUserRole(): void {
    const userType = this.sessionService.getUserType();
    this.isClient = userType === UserRole.TYPE_CLIENT;
    this.isContractor = userType === UserRole.TYPE_WORKER;
  }

  private async loadChangeRequests(): Promise<void> {
    try {
      this.loading = true;

      // Asegúrate de que el service acepte `params` o ajusta según tu implementación
      this.changeRequests = await this.changeProcessService.getByProject({
        params: {projectId: this.projectId}
      });

    } catch (error) {
      this.error = 'Error al cargar las solicitudes de cambio: ' + (error as Error).message;
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
      const changeProcess = new ChangeProcess({
        origin: ChangeOrigin.CHANGE_REQUEST,
        status: ChangeProcessStatus.PENDING,
        justification: this.changeRequest.title,
        approvedBy: new Date(),
        changeOrder: {
          issuedAt: new Date(),
          milestoneId: 0,
          description: this.changeRequest.description
        } as any,
        response: undefined as any,
        projectId: this.projectId
      });

      await this.changeProcessService.create(changeProcess);
      this.success = true;
      this.resetForm();
      this.showForm = false;
      this.loadChangeRequests();
    } catch (error) {
      this.error = 'Error al crear el change request.';
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
        status: ChangeProcessStatus.APPROVED,
        approvedAt: new Date(),
        approvedBy: new Date()
      };
      await this.changeProcessService.update(updated);
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
        status: ChangeProcessStatus.REJECTED,
        approvedAt: new Date(),
        approvedBy: new Date()
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
