import { TestBed } from '@angular/core/testing';

import { CaseFindingStorageService } from './case-finding-storage.service';

describe('CaseFindingStorageService', () => {
  let service: CaseFindingStorageService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CaseFindingStorageService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
