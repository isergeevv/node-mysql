import type { FieldPacket, PoolConnection } from 'mysql2/promise';

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

export interface InsertProps {
  into: string;
  items: Record<string, any>;
  conn?: PoolConnection;
}

export interface UpdateProps {
  table: string;
  set: string | string[];
  where?: string | string[];
  items?: (string | number)[];
  conn?: PoolConnection;
}

export interface DeleteProps {
  table: string;
  where: string | string[];
  items: any[];
  conn?: PoolConnection;
}

export enum TABLE_JOIN_TYPE {
  NONE = '',
  LEFT = 'LEFT',
  RIGHT = 'RIGHT',
  INNER = 'INNER',
  OUTER = 'OUTER',
}

export interface Join {
  type?: TABLE_JOIN_TYPE;
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

export interface TableColumnData {
  name: string;
  type: string;
  isAutoIncrement: boolean;
  isPrimary: boolean;
  isUnique: boolean;
  isNull: boolean;
  default: string;
}
