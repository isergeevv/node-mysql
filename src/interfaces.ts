import type { PoolConnection, Pool, FieldPacket, QueryResult } from 'mysql2/promise';
import type { DeleteProps, InsertProps, ResultField, ResultRow, SelectProps, UpdateProps } from './types';
import QryBuilder from './QryBuilder';
import QryTableBuilder from './QryTableBuilder';

export interface IConnection {
  get qryBuilder(): typeof QryBuilder;
  get qryTableBuilder(): typeof QryTableBuilder;
  query(qry: string, items?: any[]): Promise<IQryResult>;
  select(qry: string | SelectProps): Promise<IQrySelectResult>;
  insert(qry: string | InsertProps): Promise<IQryInsertResult>;
  update(qry: string | UpdateProps): Promise<IQryUpdateResult>;
  delete(qry: string | DeleteProps): Promise<IQryDeleteResult>;
  escape(value: unknown): string;
  generateParameterizedQuery(queryString: string, values?: (string | number)[]): string;
}

export interface IDatabaseConnection extends IConnection {
  get connection(): PoolConnection;
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

export interface IQryBuilder {
  export(conn: IConnection): string;
}

export interface IBaseQryResult {
  get raw(): [QueryResult, FieldPacket[]];
  //   get headers(): ResultSetHeader;
}

export interface IQrySelectResult extends IBaseQryResult {
  get rows(): ResultRow[];
  get fields(): ResultField[];
}

export interface IQryUpdateResult extends IBaseQryResult {
  get affectedRows(): number;
}
export interface IQryDeleteResult extends IBaseQryResult {
  get affectedRows(): number;
}

export interface IQryInsertResult extends IBaseQryResult {
  get insertId(): number;
}

export type IQryResult = IBaseQryResult & IQrySelectResult & IQryUpdateResult & IQryDeleteResult & IQryInsertResult;
