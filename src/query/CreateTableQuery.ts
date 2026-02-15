import type { ICreateTableQuery, ICreateTableResult, IConnection } from '../interfaces';
import type { CreateTableProps, TableColumnData } from '../types';
import CreateTableResult from '../results/CreateTableResult';

export default class CreateTableQuery implements ICreateTableQuery {
  private _connection: IConnection;

  private _props: CreateTableProps;

  constructor(connection: IConnection) {
    this._connection = connection;
    this._props = {
      table: '',
      columns: [],
      ifNotExists: false,
      unique: [],
    };
  }

  table(table: string): ICreateTableQuery {
    this._props.table = table;
    return this;
  }

  ifNotExists(ifNotExists: boolean = true): ICreateTableQuery {
    this._props.ifNotExists = ifNotExists;
    return this;
  }

  columns(...columns: Partial<TableColumnData>[]): ICreateTableQuery {
    this._props.columns.push(...columns);
    return this;
  }

  unique(...columnNameGroups: (string | string[])[]): ICreateTableQuery {
    const currentColumnNames = this._props.columns.map((c) => c.name);

    for (let i = 0; i < columnNameGroups.length; i++) {
      if (typeof columnNameGroups[i] === 'string') {
        const columnName = columnNameGroups[i] as string;

        if (!currentColumnNames.includes(columnName)) {
          throw new Error(`[CreateTableQuery] Trying to set unique column '${columnName}' that does not exist.`);
        }

        this._props.unique.push([columnName]);

        continue;
      }

      const columnNames = columnNameGroups[i] as string[];

      for (const columnName of columnNames) {
        if (!currentColumnNames.includes(columnName)) {
          throw new Error(`[CreateTableQuery] Trying to set unique column '${columnName}' that does not exist.`);
        }
      }

      this._props.unique.push(columnNames);
    }

    return this;
  }

  import(qryProps: Partial<CreateTableProps>): ICreateTableQuery {
    this._props = { ...this._props, ...qryProps };
    return this;
  }

  export(): string {
    if (!this._props.table.length) {
      throw new Error('[CreateTableQuery] Missing table.');
    }

    let qry = `CREATE TABLE`;

    if (this._props.ifNotExists) {
      qry = qry.concat(' IF NOT EXISTS');
    }

    qry = qry.concat(` ${this._props.table}`);

    qry = qry.concat(' (');

    qry = qry.concat(
      this._props.columns
        .map((columnData) => {
          let c: string = '';

          if (!columnData.name) {
            throw new Error(`[CreateTableQuery] Column missing name.`);
          }

          c = c.concat(columnData.name);

          if (!columnData.type) {
            throw new Error(`[CreateTableQuery] Column missing type.`);
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
        })
        .join(', '),
    );

    qry = qry.concat(this._props.unique.map((columnNames) => `, UNIQUE (${columnNames.join(', ')})`).join(''));

    qry = qry.concat(' );');

    return qry;
  }

  async execute(): Promise<ICreateTableResult> {
    const qryResult = await this._connection.query(this.export());

    return new CreateTableResult(qryResult.raw);
  }

  async then(onfulfilled: (value: any) => any, onrejected?: (reason: any) => any): Promise<any> {
    return this.execute().then(onfulfilled, onrejected);
  }
}
