import { TestBed } from '@angular/core/testing';

import { HealthEducationDiscussedTopicsStorageService } from './health-education-discussed-topics-storage.service';

describe('HealthEducationDiscussedTopicsStorageService', () => {
  let service: HealthEducationDiscussedTopicsStorageService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(HealthEducationDiscussedTopicsStorageService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
