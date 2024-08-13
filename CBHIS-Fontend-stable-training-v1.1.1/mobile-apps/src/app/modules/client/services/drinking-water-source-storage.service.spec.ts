import { TestBed } from '@angular/core/testing';

import { DrinkingWaterSourceStorageService } from './drinking-water-source-storage.service';

describe('DrinkingWaterSourceStorageService', () => {
  let service: DrinkingWaterSourceStorageService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(DrinkingWaterSourceStorageService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
