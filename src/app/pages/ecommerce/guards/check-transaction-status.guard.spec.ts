import { TestBed } from '@angular/core/testing';
import { CanActivateFn } from '@angular/router';

import { checkTransactionStatusGuard } from './check-transaction-status.guard';

describe('checkTransactionStatusGuard', () => {
  const executeGuard: CanActivateFn = (...guardParameters) => 
      TestBed.runInInjectionContext(() => checkTransactionStatusGuard(...guardParameters));

  beforeEach(() => {
    TestBed.configureTestingModule({});
  });

  it('should be created', () => {
    expect(executeGuard).toBeTruthy();
  });
});
