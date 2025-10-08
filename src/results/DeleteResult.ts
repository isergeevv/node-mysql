import type { FieldPacket, QueryResult, ResultSetHeader } from 'mysql2/promise';
import type { IDeleteResult } from '../interfaces';

export default class DeleteResult implements IDeleteResult {
  private _result: [QueryResult, FieldPacket[]];

  constructor(result: [QueryResult, FieldPacket[]]) {
    this._result = result;
  }

  get affectedRows(): number {
    return (this._result[0] as ResultSetHeader).affectedRows ?? 0;
  }

  get raw(): [QueryResult, FieldPacket[]] {
    return this._result;
  }
}
