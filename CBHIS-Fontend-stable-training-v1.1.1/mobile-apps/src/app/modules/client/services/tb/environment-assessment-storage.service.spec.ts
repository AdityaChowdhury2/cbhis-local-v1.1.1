import { TestBed } from '@angular/core/testing';

import { EnvironmentAssessmentStorageService } from './environment-assessment-storage.service';

describe('EnvironmentAssessmentStorageService', () => {
  let service: EnvironmentAssessmentStorageService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(EnvironmentAssessmentStorageService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
