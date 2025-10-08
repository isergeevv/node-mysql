import type { Pool } from 'mysql2/promise';
import type {
  CreateTableProps,
  DeleteProps,
  InsertProps,
  QryItems,
  SelectProps,
  TableExistsProps,
  UpdateProps,
} from './types';
import type {
  ICreateTableQuery,
  IDatabase,
  IDatabaseConnection,
  IDeleteQuery,
  IInsertQuery,
  IResult,
  ISelectQuery,
  ITableExistsQuery,
  IUpdateQuery,
} from './interfaces';
import DatabaseConnection from './DatabaseConnection';
import SelectQuery from './query/SelectQuery';
import InsertQuery from './query/InsertQuery';
import UpdateQuery from './query/UpdateQuery';
import DeleteQuery from './query/DeleteQuery';
import CreateTableQuery from './query/CreateTableQuery';
import { TableExistsQuery } from './query';

export default class Database implements IDatabase {
  private _pool: Pool;

  constructor(mysqlPool: Pool) {
    this._pool = mysqlPool;
  }

  [Symbol.dispose]() {
    this.close();
  }

  get pool(): Pool {
    return this._pool;
  }

  async getConnection(): Promise<IDatabaseConnection> {
    return new DatabaseConnection(await this._pool.getConnection());
  }

  async beginTransaction(): Promise<IDatabaseConnection> {
    const connection: IDatabaseConnection = await this.getConnection();
    await connection.beginTransaction();

    return connection;
  }

  async query(qry: string, items: QryItems = []): Promise<IResult> {
    const connection: IDatabaseConnection = await this.getConnection();
    const result = await connection.query(qry, items);
    connection.release();

    return result;
  }

  select(qryProps?: SelectProps): ISelectQuery {
    const selectQuery = new SelectQuery(this);

    if (qryProps) {
      selectQuery.import(qryProps);
    }

    return selectQuery;
  }

  insert(qryProps?: InsertProps): IInsertQuery {
    const insertQuery = new InsertQuery(this);

    if (qryProps) {
      insertQuery.import(qryProps);
    }

    return insertQuery;
  }

  update(qryProps?: UpdateProps): IUpdateQuery {
    const updateQuery = new UpdateQuery(this);

    if (qryProps) {
      updateQuery.import(qryProps);
    }

    return updateQuery;
  }

  delete(qryProps?: DeleteProps): IDeleteQuery {
    const deleteQuery = new DeleteQuery(this);

    if (qryProps) {
      deleteQuery.import(qryProps);
    }

    return deleteQuery;
  }

  createTable(qryProps?: CreateTableProps): ICreateTableQuery {
    const createTableQuery = new CreateTableQuery(this);

    if (qryProps) {
      createTableQuery.import(qryProps);
    }

    return createTableQuery;
  }

  tableExists(qryProps?: TableExistsProps): ITableExistsQuery {
    const tableExistsQuery = new TableExistsQuery(this);

    if (qryProps) {
      tableExistsQuery.import(qryProps);
    }

    return tableExistsQuery;
  }

  escape(value: unknown): string {
    return this._pool.escape(value);
  }

  generateParameterizedQuery(queryString: string, values: (string | number)[] = []): string {
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

  close() {
    this._pool.end();
  }
}
