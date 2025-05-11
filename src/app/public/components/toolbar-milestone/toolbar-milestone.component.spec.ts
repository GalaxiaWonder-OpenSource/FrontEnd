import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ToolbarMilestoneComponent } from './toolbar-milestone.component';

describe('ToolbarMilestoneComponent', () => {
  let component: ToolbarMilestoneComponent;
  let fixture: ComponentFixture<ToolbarMilestoneComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ToolbarMilestoneComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ToolbarMilestoneComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
