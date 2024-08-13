import { TestBed } from '@angular/core/testing';
import { GivenHBCServiceStorageService } from './client-hbc-services-storage.service';

describe('ClientHbcServicesStorageService', () => {
  let service: GivenHBCServiceStorageService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(GivenHBCServiceStorageService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
