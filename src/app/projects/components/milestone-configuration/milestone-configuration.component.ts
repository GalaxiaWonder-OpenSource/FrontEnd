import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { RouterModule } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { Subscription } from 'rxjs';

import { Milestone } from '../../model/milestone.entity';
import { Project } from '../../model/project.entity';
import { MilestoneService } from '../../services/milestone.service';
import { ProjectService } from '../../services/project.service';
import { SessionService } from '../../../iam/services/session.service';

@Component({
  selector: 'app-milestone-configuration',
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatIconModule,
    MatTableModule,
    RouterModule,
    TranslateModule
  ],
  standalone: true,
  templateUrl: './milestone-configuration.component.html',
  styleUrl: './milestone-configuration.component.css'
})
export class MilestoneConfigurationComponent implements OnInit, OnDestroy {
  milestones: Milestone[] = [];
  project: Project | null = null;
  displayedColumns: string[] = ['name', 'startingDate', 'endingDate', 'description', 'actions'];
  loading = true;
  error: string | null = null;

  private subscriptions: Subscription[] = [];

  constructor(
    private milestoneService: MilestoneService,
    private projectService: ProjectService,
    private sessionService: SessionService,
    private snackBar: MatSnackBar,
    private translate: TranslateService
  ) {}

  ngOnInit(): void {
    this.loadProject();
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  loadProject(): void {
    const projectId = this.sessionService.getProjectId();
    if (!projectId) {
      this.error = this.translate.instant('milestone-configuration.errors.no-project-id');
      this.loading = false;
      return;
    }

    const projectSub = this.projectService.getById(null, { id: projectId }).subscribe({
      next: (project: Project) => {
        this.project = project;
        this.loadMilestones();
      },
      error: (error: any) => {
        console.error('Error loading project:', error);
        this.error = this.translate.instant('milestone-configuration.errors.load-project');
        this.loading = false;
      }
    });

    this.subscriptions.push(projectSub);
  }

  loadMilestones(): void {
    if (!this.project) {
      return;
    }

    const projectId = typeof this.project.id === 'object'
      ? this.project.id.value
      : String(this.project.id);

    const milestonesSub = this.milestoneService.getMilestonesByProjectId(projectId).subscribe({
      next: (milestones: Milestone[]) => {
        this.milestones = milestones;
        this.loading = false;
      },
      error: (error: any) => {
        console.error('Error loading milestones:', error);
        this.error = this.translate.instant('milestone-configuration.errors.load-milestones');
        this.loading = false;
      }
    });

    this.subscriptions.push(milestonesSub);
  }

  deleteMilestone(milestone: Milestone): void {
    if (confirm(this.translate.instant('milestone-configuration.confirm-delete'))) {
      this.loading = true;
      const milestoneId = typeof milestone.id === 'object' ? milestone.id.value : String(milestone.id);

      const deleteSub = this.milestoneService.deleteMilestone(milestoneId).subscribe({
        next: () => {
          this.milestones = this.milestones.filter(m => 
            (typeof m.id === 'object' ? m.id.value : String(m.id)) !== milestoneId
          );
          this.loading = false;
          this.snackBar.open(
            this.translate.instant('milestone-configuration.success.milestone-deleted'),
            this.translate.instant('milestone-configuration.actions.close'),
            { duration: 3000 }
          );
        },
        error: (error: any) => {
          console.error('Error deleting milestone:', error);
          
          // Aún así actualizamos la UI para reflejar la eliminación ya que el backend podría 
          // haber eliminado el hito a pesar del error
          this.milestones = this.milestones.filter(m => 
            (typeof m.id === 'object' ? m.id.value : String(m.id)) !== milestoneId
          );
          
          this.loading = false;
          this.snackBar.open(
            `${this.translate.instant('milestone-configuration.errors.delete-milestone')}: ${error.message}`,
            this.translate.instant('milestone-configuration.actions.close'),
            { duration: 5000 }
          );
        }
      });

      this.subscriptions.push(deleteSub);
    }
  }

  navigateToSchedule(): void {
    // This will be implemented with RouterLink in the template
  }
}
