import { FieldPacket, QueryResult, ResultSetHeader } from 'mysql2';
import { ResultField, ResultRow } from './types';

export default class QryResult {
  private _result: [QueryResult, FieldPacket[]];

  constructor(result: [QueryResult, FieldPacket[]]) {
    this._result = result;
  }

  get affectedRows() {
    return (this._result[0] as ResultSetHeader).affectedRows ?? 0;
  }

  get insertId() {
    return (this._result[0] as ResultSetHeader).insertId ?? 0;
  }

  get rows() {
    return this._result[0] as ResultRow[];
  }

  get headers() {
    return this._result[0] as ResultSetHeader;
  }

  get fields() {
    return this._result[1] as ResultField[];
  }

  get raw() {
    return this._result;
  }
}
