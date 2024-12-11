import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TransactionSummeryComponent } from './transaction-summery.component';

describe('TransactionSummeryComponent', () => {
  let component: TransactionSummeryComponent;
  let fixture: ComponentFixture<TransactionSummeryComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [TransactionSummeryComponent]
    });
    fixture = TestBed.createComponent(TransactionSummeryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
