import { FieldPacket, PoolConnection, PoolOptions, Pool } from 'mysql2/promise';
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
    items?: (string | number | bigint | boolean)[];
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

declare class QryTableCreateBuilder implements IQryBuilder {
    private _table;
    private _columns;
    constructor(table: string);
    export(): string;
    columns(columnsData: Partial<TableColumnData>[]): this;
}

declare class QryTableBuilder {
    static exists(table: string): string;
    static create(table: string): QryTableCreateBuilder;
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
    setItemValues: (...items: (string | number | bigint | boolean)[]) => this;
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

declare class MySQL {
    private _pool;
    private _lastInsertId;
    constructor(config: PoolOptions);
    [Symbol.dispose](): void;
    get pool(): Pool;
    get lastInsertId(): number;
    getConnection(): Promise<PoolConnection>;
    beginTransaction(): Promise<PoolConnection>;
    commitTransaction(connection: PoolConnection): Promise<void>;
    rollbackTransaction(connection: PoolConnection): Promise<void>;
    qry(qry: string, items?: QryItems, conn?: PoolConnection): Promise<QryResult>;
    select(qry: string | SelectProps, conn?: PoolConnection): Promise<QryResult>;
    insert(qry: string | InsertProps, conn?: PoolConnection): Promise<number>;
    update(qry: string | UpdateProps, conn?: PoolConnection): Promise<number>;
    delete(qry: string | DeleteProps, conn?: PoolConnection | undefined): Promise<number>;
    checkString(value: string | number): string | number;
    close(): void;
}

declare class QryBuilder {
    static select(...items: string[]): QrySelectBuilder;
    static insert(items?: Record<string, string | number>): QryInsertBuilder;
    static delete(): QryDeleteBuilder;
    static update(table: string): QryUpdateBuilder;
}

export { DeleteProps, InsertProps, Join, MySQL, ORDER_DIRECTION, QryBuilder, QryDeleteBuilder, QryInsertBuilder, QryItems, QrySelectBuilder, QryTableBuilder, QryTableCreateBuilder, QryUpdateBuilder, ResultField, ResultRow, SelectOrder, SelectProps, SelectReturn, TABLE_JOIN_TYPE, TableColumnData, UpdateProps };
