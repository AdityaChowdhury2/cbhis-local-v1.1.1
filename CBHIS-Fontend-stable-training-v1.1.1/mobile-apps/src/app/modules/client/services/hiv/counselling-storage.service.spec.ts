import { TestBed } from '@angular/core/testing';

import { CounsellingStorageService } from './counselling-storage.service';

describe('CounsellingStorageService', () => {
  let service: CounsellingStorageService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CounsellingStorageService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
