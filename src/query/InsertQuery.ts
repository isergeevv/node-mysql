import type { IConnection, IInsertQuery, IInsertResult } from '../interfaces';
import type { InsertProps } from '../types';
import InsertResult from '../results/InsertResult';

export default class InsertQuery implements IInsertQuery {
  private _connection: IConnection;

  private _props: InsertProps;

  constructor(connection: IConnection) {
    this._connection = connection;
    this._props = {
      table: '',
      items: {},
    };
  }

  into(table: string): IInsertQuery {
    this._props.table = table;
    return this;
  }

  items(items: Record<string, string | number>): IInsertQuery {
    this._props.items = items;
    return this;
  }

  import(qryProps: Partial<InsertProps>): IInsertQuery {
    this._props = { ...this._props, ...qryProps };
    return this;
  }

  export(): string {
    if (!this._props.table.length) {
      throw new Error('[InsertQuery] Missing table.');
    }

    const keys = Object.keys(this._props.items);

    return (
      `INSERT INTO ${this._props.table}` +
      (keys.length
        ? ` SET ${keys.map((key) => `${key} = ${this._connection.escape(this._props.items[key])}`).join(', ')}`
        : '') +
      ';'
    );
  }

  async execute(): Promise<IInsertResult> {
    const qryResult = await this._connection.query(this.export());

    return new InsertResult(qryResult.raw);
  }

  async then(onfulfilled: (value: any) => any, onrejected?: (reason: any) => any): Promise<any> {
    return this.execute().then(onfulfilled, onrejected);
  }
}
