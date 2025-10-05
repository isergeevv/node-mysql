import type { IConnection, IQryBuilder } from '../interfaces';

export default class QryTableExistsBuilder implements IQryBuilder {
  private _table: string;

  constructor(table: string) {
    this._table = table;
  }

  export(conn: IConnection): string {
    if (!this._table.length) {
      throw new Error('[QryTableExistsBuilder] Missing table.');
    }

    return `SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = DATABASE() AND table_name = ${conn.escape(
      this._table,
    )};`;
  }
}
