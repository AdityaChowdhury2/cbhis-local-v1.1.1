import { TestBed } from '@angular/core/testing';

import { VillageStorageService } from './village-storage.service';

describe('VillageStorageService', () => {
  let service: VillageStorageService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(VillageStorageService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
