import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MilestoneLayoutComponent } from './milestone-layout.component';

describe('MilestoneLayoutComponent', () => {
  let component: MilestoneLayoutComponent;
  let fixture: ComponentFixture<MilestoneLayoutComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MilestoneLayoutComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MilestoneLayoutComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
