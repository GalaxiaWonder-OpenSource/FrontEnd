import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MemberListComponent } from './member-list.component';
import { SessionService } from '../../../iam/services/session.service';
import { OrganizationMemberService } from '../../services/organization-member.service';
import { OrganizationService } from '../../services/organization.service';
import { PersonService } from '../../../iam/services/person.service';
import { MatDialog } from '@angular/material/dialog';

// Mocks básicos para los servicios
class SessionServiceMock {}
class OrganizationMemberServiceMock {}
class OrganizationServiceMock {}
class PersonServiceMock {}
class MatDialogMock {}

describe('MemberListComponent', () => {
  let component: MemberListComponent;
  let fixture: ComponentFixture<MemberListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MemberListComponent],
      providers: [
        { provide: SessionService, useClass: SessionServiceMock },
        { provide: OrganizationMemberService, useClass: OrganizationMemberServiceMock },
        { provide: OrganizationService, useClass: OrganizationServiceMock },
        { provide: PersonService, useClass: PersonServiceMock },
        { provide: MatDialog, useClass: MatDialogMock }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(MemberListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
