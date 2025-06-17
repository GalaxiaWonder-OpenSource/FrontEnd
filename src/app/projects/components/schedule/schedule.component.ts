import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { TranslateModule } from '@ngx-translate/core';

import { MilestoneService } from '../../services/milestone.service';
import { SessionService } from '../../../iam/services/session.service';
import { Milestone } from '../../model/milestone.entity';
import {TaskListComponent} from '../task-list/task-list.component';

@Component({
  selector: 'app-schedule',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatDialogModule,
    MatProgressSpinnerModule,
    TranslateModule,
  ],
  templateUrl: './schedule.component.html',
  styleUrl: './schedule.component.css'
})
export class ScheduleComponent implements OnInit {
  milestones = signal<Milestone[]>([]);
  selectedMilestone: Milestone | null = null;
  loading = false;
  error: string | null = null;

  constructor(
    private milestoneService: MilestoneService,
    private sessionService: SessionService,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.loadMilestones();
  }

  loadMilestones(): void {
    this.loading = true;
    const projectId = this.sessionService.getProjectId();
    if (!projectId) {
      this.error = 'No project selected';
      this.loading = false;
      return;
    }

    this.milestoneService.getByProject({ projectId: String(projectId) }).subscribe({
      next: (data: Milestone[]) => {
        this.milestones.set(data);
        this.loading = false;
      },
      error: () => {
        this.error = 'Failed to load milestones';
        this.loading = false;
      }
    });
  }

  selectMilestone(milestone: Milestone): void {
    this.selectedMilestone = milestone;
    this.sessionService.setMilestone(milestone.id!); // Guarda en sesión
    this.dialog.open(TaskListComponent, {
      width: '900px',
      maxHeight: '90vh',
      panelClass: 'task-list-dialog'
    });
  }
}
