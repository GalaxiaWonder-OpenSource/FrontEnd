import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WorkerLayoutComponent } from './worker-layout.component';

describe('WorkerLayoutComponent', () => {
  let component: WorkerLayoutComponent;
  let fixture: ComponentFixture<WorkerLayoutComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WorkerLayoutComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(WorkerLayoutComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
