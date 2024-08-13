import { TestBed } from '@angular/core/testing';

import { DiscussedANCTopicsStorageService } from './discussed-anc-topics-storage.service';

describe('DiscussedANCTopicsStorageService', () => {
  let service: DiscussedANCTopicsStorageService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(DiscussedANCTopicsStorageService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
