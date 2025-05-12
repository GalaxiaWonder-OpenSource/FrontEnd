import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ToolbarProjectComponent } from './toolbar-project.component';

describe('ToolbarProjectComponent', () => {
  let component: ToolbarProjectComponent;
  let fixture: ComponentFixture<ToolbarProjectComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ToolbarProjectComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ToolbarProjectComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
