import { TestBed } from '@angular/core/testing';

import { DiscussedTopicStorageService } from './discussed-topic-storage.service';

describe('DiscussedTopicStorageService', () => {
  let service: DiscussedTopicStorageService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(DiscussedTopicStorageService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
