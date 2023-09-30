import QryBuilderInterface from './interface/QryBuilderInterface';
import { generateParameterizedQuery } from './util';

export default class QryUpdateBuilder implements QryBuilderInterface {
  private _table: string;
  private _where: string[];
  private _items: string[];
  private _itemValues: (string | number)[];

  constructor(table: string) {
    this._table = table;
    this._where = [];
    this._itemValues = [];
    this._items = [];
  }

  export() {
    if (!this._table.length) {
      throw new Error('[QryUpdateBuilder] Missing table.');
    }
    if (!this._items.length) {
      throw new Error('[QryUpdateBuilder] Missing set items.');
    }

    const qry =
      `UPDATE ${this._table} SET ${this._items.join(', ')}` +
      (this._where.length ? ` WHERE ${this._where.join(' AND ')}` : '') +
      ';';

    return generateParameterizedQuery(qry, this._itemValues);
  }

  set = (...items: string[]) => {
    this._items = items;
    return this;
  };

  where = (...where: string[]) => {
    this._where = [...where];
    return this;
  };

  setItemValues = (...items: (string | number)[]) => {
    this._itemValues = [...items];
    return this;
  };
}
