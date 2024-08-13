import { TestBed } from '@angular/core/testing';

import { PostnatalStorageService } from './postnatal-storage.service';

describe('PostnatalStorageService', () => {
  let service: PostnatalStorageService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PostnatalStorageService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
