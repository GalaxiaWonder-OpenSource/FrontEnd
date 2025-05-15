import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConfigurationTabComponent } from './configuration-tab.component';

describe('ConfigurationTabComponent', () => {
  let component: ConfigurationTabComponent;
  let fixture: ComponentFixture<ConfigurationTabComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ConfigurationTabComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ConfigurationTabComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
