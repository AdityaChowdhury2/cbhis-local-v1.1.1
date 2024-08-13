import { TestBed } from '@angular/core/testing';

import { HouseholdSafeWaterStorageService } from './household-safe-water-storage.service';

describe('HouseholdSafeWaterStorageService', () => {
  let service: HouseholdSafeWaterStorageService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(HouseholdSafeWaterStorageService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
