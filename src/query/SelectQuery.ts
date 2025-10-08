import type { IConnection, ISelectResult, ISelectQuery } from '../interfaces';
import type { Join, SelectOrder, SelectProps } from '../types';
import SelectResult from '../results/SelectResult';

export default class SelectQuery implements ISelectQuery {
  private _connection: IConnection;

  private _props: SelectProps;

  constructor(connection: IConnection) {
    this._connection = connection;

    this._props = {
      items: [],
      forUpdate: false,
      table: '',
      joins: [],
      where: '',
      limit: 0,
      order: [],
      startItem: 0,
      extra: '',
      params: [],
    };
  }

  items(...items: string[]): ISelectQuery {
    this._props.items = items;
    return this;
  }

  forUpdate(): ISelectQuery {
    this._props.forUpdate = true;
    return this;
  }

  from(table: string): ISelectQuery {
    this._props.table = table;
    return this;
  }

  join(...joins: Join[]): ISelectQuery {
    this._props.joins.push(...joins);
    return this;
  }

  where(where: string): ISelectQuery {
    this._props.where = where;
    return this;
  }

  limit(limit: number): ISelectQuery {
    this._props.limit = limit;
    return this;
  }

  order(...orders: SelectOrder[]): ISelectQuery {
    for (const order of orders) {
      if (!order.columns.length) {
        throw new Error('[SelectQuery] Need to set columns to be ordered by.');
      }

      this._props.order.push(order);
    }

    return this;
  }

  startItem(startItem: number): ISelectQuery {
    if (startItem !== 0 && this._props.limit === 0) {
      throw new Error('[SelectQuery] Need to set limit before setting startItem.');
    }

    this._props.startItem = startItem;
    return this;
  }

  extra(extra: string): ISelectQuery {
    this._props.extra = extra;
    return this;
  }

  setParams(...items: (string | number | bigint)[]): ISelectQuery {
    this._props.params = items;
    return this;
  }

  import(qryProps: SelectProps): ISelectQuery {
    this._props = { ...this._props, ...qryProps };

    return this;
  }

  export(): string {
    if (this._props.table.length === 0) {
      throw new Error('[SelectQuery] Missing table.');
    }

    let qry = `SELECT ${this._props.items.length > 0 ? this._props.items.join(', ') : '*'}`;

    if (this._props.forUpdate) {
      qry = qry.concat(' FOR UPDATE');
    }

    qry = qry.concat(` FROM ${this._props.table}`);

    for (const join of this._props.joins) {
      qry = qry.concat(`${join.type?.length ? ` ${join.type}` : ''} JOIN ${join.join}`);
    }

    if (this._props.where.length) {
      qry = qry.concat(` WHERE ${this._props.where}`);
    }

    if (this._props.order.length) {
      qry = qry.concat(
        ` ORDER BY ${this._props.order.map((order) => `${order.columns.join(', ')} ${order.direction}`).join(',')}`,
      );
    }

    if (this._props.limit) {
      qry = qry.concat(` LIMIT ${this._props.startItem}, ${this._props.limit}`);
    }

    if (this._props.extra.length > 0) {
      qry = qry.concat(` ${this._props.extra}`);
    }

    qry = qry.concat(';');

    return this._connection.generateParameterizedQuery(qry, this._props.params);
  }

  async execute(): Promise<ISelectResult> {
    const qryResult = await this._connection.query(this.export());

    return new SelectResult(qryResult.raw);
  }

  async then(onfulfilled: (value: any) => any, onrejected?: (reason: any) => any): Promise<any> {
    return this.execute().then(onfulfilled, onrejected);
  }
}
