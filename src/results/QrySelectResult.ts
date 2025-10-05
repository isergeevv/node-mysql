import type { FieldPacket, QueryResult, ResultSetHeader } from 'mysql2';
import type { ResultField, ResultRow } from '../types';
import type { IQrySelectResult } from '../interfaces';

export default class QrySelectResult implements IQrySelectResult {
  private _result: [QueryResult, FieldPacket[]];

  constructor(result: [QueryResult, FieldPacket[]]) {
    this._result = result;
  }

  get rows(): ResultRow[] {
    return this._result[0] as ResultRow[];
  }

  get fields(): ResultField[] {
    return this._result[1] as ResultField[];
  }

  get raw(): [QueryResult, FieldPacket[]] {
    return this._result;
  }
}
