import { createPool, Pool, PoolConnection, PoolOptions, ResultSetHeader } from 'mysql2/promise';
import { Delete, Insert, QryItems, ResultField, ResultRow, Select, Update } from './types';
import QryBuilder from './QryBuilder';

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

  getConnection = async () => {
    return await this._pool.getConnection();
  };

  beginTransaction = async () => {
    const connection: PoolConnection = await this.getConnection();
    await connection.beginTransaction();
    return connection;
  };

  commitTransaction = async (connection: PoolConnection) => {
    if (!connection) return;
    connection.commit();
    connection.release();
  };

  rollbackTransaction = async (connection: PoolConnection) => {
    if (!connection) return;
    connection.rollback();
    connection.release();
  };

  qry = async (qry: string, items: QryItems = [], conn?: PoolConnection) => {
    try {
      const connection = conn || (await this.getConnection());
      const result = await connection.query(qry, items);
      if (!conn) connection.release();
      return result;
    } catch (e: any) {
      throw new Error(`Error: ${e.message}.\nQuery: ${qry}\nItems: ${items.join(', ')}`);
    }
  };

  select: Select = async (qry, conn) => {
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

    const result = await this.qry(sql, conn);

    return {
      rows: result[0] as ResultRow[],
      fields: result[1] as ResultField[],
    };
  };

  insert: Insert = async (qry, conn) => {
    const sql = typeof qry === 'string' ? qry : QryBuilder.insert(qry.items).into(qry.into).export();

    const result = await this.qry(sql, conn);
    const insertId = result && result[0] ? (result[0] as ResultSetHeader).insertId : 0;
    if (insertId) this._lastInsertId = insertId;

    return insertId;
  };

  update: Update = async (qry, conn) => {
    const sql =
      typeof qry === 'string'
        ? qry
        : QryBuilder.update(qry.table)
            .set(...(Array.isArray(qry.set) ? qry.set : [qry.set]))
            .where(...(qry.where ? (Array.isArray(qry.where) ? qry.where : [qry.where]) : []))
            .setItemValues(...(qry.items || []))
            .export();

    const result = await this.qry(sql, conn);
    return result && result[0] ? (result[0] as ResultSetHeader).affectedRows : 0;
  };

  delete: Delete = async (qry, conn) => {
    const sql =
      typeof qry === 'string'
        ? qry
        : QryBuilder.delete()
            .from(qry.table)
            .where(...(Array.isArray(qry.where) ? qry.where : [qry.where]))
            .setItemValues(...qry.items)
            .export();

    const result = await this.qry(sql, conn);

    return result && result[0] ? (result[0] as ResultSetHeader).affectedRows : 0;
  };

  checkString = (value: string | number) => {
    return typeof value == 'string' ? `'${value}'` : value;
  };

  close = () => {
    this._pool.end();
  };
}
