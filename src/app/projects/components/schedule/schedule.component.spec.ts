import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { MatDialogModule } from '@angular/material/dialog';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { of, throwError } from 'rxjs';

import { ScheduleComponent } from './schedule.component';
import { MilestoneService } from '../../services/milestone.service';
import { ProjectService } from '../../services/project.service';
import { SessionService } from '../../../iam/services/session.service';
import { Project } from '../../model/project.entity';
import { Milestone } from '../../model/milestone.entity';
import { ProjectStatus } from '../../model/project-status.vo';

describe('ScheduleComponent', () => {
  let component: ScheduleComponent;
  let fixture: ComponentFixture<ScheduleComponent>;
  let milestoneServiceSpy: jasmine.SpyObj<MilestoneService>;
  let projectServiceSpy: jasmine.SpyObj<ProjectService>;
  let sessionServiceSpy: jasmine.SpyObj<SessionService>;

  const mockProject = {
    id: 'test-project-id',
    name: 'Test Project',
    description: 'Test description',
    status: ProjectStatus.BASIC_STUDIES,
    startingDate: new Date('2025-01-01'),
    endingDate: new Date('2025-12-31'),
    team: []
  };

  const mockMilestones = [
    new Milestone({
      id: 'milestone-1',
      name: 'Test Milestone 1',
      startingDate: new Date('2025-06-15'),
      endingDate: new Date('2025-07-15'),
      projectId: 'test-project-id',
      description: 'Test description 1'
    }),
    new Milestone({
      id: 'milestone-2',
      name: 'Test Milestone 2',
      startingDate: new Date('2025-07-20'),
      endingDate: new Date('2025-08-30'),
      projectId: 'test-project-id',
      description: 'Test description 2'
    })
  ];

  beforeEach(async () => {
    const milestoneSpy = jasmine.createSpyObj('MilestoneService', [
      'getMilestonesByProjectId',
      'createMilestone'
    ]);
    const projectSpy = jasmine.createSpyObj('ProjectService', ['getById']);
    const sessionSpy = jasmine.createSpyObj('SessionService', ['getProjectId']);

    await TestBed.configureTestingModule({
      imports: [
        ScheduleComponent,
        ReactiveFormsModule,
        MatDialogModule,
        MatSnackBarModule,
        NoopAnimationsModule,
        HttpClientTestingModule,
        TranslateModule.forRoot()
      ],
      providers: [
        { provide: MilestoneService, useValue: milestoneSpy },
        { provide: ProjectService, useValue: projectSpy },
        { provide: SessionService, useValue: sessionSpy },
        TranslateService
      ]
    }).compileComponents();

    milestoneServiceSpy = TestBed.inject(MilestoneService) as jasmine.SpyObj<MilestoneService>;
    projectServiceSpy = TestBed.inject(ProjectService) as jasmine.SpyObj<ProjectService>;
    sessionServiceSpy = TestBed.inject(SessionService) as jasmine.SpyObj<SessionService>;
  });

  beforeEach(() => {
    sessionServiceSpy.getProjectId.and.returnValue('test-project-id');
    projectServiceSpy.getById.and.returnValue(of(mockProject as unknown as Project));
    milestoneServiceSpy.getMilestonesByProjectId.and.returnValue(of(mockMilestones));

    fixture = TestBed.createComponent(ScheduleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load project and milestones on init', () => {
    expect(sessionServiceSpy.getProjectId).toHaveBeenCalled();
    expect(projectServiceSpy.getById).toHaveBeenCalledWith(null, { id: 'test-project-id' });
    expect(milestoneServiceSpy.getMilestonesByProjectId).toHaveBeenCalledWith('test-project-id');
    
    expect(component.project).toEqual(mockProject as unknown as Project);
    expect(component.milestones.length).toBe(2);
    expect(component.loading).toBeFalse();
  });

  it('should handle project loading error', () => {
    projectServiceSpy.getById.and.returnValue(throwError(() => new Error('Test error')));
    
    component.loadProject();
    
    expect(component.error).toBeTruthy();
    expect(component.loading).toBeFalse();
  });

  it('should handle milestone loading error', () => {
    milestoneServiceSpy.getMilestonesByProjectId.and.returnValue(throwError(() => new Error('Test error')));
    
    component.loadMilestones();
    
    expect(component.error).toBeTruthy();
    expect(component.loading).toBeFalse();
  });

  it('should validate and adjust dates when creating milestone', () => {
    component.project = mockProject as unknown as Project;
    
    // Test start date after end date
    component.milestoneForm.setValue({
      name: 'Test Milestone',
      startingDate: new Date('2025-08-15'),
      endingDate: new Date('2025-07-15'),
      description: 'Test description'
    });
    
    component.onSubmit();
    
    // The end date should be adjusted to match the start date
    expect(component.milestoneForm.get('endingDate')?.value.getTime()).toEqual(
      component.milestoneForm.get('startingDate')?.value.getTime()
    );
  });

  it('should validate project date range when creating milestone', () => {
    component.project = mockProject as unknown as Project;
    
    // Test dates outside project range
    component.milestoneForm.setValue({
      name: 'Test Milestone',
      startingDate: new Date('2024-01-01'), // Before project start
      endingDate: new Date('2026-12-31'),   // After project end
      description: 'Test description'
    });
    
    component.onSubmit();
    
    // Dates should be adjusted to fit within project range
    expect(component.milestoneForm.get('startingDate')?.value.getTime()).toEqual(
      new Date('2025-01-01').getTime()
    );
    expect(component.milestoneForm.get('endingDate')?.value.getTime()).toEqual(
      new Date('2025-12-31').getTime()
    );
  });
});
