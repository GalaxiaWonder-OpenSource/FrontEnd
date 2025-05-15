import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OrganizationInformationCardComponent } from './organization-information-card.component';

describe('OrganizationInformationCardComponent', () => {
  let component: OrganizationInformationCardComponent;
  let fixture: ComponentFixture<OrganizationInformationCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OrganizationInformationCardComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OrganizationInformationCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
