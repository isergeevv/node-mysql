import IQryBuilder from '../interface/IQryBuilder';
import { generateParameterizedQuery } from '../util';

export default class QryDeleteBuilder implements IQryBuilder {
  private _table: string;
  private _where: string[];
  private _itemValues: (string | number)[];

  constructor() {
    this._table = '';
    this._where = [];
    this._itemValues = [];
  }

  export() {
    if (!this._table.length) {
      throw new Error('[QryDeleteBuilder] Missing table.');
    }

    const qry = `DELETE FROM ${this._table}` + (this._where.length ? ` WHERE ${this._where.join(' AND ')}` : '') + ';';

    return generateParameterizedQuery(qry, this._itemValues);
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
}
