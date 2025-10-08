import type { ITableExistsQuery, IDatabaseConnection, ITableExistsResult, IDatabase, IConnection } from '../interfaces';
import type { TableExistsProps } from '../types';
import TableExistsResult from '../results/TableExistsResult';

export default class TableExistsQuery implements ITableExistsQuery {
  private _connection: IConnection;

  private _props: TableExistsProps;

  constructor(connection: IConnection) {
    this._connection = connection;
    this._props = {
      table: '',
    };
  }

  table(table: string): ITableExistsQuery {
    this._props.table = table;
    return this;
  }

  import(props: TableExistsProps): ITableExistsQuery {
    this._props = { ...this._props, ...props };
    return this;
  }

  export(): string {
    if (!this._props.table.length) {
      throw new Error('[TableExistsQuery] Missing table.');
    }

    return `SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = DATABASE() AND table_name = ${this._connection.escape(
      this._props.table,
    )};`;
  }

  async execute(): Promise<ITableExistsResult> {
    const qryResult = await this._connection.query(this.export());

    return new TableExistsResult(qryResult.raw);
  }

  async then(onfulfilled: (value: any) => any, onrejected?: (reason: any) => any): Promise<any> {
    return this.execute().then(onfulfilled, onrejected);
  }
}
