import type { PoolConnection } from 'mysql2/promise';
import type { CreateTableProps, DeleteProps, InsertProps, SelectProps, TableExistsProps, UpdateProps } from './types';
import type {
  ICreateTableQuery,
  IDatabaseConnection,
  IDeleteQuery,
  IInsertQuery,
  IResult,
  ISelectQuery,
  ITableExistsQuery,
  IUpdateQuery,
} from './interfaces';
import Result from './results/Result';
import SelectQuery from './query/SelectQuery';
import InsertQuery from './query/InsertQuery';
import UpdateQuery from './query/UpdateQuery';
import DeleteQuery from './query/DeleteQuery';
import CreateTableQuery from './query/CreateTableQuery';
import TableExistsQuery from './query/TableExistsQuery';

export default class DatabaseConnection implements IDatabaseConnection {
  private _connection: PoolConnection;

  constructor(connection: PoolConnection) {
    this._connection = connection;
  }

  get connection(): PoolConnection {
    return this._connection;
  }

  [Symbol.dispose]() {
    this.release();
  }

  async beginTransaction(): Promise<void> {
    await this._connection.beginTransaction();
  }

  async commitTransaction(): Promise<void> {
    await this._connection.commit();
  }

  async rollbackTransaction(): Promise<void> {
    await this._connection.rollback();
  }

  async query(qry: string, items: any[] = []): Promise<IResult> {
    try {
      return new Result(await this._connection.query(qry, items));
    } catch (e: any) {
      throw new Error(`Error: ${e.message}.\nQuery: ${qry}\nItems: ${items.join(', ')}`);
    }
  }

  select(qryProps?: Partial<SelectProps>): ISelectQuery {
    const selectQuery = new SelectQuery(this);

    if (qryProps) {
      selectQuery.import(qryProps);
    }

    return selectQuery;
  }

  insert(qryProps?: Partial<InsertProps>): IInsertQuery {
    const insertQuery = new InsertQuery(this);

    if (qryProps) {
      insertQuery.import(qryProps);
    }

    return insertQuery;
  }

  update(qryProps?: Partial<UpdateProps>): IUpdateQuery {
    const updateQuery = new UpdateQuery(this);

    if (qryProps) {
      updateQuery.import(qryProps);
    }

    return updateQuery;
  }

  delete(qryProps?: Partial<DeleteProps>): IDeleteQuery {
    const deleteQuery = new DeleteQuery(this);

    if (qryProps) {
      deleteQuery.import(qryProps);
    }

    return deleteQuery;
  }

  createTable(qryProps?: Partial<CreateTableProps>): ICreateTableQuery {
    const createTableQuery = new CreateTableQuery(this);

    if (qryProps) {
      createTableQuery.import(qryProps);
    }

    return createTableQuery;
  }

  tableExists(qryProps?: Partial<TableExistsProps>): ITableExistsQuery {
    const tableExistsQuery = new TableExistsQuery(this);

    if (qryProps) {
      tableExistsQuery.import(qryProps);
    }

    return tableExistsQuery;
  }

  escape(value: unknown): string {
    return this._connection.escape(value);
  }

  generateParameterizedQuery(queryString: string, values: (string | number | bigint)[] = []): string {
    const placeholders = queryString.match(/\?/g);

    if (!placeholders) return queryString;

    if (placeholders.length !== values.length) {
      throw new Error('[util->generateParameterizedQuery] Mismatch between placeholders and values.');
    }

    // Prepare the statement with placeholders
    const preparedQuery = queryString.replace(/\?/g, () => {
      // Ensure proper escaping and formatting based on data type
      return this.escape(values.shift());
    });

    return preparedQuery;
  }

  release() {
    this._connection.release();
  }
}
