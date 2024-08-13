import { TestBed } from '@angular/core/testing';

import { ClientTbSymptomsStorageService } from './client-tb-symptoms-storage.service';

describe('ClientTbSymptomsStorageService', () => {
  let service: ClientTbSymptomsStorageService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ClientTbSymptomsStorageService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
