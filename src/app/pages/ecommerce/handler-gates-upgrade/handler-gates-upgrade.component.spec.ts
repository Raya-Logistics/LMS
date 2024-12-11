import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HandlerGatesUpgradeComponent } from './handler-gates-upgrade.component';

describe('HandlerGatesUpgradeComponent', () => {
  let component: HandlerGatesUpgradeComponent;
  let fixture: ComponentFixture<HandlerGatesUpgradeComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [HandlerGatesUpgradeComponent]
    });
    fixture = TestBed.createComponent(HandlerGatesUpgradeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
