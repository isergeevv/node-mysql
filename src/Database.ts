import type { Pool } from 'mysql2/promise';
import type { DeleteProps, InsertProps, QryItems, SelectProps, UpdateProps } from './types';
import QryResult from './results/QryResult';
import DatabaseConnection from './DatabaseConnection';

export default class Database {
  private _pool: Pool;

  constructor(mysqlPool: Pool) {
    this._pool = mysqlPool;
  }

  [Symbol.dispose]() {
    this.close();
  }

  get pool() {
    return this._pool;
  }

  async getConnection(): Promise<DatabaseConnection> {
    return new DatabaseConnection(await this._pool.getConnection());
  }

  async beginTransaction(): Promise<DatabaseConnection> {
    const connection: DatabaseConnection = await this.getConnection();
    await connection.beginTransaction();

    return connection;
  }

  async query(qry: string, items: QryItems = []): Promise<QryResult> {
    const connection: DatabaseConnection = await this.getConnection();
    const result = await connection.query(qry, items);
    connection.release();

    return new QryResult(result);
  }

  async select(qry: string | SelectProps): Promise<any[]> {
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

  close() {
    this._pool.end();
  }
}
