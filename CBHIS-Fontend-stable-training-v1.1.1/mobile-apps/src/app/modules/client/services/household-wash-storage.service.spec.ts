import { TestBed } from '@angular/core/testing';

import { HouseholdWASHStorageService } from './household-wash-storage.service';

describe('HouseholdWASHStorageService', () => {
  let service: HouseholdWASHStorageService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(HouseholdWASHStorageService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
