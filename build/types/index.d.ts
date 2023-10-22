import * as mysql2_typings_mysql_lib_protocol_packets_FieldPacket from 'mysql2/typings/mysql/lib/protocol/packets/FieldPacket';
import * as mysql2_typings_mysql_lib_protocol_packets_RowDataPacket from 'mysql2/typings/mysql/lib/protocol/packets/RowDataPacket';
import * as mysql2_typings_mysql_lib_protocol_packets_OkPacket from 'mysql2/typings/mysql/lib/protocol/packets/OkPacket';
import { FieldPacket, PoolConnection, PoolOptions, Pool, ResultSetHeader } from 'mysql2/promise';

type ResultRow = Record<string, any>;
type ResultField = FieldPacket;
type QryItems = any | any[] | Record<string, any>;
interface SelectProps {
    select?: string | string[];
    from: string;
    join?: Join[];
    where?: string | string[];
    extra?: string;
    items?: (string | number)[];
}
interface SelectReturn {
    rows: ResultRow[];
    fields: FieldPacket[];
}
type Select = (qry: string | SelectProps, conn?: PoolConnection) => Promise<SelectReturn>;
interface InsertProps {
    into: string;
    items: Record<string, any>;
    conn?: PoolConnection;
}
type Insert = (qry: string | InsertProps, conn?: PoolConnection) => Promise<number>;
interface UpdateProps {
    table: string;
    set: string | string[];
    where?: string | string[];
    items?: (string | number)[];
    conn?: PoolConnection;
}
type Update = (qry: string | UpdateProps, conn?: PoolConnection) => Promise<number>;
interface DeleteProps {
    table: string;
    where: string | string[];
    items: any[];
    conn?: PoolConnection;
}
type Delete = (qry: string | DeleteProps, conn?: PoolConnection) => Promise<number>;
interface Join {
    type?: '' | 'LEFT' | 'RIGHT' | 'INNER' | 'OUTER';
    join: string;
}
declare enum ORDER_DIRECTION {
    ASC = "ASC",
    DESC = "DESC"
}
interface SelectOrder {
    direction: ORDER_DIRECTION;
    columns: string[];
}

declare class MySQL {
    private _pool;
    private _lastInsertId;
    constructor(config: PoolOptions);
    [Symbol.dispose](): void;
    get pool(): Pool;
    get lastInsertId(): number;
    getConnection: () => Promise<PoolConnection>;
    beginTransaction: () => Promise<PoolConnection>;
    commitTransaction: (connection: PoolConnection) => Promise<void>;
    rollbackTransaction: (connection: PoolConnection) => Promise<void>;
    qry: (qry: string, items?: QryItems, conn?: PoolConnection) => Promise<[mysql2_typings_mysql_lib_protocol_packets_OkPacket.OkPacket | ResultSetHeader | mysql2_typings_mysql_lib_protocol_packets_RowDataPacket.RowDataPacket[] | ResultSetHeader[] | mysql2_typings_mysql_lib_protocol_packets_RowDataPacket.RowDataPacket[][] | mysql2_typings_mysql_lib_protocol_packets_OkPacket.OkPacket[] | [mysql2_typings_mysql_lib_protocol_packets_RowDataPacket.RowDataPacket[], ResultSetHeader], mysql2_typings_mysql_lib_protocol_packets_FieldPacket.FieldPacket[]]>;
    select: Select;
    insert: Insert;
    update: Update;
    delete: Delete;
    checkString: (value: string | number) => string | number;
    close: () => void;
}

interface QryBuilderInterface {
    export(): string;
}

declare class QrySelectBuilder implements QryBuilderInterface {
    private _table;
    private _joins;
    private _where;
    private _startItem;
    private _limit;
    private _order;
    private _extra;
    private _items;
    private _itemValues;
    constructor(...items: string[]);
    export(): string;
    from: (table: string) => this;
    join: (...joins: Join[]) => this;
    where: (...where: string[]) => this;
    limit: (limit: number) => this;
    order: (...orders: SelectOrder[]) => this;
    startItem: (startItem: number) => this;
    extra: (extra: string) => this;
    setItemValues: (...items: (string | number)[]) => this;
}

declare class QryInsertBuilder implements QryBuilderInterface {
    private _table;
    private _set;
    constructor(items?: Record<string, string | number>);
    export(): string;
    into: (table: string) => this;
    set: (items: Record<string, string | number>) => this;
}

declare class QryDeleteBuilder implements QryBuilderInterface {
    private _table;
    private _where;
    private _itemValues;
    constructor();
    export(): string;
    from: (table: string) => this;
    where: (...where: string[]) => this;
    setItemValues: (...items: (string | number)[]) => this;
}

declare class QryUpdateBuilder implements QryBuilderInterface {
    private _table;
    private _where;
    private _items;
    private _itemValues;
    constructor(table: string);
    export(): string;
    set: (...items: string[]) => this;
    where: (...where: string[]) => this;
    setItemValues: (...items: (string | number)[]) => this;
}

declare class QryBuilder {
    static select: (...items: string[]) => QrySelectBuilder;
    static insert: (items?: Record<string, string | number>) => QryInsertBuilder;
    static delete: () => QryDeleteBuilder;
    static update: (table: string) => QryUpdateBuilder;
}

export { Delete, DeleteProps, Insert, InsertProps, Join, MySQL, ORDER_DIRECTION, QryBuilder, QryItems, ResultField, ResultRow, Select, SelectOrder, SelectProps, SelectReturn, Update, UpdateProps };
