import { escape } from 'mysql2/promise';
import IQryBuilder from '../interface/IQryBuilder';

export default class QryTableExistsBuilder implements IQryBuilder {
  private _table: string;

  constructor(table: string) {
    this._table = table;
  }

  export() {
    if (!this._table.length) {
      throw new Error('[QryTableExistsBuilder] Missing table.');
    }

    return `SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = DATABASE() AND table_name = ${escape(
      this._table,
    )};`;
  }
}
