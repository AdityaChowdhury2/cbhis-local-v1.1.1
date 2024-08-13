import { Injectable } from '@angular/core';
import {
  CreateTableBuilder,
  DeleteBuilder,
  InsertBuilder,
  QueryBuilder,
  SQLQueryBuilder,
  UpdateBuilder,
} from '../utils/query-builder';

@Injectable({
  providedIn: 'root',
})
export class SqlQueryBuilderService {
  constructor() {}

  create(): CreateTableBuilder {
    return SQLQueryBuilder.create();
  }

  select(...columns: string[]): QueryBuilder {
    return SQLQueryBuilder.select(...columns);
  }

  insert(): InsertBuilder {
    return SQLQueryBuilder.insert();
  }

  update(): UpdateBuilder {
    return SQLQueryBuilder.update();
  }

  delete(): DeleteBuilder {
    return SQLQueryBuilder.delete();
  }
}
