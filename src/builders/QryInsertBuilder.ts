import type { IConnection, IQryBuilder } from '../interfaces';

export default class QryInsertBuilder implements IQryBuilder {
  private _table: string;
  private _set: Record<string, string | number>;

  constructor(items?: Record<string, string | number>) {
    this._table = '';
    this._set = items || {};
  }

  into = (table: string) => {
    this._table = table;
    return this;
  };

  set = (items: Record<string, string | number>) => {
    this._set = items;
    return this;
  };

  export(conn: IConnection): string {
    if (!this._table.length) {
      throw new Error('[QryInsertBuilder] Missing table.');
    }

    const keys = Object.keys(this._set);

    return (
      `INSERT INTO ${this._table}` +
      (keys.length ? ` SET ${keys.map((key) => `${key} = ${conn.escape(this._set[key])}`).join(', ')}` : '') +
      ';'
    );
  }
}
