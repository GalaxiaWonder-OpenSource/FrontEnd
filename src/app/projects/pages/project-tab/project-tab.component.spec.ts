import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProjectTabComponent } from './project-tab.component';

describe('ProjectTabComponent', () => {
  let component: ProjectTabComponent;
  let fixture: ComponentFixture<ProjectTabComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProjectTabComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProjectTabComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
