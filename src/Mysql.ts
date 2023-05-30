import {
  createPool,
  OkPacket,
  Pool,
  PoolConnection,
  PoolOptions,
} from "mysql2/promise";
import {
  Delete,
  ResultField,
  Insert,
  Qry,
  ResultRow,
  Select,
  Update,
} from "./types";

export default class Mysql {
  private _pool: Pool;

  constructor(config: PoolOptions) {
    this._pool = createPool(config);
  }

  beginTransaction = async () => {
    const connection: PoolConnection = await this._pool.getConnection();
    await connection.beginTransaction();
    return connection;
  };

  commitTransaction = async (connection: PoolConnection) => {
    if (!connection) return;
    connection.commit();
    connection.release();
  };

  rollbackTransaction = async (connection: PoolConnection) => {
    if (!connection) return;
    connection.rollback();
    connection.release();
  };

  qry: Qry = async ({ qry, items = [], conn = null }) => {
    try {
      const connection = conn || (await this._pool.getConnection());
      const result = await connection.query(qry, items);
      if (!conn) connection.release();
      return result;
    } catch (e) {
      throw new Error(`[] Error executing query.\nQuery: ${qry}`);
    }
  };

  select: Select = async ({
    select = "*",
    from,
    join = "",
    where = null,
    extra = "",
    items = [],
    conn = null,
  }) => {
    const qry =
      `SELECT ${select} FROM ${from} ` +
      join +
      (where
        ? ` WHERE ${typeof where == "string" ? where : where.join(" AND ")} `
        : "") +
      extra;

    const result = await this.qry({ qry, items, conn });
    return {
      rows: result[0] as ResultRow[],
      fields: result[1] as ResultField[],
    };
  };

  insert: Insert = async ({ into, items, conn = null }) => {
    const qry = `INSERT INTO ${into} SET ?`;
    const result = await this.qry({ qry, items, conn });
    return result && result[0] ? (result[0] as OkPacket).insertId : null;
  };

  update: Update = async ({
    update,
    set,
    where = null,
    items = [],
    conn = null,
  }) => {
    const qry =
      `UPDATE ${update} SET ${typeof set == "string" ? set : set.join(", ")}` +
      (where
        ? ` WHERE ${typeof where == "string" ? where : where.join(" AND ")}`
        : "");

    const result = await this.qry({ qry, items, conn });
    return result && result[0] ? (result[0] as OkPacket).changedRows : 0;
  };

  delete: Delete = async ({ from, where, items = [], conn = null }) => {
    const qry = `DELETE FROM ${from} WHERE ${
      typeof where == "string" ? where : where.join(" AND ")
    }`;
    const result = await this.qry({ qry, items, conn });
    return result && result[0] ? (result[0] as OkPacket).affectedRows : 0;
  };

  checkString = (value: string | number) => {
    return typeof value == "string" ? `'${value}'` : value;
  };
}

