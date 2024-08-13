import { TestBed } from '@angular/core/testing';

import { PreventionStorageService } from './prevention-storage.service';

describe('PreventionStorageService', () => {
  let service: PreventionStorageService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PreventionStorageService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
