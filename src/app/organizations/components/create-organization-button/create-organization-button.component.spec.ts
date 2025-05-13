import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateOrganizationButtonComponent } from './create-organization-button.component';

describe('CreateOrganizationButtonComponent', () => {
  let component: CreateOrganizationButtonComponent;
  let fixture: ComponentFixture<CreateOrganizationButtonComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CreateOrganizationButtonComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CreateOrganizationButtonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
