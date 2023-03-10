import { PoolConnection, RowDataPacket, OkPacket, ResultSetHeader, FieldPacket, PoolOptions } from 'mysql2/promise';

interface MysqlInterface {
    beginTransaction(): Promise<PoolConnection>;
    commitTransaction(connection: PoolConnection): void;
    rollbackTransaction(connection: PoolConnection): void;
    qry(props: QryProps): Promise<QryReturn>;
    select(props: SelectProps): Promise<SelectReturn>;
    insert(props: InsertProps): Promise<number | null>;
    update(props: UpdateProps): Promise<number>;
    delete(props: DeleteProps): Promise<number>;
    checkString(value: string | number): string | number;
}
type QryReturn = [
    RowDataPacket[] | RowDataPacket[][] | OkPacket | OkPacket[] | ResultSetHeader,
    FieldPacket[]
];
type ResultRow = {
    [column: string]: any;
    [column: number]: any;
};
type ResultField = FieldPacket;
type QryProps = {
    qry: string;
    items?: any | any[] | {
        [key: string]: any;
    };
    conn?: PoolConnection | null;
};
type Qry = (props: QryProps) => Promise<QryReturn>;
type SelectProps = {
    select?: string;
    from: string;
    join?: string;
    where?: string | string[];
    extra?: string;
    items?: any[];
    conn?: PoolConnection | null;
};
type SelectReturn = {
    rows: ResultRow[];
    fields: ResultField[];
};
type Select = (props: SelectProps) => Promise<SelectReturn>;
type InsertProps = {
    into: string;
    items: {
        [key: string]: any;
    };
    conn?: PoolConnection | null;
};
type Insert = (props: InsertProps) => Promise<number | null>;
type UpdateProps = {
    update: string;
    set: string | string[];
    where?: string | string[] | null;
    items?: any[];
    conn?: PoolConnection | null;
};
type Update = (props: UpdateProps) => Promise<number>;
type DeleteProps = {
    from: string;
    where: string | string[];
    items: any[];
    conn?: PoolConnection | null;
};
type Delete = (props: DeleteProps) => Promise<number>;

declare class Mysql implements MysqlInterface {
    private pool;
    constructor(config: PoolOptions);
    beginTransaction: () => Promise<PoolConnection>;
    commitTransaction: (connection: PoolConnection) => Promise<void>;
    rollbackTransaction: (connection: PoolConnection) => Promise<void>;
    qry: Qry;
    select: Select;
    insert: Insert;
    update: Update;
    delete: Delete;
    checkString: (value: string | number) => string | number;
}

export { Delete, DeleteProps, Insert, InsertProps, MysqlInterface, Qry, QryProps, QryReturn, ResultField, ResultRow, Select, SelectProps, SelectReturn, Update, UpdateProps, Mysql as default };
