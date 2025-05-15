import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OrganizationLayoutComponent } from './organization-layout.component';

describe('OrganizationLayoutComponent', () => {
  let component: OrganizationLayoutComponent;
  let fixture: ComponentFixture<OrganizationLayoutComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OrganizationLayoutComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OrganizationLayoutComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
