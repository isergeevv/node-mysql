import IQryBuilder from '../interface/IQryBuilder';
import { TableColumnData } from '../types';

export default class QryTableCreateBuilder implements IQryBuilder {
  private _table: string;
  private _columns: Partial<TableColumnData>[];

  constructor(table: string) {
    this._table = table;
    this._columns = [];
  }

  export() {
    if (!this._table.length) {
      throw new Error('[QryTableCreateBuilder] Missing table.');
    }

    return `CREATE TABLE ${this._table} (
      ${this._columns.map((columnData) => {
        let c: string = '';

        if (!columnData.name) {
          throw new Error(`[QryTableCreateBuilder] Column missing name.`);
        }

        c = c.concat(columnData.name);

        if (!columnData.type) {
          throw new Error(`[QryTableCreateBuilder] Column missing type.`);
        }

        c = c.concat(` ${columnData.type}`);

        if (columnData.isAutoIncrement) {
          c = c.concat(` AUTO_INCREMENT`);
        }

        if (columnData.isPrimary) {
          c = c.concat(` PRIMARY KEY`);
        }

        if (columnData.isUnique) {
          c = c.concat(` UNIQUE`);
        }

        c = c.concat(columnData.isNull ? ` NULL` : ` NOT NULL`);

        if (columnData.default) {
          c = c.concat(` DEFAULT ${columnData.default}`);
        }

        return c;
      })}
    );`;
  }

  columns(columnsData: Partial<TableColumnData>[]) {
    this._columns = columnsData;
    return this;
  }
}
