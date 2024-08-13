import { TestBed } from '@angular/core/testing';

import { PostnatalDepressionsStorageService } from './postnatal-depressions-storage.service';

describe('PostnatalDepressionsStorageService', () => {
  let service: PostnatalDepressionsStorageService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PostnatalDepressionsStorageService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
