import { createPool } from 'mysql2/promise';

class Mysql {
    constructor(config) {
        this.beginTransaction = async () => {
            const connection = await this._pool.getConnection();
            await connection.beginTransaction();
            return connection;
        };
        this.commitTransaction = async (connection) => {
            if (!connection)
                return;
            connection.commit();
            connection.release();
        };
        this.rollbackTransaction = async (connection) => {
            if (!connection)
                return;
            connection.rollback();
            connection.release();
        };
        this.qry = async ({ qry, items = [], conn = null }) => {
            try {
                const connection = conn || (await this._pool.getConnection());
                const result = await connection.query(qry, items);
                if (!conn)
                    connection.release();
                return result;
            }
            catch (e) {
                throw new Error(`[] Error executing query.\nQuery: ${qry}`);
            }
        };
        this.select = async ({ select = "*", from, join = "", where = null, extra = "", items = [], conn = null, }) => {
            const qry = `SELECT ${select} FROM ${from} ` +
                join +
                (where
                    ? ` WHERE ${typeof where == "string" ? where : where.join(" AND ")} `
                    : "") +
                extra;
            const result = await this.qry({ qry, items, conn });
            return {
                rows: result[0],
                fields: result[1],
            };
        };
        this.insert = async ({ into, items, conn = null }) => {
            const qry = `INSERT INTO ${into} SET ?`;
            const result = await this.qry({ qry, items, conn });
            return result && result[0] ? result[0].insertId : null;
        };
        this.update = async ({ update, set, where = null, items = [], conn = null, }) => {
            const qry = `UPDATE ${update} SET ${typeof set == "string" ? set : set.join(", ")}` +
                (where
                    ? ` WHERE ${typeof where == "string" ? where : where.join(" AND ")}`
                    : "");
            const result = await this.qry({ qry, items, conn });
            return result && result[0] ? result[0].changedRows : 0;
        };
        this.delete = async ({ from, where, items = [], conn = null }) => {
            const qry = `DELETE FROM ${from} WHERE ${typeof where == "string" ? where : where.join(" AND ")}`;
            const result = await this.qry({ qry, items, conn });
            return result && result[0] ? result[0].affectedRows : 0;
        };
        this.checkString = (value) => {
            return typeof value == "string" ? `'${value}'` : value;
        };
        this._pool = createPool(config);
    }
}

export { Mysql as default };
