import type { IConnection, IUpdateResult, IUpdateQuery } from '../interfaces';
import type { UpdateProps } from '../types';
import UpdateResult from '../results/UpdateResult';

export default class UpdateQuery implements IUpdateQuery {
  private _connection: IConnection;

  private _props: UpdateProps;

  constructor(connection: IConnection) {
    this._connection = connection;

    this._props = {
      table: '',
      items: [],
      where: '',
      params: [],
    };
  }

  table(table: string): IUpdateQuery {
    this._props.table = table;
    return this;
  }

  set(...items: string[]): IUpdateQuery {
    this._props.items.push(...items);
    return this;
  }

  where(where: string): IUpdateQuery {
    this._props.where = where;
    return this;
  }

  setParams(...params: (string | number | bigint)[]): IUpdateQuery {
    this._props.params = params;
    return this;
  }

  import(qryProps: Partial<UpdateProps>): IUpdateQuery {
    this._props = { ...this._props, ...qryProps };
    return this;
  }

  export(): string {
    if (!this._props.table.length) {
      throw new Error('[UpdateQuery] Missing table.');
    }
    if (!this._props.items.length) {
      throw new Error('[UpdateQuery] Missing set items.');
    }

    const qry =
      `UPDATE ${this._props.table} SET ${this._props.items.join(', ')}` +
      (this._props.where.length ? ` WHERE ${this._props.where}` : '') +
      ';';

    return this._connection.generateParameterizedQuery(qry, this._props.params);
  }

  async execute(): Promise<IUpdateResult> {
    const qryResult = await this._connection.query(this.export());

    return new UpdateResult(qryResult.raw);
  }

  async then(onfulfilled: (value: any) => any, onrejected?: (reason: any) => any): Promise<any> {
    return this.execute().then(onfulfilled, onrejected);
  }
}
