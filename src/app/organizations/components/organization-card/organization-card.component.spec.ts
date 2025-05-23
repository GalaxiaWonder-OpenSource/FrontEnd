import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OrganizationCardComponent } from './organization-card.component';

describe('OrganizationCardComponent', () => {
  let component: OrganizationCardComponent;
  let fixture: ComponentFixture<OrganizationCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OrganizationCardComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OrganizationCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
