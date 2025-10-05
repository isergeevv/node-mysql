import type { PoolConnection } from 'mysql2/promise';
import type { DeleteProps, InsertProps, SelectProps, UpdateProps } from './types';
import QryBuilder from './QryBuilder';

export default class DatabaseConnection {
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

  async query(qry: string, items: any[] = []): Promise<any> {
    try {
      return this._connection.query(qry, items);
    } catch (e: any) {
      throw new Error(`Error: ${e.message}.\nQuery: ${qry}\nItems: ${items.join(', ')}`);
    }
  }

  async select(qry: string | SelectProps): Promise<any[]> {
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

    return await this.query(sql);
  }

  async insert(qry: string | InsertProps): Promise<number> {
    const sql = typeof qry === 'string' ? qry : QryBuilder.insert(qry.items).into(qry.into).export();

    const result = await this.query(sql);

    const insertId = result.insertId;

    return insertId;
  }

  async update(qry: string | UpdateProps) {
    const sql =
      typeof qry === 'string'
        ? qry
        : QryBuilder.update(qry.table)
            .set(...(Array.isArray(qry.set) ? qry.set : [qry.set]))
            .where(...(qry.where ? (Array.isArray(qry.where) ? qry.where : [qry.where]) : []))
            .setItemValues(...(qry.items || []))
            .export();

    const result = await this.query(sql);

    return result.affectedRows;
  }

  async delete(qry: string | DeleteProps) {
    const sql =
      typeof qry === 'string'
        ? qry
        : QryBuilder.delete()
            .from(qry.table)
            .where(...(Array.isArray(qry.where) ? qry.where : [qry.where]))
            .setItemValues(...qry.items)
            .export();

    const result = await this.query(sql);

    return result.affectedRows;
  }

  release() {
    this._connection.release();
  }
}
