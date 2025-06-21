import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DeleteOrganizationModalComponent } from './delete-organization-modal.component';

describe('DeleteOrganizationModalComponent', () => {
  let component: DeleteOrganizationModalComponent;
  let fixture: ComponentFixture<DeleteOrganizationModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DeleteOrganizationModalComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DeleteOrganizationModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
