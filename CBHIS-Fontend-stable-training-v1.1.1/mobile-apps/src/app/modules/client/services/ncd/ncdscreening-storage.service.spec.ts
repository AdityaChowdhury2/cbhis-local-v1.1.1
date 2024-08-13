import { TestBed } from '@angular/core/testing';

import { NCDScreeningStorageService } from './ncdscreening-storage.service';

describe('NCDScreeningStorageService', () => {
  let service: NCDScreeningStorageService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(NCDScreeningStorageService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
