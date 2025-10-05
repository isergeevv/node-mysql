'use strict';

var promise = require('mysql2/promise');

exports.TABLE_JOIN_TYPE = void 0;
(function (TABLE_JOIN_TYPE) {
    TABLE_JOIN_TYPE["NONE"] = "";
    TABLE_JOIN_TYPE["LEFT"] = "LEFT";
    TABLE_JOIN_TYPE["RIGHT"] = "RIGHT";
    TABLE_JOIN_TYPE["INNER"] = "INNER";
    TABLE_JOIN_TYPE["OUTER"] = "OUTER";
})(exports.TABLE_JOIN_TYPE || (exports.TABLE_JOIN_TYPE = {}));
exports.ORDER_DIRECTION = void 0;
(function (ORDER_DIRECTION) {
    ORDER_DIRECTION["ASC"] = "ASC";
    ORDER_DIRECTION["DESC"] = "DESC";
})(exports.ORDER_DIRECTION || (exports.ORDER_DIRECTION = {}));

const generateParameterizedQuery = (queryString, values = []) => {
    // Parse the query to identify placeholders
    const placeholders = queryString.match(/\?/g);
    if (!placeholders)
        return queryString;
    if (placeholders.length !== values.length) {
        throw new Error('[util->generateParameterizedQuery] Mismatch between placeholders and values.');
    }
    // Prepare the statement with placeholders
    const preparedQuery = queryString.replace(/\?/g, () => {
        // Ensure proper escaping and formatting based on data type
        return promise.escape(values.shift());
    });
    return preparedQuery;
};

class QryDeleteBuilder {
    _table;
    _where;
    _itemValues;
    constructor() {
        this._table = '';
        this._where = [];
        this._itemValues = [];
    }
    export() {
        if (!this._table.length) {
            throw new Error('[QryDeleteBuilder] Missing table.');
        }
        const qry = `DELETE FROM ${this._table}` + (this._where.length ? ` WHERE ${this._where.join(' AND ')}` : '') + ';';
        return generateParameterizedQuery(qry, this._itemValues);
    }
    from = (table) => {
        this._table = table;
        return this;
    };
    where = (...where) => {
        this._where = [...where];
        return this;
    };
    setItemValues = (...items) => {
        this._itemValues = [...items];
        return this;
    };
}

class QryInsertBuilder {
    _table;
    _set;
    constructor(items) {
        this._table = '';
        this._set = items || {};
    }
    export() {
        if (!this._table.length) {
            throw new Error('[QryInsertBuilder] Missing table.');
        }
        const keys = Object.keys(this._set);
        return (`INSERT INTO ${this._table}` +
            (keys.length ? ` SET ${keys.map((key) => `${key} = ${promise.escape(this._set[key])}`).join(', ')}` : '') +
            ';');
    }
    into = (table) => {
        this._table = table;
        return this;
    };
    set = (items) => {
        this._set = items;
        return this;
    };
}

class QrySelectBuilder {
    _items;
    _forUpdate;
    _table;
    _joins;
    _where;
    _startItem;
    _limit;
    _order;
    _extra;
    _itemValues;
    constructor(...items) {
        this._items = items;
        this._forUpdate = false;
        this._table = '';
        this._joins = [];
        this._where = [];
        this._order = [];
        this._extra = '';
        this._itemValues = [];
        this._startItem = 0;
        this._limit = 0;
    }
    forUpdate = () => {
        this._forUpdate = true;
        return this;
    };
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
    order = (...orders) => {
        for (const order of orders) {
            if (!order.columns.length) {
                throw new Error('[QrySelectBuilder] Need to set columns to be ordered by.');
            }
            this._order.push({
                direction: order.direction,
                columns: [...order.columns],
            });
        }
        return this;
    };
    startItem = (startItem) => {
        if (startItem !== 0 && !this._limit) {
            throw new Error('[QrySelectBuilder] Need to set limit before setting startItem.');
        }
        this._startItem = startItem;
        return this;
    };
    extra = (extra) => {
        this._extra = extra;
        return this;
    };
    setItemValues = (...items) => {
        this._itemValues = [...items];
        return this;
    };
    export() {
        if (!this._table.length) {
            throw new Error('[QrySelectBuilder] Missing table.');
        }
        let qry = `SELECT ${this._items.length ? this._items.join(', ') : '*'}`;
        if (this._forUpdate) {
            qry = qry.concat(' FOR UPDATE');
        }
        qry = qry.concat(` FROM ${this._table}`);
        for (const join of this._joins) {
            qry = qry.concat(`${join.type?.length ? ` ${join.type}` : ''} JOIN ${join.join}`);
        }
        if (this._where.length) {
            qry = qry.concat(` WHERE ${this._where.join(' AND ')}`);
        }
        if (this._order.length) {
            qry = qry.concat(` ORDER BY ${this._order.map((order) => `${order.columns.join(', ')} ${order.direction}`).join(',')}`);
        }
        if (this._limit) {
            qry = qry.concat(` LIMIT ${this._startItem}, ${this._limit}`);
        }
        if (this._extra.length) {
            qry = qry.concat(` ${this._extra}`);
        }
        qry = qry.concat(';');
        return generateParameterizedQuery(qry, this._itemValues);
    }
}

class QryTableCreateBuilder {
    _table;
    _columns;
    constructor(table) {
        this._table = table;
        this._columns = [];
    }
    export() {
        if (!this._table.length) {
            throw new Error('[QryTableCreateBuilder] Missing table.');
        }
        return `CREATE TABLE ${this._table} (
      ${this._columns.map((columnData) => {
            let c = '';
            if (!columnData.name) {
                throw new Error(`[QryTableCreateBuilder] Column missing name.`);
            }
            c = c.concat(columnData.name);
            if (!columnData.type) {
                throw new Error(`[QryTableCreateBuilder] Column missing type.`);
            }
            c = c.concat(` ${columnData.type}`);
            if (columnData.isAutoIncrement) {
                c = c.concat(` AUTO_INCREMENT`);
            }
            if (columnData.isPrimary) {
                c = c.concat(` PRIMARY KEY`);
            }
            if (columnData.isUnique) {
                c = c.concat(` UNIQUE`);
            }
            c = c.concat(columnData.isNull ? ` NULL` : ` NOT NULL`);
            if (columnData.default) {
                c = c.concat(` DEFAULT ${columnData.default}`);
            }
            return c;
        })}
    );`;
    }
    columns(columnsData) {
        this._columns = columnsData;
        return this;
    }
}

class QryTableExistsBuilder {
    _table;
    constructor(table) {
        this._table = table;
    }
    export() {
        if (!this._table.length) {
            throw new Error('[QryTableExistsBuilder] Missing table.');
        }
        return `SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = DATABASE() AND table_name = ${promise.escape(this._table)};`;
    }
}

class QryTableBuilder {
    static create(table) {
        return new QryTableCreateBuilder(table);
    }
    static exists(table) {
        return new QryTableExistsBuilder(table);
    }
}

class QryUpdateBuilder {
    _table;
    _where;
    _items;
    _itemValues;
    constructor(table) {
        this._table = table;
        this._where = [];
        this._itemValues = [];
        this._items = [];
    }
    export() {
        if (!this._table.length) {
            throw new Error('[QryUpdateBuilder] Missing table.');
        }
        if (!this._items.length) {
            throw new Error('[QryUpdateBuilder] Missing set items.');
        }
        const qry = `UPDATE ${this._table} SET ${this._items.join(', ')}` +
            (this._where.length ? ` WHERE ${this._where.join(' AND ')}` : '') +
            ';';
        return generateParameterizedQuery(qry, this._itemValues);
    }
    set = (...items) => {
        this._items = items;
        return this;
    };
    where = (...where) => {
        this._where = [...where];
        return this;
    };
    setItemValues = (...items) => {
        this._itemValues = [...items];
        return this;
    };
}

class QryResult {
    _result;
    constructor(result) {
        this._result = result;
    }
    get affectedRows() {
        return this._result[0].affectedRows ?? 0;
    }
    get insertId() {
        return this._result[0].insertId ?? 0;
    }
    get rows() {
        return this._result[0];
    }
    get headers() {
        return this._result[0];
    }
    get fields() {
        return this._result[1];
    }
    get raw() {
        return this._result;
    }
}

class QryBuilder {
    static select(...items) {
        return new QrySelectBuilder(...items);
    }
    static insert(items) {
        return new QryInsertBuilder(items);
    }
    static delete() {
        return new QryDeleteBuilder();
    }
    static update(table) {
        return new QryUpdateBuilder(table);
    }
}

class DatabaseConnection {
    _connection;
    constructor(connection) {
        this._connection = connection;
    }
    get connection() {
        return this._connection;
    }
    [Symbol.dispose]() {
        this.release();
    }
    async beginTransaction() {
        await this._connection.beginTransaction();
    }
    async commitTransaction() {
        await this._connection.commit();
    }
    async rollbackTransaction() {
        await this._connection.rollback();
    }
    async query(qry, items = []) {
        try {
            return this._connection.query(qry, items);
        }
        catch (e) {
            throw new Error(`Error: ${e.message}.\nQuery: ${qry}\nItems: ${items.join(', ')}`);
        }
    }
    async select(qry) {
        const sql = typeof qry === 'string'
            ? qry
            : QryBuilder.select(...(qry.select ? (Array.isArray(qry.select) ? qry.select : [qry.select]) : ['*']))
                .from(qry.from)
                .join(...(qry.join ? (Array.isArray(qry.join) ? qry.join : [qry.join]) : []))
                .where(...(qry.where ? (Array.isArray(qry.where) ? qry.where : [qry.where]) : []))
                .extra(qry.extra || '')
                .setItemValues(...(qry.items || []))
                .export();
        return await this.query(sql);
    }
    async insert(qry) {
        const sql = typeof qry === 'string' ? qry : QryBuilder.insert(qry.items).into(qry.into).export();
        const result = await this.query(sql);
        const insertId = result.insertId;
        return insertId;
    }
    async update(qry) {
        const sql = typeof qry === 'string'
            ? qry
            : QryBuilder.update(qry.table)
                .set(...(Array.isArray(qry.set) ? qry.set : [qry.set]))
                .where(...(qry.where ? (Array.isArray(qry.where) ? qry.where : [qry.where]) : []))
                .setItemValues(...(qry.items || []))
                .export();
        const result = await this.query(sql);
        return result.affectedRows;
    }
    async delete(qry) {
        const sql = typeof qry === 'string'
            ? qry
            : QryBuilder.delete()
                .from(qry.table)
                .where(...(Array.isArray(qry.where) ? qry.where : [qry.where]))
                .setItemValues(...qry.items)
                .export();
        const result = await this.query(sql);
        return result.affectedRows;
    }
    release() {
        this._connection.release();
    }
}

class Database {
    _pool;
    constructor(mysqlPool) {
        this._pool = mysqlPool;
    }
    [Symbol.dispose]() {
        this.close();
    }
    get pool() {
        return this._pool;
    }
    async getConnection() {
        return new DatabaseConnection(await this._pool.getConnection());
    }
    async beginTransaction() {
        const connection = await this.getConnection();
        await connection.beginTransaction();
        return connection;
    }
    async query(qry, items = []) {
        const connection = await this.getConnection();
        const result = await connection.query(qry, items);
        connection.release();
        return new QryResult(result);
    }
    async select(qry) {
        const connection = await this.getConnection();
        const result = await connection.select(qry);
        connection.release();
        return result;
    }
    async insert(qry) {
        const connection = await this.getConnection();
        const result = await connection.insert(qry);
        connection.release();
        return result;
    }
    async update(qry) {
        const connection = await this.getConnection();
        const result = await connection.update(qry);
        connection.release();
        return result;
    }
    async delete(qry) {
        const connection = await this.getConnection();
        const result = await connection.delete(qry);
        connection.release();
        return result;
    }
    close() {
        this._pool.end();
    }
}

exports.Database = Database;
exports.QryBuilder = QryBuilder;
exports.QryDeleteBuilder = QryDeleteBuilder;
exports.QryInsertBuilder = QryInsertBuilder;
exports.QrySelectBuilder = QrySelectBuilder;
exports.QryTableBuilder = QryTableBuilder;
exports.QryTableCreateBuilder = QryTableCreateBuilder;
exports.QryUpdateBuilder = QryUpdateBuilder;
