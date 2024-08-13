import { TestBed } from '@angular/core/testing';
import { HBCServiceCategoryStorageService } from './hbc-service-category-storage.service';

describe('HbcServiceCategoryStorageService', () => {
  let service: HBCServiceCategoryStorageService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(HBCServiceCategoryStorageService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
