import { FieldPacket, PoolConnection } from 'mysql2/promise';

export type ResultRow = Record<string, any>;
export type ResultField = FieldPacket;

export type QryItems = any | any[] | Record<string, any>;

export interface SelectProps {
  select?: string | string[];
  from: string;
  join?: Join[];
  where?: string | string[];
  extra?: string;
  items?: (string | number)[];
}

export interface SelectReturn {
  rows: ResultRow[];
  fields: FieldPacket[];
}

export type Select = (qry: string | SelectProps, conn?: PoolConnection) => Promise<SelectReturn>;

export interface InsertProps {
  into: string;
  items: Record<string, any>;
  conn?: PoolConnection;
}

export type Insert = (qry: string | InsertProps, conn?: PoolConnection) => Promise<number>;

export interface UpdateProps {
  table: string;
  set: string | string[];
  where?: string | string[];
  items?: (string | number)[];
  conn?: PoolConnection;
}

export type Update = (qry: string | UpdateProps, conn?: PoolConnection) => Promise<number>;

export interface DeleteProps {
  table: string;
  where: string | string[];
  items: any[];
  conn?: PoolConnection;
}

export type Delete = (qry: string | DeleteProps, conn?: PoolConnection) => Promise<number>;

export interface Join {
  type?: '' | 'LEFT' | 'RIGHT' | 'INNER' | 'OUTER';
  join: string;
}

export enum ORDER_DIRECTION {
  ASC = 'ASC',
  DESC = 'DESC',
}

export interface SelectOrder {
  direction: ORDER_DIRECTION;
  columns: string[];
}
