import type { Pool } from 'mysql2/promise';
import type { DeleteProps, InsertProps, QryItems, SelectProps, UpdateProps } from './types';
import type { IDatabase, IQryResult, IQrySelectResult } from './interfaces';
import DatabaseConnection from './DatabaseConnection';
import QryBuilder from './QryBuilder';
import QryTableBuilder from './QryTableBuilder';

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

  get qryBuilder(): typeof QryBuilder {
    return QryBuilder;
  }

  get qryTableBuilder(): typeof QryTableBuilder {
    return QryTableBuilder;
  }

  async getConnection(): Promise<DatabaseConnection> {
    return new DatabaseConnection(await this._pool.getConnection());
  }

  async beginTransaction(): Promise<DatabaseConnection> {
    const connection: DatabaseConnection = await this.getConnection();
    await connection.beginTransaction();

    return connection;
  }

  async query(qry: string, items: QryItems = []): Promise<IQryResult> {
    const connection: DatabaseConnection = await this.getConnection();
    const result = await connection.query(qry, items);
    connection.release();

    return result;
  }

  async select(qry: string | SelectProps): Promise<IQrySelectResult> {
    const connection: DatabaseConnection = await this.getConnection();
    const result = await connection.select(qry);
    connection.release();

    return result;
  }

  async insert(qry: string | InsertProps) {
    const connection: DatabaseConnection = await this.getConnection();
    const result = await connection.insert(qry);
    connection.release();

    return result;
  }

  async update(qry: string | UpdateProps) {
    const connection: DatabaseConnection = await this.getConnection();
    const result = await connection.update(qry);
    connection.release();

    return result;
  }

  async delete(qry: string | DeleteProps) {
    const connection: DatabaseConnection = await this.getConnection();
    const result = await connection.delete(qry);
    connection.release();

    return result;
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
