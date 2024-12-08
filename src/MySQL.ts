import { createPool, Pool, PoolConnection, PoolOptions, ResultSetHeader } from 'mysql2/promise';
import { DeleteProps, InsertProps, QryItems, ResultField, ResultRow, SelectProps, UpdateProps } from './types';
import QryBuilder from './QryBuilder';
import QryTableBuilder from './QryTableBuilder';
import QryResult from './QryResult';

export default class MySQL {
  private _pool: Pool;
  private _lastInsertId: number;

  constructor(config: PoolOptions) {
    this._pool = createPool(config);
    this._lastInsertId = 0;
  }

  [Symbol.dispose]() {
    this.close();
  }

  get pool() {
    return this._pool;
  }
  get lastInsertId() {
    return this._lastInsertId;
  }

  async getConnection() {
    return await this._pool.getConnection();
  }

  async beginTransaction() {
    const connection: PoolConnection = await this.getConnection();
    await connection.beginTransaction();
    return connection;
  }

  async commitTransaction(connection: PoolConnection) {
    if (!connection) return;
    connection.commit();
    connection.release();
  }

  async rollbackTransaction(connection: PoolConnection) {
    if (!connection) return;
    connection.rollback();
    connection.release();
  }

  async qry(qry: string, items: QryItems = [], conn?: PoolConnection) {
    try {
      const connection = conn || (await this.getConnection());
      const result = await connection.query(qry, items);

      if (!conn) connection.release();

      return new QryResult(result);
    } catch (e: any) {
      throw new Error(`Error: ${e.message}.\nQuery: ${qry}\nItems: ${items.join(', ')}`);
    }
  }

  async select(qry: string | SelectProps, conn?: PoolConnection) {
    const sql =
      typeof qry === 'string'
        ? qry
        : QryBuilder.select(...(qry.select ? (Array.isArray(qry.select) ? qry.select : [qry.select]) : ['*']))
            .from(qry.from)
            .join(...(qry.join ? (Array.isArray(qry.join) ? qry.join : [qry.join]) : []))
            .where(...(qry.where ? (Array.isArray(qry.where) ? qry.where : [qry.where]) : []))
            .extra(qry.extra || '')
            .setItemValues(...(qry.items || []))
            .export();

    return await this.qry(sql, conn);
  }

  async insert(qry: string | InsertProps, conn?: PoolConnection) {
    const sql = typeof qry === 'string' ? qry : QryBuilder.insert(qry.items).into(qry.into).export();

    const result = await this.qry(sql, conn);

    const insertId = result.insertId;

    if (insertId) this._lastInsertId = insertId;

    return insertId;
  }

  async update(qry: string | UpdateProps, conn?: PoolConnection) {
    const sql =
      typeof qry === 'string'
        ? qry
        : QryBuilder.update(qry.table)
            .set(...(Array.isArray(qry.set) ? qry.set : [qry.set]))
            .where(...(qry.where ? (Array.isArray(qry.where) ? qry.where : [qry.where]) : []))
            .setItemValues(...(qry.items || []))
            .export();

    const result = await this.qry(sql, conn);

    return result.affectedRows;
  }

  async delete(qry: string | DeleteProps, conn?: PoolConnection | undefined) {
    const sql =
      typeof qry === 'string'
        ? qry
        : QryBuilder.delete()
            .from(qry.table)
            .where(...(Array.isArray(qry.where) ? qry.where : [qry.where]))
            .setItemValues(...qry.items)
            .export();

    const result = await this.qry(sql, conn);

    return result.affectedRows;
  }

  checkString(value: string | number) {
    return typeof value == 'string' ? `'${value}'` : value;
  }

  close() {
    this._pool.end();
  }
}
