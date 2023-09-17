import { escape } from 'mysql2/promise';
import { Join } from './types';

export default class QryBuilder {
  private _statement: string;
  private _table: string;
  private _joins: Join[];
  private _where: string[];
  private _startItem: number;
  private _limit: number;
  private _extra: string;
  private _items: (string | number)[];

  constructor(start: string) {
    this._statement = start;
    this._table = '';
    this._joins = [];
    this._where = [];
    this._extra = '';
    this._items = [];
    this._startItem = 0;
    this._limit = 0;
  }

  static select = (...items: string[]) => {
    return new QryBuilder(`SELECT ${items.length ? items.join(', ') : '*'}`);
  };

  export() {
    let qry = this._statement;
    if (this._table.length) {
      qry = qry.concat(` FROM ${this._table}`);
    }

    for (const join of this._joins) {
      qry = qry.concat(`${join.type?.length ? ` ${join.type}` : ''} JOIN ${join.join}`);
    }

    if (this._where.length) {
      qry = qry.concat(` WHERE ${this._where.join(' AND ')}`);
    }

    if (this._limit) {
      qry = qry.concat(` LIMIT ${this._startItem}, ${this._limit}`);
    }

    if (this._extra) {
      qry = qry.concat(` ${this._extra}`);
    }

    qry = qry.concat(';');

    for (const item of this._items) {
      qry = qry.replace('?', escape(item));
    }

    return qry;
  }

  from = (table: string) => {
    this._table = table;
    return this;
  };

  join = (...joins: Join[]) => {
    this._joins.push(...joins);
    return this;
  };

  where = (...where: string[]) => {
    this._where = [...where];
    return this;
  };

  limit = (limit: number) => {
    this._limit = limit;
    return this;
  };

  startItem = (startItem: number) => {
    if (startItem !== 0 && !this._limit) {
      throw new Error('[QryBuilder] Need to set limit before setting startItem.');
    }
    this._startItem = startItem;
    return this;
  };

  extra = (extra: string) => {
    this._extra = extra;
    return this;
  };

  setItems = (...items: (string | number)[]) => {
    this._items = [...items];
    return this;
  };
}
