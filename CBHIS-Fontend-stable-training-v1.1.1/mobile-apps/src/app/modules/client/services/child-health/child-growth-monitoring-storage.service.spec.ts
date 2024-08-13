import { TestBed } from '@angular/core/testing';

import { ChildGrowthMonitoringStorageService } from './child-growth-monitoring-storage.service';

describe('ChildGrowthMonitoringStorageService', () => {
  let service: ChildGrowthMonitoringStorageService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ChildGrowthMonitoringStorageService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
