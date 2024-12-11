import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HandlingInComponent } from './handling-in.component';

describe('HandlingInComponent', () => {
  let component: HandlingInComponent;
  let fixture: ComponentFixture<HandlingInComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [HandlingInComponent]
    });
    fixture = TestBed.createComponent(HandlingInComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
