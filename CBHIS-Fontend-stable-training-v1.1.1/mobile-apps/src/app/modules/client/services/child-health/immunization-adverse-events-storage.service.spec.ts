import { TestBed } from '@angular/core/testing';
import { AdverseEventStorageService } from './immunization-adverse-events-storage.service';
describe('ImmunizationAdverseEventsStorageService', () => {
  let service: AdverseEventStorageService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AdverseEventStorageService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
