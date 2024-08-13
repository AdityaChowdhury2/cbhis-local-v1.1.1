import { TestBed } from '@angular/core/testing';

import { DietaryDiversityStorageService } from './dietary-diversity-storage.service';

describe('DietaryDiversityStorageService', () => {
  let service: DietaryDiversityStorageService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(DietaryDiversityStorageService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
