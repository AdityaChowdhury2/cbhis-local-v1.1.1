import { TestBed } from '@angular/core/testing';

import { AncStorageService } from './anc-storage.service';

describe('AncStorageService', () => {
  let service: AncStorageService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AncStorageService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
