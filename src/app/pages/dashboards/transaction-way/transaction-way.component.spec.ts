import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TransactionWayComponent } from './transaction-way.component';

describe('TransactionWayComponent', () => {
  let component: TransactionWayComponent;
  let fixture: ComponentFixture<TransactionWayComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [TransactionWayComponent]
    });
    fixture = TestBed.createComponent(TransactionWayComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
