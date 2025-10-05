import type { IConnection, IQryBuilder } from '../interfaces';

export default class QryDeleteBuilder implements IQryBuilder {
  private _table: string;
  private _where: string[];
  private _itemValues: (string | number)[];

  constructor() {
    this._table = '';
    this._where = [];
    this._itemValues = [];
  }

  from = (table: string) => {
    this._table = table;
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

  export(conn: IConnection): string {
    if (!this._table.length) {
      throw new Error('[QryDeleteBuilder] Missing table.');
    }

    const qry = `DELETE FROM ${this._table}` + (this._where.length ? ` WHERE ${this._where.join(' AND ')}` : '') + ';';

    return conn.generateParameterizedQuery(qry, this._itemValues);
  }
}
