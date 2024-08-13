import { TestBed } from '@angular/core/testing';

import { PostnatalDangerSignsStorageService } from './postnatal-danger-signs-storage.service';

describe('PostnatalDangerSignsStorageService', () => {
  let service: PostnatalDangerSignsStorageService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PostnatalDangerSignsStorageService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
