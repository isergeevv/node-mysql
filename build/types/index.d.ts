import { FieldPacket, PoolConnection, Pool, QueryResult, ResultSetHeader } from 'mysql2/promise';
import { QueryResult as QueryResult$1, FieldPacket as FieldPacket$1 } from 'mysql2';

type ResultRow = Record<string, any>;
type ResultField = FieldPacket;
type QryItems = any | any[] | Record<string, any>;
interface SelectReturn {
    rows: ResultRow[];
    fields: FieldPacket[];
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
interface SelectProps {
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
interface InsertProps {
    table: string;
    items: Record<string, any>;
}
interface UpdateProps {
    table: string;
    items: string[];
    where: string;
    params: (string | number | bigint)[];
}
interface DeleteProps {
    table: string;
    where: string;
    params: (string | number | bigint)[];
}
interface CreateTableProps {
    table: string;
    columns: Partial<TableColumnData>[];
    ifNotExists: boolean;
}
interface TableExistsProps {
    table: string;
}

interface IConnection {
    query(qry: string, items?: any[]): Promise<IResult>;
    select(qryProps?: Partial<SelectProps>): ISelectQuery;
    insert(qryProps?: Partial<InsertProps>): IInsertQuery;
    update(qryProps?: Partial<UpdateProps>): IUpdateQuery;
    delete(qryProps?: Partial<DeleteProps>): IDeleteQuery;
    createTable(qryProps?: Partial<CreateTableProps>): ICreateTableQuery;
    tableExists(qryProps?: Partial<TableExistsProps>): ITableExistsQuery;
    escape(value: unknown): string;
    generateParameterizedQuery(queryString: string, values?: (string | number | bigint)[]): string;
}
interface IDatabaseConnection extends IConnection {
    get connection(): PoolConnection;
    beginTransaction(): Promise<void>;
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
interface IBaseResult {
    get raw(): [QueryResult, FieldPacket[]];
}
interface ISelectResult extends IBaseResult {
    get rows(): ResultRow[];
    get fields(): ResultField[];
}
interface IUpdateResult extends IBaseResult {
    get affectedRows(): number;
}
interface IDeleteResult extends IBaseResult {
    get affectedRows(): number;
}
interface IInsertResult extends IBaseResult {
    get insertId(): number;
}
interface ICreateTableResult extends IBaseResult {
}
interface ITableExistsResult extends IBaseResult {
}
type IResult = IBaseResult & ISelectResult & IUpdateResult & IDeleteResult & IInsertResult & ICreateTableResult & ITableExistsResult;
interface IQuery<T extends IBaseResult = IBaseResult> {
    export(): string;
    execute(): Promise<T>;
    then(resolve: (value: T) => void, reject?: (reason: Error) => void): Promise<T>;
}
interface ISelectQuery extends IQuery<ISelectResult> {
    items(...items: string[]): ISelectQuery;
    forUpdate(forUpdate?: boolean): ISelectQuery;
    from(table: string): ISelectQuery;
    join(...joins: Join[]): ISelectQuery;
    where(...conditions: string[]): ISelectQuery;
    limit(limit: number, startItem?: number): ISelectQuery;
    order(order: SelectOrder): ISelectQuery;
    extra(extra: string): ISelectQuery;
    setParams(...items: (string | number | bigint)[]): ISelectQuery;
    import(props: Partial<SelectProps>): ISelectQuery;
}
interface IInsertQuery extends IQuery<IInsertResult> {
    into(table: string): IInsertQuery;
    items(items: Record<string, any>): IInsertQuery;
    import(props: Partial<InsertProps>): IInsertQuery;
}
interface IUpdateQuery extends IQuery<IUpdateResult> {
    table(table: string): IUpdateQuery;
    set(set: string | string[]): IUpdateQuery;
    where(...conditions: string[]): IUpdateQuery;
    setParams(...items: (string | number | bigint)[]): IUpdateQuery;
    import(props: Partial<UpdateProps>): IUpdateQuery;
}
interface IDeleteQuery extends IQuery<IDeleteResult> {
    from(table: string): IDeleteQuery;
    where(...conditions: string[]): IDeleteQuery;
    setParams(...items: (string | number | bigint)[]): IDeleteQuery;
    import(props: Partial<DeleteProps>): IDeleteQuery;
}
interface ICreateTableQuery extends IQuery<ICreateTableResult> {
    table(table: string): ICreateTableQuery;
    columns(...columns: Partial<TableColumnData>[]): ICreateTableQuery;
    ifNotExists(ifNotExists?: boolean): ICreateTableQuery;
    import(props: Partial<CreateTableProps>): ICreateTableQuery;
}
interface ITableExistsQuery extends IQuery<ITableExistsResult> {
    table(table: string): ITableExistsQuery;
    import(props: Partial<TableExistsProps>): ITableExistsQuery;
}

declare class Result implements IResult {
    private _result;
    constructor(result: [QueryResult, FieldPacket[]]);
    get affectedRows(): number;
    get insertId(): number;
    get rows(): ResultRow[];
    get headers(): ResultSetHeader;
    get fields(): ResultField[];
    get raw(): [QueryResult, FieldPacket[]];
}

declare class SelectResult implements ISelectResult {
    private _result;
    constructor(result: [QueryResult$1, FieldPacket$1[]]);
    get rows(): ResultRow[];
    get fields(): ResultField[];
    get raw(): [QueryResult$1, FieldPacket$1[]];
}

declare class InsertResult implements IInsertResult {
    private _result;
    constructor(result: [QueryResult, FieldPacket[]]);
    get insertId(): number;
    get raw(): [QueryResult, FieldPacket[]];
}

declare class UpdateResult implements IUpdateResult {
    private _result;
    constructor(result: [QueryResult, FieldPacket[]]);
    get affectedRows(): number;
    get raw(): [QueryResult, FieldPacket[]];
}

declare class DeleteResult implements IDeleteResult {
    private _result;
    constructor(result: [QueryResult, FieldPacket[]]);
    get affectedRows(): number;
    get raw(): [QueryResult, FieldPacket[]];
}

declare class DeleteQuery implements IDeleteQuery {
    private _connection;
    private _props;
    constructor(connection: IConnection);
    from(table: string): IDeleteQuery;
    where(where: string): IDeleteQuery;
    setParams(...params: (string | number | bigint)[]): IDeleteQuery;
    import(qryProps: Partial<DeleteProps>): IDeleteQuery;
    export(): string;
    execute(): Promise<IDeleteResult>;
    then(onfulfilled: (value: any) => any, onrejected?: (reason: any) => any): Promise<any>;
}

declare class InsertQuery implements IInsertQuery {
    private _connection;
    private _props;
    constructor(connection: IConnection);
    into(table: string): IInsertQuery;
    items(items: Record<string, string | number>): IInsertQuery;
    import(qryProps: Partial<InsertProps>): IInsertQuery;
    export(): string;
    execute(): Promise<IInsertResult>;
    then(onfulfilled: (value: any) => any, onrejected?: (reason: any) => any): Promise<any>;
}

declare class SelectQuery implements ISelectQuery {
    private _connection;
    private _props;
    constructor(connection: IConnection);
    items(...items: string[]): ISelectQuery;
    forUpdate(): ISelectQuery;
    from(table: string): ISelectQuery;
    join(...joins: Join[]): ISelectQuery;
    where(where: string): ISelectQuery;
    limit(limit: number): ISelectQuery;
    order(...orders: SelectOrder[]): ISelectQuery;
    startItem(startItem: number): ISelectQuery;
    extra(extra: string): ISelectQuery;
    setParams(...items: (string | number | bigint)[]): ISelectQuery;
    import(qryProps: Partial<SelectProps>): ISelectQuery;
    export(): string;
    execute(): Promise<ISelectResult>;
    then(onfulfilled: (value: any) => any, onrejected?: (reason: any) => any): Promise<any>;
}

declare class UpdateQuery implements IUpdateQuery {
    private _connection;
    private _props;
    constructor(connection: IConnection);
    table(table: string): IUpdateQuery;
    set(...items: string[]): IUpdateQuery;
    where(where: string): IUpdateQuery;
    setParams(...params: (string | number | bigint)[]): IUpdateQuery;
    import(qryProps: Partial<UpdateProps>): IUpdateQuery;
    export(): string;
    execute(): Promise<IUpdateResult>;
    then(onfulfilled: (value: any) => any, onrejected?: (reason: any) => any): Promise<any>;
}

declare class TableExistsQuery implements ITableExistsQuery {
    private _connection;
    private _props;
    constructor(connection: IConnection);
    table(table: string): ITableExistsQuery;
    import(props: Partial<TableExistsProps>): ITableExistsQuery;
    export(): string;
    execute(): Promise<ITableExistsResult>;
    then(onfulfilled: (value: any) => any, onrejected?: (reason: any) => any): Promise<any>;
}

declare class CreateTableQuery implements ICreateTableQuery {
    private _connection;
    private _props;
    constructor(connection: IConnection);
    table(table: string): ICreateTableQuery;
    columns(...columns: Partial<TableColumnData>[]): ICreateTableQuery;
    ifNotExists(ifNotExists?: boolean): ICreateTableQuery;
    import(qryProps: Partial<CreateTableProps>): ICreateTableQuery;
    export(): string;
    execute(): Promise<ICreateTableResult>;
    then(onfulfilled: (value: any) => any, onrejected?: (reason: any) => any): Promise<any>;
}

declare const AND: (a: string, b: string) => string;
declare const OR: (a: string, b: string) => string;

declare class Database implements IDatabase {
    private _pool;
    constructor(mysqlPool: Pool);
    [Symbol.dispose](): void;
    get pool(): Pool;
    getConnection(): Promise<IDatabaseConnection>;
    beginTransaction(): Promise<IDatabaseConnection>;
    query(qry: string, items?: QryItems): Promise<IResult>;
    select(qryProps?: Partial<SelectProps>): ISelectQuery;
    insert(qryProps?: Partial<InsertProps>): IInsertQuery;
    update(qryProps?: Partial<UpdateProps>): IUpdateQuery;
    delete(qryProps?: Partial<DeleteProps>): IDeleteQuery;
    createTable(qryProps?: Partial<CreateTableProps>): ICreateTableQuery;
    tableExists(qryProps?: Partial<TableExistsProps>): ITableExistsQuery;
    escape(value: unknown): string;
    generateParameterizedQuery(queryString: string, values?: (string | number)[]): string;
    close(): void;
}

declare class DatabaseConnection implements IDatabaseConnection {
    private _connection;
    constructor(connection: PoolConnection);
    get connection(): PoolConnection;
    [Symbol.dispose](): void;
    beginTransaction(): Promise<void>;
    commitTransaction(): Promise<void>;
    rollbackTransaction(): Promise<void>;
    query(qry: string, items?: any[]): Promise<IResult>;
    select(qryProps?: Partial<SelectProps>): ISelectQuery;
    insert(qryProps?: Partial<InsertProps>): IInsertQuery;
    update(qryProps?: Partial<UpdateProps>): IUpdateQuery;
    delete(qryProps?: Partial<DeleteProps>): IDeleteQuery;
    createTable(qryProps?: Partial<CreateTableProps>): ICreateTableQuery;
    tableExists(qryProps?: Partial<TableExistsProps>): ITableExistsQuery;
    escape(value: unknown): string;
    generateParameterizedQuery(queryString: string, values?: (string | number | bigint)[]): string;
    release(): void;
}

export { AND, CreateTableProps, CreateTableQuery, Database, DatabaseConnection, DeleteProps, DeleteQuery, DeleteResult, IBaseResult, IConnection, ICreateTableQuery, ICreateTableResult, IDatabase, IDatabaseConnection, IDeleteQuery, IDeleteResult, IInsertQuery, IInsertResult, IQuery, IResult, ISelectQuery, ISelectResult, ITableExistsQuery, ITableExistsResult, IUpdateQuery, IUpdateResult, InsertProps, InsertQuery, InsertResult, Join, OR, ORDER_DIRECTION, QryItems, Result, ResultField, ResultRow, SelectOrder, SelectProps, SelectQuery, SelectResult, SelectReturn, TABLE_JOIN_TYPE, TableColumnData, TableExistsProps, TableExistsQuery, UpdateProps, UpdateQuery, UpdateResult };
