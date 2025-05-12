import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ToolbarOrganizationComponent } from './toolbar-organization.component';

describe('ToolbarOrganizationComponent', () => {
  let component: ToolbarOrganizationComponent;
  let fixture: ComponentFixture<ToolbarOrganizationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ToolbarOrganizationComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ToolbarOrganizationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
