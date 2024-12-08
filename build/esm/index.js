import { escape, createPool } from 'mysql2/promise';

var TABLE_JOIN_TYPE;
(function (TABLE_JOIN_TYPE) {
    TABLE_JOIN_TYPE["NONE"] = "";
    TABLE_JOIN_TYPE["LEFT"] = "LEFT";
    TABLE_JOIN_TYPE["RIGHT"] = "RIGHT";
    TABLE_JOIN_TYPE["INNER"] = "INNER";
    TABLE_JOIN_TYPE["OUTER"] = "OUTER";
})(TABLE_JOIN_TYPE || (TABLE_JOIN_TYPE = {}));
var ORDER_DIRECTION;
(function (ORDER_DIRECTION) {
    ORDER_DIRECTION["ASC"] = "ASC";
    ORDER_DIRECTION["DESC"] = "DESC";
})(ORDER_DIRECTION || (ORDER_DIRECTION = {}));

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
        return escape(values.shift());
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
            (keys.length ? ` SET ${keys.map((key) => `${key} = ${escape(this._set[key])}`).join(', ')}` : '') +
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
    _table;
    _joins;
    _where;
    _startItem;
    _limit;
    _order;
    _extra;
    _items;
    _itemValues;
    constructor(...items) {
        this._table = '';
        this._joins = [];
        this._where = [];
        this._order = [];
        this._extra = '';
        this._itemValues = [];
        this._startItem = 0;
        this._limit = 0;
        this._items = items;
    }
    export() {
        if (!this._table.length) {
            throw new Error('[QrySelectBuilder] Missing table.');
        }
        let qry = `SELECT ${this._items.length ? this._items.join(', ') : '*'} FROM ${this._table}`;
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

class QryTableBuilder {
    static exists(table) {
        return `SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = DATABASE() AND table_name = '${table}';`;
    }
    static create(table) {
        return new QryTableCreateBuilder(table);
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

class MySQL {
    _pool;
    _lastInsertId;
    constructor(config) {
        this._pool = createPool(config);
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
    async getConnection() {
        return await this._pool.getConnection();
    }
    async beginTransaction() {
        const connection = await this.getConnection();
        await connection.beginTransaction();
        return connection;
    }
    async commitTransaction(connection) {
        if (!connection)
            return;
        connection.commit();
        connection.release();
    }
    async rollbackTransaction(connection) {
        if (!connection)
            return;
        connection.rollback();
        connection.release();
    }
    async qry(qry, items = [], conn) {
        try {
            const connection = conn || (await this.getConnection());
            const result = await connection.query(qry, items);
            if (!conn)
                connection.release();
            return new QryResult(result);
        }
        catch (e) {
            throw new Error(`Error: ${e.message}.\nQuery: ${qry}\nItems: ${items.join(', ')}`);
        }
    }
    async select(qry, conn) {
        const sql = typeof qry === 'string'
            ? qry
            : QryBuilder.select(...(qry.select ? (Array.isArray(qry.select) ? qry.select : [qry.select]) : ['*']))
                .from(qry.from)
                .join(...(qry.join ? (Array.isArray(qry.join) ? qry.join : [qry.join]) : []))
                .where(...(qry.where ? (Array.isArray(qry.where) ? qry.where : [qry.where]) : []))
                .extra(qry.extra || '')
                .setItemValues(...(qry.items || []))
                .export();
        return await this.qry(sql, conn);
    }
    async insert(qry, conn) {
        const sql = typeof qry === 'string' ? qry : QryBuilder.insert(qry.items).into(qry.into).export();
        const result = await this.qry(sql, conn);
        const insertId = result.insertId;
        if (insertId)
            this._lastInsertId = insertId;
        return insertId;
    }
    async update(qry, conn) {
        const sql = typeof qry === 'string'
            ? qry
            : QryBuilder.update(qry.table)
                .set(...(Array.isArray(qry.set) ? qry.set : [qry.set]))
                .where(...(qry.where ? (Array.isArray(qry.where) ? qry.where : [qry.where]) : []))
                .setItemValues(...(qry.items || []))
                .export();
        const result = await this.qry(sql, conn);
        return result.affectedRows;
    }
    async delete(qry, conn) {
        const sql = typeof qry === 'string'
            ? qry
            : QryBuilder.delete()
                .from(qry.table)
                .where(...(Array.isArray(qry.where) ? qry.where : [qry.where]))
                .setItemValues(...qry.items)
                .export();
        const result = await this.qry(sql, conn);
        return result.affectedRows;
    }
    checkString(value) {
        return typeof value == 'string' ? `'${value}'` : value;
    }
    close() {
        this._pool.end();
    }
}

export { MySQL, ORDER_DIRECTION, QryBuilder, QryDeleteBuilder, QryInsertBuilder, QrySelectBuilder, QryTableBuilder, QryTableCreateBuilder, QryUpdateBuilder, TABLE_JOIN_TYPE };
