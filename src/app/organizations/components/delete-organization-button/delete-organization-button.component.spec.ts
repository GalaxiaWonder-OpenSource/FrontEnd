import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DeleteOrganizationButtonComponent } from './delete-organization-button.component';

describe('DeleteOrganizationButtonComponent', () => {
  let component: DeleteOrganizationButtonComponent;
  let fixture: ComponentFixture<DeleteOrganizationButtonComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DeleteOrganizationButtonComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DeleteOrganizationButtonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
