import type { PoolConnection, Pool, FieldPacket, QueryResult } from 'mysql2/promise';
import type {
  CreateTableProps,
  DeleteProps,
  InsertProps,
  Join,
  ResultField,
  ResultRow,
  SelectOrder,
  SelectProps,
  TableColumnData,
  TableExistsProps,
  UpdateProps,
} from './types';

export interface IConnection {
  query(qry: string, items?: any[]): Promise<IResult>;
  select(qryProps?: Partial<SelectProps>): ISelectQuery;
  insert(qryProps?: Partial<InsertProps>): IInsertQuery;
  update(qryProps?: Partial<UpdateProps>): IUpdateQuery;
  delete(qryProps?: Partial<DeleteProps>): IDeleteQuery;
  createTable(qryProps?: Partial<CreateTableProps>): ICreateTableQuery;
  tableExists(qryProps?: Partial<TableExistsProps>): ITableExistsQuery;
  escape(value: unknown): string;
  generateParameterizedQuery(queryString: string, values?: (string | number | bigint)[]): string;
}

export interface IDatabaseConnection extends IConnection {
  get connection(): PoolConnection;
  beginTransaction(): Promise<void>;
  commitTransaction(): Promise<void>;
  rollbackTransaction(): Promise<void>;
  release(): void;
}

export interface IDatabase extends IConnection {
  get pool(): Pool;
  getConnection(): Promise<IDatabaseConnection>;
  beginTransaction(): Promise<IDatabaseConnection>;
  close(): void;
}

export interface IBaseResult {
  get raw(): [QueryResult, FieldPacket[]];
  //   get headers(): ResultSetHeader;
}

export interface ISelectResult extends IBaseResult {
  get rows(): ResultRow[];
  get fields(): ResultField[];
}

export interface IUpdateResult extends IBaseResult {
  get affectedRows(): number;
}
export interface IDeleteResult extends IBaseResult {
  get affectedRows(): number;
}

export interface IInsertResult extends IBaseResult {
  get insertId(): number;
}

export interface ICreateTableResult extends IBaseResult {}

export interface ITableExistsResult extends IBaseResult {}

export type IResult = IBaseResult &
  ISelectResult &
  IUpdateResult &
  IDeleteResult &
  IInsertResult &
  ICreateTableResult &
  ITableExistsResult;

export interface IQuery {
  export(): string;
  execute(): Promise<IBaseResult>;
  then(resolve: (value: string) => void, reject?: (reason: Error) => void): Promise<IBaseResult>;
}

export interface ISelectQuery extends IQuery {
  items(...items: string[]): ISelectQuery;
  forUpdate(forUpdate?: boolean): ISelectQuery;
  from(table: string): ISelectQuery;
  join(...joins: Join[]): ISelectQuery;
  where(...conditions: string[]): ISelectQuery;
  limit(limit: number, startItem?: number): ISelectQuery;
  order(order: SelectOrder): ISelectQuery;
  extra(extra: string): ISelectQuery;
  setParams(...items: (string | number | bigint)[]): ISelectQuery;
  import(props: SelectProps): ISelectQuery;
}

export interface IInsertQuery extends IQuery {
  into(table: string): IInsertQuery;
  items(items: Record<string, any>): IInsertQuery;
  import(props: InsertProps): IInsertQuery;
}

export interface IUpdateQuery extends IQuery {
  table(table: string): IUpdateQuery;
  set(set: string | string[]): IUpdateQuery;
  where(...conditions: string[]): IUpdateQuery;
  setParams(...items: (string | number | bigint)[]): IUpdateQuery;
  import(props: UpdateProps): IUpdateQuery;
}

export interface IDeleteQuery extends IQuery {
  from(table: string): IDeleteQuery;
  where(...conditions: string[]): IDeleteQuery;
  setParams(...items: (string | number | bigint)[]): IDeleteQuery;
  import(props: DeleteProps): IDeleteQuery;
}

export interface ICreateTableQuery extends IQuery {
  table(table: string): ICreateTableQuery;
  columns(...columns: Partial<TableColumnData>[]): ICreateTableQuery;
  ifNotExists(ifNotExists?: boolean): ICreateTableQuery;
  import(props: CreateTableProps): ICreateTableQuery;
}

export interface ITableExistsQuery extends IQuery {
  table(table: string): ITableExistsQuery;
  import(props: CreateTableProps): ITableExistsQuery;
}
