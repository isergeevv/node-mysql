import type { FieldPacket, QueryResult } from 'mysql2/promise';
import type { ITableExistsResult } from '../interfaces';

export default class TableExistsResult implements ITableExistsResult {
  private _result: [QueryResult, FieldPacket[]];

  constructor(result: [QueryResult, FieldPacket[]]) {
    this._result = result;
  }

  get exists(): boolean {
    const rows = this._result[0] as any[];
    return rows.length > 0 && rows[0]['COUNT(*)'] === 1;
  }

  get raw(): [QueryResult, FieldPacket[]] {
    return this._result;
  }
}
