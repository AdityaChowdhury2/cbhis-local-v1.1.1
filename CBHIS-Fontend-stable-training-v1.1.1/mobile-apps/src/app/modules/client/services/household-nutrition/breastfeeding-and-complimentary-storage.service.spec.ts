import { TestBed } from '@angular/core/testing';

import { BreastfeedingAndComplimentaryStorageService } from './breastfeeding-and-complimentary-storage.service';

describe('BreastfeedingAndComplimentaryStorageService', () => {
  let service: BreastfeedingAndComplimentaryStorageService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(BreastfeedingAndComplimentaryStorageService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
