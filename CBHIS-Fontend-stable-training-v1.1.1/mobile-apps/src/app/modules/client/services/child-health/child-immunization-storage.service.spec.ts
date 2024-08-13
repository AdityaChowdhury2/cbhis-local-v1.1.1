import { TestBed } from '@angular/core/testing';

import { ChildImmunizationStorageService } from './child-immunization-storage.service';

describe('ChildImmunizationStorageService', () => {
  let service: ChildImmunizationStorageService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ChildImmunizationStorageService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
