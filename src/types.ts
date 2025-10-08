import type { FieldPacket } from 'mysql2/promise';

export type ResultRow = Record<string, any>;
export type ResultField = FieldPacket;

export type QryItems = any | any[] | Record<string, any>;

export interface SelectReturn {
  rows: ResultRow[];
  fields: FieldPacket[];
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

export interface SelectProps {
  forUpdate: boolean;
  table: string;
  joins: Join[];
  where: string;
  limit: number;
  order: SelectOrder[];
  startItem: number;
  extra: string;
  items: string[];
  params: (string | number | bigint)[];
}

export interface InsertProps {
  table: string;
  items: Record<string, any>;
}

export interface UpdateProps {
  table: string;
  items: string[];
  where: string;
  params: (string | number | bigint)[];
}

export interface DeleteProps {
  table: string;
  where: string;
  params: (string | number | bigint)[];
}

export interface CreateTableProps {
  table: string;
  columns: Partial<TableColumnData>[];
  ifNotExists: boolean;
}

export interface TableExistsProps {
  table: string;
}
