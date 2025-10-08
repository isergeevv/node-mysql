import type { FieldPacket, QueryResult } from 'mysql2/promise';
import type { ICreateTableResult } from '../interfaces';

export default class CreateTableResult implements ICreateTableResult {
  private _result: [QueryResult, FieldPacket[]];

  constructor(result: [QueryResult, FieldPacket[]]) {
    this._result = result;
  }

  get raw(): [QueryResult, FieldPacket[]] {
    return this._result;
  }
}
