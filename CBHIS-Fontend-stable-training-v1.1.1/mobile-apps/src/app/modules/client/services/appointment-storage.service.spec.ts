import { TestBed } from '@angular/core/testing';

import { AppointmentStorageService } from './appointment-storage.service';

describe('AppointmentStorageService', () => {
  let service: AppointmentStorageService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AppointmentStorageService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
