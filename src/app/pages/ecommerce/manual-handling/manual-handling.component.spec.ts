import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ManualHandlingComponent } from './manual-handling.component';

describe('ManualHandlingComponent', () => {
  let component: ManualHandlingComponent;
  let fixture: ComponentFixture<ManualHandlingComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ManualHandlingComponent]
    });
    fixture = TestBed.createComponent(ManualHandlingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
