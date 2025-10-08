import type { FieldPacket, QueryResult, ResultSetHeader } from 'mysql2/promise';
import type { IInsertResult } from '../interfaces';

export default class InsertResult implements IInsertResult {
  private _result: [QueryResult, FieldPacket[]];

  constructor(result: [QueryResult, FieldPacket[]]) {
    this._result = result;
  }

  get insertId(): number {
    return (this._result[0] as ResultSetHeader).insertId ?? 0;
  }

  get raw(): [QueryResult, FieldPacket[]] {
    return this._result;
  }
}
