import { FieldPacket, PoolConnection } from 'mysql2/promise';

export type ResultRow = Record<string, any>;
export type ResultField = FieldPacket;

export interface QryProps {
  qry: string;
  items?:
    | any
    | any[]
    | {
        [key: string]: any;
      };
  conn?: PoolConnection;
}

export interface SelectProps {
  qry?: string;
  select?: string;
  from: string;
  join?: Join[];
  where?: string | string[];
  extra?: string;
  items?: (string | number)[];
  conn?: PoolConnection;
}

export interface SelectReturn {
  rows: ResultRow[];
  fields: FieldPacket[];
}

export type Select = (props: SelectProps) => Promise<SelectReturn>;

export interface InsertProps {
  qry?: string;
  into: string;
  items: {
    [key: string]: any;
  };
  conn?: PoolConnection;
}

export type Insert = (props: InsertProps) => Promise<number>;

export interface UpdateProps {
  qry?: string;
  table: string;
  set: string | string[];
  where?: string | string[];
  items?: (string | number)[];
  conn?: PoolConnection;
}

export type Update = (props: UpdateProps) => Promise<number>;

export interface DeleteProps {
  qry?: string;
  table: string;
  where: string | string[];
  items: any[];
  conn?: PoolConnection;
}

export type Delete = (props: DeleteProps) => Promise<number>;

export interface Join {
  type?: '' | 'LEFT' | 'RIGHT' | 'INNER' | 'OUTER';
  join: string;
}
