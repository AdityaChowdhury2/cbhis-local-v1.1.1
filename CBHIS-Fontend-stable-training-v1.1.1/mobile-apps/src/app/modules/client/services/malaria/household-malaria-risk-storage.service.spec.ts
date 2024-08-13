import { TestBed } from '@angular/core/testing';

import { HouseholdMalariaRiskStorageService } from './household-malaria-risk-storage.service';

describe('HouseholdMalariaRiskStorageService', () => {
  let service: HouseholdMalariaRiskStorageService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(HouseholdMalariaRiskStorageService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
