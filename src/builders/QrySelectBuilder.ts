import { Join, SelectOrder } from '../types';
import IQryBuilder from '../interface/IQryBuilder';
import { generateParameterizedQuery } from '../util';

export default class QrySelectBuilder implements IQryBuilder {
  private _items: string[];

  private _forUpdate: boolean;
  private _table: string;
  private _joins: Join[];
  private _where: string[];
  private _startItem: number;
  private _limit: number;
  private _order: SelectOrder[];
  private _extra: string;
  private _itemValues: (string | number)[];

  constructor(...items: string[]) {
    this._items = items;

    this._forUpdate = false;
    this._table = '';
    this._joins = [];
    this._where = [];
    this._order = [];
    this._extra = '';
    this._itemValues = [];
    this._startItem = 0;
    this._limit = 0;
  }

  forUpdate = () => {
    this._forUpdate = true;
    return this;
  };

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

  order = (...orders: SelectOrder[]) => {
    for (const order of orders) {
      if (!order.columns.length) {
        throw new Error('[QrySelectBuilder] Need to set columns to be ordered by.');
      }
      this._order.push({
        direction: order.direction,
        columns: [...order.columns],
      });
    }
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

  export() {
    if (!this._table.length) {
      throw new Error('[QrySelectBuilder] Missing table.');
    }

    let qry = `SELECT ${this._items.length ? this._items.join(', ') : '*'}`;

    if (this._forUpdate) {
      qry = qry.concat(' FOR UPDATE');
    }

    qry = qry.concat(` FROM ${this._table}`);

    for (const join of this._joins) {
      qry = qry.concat(`${join.type?.length ? ` ${join.type}` : ''} JOIN ${join.join}`);
    }

    if (this._where.length) {
      qry = qry.concat(` WHERE ${this._where.join(' AND ')}`);
    }

    if (this._order.length) {
      qry = qry.concat(
        ` ORDER BY ${this._order.map((order) => `${order.columns.join(', ')} ${order.direction}`).join(',')}`,
      );
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
}
