import { Join, ORDER } from './types';
import QryBuilderInterface from './interface/QryBuilderInterface';
import { generateParameterizedQuery } from './util';

export default class QrySelectBuilder implements QryBuilderInterface {
  private _table: string;
  private _joins: Join[];
  private _where: string[];
  private _startItem: number;
  private _limit: number;
  private _orderBy: string[];
  private _order: string;
  private _extra: string;
  private _items: string[];
  private _itemValues: (string | number)[];

  constructor(...items: string[]) {
    this._table = '';
    this._joins = [];
    this._where = [];
    this._orderBy = [];
    this._order = ORDER.ASC;
    this._extra = '';
    this._itemValues = [];
    this._startItem = 0;
    this._limit = 0;
    this._items = items;
  }

  export() {
    if (!this._table.length) {
      throw new Error('[QrySelectBuilder] Missing table.');
    }

    let qry = `SELECT ${this._items.length ? this._items.join(', ') : '*'} FROM ${this._table}`;

    for (const join of this._joins) {
      qry = qry.concat(`${join.type?.length ? ` ${join.type}` : ''} JOIN ${join.join}`);
    }

    if (this._where.length) {
      qry = qry.concat(` WHERE ${this._where.join(' AND ')}`);
    }

    if (this._limit) {
      qry = qry.concat(` LIMIT ${this._startItem}, ${this._limit}`);
    }

    if (this._extra.length) {
      qry = qry.concat(` ${this._extra}`);
    }

    qry = qry.concat(';');

    return generateParameterizedQuery(qry, this._itemValues);
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

  order = (order: ORDER, columns: string[] = []) => {
    this._order = order;
    this._orderBy.push(...columns);
    return this;
  };

  startItem = (startItem: number) => {
    if (startItem !== 0 && !this._limit) {
      throw new Error('[QrySelectBuilder] Need to set limit before setting startItem.');
    }
    this._startItem = startItem;
    return this;
  };

  extra = (extra: string) => {
    this._extra = extra;
    return this;
  };

  setItemValues = (...items: (string | number)[]) => {
    this._itemValues = [...items];
    return this;
  };
}
