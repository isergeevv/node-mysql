import { FieldPacket, PoolConnection, Pool } from 'mysql2/promise';
import { QueryResult, FieldPacket as FieldPacket$1, ResultSetHeader } from 'mysql2';

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
interface InsertProps {
    into: string;
    items: Record<string, any>;
    conn?: PoolConnection;
}
interface UpdateProps {
    table: string;
    set: string | string[];
    where?: string | string[];
    items?: (string | number)[];
    conn?: PoolConnection;
}
interface DeleteProps {
    table: string;
    where: string | string[];
    items: any[];
    conn?: PoolConnection;
}
declare enum TABLE_JOIN_TYPE {
    NONE = "",
    LEFT = "LEFT",
    RIGHT = "RIGHT",
    INNER = "INNER",
    OUTER = "OUTER"
}
interface Join {
    type?: TABLE_JOIN_TYPE;
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
interface TableColumnData {
    name: string;
    type: string;
    isAutoIncrement: boolean;
    isPrimary: boolean;
    isUnique: boolean;
    isNull: boolean;
    default: string;
}

interface IQryBuilder {
    export(): string;
}

declare class QryDeleteBuilder implements IQryBuilder {
    private _table;
    private _where;
    private _itemValues;
    constructor();
    export(): string;
    from: (table: string) => this;
    where: (...where: string[]) => this;
    setItemValues: (...items: (string | number)[]) => this;
}

declare class QryInsertBuilder implements IQryBuilder {
    private _table;
    private _set;
    constructor(items?: Record<string, string | number>);
    export(): string;
    into: (table: string) => this;
    set: (items: Record<string, string | number>) => this;
}

declare class QrySelectBuilder implements IQryBuilder {
    private _items;
    private _forUpdate;
    private _table;
    private _joins;
    private _where;
    private _startItem;
    private _limit;
    private _order;
    private _extra;
    private _itemValues;
    constructor(...items: string[]);
    forUpdate: () => this;
    from: (table: string) => this;
    join: (...joins: Join[]) => this;
    where: (...where: string[]) => this;
    limit: (limit: number) => this;
    order: (...orders: SelectOrder[]) => this;
    startItem: (startItem: number) => this;
    extra: (extra: string) => this;
    setItemValues: (...items: (string | number)[]) => this;
    export(): string;
}

declare class QryTableCreateBuilder implements IQryBuilder {
    private _table;
    private _columns;
    constructor(table: string);
    export(): string;
    columns(columnsData: Partial<TableColumnData>[]): this;
}

declare class QryTableExistsBuilder implements IQryBuilder {
    private _table;
    constructor(table: string);
    export(): string;
}

declare class QryTableBuilder {
    static create(table: string): QryTableCreateBuilder;
    static exists(table: string): QryTableExistsBuilder;
}

declare class QryUpdateBuilder implements IQryBuilder {
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

declare class QryResult {
    private _result;
    constructor(result: [QueryResult, FieldPacket$1[]]);
    get affectedRows(): number;
    get insertId(): number;
    get rows(): ResultRow[];
    get headers(): ResultSetHeader;
    get fields(): FieldPacket$1[];
    get raw(): [QueryResult, FieldPacket$1[]];
}

declare class DatabaseConnection {
    private _connection;
    constructor(connection: PoolConnection);
    get connection(): PoolConnection;
    [Symbol.dispose](): void;
    beginTransaction(): Promise<void>;
    commitTransaction(): Promise<void>;
    rollbackTransaction(): Promise<void>;
    query(qry: string, items?: any[]): Promise<any>;
    select(qry: string | SelectProps): Promise<any[]>;
    insert(qry: string | InsertProps): Promise<number>;
    update(qry: string | UpdateProps): Promise<any>;
    delete(qry: string | DeleteProps): Promise<any>;
    release(): void;
}

declare class Database {
    private _pool;
    constructor(mysqlPool: Pool);
    [Symbol.dispose](): void;
    get pool(): Pool;
    getConnection(): Promise<DatabaseConnection>;
    beginTransaction(): Promise<DatabaseConnection>;
    query(qry: string, items?: QryItems): Promise<QryResult>;
    select(qry: string | SelectProps): Promise<any[]>;
    insert(qry: string | InsertProps): Promise<number>;
    update(qry: string | UpdateProps): Promise<any>;
    delete(qry: string | DeleteProps): Promise<any>;
    close(): void;
}

declare class QryBuilder {
    static select(...items: string[]): QrySelectBuilder;
    static insert(items?: Record<string, string | number>): QryInsertBuilder;
    static delete(): QryDeleteBuilder;
    static update(table: string): QryUpdateBuilder;
}

export { Database, DeleteProps, InsertProps, Join, ORDER_DIRECTION, QryBuilder, QryDeleteBuilder, QryInsertBuilder, QryItems, QrySelectBuilder, QryTableBuilder, QryTableCreateBuilder, QryUpdateBuilder, ResultField, ResultRow, SelectOrder, SelectProps, SelectReturn, TABLE_JOIN_TYPE, TableColumnData, UpdateProps };
