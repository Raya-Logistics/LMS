import { TestBed } from '@angular/core/testing';

import { SignalRNotificationService } from './signal-rnotification.service';

describe('SignalRNotificationService', () => {
  let service: SignalRNotificationService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SignalRNotificationService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
