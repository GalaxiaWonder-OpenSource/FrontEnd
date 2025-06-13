import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DeleteMemberModalComponent } from './delete-member-modal.component';
import { MatDialogRef } from '@angular/material/dialog';
import { TranslatePipe } from '@ngx-translate/core';
import { NO_ERRORS_SCHEMA } from '@angular/core';

describe('DeleteMemberModalComponent', () => {
  let component: DeleteMemberModalComponent;
  let fixture: ComponentFixture<DeleteMemberModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DeleteMemberModalComponent],
      providers: [
        { provide: MatDialogRef, useValue: {} },
        { provide: TranslatePipe, useValue: { transform: (v: string) => v } }
      ],
      schemas: [NO_ERRORS_SCHEMA]
    }).compileComponents();

    fixture = TestBed.createComponent(DeleteMemberModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
