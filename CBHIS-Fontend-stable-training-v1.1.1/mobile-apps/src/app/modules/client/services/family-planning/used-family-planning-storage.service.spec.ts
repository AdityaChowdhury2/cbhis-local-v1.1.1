import { TestBed } from '@angular/core/testing';

import { UsedFamilyPlanningStorageService } from './used-family-planning-storage.service';

describe('UsedFamilyPlanningStorageService', () => {
  let service: UsedFamilyPlanningStorageService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(UsedFamilyPlanningStorageService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
