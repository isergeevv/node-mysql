'use strict';

var promise = require('mysql2/promise');

exports.QRY_TYPES = void 0;
(function (QRY_TYPES) {
    QRY_TYPES[QRY_TYPES["INSERT"] = 0] = "INSERT";
    QRY_TYPES[QRY_TYPES["SELECT"] = 1] = "SELECT";
    QRY_TYPES[QRY_TYPES["DELETE"] = 2] = "DELETE";
    QRY_TYPES[QRY_TYPES["UPDATE"] = 3] = "UPDATE";
})(exports.QRY_TYPES || (exports.QRY_TYPES = {}));

class QryBuilder {
    _type;
    _table;
    _set;
    _joins;
    _where;
    _startItem;
    _limit;
    _extra;
    _items;
    _itemValues;
    constructor(type) {
        this._type = type;
        this._table = '';
        this._joins = [];
        this._where = [];
        this._extra = '';
        this._itemValues = [];
        this._startItem = 0;
        this._limit = 0;
        this._set = {};
        this._items = [];
    }
    static select = (...items) => {
        const qryBuilder = new QryBuilder(exports.QRY_TYPES.SELECT);
        qryBuilder.setItems(...items);
        return qryBuilder;
    };
    static insert = (items) => {
        const qryBuilder = new QryBuilder(exports.QRY_TYPES.INSERT);
        if (items)
            qryBuilder.set(items);
        return qryBuilder;
    };
    export() {
        if (!this._table.length) {
            throw new Error('[QryBuilder] Missing table.');
        }
        let qry = '';
        switch (this._type) {
            case exports.QRY_TYPES.SELECT: {
                qry = qry.concat(`SELECT ${this._items.length ? this._items.join(', ') : '*'} FROM ${this._table}`);
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
                break;
            }
            case exports.QRY_TYPES.INSERT: {
                qry = qry.concat(`INSERT INTO ${this._table}`);
                const keys = Object.keys(this._set);
                if (keys.length) {
                    qry = qry.concat(` SET ${keys.map((key) => `${key} = ${promise.escape(this._set[key])}`).join(', ')}`);
                }
                break;
            }
        }
        qry = qry.concat(';');
        for (const item of this._itemValues) {
            qry = qry.replace(' = ?', ` = ${promise.escape(item)}`);
        }
        return qry;
    }
    from = (table) => {
        this._table = table;
        return this;
    };
    into = (table) => {
        this._table = table;
        return this;
    };
    set = (items) => {
        this._set = items;
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
        if (startItem !== 0 && !this._limit) {
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
    setItemValues = (...items) => {
        this._itemValues = [...items];
        return this;
    };
}

class MySQL {
    _pool;
    _lastInsertId;
    constructor(config) {
        this._pool = promise.createPool(config);
        this._lastInsertId = 0;
    }
    [Symbol.dispose]() {
        this.close();
    }
    get pool() {
        return this._pool;
    }
    get lastInsertId() {
        return this._lastInsertId;
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
            .setItemValues(...items)
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
        this._lastInsertId = result && result[0] ? result[0].insertId : 0;
        return this._lastInsertId;
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
