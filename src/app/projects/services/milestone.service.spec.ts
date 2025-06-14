import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';

import { MilestoneService } from './milestone.service';
import { Milestone } from '../model/milestone.entity';
import { environment } from '../../../environments/environment';
import { MilestoneId } from '../../shared/model/milestone-id.vo';
import { ProjectId } from '../../shared/model/project-id.vo';

describe('MilestoneService', () => {
  let service: MilestoneService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [MilestoneService]
    });
    service = TestBed.inject(MilestoneService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should get milestones by project ID', () => {
    const projectId = 'test-project-id';
    const mockMilestones = [
      {
        id: 'milestone-1',
        name: 'Test Milestone 1',
        startingDate: '2025-06-15T00:00:00.000Z',
        endingDate: '2025-07-15T00:00:00.000Z',
        projectId: projectId,
        description: 'Test description 1'
      },
      {
        id: 'milestone-2',
        name: 'Test Milestone 2',
        startingDate: '2025-07-20T00:00:00.000Z',
        endingDate: '2025-08-30T00:00:00.000Z',
        projectId: projectId,
        description: 'Test description 2'
      }
    ];

    service.getMilestonesByProjectId(projectId).subscribe(milestones => {
      expect(milestones.length).toBe(2);
      expect(milestones[0].name).toBe('Test Milestone 1');
      expect(milestones[1].name).toBe('Test Milestone 2');
    });

    const req = httpMock.expectOne(`${environment.propgmsApiBaseUrl}/milestones?projectId=${projectId}`);
    expect(req.request.method).toBe('GET');
    req.flush(mockMilestones);
  });

  it('should create a milestone', () => {
    const projectId = 'test-project-id';
    const milestone = new Milestone({
      id: 'new-milestone',
      name: 'New Milestone',
      startingDate: new Date('2025-06-15'),
      endingDate: new Date('2025-07-15'),
      projectId: projectId,
      description: 'Test description'
    });

    const mockResponse = {
      id: 'new-milestone',
      name: 'New Milestone',
      startingDate: '2025-06-15T00:00:00.000Z',
      endingDate: '2025-07-15T00:00:00.000Z',
      projectId: projectId,
      description: 'Test description'
    };

    service.createMilestone(milestone).subscribe(response => {
      expect(response).toBeTruthy();
      expect(response.name).toBe('New Milestone');
      expect(response.id.toString()).toBe('new-milestone');
    });

    const req = httpMock.expectOne(`${environment.propgmsApiBaseUrl}/milestones`);
    expect(req.request.method).toBe('POST');
    req.flush(mockResponse);
  });

  it('should update a milestone', () => {
    const milestoneId = 'milestone-1';
    const projectId = 'test-project-id';
    const milestone = new Milestone({
      id: milestoneId,
      name: 'Updated Milestone',
      startingDate: new Date('2025-06-15'),
      endingDate: new Date('2025-07-15'),
      projectId: projectId,
      description: 'Updated description'
    });

    const mockResponse = {
      id: milestoneId,
      name: 'Updated Milestone',
      startingDate: '2025-06-15T00:00:00.000Z',
      endingDate: '2025-07-15T00:00:00.000Z',
      projectId: projectId,
      description: 'Updated description'
    };

    service.updateMilestone(milestone).subscribe(response => {
      expect(response).toBeTruthy();
      expect(response.name).toBe('Updated Milestone');
      expect(response.description).toBe('Updated description');
    });

    const req = httpMock.expectOne(`${environment.propgmsApiBaseUrl}/milestones/${milestoneId}`);
    expect(req.request.method).toBe('PUT');
    req.flush(mockResponse);
  });

  it('should delete a milestone', () => {
    const milestoneId = 'milestone-1';

    service.deleteMilestone(milestoneId).subscribe(response => {
      expect(response).toBeUndefined();
    });

    const req = httpMock.expectOne(`${environment.propgmsApiBaseUrl}/milestones/${milestoneId}`);
    expect(req.request.method).toBe('DELETE');
    req.flush(null);
  });
});
