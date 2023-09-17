import * as mysql2_typings_mysql_lib_protocol_packets_FieldPacket from 'mysql2/typings/mysql/lib/protocol/packets/FieldPacket';
import * as mysql2_typings_mysql_lib_protocol_packets_RowDataPacket from 'mysql2/typings/mysql/lib/protocol/packets/RowDataPacket';
import * as mysql2_typings_mysql_lib_protocol_packets_OkPacket from 'mysql2/typings/mysql/lib/protocol/packets/OkPacket';
import { FieldPacket, PoolConnection, PoolOptions, Pool, ResultSetHeader } from 'mysql2/promise';

type ResultRow = Record<string, any>;
type ResultField = FieldPacket;
interface QryProps {
    qry: string;
    items?: any | any[] | {
        [key: string]: any;
    };
    conn?: PoolConnection | null;
}
interface SelectProps {
    select?: string;
    from: string;
    join?: Join[];
    where?: string | string[];
    extra?: string;
    items?: (string | number)[];
    conn?: PoolConnection | null;
}
interface SelectReturn {
    rows: ResultRow[];
    fields: FieldPacket[];
}
interface InsertProps {
    into: string;
    items: {
        [key: string]: any;
    };
    conn?: PoolConnection | null;
}
type Insert = (props: InsertProps) => Promise<number | null>;
interface UpdateProps {
    update: string;
    set: string | string[];
    where?: string | string[] | null;
    items?: any[];
    conn?: PoolConnection | null;
}
type Update = (props: UpdateProps) => Promise<number>;
interface DeleteProps {
    from: string;
    where: string | string[];
    items: any[];
    conn?: PoolConnection | null;
}
type Delete = (props: DeleteProps) => Promise<number>;
interface Join {
    type?: '' | 'LEFT' | 'RIGHT' | 'INNER' | 'OUTER';
    join: string;
}

declare class MySQL {
    private _pool;
    constructor(config: PoolOptions);
    [Symbol.dispose](): void;
    get pool(): Pool;
    getConnection: () => Promise<PoolConnection>;
    beginTransaction: () => Promise<PoolConnection>;
    commitTransaction: (connection: PoolConnection) => Promise<void>;
    rollbackTransaction: (connection: PoolConnection) => Promise<void>;
    qry: ({ qry, items, conn }: QryProps) => Promise<[mysql2_typings_mysql_lib_protocol_packets_OkPacket.OkPacket | ResultSetHeader | mysql2_typings_mysql_lib_protocol_packets_RowDataPacket.RowDataPacket[] | ResultSetHeader[] | mysql2_typings_mysql_lib_protocol_packets_RowDataPacket.RowDataPacket[][] | mysql2_typings_mysql_lib_protocol_packets_OkPacket.OkPacket[] | [mysql2_typings_mysql_lib_protocol_packets_RowDataPacket.RowDataPacket[], ResultSetHeader], mysql2_typings_mysql_lib_protocol_packets_FieldPacket.FieldPacket[]]>;
    select: ({ select, from, join, where, extra, items, conn }: SelectProps) => Promise<{
        rows: ResultRow[];
        fields: mysql2_typings_mysql_lib_protocol_packets_FieldPacket.FieldPacket[];
    }>;
    insert: Insert;
    update: Update;
    delete: Delete;
    checkString: (value: string | number) => string | number;
}

declare class QryBuilder {
    private _statement;
    private _table;
    private _joins;
    private _where;
    private _startItem;
    private _limit;
    private _extra;
    private _items;
    constructor(start: string);
    static select: (...items: string[]) => QryBuilder;
    export(): string;
    from: (table: string) => this;
    join: (...joins: Join[]) => this;
    where: (...where: string[]) => this;
    limit: (limit: number) => this;
    startItem: (startItem: number) => this;
    extra: (extra: string) => this;
    setItems: (...items: (string | number)[]) => this;
}

export { Delete, DeleteProps, Insert, InsertProps, Join, MySQL, QryBuilder, QryProps, ResultField, ResultRow, SelectProps, SelectReturn, Update, UpdateProps };
