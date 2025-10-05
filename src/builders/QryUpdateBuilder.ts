import { IConnection, IQryBuilder } from '../interfaces';

export default class QryUpdateBuilder implements IQryBuilder {
  private _table: string;
  private _where: string[];
  private _items: string[];
  private _itemValues: (string | number | bigint)[];

  constructor(table: string) {
    this._table = table;
    this._where = [];
    this._itemValues = [];
    this._items = [];
  }

  set = (...items: string[]) => {
    this._items = items;
    return this;
  };

  where = (...where: string[]) => {
    this._where = [...where];
    return this;
  };

  setItemValues = (...items: (string | number | bigint)[]) => {
    this._itemValues = [...items];
    return this;
  };

  export(conn: IConnection): string {
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

    return conn.generateParameterizedQuery(qry, this._itemValues);
  }
}
