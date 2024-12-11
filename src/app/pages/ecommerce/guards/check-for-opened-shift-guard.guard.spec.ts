import { TestBed } from '@angular/core/testing';
import { CanActivateFn } from '@angular/router';

import { checkForOpenedShiftGuardGuard } from './check-for-opened-shift-guard.guard';

describe('checkForOpenedShiftGuardGuard', () => {
  const executeGuard: CanActivateFn = (...guardParameters) => 
      TestBed.runInInjectionContext(() => checkForOpenedShiftGuardGuard(...guardParameters));

  beforeEach(() => {
    TestBed.configureTestingModule({});
  });

  it('should be created', () => {
    expect(executeGuard).toBeTruthy();
  });
});
