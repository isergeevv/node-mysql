import {
  RowDataPacket,
  OkPacket,
  ResultSetHeader,
  FieldPacket,
  PoolConnection,
} from "mysql2/promise";

export type QryReturn = [
  RowDataPacket[] | RowDataPacket[][] | OkPacket | OkPacket[] | ResultSetHeader,
  FieldPacket[]
];

export type ResultRow = {
  [column: string]: any;
  [column: number]: any;
};
export type ResultField = FieldPacket;

export type QryProps = {
  qry: string;
  items?:
    | any
    | any[]
    | {
        [key: string]: any;
      };
  conn?: PoolConnection | null;
};

export type Qry = (props: QryProps) => Promise<QryReturn>;

export type SelectProps = {
  select?: string;
  from: string;
  join?: string;
  where?: string | string[];
  extra?: string;
  items?: any[];
  conn?: PoolConnection | null;
};

export type SelectReturn = {
  rows: ResultRow[];
  fields: ResultField[];
};

export type Select = (props: SelectProps) => Promise<SelectReturn>;

export type InsertProps = {
  into: string;
  items: {
    [key: string]: any;
  };
  conn?: PoolConnection | null;
};

export type Insert = (props: InsertProps) => Promise<number | null>;

export type UpdateProps = {
  update: string;
  set: string | string[];
  where?: string | string[] | null;
  items?: any[];
  conn?: PoolConnection | null;
};

export type Update = (props: UpdateProps) => Promise<number>;

export type DeleteProps = {
  from: string;
  where: string | string[];
  items: any[];
  conn?: PoolConnection | null;
};

export type Delete = (props: DeleteProps) => Promise<number>;

