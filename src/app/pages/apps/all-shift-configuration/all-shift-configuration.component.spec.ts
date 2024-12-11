import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AllShiftConfigurationComponent } from './all-shift-configuration.component';

describe('AllShiftConfigurationComponent', () => {
  let component: AllShiftConfigurationComponent;
  let fixture: ComponentFixture<AllShiftConfigurationComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [AllShiftConfigurationComponent]
    });
    fixture = TestBed.createComponent(AllShiftConfigurationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
