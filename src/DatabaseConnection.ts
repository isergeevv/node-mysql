import type { PoolConnection } from 'mysql2/promise';
import type { DeleteProps, InsertProps, SelectProps, UpdateProps } from './types';
import type {
  IDatabaseConnection,
  IQryDeleteResult,
  IQryInsertResult,
  IQryResult,
  IQrySelectResult,
  IQryUpdateResult,
} from './interfaces';
import QryBuilder from './QryBuilder';
import { QryResult, QrySelectResult } from './results';
import QryUpdateResult from './results/QryUpdateResult';
import QryInsertResult from './results/QryInsertResult';
import QryDeleteResult from './results/QryDeleteResult';
import QryTableBuilder from './QryTableBuilder';

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

  get qryBuilder(): typeof QryBuilder {
    return QryBuilder;
  }

  get qryTableBuilder(): typeof QryTableBuilder {
    return QryTableBuilder;
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

  async query(qry: string, items: any[] = []): Promise<IQryResult> {
    try {
      return new QryResult(await this._connection.query(qry, items));
    } catch (e: any) {
      throw new Error(`Error: ${e.message}.\nQuery: ${qry}\nItems: ${items.join(', ')}`);
    }
  }

  async select(qry: string | SelectProps): Promise<IQrySelectResult> {
    const sql =
      typeof qry === 'string'
        ? qry
        : QryBuilder.select(...(qry.select ? (Array.isArray(qry.select) ? qry.select : [qry.select]) : ['*']))
            .from(qry.from)
            .join(...(qry.join ? (Array.isArray(qry.join) ? qry.join : [qry.join]) : []))
            .where(...(qry.where ? (Array.isArray(qry.where) ? qry.where : [qry.where]) : []))
            .extra(qry.extra || '')
            .setItemValues(...(qry.items || []))
            .export(this);

    const qryResult = await this.query(sql);

    return new QrySelectResult(qryResult.raw);
  }

  async insert(qry: string | InsertProps): Promise<IQryInsertResult> {
    const sql = typeof qry === 'string' ? qry : QryBuilder.insert(qry.items).into(qry.into).export(this);

    const result = await this.query(sql);

    return new QryInsertResult(result.raw);
  }

  async update(qry: string | UpdateProps): Promise<IQryUpdateResult> {
    const sql =
      typeof qry === 'string'
        ? qry
        : QryBuilder.update(qry.table)
            .set(...(Array.isArray(qry.set) ? qry.set : [qry.set]))
            .where(...(qry.where ? (Array.isArray(qry.where) ? qry.where : [qry.where]) : []))
            .setItemValues(...(qry.items || []))
            .export(this);

    const result = await this.query(sql);

    return new QryUpdateResult(result.raw);
  }

  async delete(qry: string | DeleteProps): Promise<IQryDeleteResult> {
    const sql =
      typeof qry === 'string'
        ? qry
        : QryBuilder.delete()
            .from(qry.table)
            .where(...(Array.isArray(qry.where) ? qry.where : [qry.where]))
            .setItemValues(...qry.items)
            .export(this);

    const result = await this.query(sql);

    return new QryDeleteResult(result.raw);
  }

  escape(value: unknown): string {
    return this._connection.escape(value);
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

  release() {
    this._connection.release();
  }
}
