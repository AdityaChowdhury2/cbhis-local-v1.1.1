import { TestBed } from '@angular/core/testing';

import { AffectedClientStorageService } from './affected-client-storage.service';

describe('AffectedClientStorageService', () => {
  let service: AffectedClientStorageService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AffectedClientStorageService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
