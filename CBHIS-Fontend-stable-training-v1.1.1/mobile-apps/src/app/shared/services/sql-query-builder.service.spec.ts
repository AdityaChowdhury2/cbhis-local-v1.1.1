import { TestBed } from '@angular/core/testing';

import { SqlQueryBuilderService } from './sql-query-builder.service';

describe('SqlQueryBuilderService', () => {
  let service: SqlQueryBuilderService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SqlQueryBuilderService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
