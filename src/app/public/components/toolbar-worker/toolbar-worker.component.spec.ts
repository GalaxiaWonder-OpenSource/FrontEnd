import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ToolbarWorkerComponent } from './toolbar-worker.component';

describe('ToolbarWorkerComponent', () => {
  let component: ToolbarWorkerComponent;
  let fixture: ComponentFixture<ToolbarWorkerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ToolbarWorkerComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ToolbarWorkerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
