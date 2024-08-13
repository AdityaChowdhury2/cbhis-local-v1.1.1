import { TestBed } from '@angular/core/testing';
import { HIVSelfTestStorageService } from './hiv-self-test-storage.service';

describe('SelfTestStorageService', () => {
  let service: HIVSelfTestStorageService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(HIVSelfTestStorageService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
