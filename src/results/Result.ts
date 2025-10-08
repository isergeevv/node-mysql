import type { FieldPacket, QueryResult, ResultSetHeader } from 'mysql2/promise';
import type { ResultField, ResultRow } from '../types';
import type { IResult } from '../interfaces';

export default class Result implements IResult {
  private _result: [QueryResult, FieldPacket[]];

  constructor(result: [QueryResult, FieldPacket[]]) {
    this._result = result;
  }

  get affectedRows(): number {
    return (this._result[0] as ResultSetHeader).affectedRows ?? 0;
  }

  get insertId(): number {
    return (this._result[0] as ResultSetHeader).insertId ?? 0;
  }

  get rows(): ResultRow[] {
    return this._result[0] as ResultRow[];
  }

  get headers(): ResultSetHeader {
    return this._result[0] as ResultSetHeader;
  }

  get fields(): ResultField[] {
    return this._result[1] as ResultField[];
  }

  get raw(): [QueryResult, FieldPacket[]] {
    return this._result;
  }
}
