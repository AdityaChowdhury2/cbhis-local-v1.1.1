import { TestBed } from '@angular/core/testing';
import { SqlGeneratorService } from './sql-generator.service';

describe('SqlGeneratorService', () => {
  let service: SqlGeneratorService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SqlGeneratorService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
