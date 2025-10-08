import type { IConnection, IDeleteQuery, IDeleteResult } from '../interfaces';
import type { DeleteProps } from '../types';
import DeleteResult from '../results/DeleteResult';

export default class DeleteQuery implements IDeleteQuery {
  private _connection: IConnection;

  private _props: DeleteProps;

  constructor(connection: IConnection) {
    this._connection = connection;
    this._props = {
      table: '',
      where: '',
      params: [],
    };
  }

  from(table: string): IDeleteQuery {
    this._props.table = table;
    return this;
  }

  where(where: string): IDeleteQuery {
    this._props.where = where;
    return this;
  }

  setParams(...params: (string | number | bigint)[]): IDeleteQuery {
    this._props.params = params;
    return this;
  }

  import(qryProps: DeleteProps): IDeleteQuery {
    this._props = { ...this._props, ...qryProps };
    return this;
  }

  export(): string {
    if (!this._props.table.length) {
      throw new Error('[DeleteQuery] Missing table.');
    }

    const qry =
      `DELETE FROM ${this._props.table}` + (this._props.where.length ? ` WHERE ${this._props.where}` : '') + ';';

    return this._connection.generateParameterizedQuery(qry, this._props.params);
  }

  async execute(): Promise<IDeleteResult> {
    const qryResult = await this._connection.query(this.export());

    return new DeleteResult(qryResult.raw);
  }

  async then(onfulfilled: (value: any) => any, onrejected?: (reason: any) => any): Promise<any> {
    return this.execute().then(onfulfilled, onrejected);
  }
}
