import { TestBed } from '@angular/core/testing';

import { MalariaSymptomsStorageService } from './malaria-symptoms-storage.service';

describe('MalariaSymptomsStorageService', () => {
  let service: MalariaSymptomsStorageService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MalariaSymptomsStorageService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
