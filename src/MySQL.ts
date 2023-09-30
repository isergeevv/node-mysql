import { createPool, Pool, PoolConnection, PoolOptions, ResultSetHeader } from 'mysql2/promise';
import { Delete, Insert, QryProps, ResultField, ResultRow, Select, Update } from './types';
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

  qry = async ({ qry, items = [], conn }: QryProps) => {
    try {
      const connection = conn || (await this.getConnection());
      const result = await connection.query(qry, items);
      if (!conn) connection.release();
      return result;
    } catch (e: any) {
      throw new Error(`Error: ${e.message}.\nQuery: ${qry}\nItems: ${items.join(', ')}`);
    }
  };

  select: Select = async ({ qry, select = '*', from, join = [], where = [], extra = '', items = [], conn }) => {
    if (!qry)
      qry = QryBuilder.select(select)
        .from(from)
        .join(...(Array.isArray(join) ? join : [join]))
        .where(...(Array.isArray(where) ? where : [where]))
        .extra(extra)
        .setItemValues(...items)
        .export();

    const result = await this.qry({ qry, conn });

    return {
      rows: result[0] as ResultRow[],
      fields: result[1] as ResultField[],
    };
  };

  insert: Insert = async ({ qry, into, items, conn }) => {
    if (!qry) qry = QryBuilder.insert(items).into(into).export();

    const result = await this.qry({ qry, conn });
    const insertId = result && result[0] ? (result[0] as ResultSetHeader).insertId : 0;
    if (insertId) this._lastInsertId = insertId;

    return insertId;
  };

  update: Update = async ({ qry, table, set, where = [], items = [], conn }) => {
    if (!qry)
      qry = QryBuilder.update(table)
        .set(...(Array.isArray(set) ? set : [set]))
        .where(...(Array.isArray(where) ? where : [where]))
        .setItemValues(...items)
        .export();

    const result = await this.qry({ qry, conn });
    return result && result[0] ? (result[0] as ResultSetHeader).affectedRows : 0;
  };

  delete: Delete = async ({ qry, table, where, items = [], conn }) => {
    if (!qry)
      qry = QryBuilder.delete()
        .from(table)
        .where(...(Array.isArray(where) ? where : [where]))
        .setItemValues(...items)
        .export();

    const result = await this.qry({ qry, items, conn });

    return result && result[0] ? (result[0] as ResultSetHeader).affectedRows : 0;
  };

  checkString = (value: string | number) => {
    return typeof value == 'string' ? `'${value}'` : value;
  };

  close = () => {
    this._pool.end();
  };
}
