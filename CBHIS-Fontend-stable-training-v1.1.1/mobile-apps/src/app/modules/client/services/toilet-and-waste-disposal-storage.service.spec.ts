import { TestBed } from '@angular/core/testing';

import { ToiletAndWasteDisposalStorageService } from './toilet-and-waste-disposal-storage.service';

describe('ToiletAndWasteDisposalStorageService', () => {
  let service: ToiletAndWasteDisposalStorageService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ToiletAndWasteDisposalStorageService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
