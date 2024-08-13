import { TestBed } from '@angular/core/testing';

import { PostnatalPreventiveStorageService } from './postnatal-preventive-storage.service';

describe('PostnatalPreventiveStorageService', () => {
  let service: PostnatalPreventiveStorageService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PostnatalPreventiveStorageService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
