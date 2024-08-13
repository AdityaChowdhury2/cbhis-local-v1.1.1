import { TestBed } from '@angular/core/testing';

import { HouseholdControlInterventionStorageService } from './household-control-intervention-storage.service';

describe('HouseholdControlInterventionStorageService', () => {
  let service: HouseholdControlInterventionStorageService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(HouseholdControlInterventionStorageService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
