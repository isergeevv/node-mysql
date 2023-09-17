import { escape } from 'mysql2/promise';
import { Join, QRY_TYPES } from './types';

export default class QryBuilder {
  private _type: QRY_TYPES;
  private _table: string;
  private _set: Record<string, string | number>;
  private _joins: Join[];
  private _where: string[];
  private _startItem: number;
  private _limit: number;
  private _extra: string;
  private _items: string[];
  private _itemValues: (string | number)[];

  constructor(type: QRY_TYPES) {
    this._type = type;
    this._table = '';
    this._joins = [];
    this._where = [];
    this._extra = '';
    this._itemValues = [];
    this._startItem = 0;
    this._limit = 0;
    this._set = {};
    this._items = [];
  }

  static select = (...items: string[]) => {
    const qryBuilder = new QryBuilder(QRY_TYPES.SELECT);
    qryBuilder.setItems(...items);
    return qryBuilder;
  };

  static insert = (items?: Record<string, string | number>) => {
    const qryBuilder = new QryBuilder(QRY_TYPES.INSERT);
    if (items) qryBuilder.set(items);
    return qryBuilder;
  };

  export() {
    if (!this._table.length) {
      throw new Error('[QryBuilder] Missing table.');
    }

    let qry = '';
    switch (this._type) {
      case QRY_TYPES.SELECT: {
        qry = qry.concat(`SELECT ${this._items.length ? this._items.join(', ') : '*'} FROM ${this._table}`);

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
        break;
      }
      case QRY_TYPES.INSERT: {
        qry = qry.concat(`INSERT INTO ${this._table}`);

        const keys = Object.keys(this._set);
        if (keys.length) {
          qry = qry.concat(` SET ${keys.map((key) => `${key} = ${escape(this._set[key])}`).join(', ')}`);
        }
        break;
      }
    }

    qry = qry.concat(';');

    for (const item of this._itemValues) {
      qry = qry.replace(' = ?', ` = ${escape(item)}`);
    }

    return qry;
  }

  from = (table: string) => {
    this._table = table;
    return this;
  };

  into = (table: string) => {
    this._table = table;
    return this;
  };

  set = (items: Record<string, string | number>) => {
    this._set = items;
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

  setItems = (...items: string[]) => {
    this._items = [...items];
    return this;
  };

  setItemValues = (...items: (string | number)[]) => {
    this._itemValues = [...items];
    return this;
  };
}
