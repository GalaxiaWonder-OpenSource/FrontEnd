import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MilestoneConfigurationComponent } from './milestone-configuration.component';

describe('MilestoneConfigurationComponent', () => {
  let component: MilestoneConfigurationComponent;
  let fixture: ComponentFixture<MilestoneConfigurationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MilestoneConfigurationComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MilestoneConfigurationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
