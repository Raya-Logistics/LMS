import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HandlingScannerComponent } from './handling-scanner.component';

describe('HandlingScannerComponent', () => {
  let component: HandlingScannerComponent;
  let fixture: ComponentFixture<HandlingScannerComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [HandlingScannerComponent]
    });
    fixture = TestBed.createComponent(HandlingScannerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
