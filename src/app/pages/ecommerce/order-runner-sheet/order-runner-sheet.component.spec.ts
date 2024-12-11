import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OrderRunnerSheetComponent } from './order-runner-sheet.component';

describe('OrderRunnerSheetComponent', () => {
  let component: OrderRunnerSheetComponent;
  let fixture: ComponentFixture<OrderRunnerSheetComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [OrderRunnerSheetComponent]
    });
    fixture = TestBed.createComponent(OrderRunnerSheetComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
