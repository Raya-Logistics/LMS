import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ShiftConfigurationComponent } from './shift-configuration.component';

describe('ShiftConfigurationComponent', () => {
  let component: ShiftConfigurationComponent;
  let fixture: ComponentFixture<ShiftConfigurationComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ShiftConfigurationComponent]
    });
    fixture = TestBed.createComponent(ShiftConfigurationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
