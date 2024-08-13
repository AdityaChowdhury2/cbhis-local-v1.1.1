export class QueryBuilder {
  private query: string = '';
  private selectColumns: string[] = [];
  private whereClauses: string[] = [];
  private joinClauses: string[] = [];
  private groupByColumns: string[] = [];
  private orderByColumns: string[] = [];
  private havingClauses: string[] = [];
  private limitCount: number | null = null;
  private likeClauses: string[] = [];

  select(...columns: string[]): this {
    this.selectColumns = columns;
    return this;
  }

  from(table: string): this {
    this.query = `SELECT ${
      this.selectColumns.length > 0 ? this.selectColumns.join(', ') : '*'
    } FROM ${table}`;
    return this;
  }

  where(condition: string): this {
    this.whereClauses.push(`(${condition})`);
    return this;
  }

  andWhere(condition: string): this {
    this.whereClauses.push(`AND (${condition})`);
    return this;
  }

  orWhere(condition: string): this {
    this.whereClauses.push(`OR (${condition})`);
    return this;
  }

  join(table: string, on: string): this {
    this.joinClauses.push(`JOIN ${table} ON ${on}`);
    return this;
  }

  leftJoin(table: string, on: string): this {
    this.joinClauses.push(`LEFT JOIN ${table} ON ${on}`);
    return this;
  }

  rightJoin(table: string, on: string): this {
    this.joinClauses.push(`RIGHT JOIN ${table} ON ${on}`);
    return this;
  }

  groupBy(...columns: string[]): this {
    this.groupByColumns = columns;
    return this;
  }

  having(condition: string): this {
    this.havingClauses.push(condition);
    return this;
  }

  orderBy(column: string, direction: 'ASC' | 'DESC' = 'ASC'): this {
    this.orderByColumns.push(`${column} ${direction}`);
    return this;
  }

  limit(count: number): this {
    this.limitCount = count;
    return this;
  }

  like(column: string, value: string): this {
    this.likeClauses.push(`${column} LIKE '%${value}%'`);
    return this;
  }

  build(): string {
    const whereClause =
      this.whereClauses.length > 0
        ? `WHERE ${this.whereClauses.join(' ')}`
        : '';
    const joinClause = this.joinClauses.join(' ');
    const groupByClause =
      this.groupByColumns.length > 0
        ? `GROUP BY ${this.groupByColumns.join(', ')}`
        : '';
    const havingClause =
      this.havingClauses.length > 0
        ? `HAVING ${this.havingClauses.join(' AND ')}`
        : '';
    const orderByClause =
      this.orderByColumns.length > 0
        ? `ORDER BY ${this.orderByColumns.join(', ')}`
        : '';
    const limitClause =
      this.limitCount !== null ? `LIMIT ${this.limitCount}` : '';
    const likeClause =
      this.likeClauses.length > 0
        ? `WHERE ${this.likeClauses.join(' AND ')}`
        : '';

    return (
      `${this.query} ${joinClause} ${whereClause} ${groupByClause} ${havingClause} ${orderByClause} ${limitClause} ${likeClause}`.trim() +
      ';'
    );
  }
}

export class InsertBuilder {
  private table: string = '';
  private columns: string[] = [];
  private valuesArray: any[] = [];

  into(table: string): this {
    this.table = table;
    return this;
  }

  values(data: { [key: string]: any }): this {
    this.columns = Object.keys(data);
    this.valuesArray = Object.values(data);
    return this;
  }

  build(): string {
    const cols = this.columns.join(', ');
    const vals = this.valuesArray.map((value) => `'${value}'`).join(', ');
    return `INSERT INTO ${this.table} (${cols}) VALUES (${vals});`;
  }
}

export class UpdateBuilder {
  private tableName: string = '';
  private updates: string[] = [];
  private whereClauses: string[] = [];

  table(table: string): this {
    this.tableName = table;
    return this;
  }

  set(data: { [key: string]: any }): this {
    this.updates = Object.entries(data).map(
      ([key, value]) => `${key} = '${value}'`
    );
    return this;
  }

  where(condition: string): this {
    this.whereClauses.push(`(${condition})`);
    return this;
  }

  andWhere(condition: string): this {
    this.whereClauses.push(`AND (${condition})`);
    return this;
  }

  orWhere(condition: string): this {
    this.whereClauses.push(`OR (${condition})`);
    return this;
  }

  build(): string {
    const setClause = this.updates.join(', ');
    const whereClause =
      this.whereClauses.length > 0
        ? ` WHERE ${this.whereClauses.join(' ')}`
        : '';
    return `UPDATE ${this.tableName} SET ${setClause}${whereClause};`;
  }
}

export class DeleteBuilder {
  private tableName: string = '';
  private whereClauses: string[] = [];

  from(table: string): this {
    this.tableName = table;
    return this;
  }

  where(condition: string): this {
    this.whereClauses.push(`(${condition})`);
    return this;
  }

  andWhere(condition: string): this {
    this.whereClauses.push(`AND (${condition})`);
    return this;
  }

  orWhere(condition: string): this {
    this.whereClauses.push(`OR (${condition})`);
    return this;
  }

  build(): string {
    const whereClause =
      this.whereClauses.length > 0
        ? ` WHERE ${this.whereClauses.join(' ')}`
        : '';
    return `DELETE FROM ${this.tableName}${whereClause};`;
  }
}

export class CreateTableBuilder {
  private tableName: string = '';
  private columns: string[] = [];

  table(table: string): this {
    this.tableName = table;
    return this;
  }

  addColumn(column: string, type: string): this {
    this.columns.push(`${column} ${type}`);
    return this;
  }

  build(): string {
    const cols = this.columns.join(', ');
    return `CREATE TABLE IF NOT EXISTS ${this.tableName} (${cols});`;
  }
}

export class SQLQueryBuilder {
  static create(): CreateTableBuilder {
    return new CreateTableBuilder();
  }

  static select(...columns: string[]): QueryBuilder {
    return new QueryBuilder().select(...columns);
  }

  static insert(): InsertBuilder {
    return new InsertBuilder();
  }

  static update(): UpdateBuilder {
    return new UpdateBuilder();
  }

  static delete(): DeleteBuilder {
    return new DeleteBuilder();
  }
}
