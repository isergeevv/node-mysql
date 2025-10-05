import type { FieldPacket, QueryResult, ResultSetHeader } from 'mysql2';
import type { IQryDeleteResult } from '../interfaces';

export default class QryDeleteResult implements IQryDeleteResult {
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
