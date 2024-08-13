import { TestBed } from '@angular/core/testing';

import { ClientStorageService } from './client-storage.service';

describe('ClientStorageService', () => {
  let service: ClientStorageService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ClientStorageService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
