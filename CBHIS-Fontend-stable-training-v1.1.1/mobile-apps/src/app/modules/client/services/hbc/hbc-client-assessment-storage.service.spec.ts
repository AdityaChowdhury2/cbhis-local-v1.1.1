import { TestBed } from '@angular/core/testing';

import { HbcClientAssessmentStorageService } from './hbc-client-assessment-storage.service';

describe('HbcClientAssessmentStorageService', () => {
  let service: HbcClientAssessmentStorageService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(HbcClientAssessmentStorageService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
