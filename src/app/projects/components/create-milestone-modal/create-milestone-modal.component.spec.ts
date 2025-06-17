import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateMilestoneModalComponent } from './create-milestone-modal.component';

describe('CreateMilestoneModalComponent', () => {
  let component: CreateMilestoneModalComponent;
  let fixture: ComponentFixture<CreateMilestoneModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CreateMilestoneModalComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CreateMilestoneModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
