import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OrganizationInformationTabComponent } from './organization-information-tab.component';

describe('OrganizationInformationTabComponent', () => {
  let component: OrganizationInformationTabComponent;
  let fixture: ComponentFixture<OrganizationInformationTabComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OrganizationInformationTabComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OrganizationInformationTabComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
