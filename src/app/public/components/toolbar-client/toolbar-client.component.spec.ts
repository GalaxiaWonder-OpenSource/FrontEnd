import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ToolbarClientComponent } from './toolbar-client.component';

describe('ToolbarClientComponent', () => {
  let component: ToolbarClientComponent;
  let fixture: ComponentFixture<ToolbarClientComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ToolbarClientComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ToolbarClientComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
