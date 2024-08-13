import { TestBed } from '@angular/core/testing';

import { ClientNcdHistoryStorageService } from './client-ncd-history-storage.service';

describe('ClientNcdHistoryStorageService', () => {
  let service: ClientNcdHistoryStorageService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ClientNcdHistoryStorageService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
