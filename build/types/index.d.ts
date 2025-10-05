import { FieldPacket, PoolConnection, Pool, QueryResult } from 'mysql2/promise';
import { QueryResult as QueryResult$1, FieldPacket as FieldPacket$1, ResultSetHeader } from 'mysql2';

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
    export(conn: IConnection): string;
}

declare class QryInsertBuilder implements IQryBuilder {
    private _table;
    private _set;
    constructor(items?: Record<string, string | number>);
    into: (table: string) => this;
    set: (items: Record<string, string | number>) => this;
    export(conn: IConnection): string;
}

declare class QryDeleteBuilder implements IQryBuilder {
    private _table;
    private _where;
    private _itemValues;
    constructor();
    from: (table: string) => this;
    where: (...where: string[]) => this;
    setItemValues: (...items: (string | number)[]) => this;
    export(conn: IConnection): string;
}

declare class QryUpdateBuilder implements IQryBuilder {
    private _table;
    private _where;
    private _items;
    private _itemValues;
    constructor(table: string);
    set: (...items: string[]) => this;
    where: (...where: string[]) => this;
    setItemValues: (...items: (string | number)[]) => this;
    export(conn: IConnection): string;
}

declare class QryBuilder {
    static select(...items: string[]): QrySelectBuilder;
    static insert(items?: Record<string, string | number>): QryInsertBuilder;
    static delete(): QryDeleteBuilder;
    static update(table: string): QryUpdateBuilder;
}

declare class QryTableCreateBuilder implements IQryBuilder {
    private _table;
    private _columns;
    constructor(table: string);
    columns(columnsData: Partial<TableColumnData>[]): this;
    export(_conn: IConnection): string;
}

declare class QryTableExistsBuilder implements IQryBuilder {
    private _table;
    constructor(table: string);
    export(conn: IConnection): string;
}

declare class QryTableBuilder {
    static create(table: string): QryTableCreateBuilder;
    static exists(table: string): QryTableExistsBuilder;
}

interface IConnection {
    get qryBuilder(): typeof QryBuilder;
    get qryTableBuilder(): typeof QryTableBuilder;
    query(qry: string, items?: any[]): Promise<IQryResult>;
    select(qry: string | SelectProps): Promise<IQrySelectResult>;
    insert(qry: string | InsertProps): Promise<IQryInsertResult>;
    update(qry: string | UpdateProps): Promise<IQryUpdateResult>;
    delete(qry: string | DeleteProps): Promise<IQryDeleteResult>;
    escape(value: unknown): string;
    generateParameterizedQuery(queryString: string, values?: (string | number)[]): string;
}
interface IDatabaseConnection extends IConnection {
    get connection(): PoolConnection;
    commitTransaction(): Promise<void>;
    rollbackTransaction(): Promise<void>;
    release(): void;
}
interface IDatabase extends IConnection {
    get pool(): Pool;
    getConnection(): Promise<IDatabaseConnection>;
    beginTransaction(): Promise<IDatabaseConnection>;
    close(): void;
}
interface IQryBuilder {
    export(conn: IConnection): string;
}
interface IBaseQryResult {
    get raw(): [QueryResult, FieldPacket[]];
}
interface IQrySelectResult extends IBaseQryResult {
    get rows(): ResultRow[];
    get fields(): ResultField[];
}
interface IQryUpdateResult extends IBaseQryResult {
    get affectedRows(): number;
}
interface IQryDeleteResult extends IBaseQryResult {
    get affectedRows(): number;
}
interface IQryInsertResult extends IBaseQryResult {
    get insertId(): number;
}
type IQryResult = IBaseQryResult & IQrySelectResult & IQryUpdateResult & IQryDeleteResult & IQryInsertResult;

declare class QryResult implements IQryResult {
    private _result;
    constructor(result: [QueryResult$1, FieldPacket$1[]]);
    get affectedRows(): number;
    get insertId(): number;
    get rows(): ResultRow[];
    get headers(): ResultSetHeader;
    get fields(): ResultField[];
    get raw(): [QueryResult$1, FieldPacket$1[]];
}

declare class QrySelectResult implements IQrySelectResult {
    private _result;
    constructor(result: [QueryResult$1, FieldPacket$1[]]);
    get rows(): ResultRow[];
    get fields(): ResultField[];
    get raw(): [QueryResult$1, FieldPacket$1[]];
}

declare class DatabaseConnection implements IDatabaseConnection {
    private _connection;
    constructor(connection: PoolConnection);
    get connection(): PoolConnection;
    [Symbol.dispose](): void;
    get qryBuilder(): typeof QryBuilder;
    get qryTableBuilder(): typeof QryTableBuilder;
    beginTransaction(): Promise<void>;
    commitTransaction(): Promise<void>;
    rollbackTransaction(): Promise<void>;
    query(qry: string, items?: any[]): Promise<IQryResult>;
    select(qry: string | SelectProps): Promise<IQrySelectResult>;
    insert(qry: string | InsertProps): Promise<IQryInsertResult>;
    update(qry: string | UpdateProps): Promise<IQryUpdateResult>;
    delete(qry: string | DeleteProps): Promise<IQryDeleteResult>;
    escape(value: unknown): string;
    generateParameterizedQuery(queryString: string, values?: (string | number)[]): string;
    release(): void;
}

declare class Database implements IDatabase {
    private _pool;
    constructor(mysqlPool: Pool);
    [Symbol.dispose](): void;
    get pool(): Pool;
    get qryBuilder(): typeof QryBuilder;
    get qryTableBuilder(): typeof QryTableBuilder;
    getConnection(): Promise<DatabaseConnection>;
    beginTransaction(): Promise<DatabaseConnection>;
    query(qry: string, items?: QryItems): Promise<IQryResult>;
    select(qry: string | SelectProps): Promise<IQrySelectResult>;
    insert(qry: string | InsertProps): Promise<IQryInsertResult>;
    update(qry: string | UpdateProps): Promise<IQryUpdateResult>;
    delete(qry: string | DeleteProps): Promise<IQryDeleteResult>;
    escape(value: unknown): string;
    generateParameterizedQuery(queryString: string, values?: (string | number)[]): string;
    close(): void;
}

export { Database, DeleteProps, IBaseQryResult, IConnection, IDatabase, IDatabaseConnection, IQryBuilder, IQryDeleteResult, IQryInsertResult, IQryResult, IQrySelectResult, IQryUpdateResult, InsertProps, Join, ORDER_DIRECTION, QryBuilder, QryDeleteBuilder, QryInsertBuilder, QryItems, QryResult, QrySelectBuilder, QrySelectResult, QryTableBuilder, QryTableCreateBuilder, QryUpdateBuilder, ResultField, ResultRow, SelectOrder, SelectProps, SelectReturn, TABLE_JOIN_TYPE, TableColumnData, UpdateProps };
