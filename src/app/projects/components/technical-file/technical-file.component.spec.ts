import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TechnicalFileComponent } from './technical-file.component';

describe('TechnicalFileComponent', () => {
  let component: TechnicalFileComponent;
  let fixture: ComponentFixture<TechnicalFileComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TechnicalFileComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TechnicalFileComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
