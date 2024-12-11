import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HandlingOutPrintComponent } from './handling-out-print.component';

describe('HandlingOutPrintComponent', () => {
  let component: HandlingOutPrintComponent;
  let fixture: ComponentFixture<HandlingOutPrintComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [HandlingOutPrintComponent]
    });
    fixture = TestBed.createComponent(HandlingOutPrintComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
