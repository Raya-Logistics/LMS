import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HandlingOutComponent } from './handling-out.component';

describe('HandlingOutComponent', () => {
  let component: HandlingOutComponent;
  let fixture: ComponentFixture<HandlingOutComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [HandlingOutComponent]
    });
    fixture = TestBed.createComponent(HandlingOutComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
