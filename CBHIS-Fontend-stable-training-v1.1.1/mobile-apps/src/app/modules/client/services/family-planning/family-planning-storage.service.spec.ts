import { TestBed } from '@angular/core/testing';

import { FamilyPlanningStorageService } from './family-planning-storage.service';

describe('FamilyPlanningStorageService', () => {
  let service: FamilyPlanningStorageService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(FamilyPlanningStorageService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
