import { TestBed } from '@angular/core/testing';
import { ArtStorageService } from './art-storage.service';

describe('ArtStorageService', () => {
  let service: ArtStorageService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ArtStorageService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
