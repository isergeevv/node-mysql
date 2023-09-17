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
  conn?: PoolConnection | null;
}

export interface SelectProps {
  select?: string;
  from: string;
  join?: Join[];
  where?: string | string[];
  extra?: string;
  items?: (string | number)[];
  conn?: PoolConnection | null;
}

export interface SelectReturn {
  rows: ResultRow[];
  fields: FieldPacket[];
}

export interface InsertProps {
  into: string;
  items: {
    [key: string]: any;
  };
  conn?: PoolConnection | null;
}

export type Insert = (props: InsertProps) => Promise<number | null>;

export interface UpdateProps {
  update: string;
  set: string | string[];
  where?: string | string[] | null;
  items?: any[];
  conn?: PoolConnection | null;
}

export type Update = (props: UpdateProps) => Promise<number>;

export interface DeleteProps {
  from: string;
  where: string | string[];
  items: any[];
  conn?: PoolConnection | null;
}

export type Delete = (props: DeleteProps) => Promise<number>;

export interface Join {
  type?: '' | 'LEFT' | 'RIGHT' | 'INNER' | 'OUTER';
  join: string;
}
