import { TestBed } from '@angular/core/testing';

import { HouseholdDrinkingWaterSourceStorageService } from './household-drinking-water-source-storage.service';

describe('HouseholdDrinkingWaterSourceStorageService', () => {
  let service: HouseholdDrinkingWaterSourceStorageService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(HouseholdDrinkingWaterSourceStorageService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
