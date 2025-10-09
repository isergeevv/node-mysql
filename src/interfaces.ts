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

export type IResult =
  | IBaseResult
  | ISelectResult
  | IUpdateResult
  | IDeleteResult
  | IInsertResult
  | ICreateTableResult
  | ITableExistsResult;

export interface IQuery<T extends IBaseResult = IBaseResult> {
  export(): string;
  execute(): Promise<T>;
  then(resolve: (value: T) => void, reject?: (reason: Error) => void): Promise<T>;
}

export interface ISelectQuery extends IQuery<ISelectResult> {
  items(...items: string[]): ISelectQuery;
  forUpdate(forUpdate?: boolean): ISelectQuery;
  from(table: string): ISelectQuery;
  join(...joins: Join[]): ISelectQuery;
  where(...conditions: string[]): ISelectQuery;
  limit(limit: number, startItem?: number): ISelectQuery;
  order(order: SelectOrder): ISelectQuery;
  extra(extra: string): ISelectQuery;
  setParams(...items: (string | number | bigint)[]): ISelectQuery;
  import(props: Partial<SelectProps>): ISelectQuery;
}

export interface IInsertQuery extends IQuery<IInsertResult> {
  into(table: string): IInsertQuery;
  items(items: Record<string, any>): IInsertQuery;
  import(props: Partial<InsertProps>): IInsertQuery;
}

export interface IUpdateQuery extends IQuery<IUpdateResult> {
  table(table: string): IUpdateQuery;
  set(set: string | string[]): IUpdateQuery;
  where(...conditions: string[]): IUpdateQuery;
  setParams(...items: (string | number | bigint)[]): IUpdateQuery;
  import(props: Partial<UpdateProps>): IUpdateQuery;
}

export interface IDeleteQuery extends IQuery<IDeleteResult> {
  from(table: string): IDeleteQuery;
  where(...conditions: string[]): IDeleteQuery;
  setParams(...items: (string | number | bigint)[]): IDeleteQuery;
  import(props: Partial<DeleteProps>): IDeleteQuery;
}

export interface ICreateTableQuery extends IQuery<ICreateTableResult> {
  table(table: string): ICreateTableQuery;
  columns(...columns: Partial<TableColumnData>[]): ICreateTableQuery;
  ifNotExists(ifNotExists?: boolean): ICreateTableQuery;
  import(props: Partial<CreateTableProps>): ICreateTableQuery;
}

export interface ITableExistsQuery extends IQuery<ITableExistsResult> {
  table(table: string): ITableExistsQuery;
  import(props: Partial<TableExistsProps>): ITableExistsQuery;
}
