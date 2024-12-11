import { TestBed } from '@angular/core/testing';

import { FilehandlerService } from './filehandler.service';

describe('FilehandlerService', () => {
  let service: FilehandlerService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(FilehandlerService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
