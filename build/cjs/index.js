'use strict';

var promise = require('mysql2/promise');

class QryBuilder {
    _statement;
    _table;
    _joins;
    _where;
    _startItem;
    _limit;
    _extra;
    _items;
    constructor(start) {
        this._statement = start;
        this._table = '';
        this._joins = [];
        this._where = [];
        this._extra = '';
        this._items = [];
        this._startItem = 0;
        this._limit = 0;
    }
    static select = (...items) => {
        return new QryBuilder(`SELECT ${items.length ? items.join(', ') : '*'}`);
    };
    export() {
        let qry = this._statement;
        if (this._table.length) {
            qry = qry.concat(` FROM ${this._table}`);
        }
        for (const join of this._joins) {
            qry = qry.concat(`${join.type?.length ? ` ${join.type}` : ''} JOIN ${join.join}`);
        }
        if (this._where.length) {
            qry = qry.concat(` WHERE ${this._where.join(' AND ')}`);
        }
        if (this._limit) {
            qry = qry.concat(` LIMIT ${this._startItem}, ${this._limit}`);
        }
        if (this._extra) {
            qry = qry.concat(` ${this._extra}`);
        }
        qry = qry.concat(';');
        for (const item of this._items) {
            qry = qry.replace('?', promise.escape(item));
        }
        return qry;
    }
    from = (table) => {
        this._table = table;
        return this;
    };
    join = (...joins) => {
        this._joins.push(...joins);
        return this;
    };
    where = (...where) => {
        this._where = [...where];
        return this;
    };
    limit = (limit) => {
        this._limit = limit;
        return this;
    };
    startItem = (startItem) => {
        if (!this._limit) {
            throw new Error('[QryBuilder] Need to set limit before setting startItem.');
        }
        this._startItem = startItem;
        return this;
    };
    extra = (extra) => {
        this._extra = extra;
        return this;
    };
    setItems = (...items) => {
        this._items = [...items];
        return this;
    };
}

class MySQL {
    _pool;
    constructor(config) {
        this._pool = promise.createPool(config);
    }
    [Symbol.dispose]() {
        this.close();
    }
    get pool() {
        return this._pool;
    }
    getConnection = async () => {
        return await this._pool.getConnection();
    };
    beginTransaction = async () => {
        const connection = await this.getConnection();
        await connection.beginTransaction();
        return connection;
    };
    commitTransaction = async (connection) => {
        if (!connection)
            return;
        connection.commit();
        connection.release();
    };
    rollbackTransaction = async (connection) => {
        if (!connection)
            return;
        connection.rollback();
        connection.release();
    };
    qry = async ({ qry, items = [], conn = null }) => {
        try {
            const connection = conn || (await this.getConnection());
            const result = await connection.query(qry, items);
            if (!conn)
                connection.release();
            return result;
        }
        catch (e) {
            throw new Error(`Error: ${e.message}.\nQuery: ${qry}\nItems: ${items.join(', ')}`);
        }
    };
    select = async ({ select = '*', from, join = [], where = '', extra = '', items = [], conn = null }) => {
        const qry = QryBuilder.select(select)
            .from(from)
            .join(...(Array.isArray(join) ? join : [join]))
            .where(...(Array.isArray(where) ? where : [where]))
            .extra(extra)
            .setItems(...items)
            .export();
        const result = await this.qry({ qry, items, conn });
        return {
            rows: result[0],
            fields: result[1],
        };
    };
    insert = async ({ into, items, conn = null }) => {
        const qry = `INSERT INTO ${into} SET ?`;
        const result = await this.qry({ qry, items, conn });
        return result && result[0] ? result[0].insertId : null;
    };
    update = async ({ update, set, where = null, items = [], conn = null }) => {
        const qry = `UPDATE ${update} SET ${typeof set == 'string' ? set : set.join(', ')}` +
            (where ? ` WHERE ${typeof where == 'string' ? where : where.join(' AND ')}` : '');
        const result = await this.qry({ qry, items, conn });
        return result && result[0] ? result[0].affectedRows : 0;
    };
    delete = async ({ from, where, items = [], conn = null }) => {
        const qry = `DELETE FROM ${from} WHERE ${typeof where == 'string' ? where : where.join(' AND ')}`;
        const result = await this.qry({ qry, items, conn });
        return result && result[0] ? result[0].affectedRows : 0;
    };
    checkString = (value) => {
        return typeof value == 'string' ? `'${value}'` : value;
    };
    close = () => {
        this._pool.end();
    };
}

exports.MySQL = MySQL;
exports.QryBuilder = QryBuilder;
