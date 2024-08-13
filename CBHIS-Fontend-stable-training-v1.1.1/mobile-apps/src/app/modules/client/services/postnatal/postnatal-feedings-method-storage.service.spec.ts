import { TestBed } from '@angular/core/testing';

import { PostnatalFeedingsMethodStorageService } from './postnatal-feedings-method-storage.service';

describe('PostnatalFeedingsMethodStorageService', () => {
  let service: PostnatalFeedingsMethodStorageService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PostnatalFeedingsMethodStorageService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
