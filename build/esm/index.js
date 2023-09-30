import { escape, createPool } from 'mysql2/promise';

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

class QrySelectBuilder {
    _table;
    _joins;
    _where;
    _startItem;
    _limit;
    _extra;
    _items;
    _itemValues;
    constructor(...items) {
        this._table = '';
        this._joins = [];
        this._where = [];
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
        if (this._limit) {
            qry = qry.concat(` LIMIT ${this._startItem}, ${this._limit}`);
        }
        if (this._extra) {
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
    static select = (...items) => {
        return new QrySelectBuilder(...items);
    };
    static insert = (items) => {
        return new QryInsertBuilder(items);
    };
    static delete = () => {
        return new QryDeleteBuilder();
    };
    static update = (table) => {
        return new QryUpdateBuilder(table);
    };
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
    qry = async ({ qry, items = [], conn }) => {
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
    select = async ({ qry, select = '*', from, join = [], where = [], extra = '', items = [], conn }) => {
        if (!qry)
            qry = QryBuilder.select(select)
                .from(from)
                .join(...(Array.isArray(join) ? join : [join]))
                .where(...(Array.isArray(where) ? where : [where]))
                .extra(extra)
                .setItemValues(...items)
                .export();
        const result = await this.qry({ qry, conn });
        return {
            rows: result[0],
            fields: result[1],
        };
    };
    insert = async ({ qry, into, items, conn }) => {
        if (!qry)
            qry = QryBuilder.insert(items).into(into).export();
        const result = await this.qry({ qry, conn });
        const insertId = result && result[0] ? result[0].insertId : 0;
        if (insertId)
            this._lastInsertId = insertId;
        return insertId;
    };
    update = async ({ qry, table, set, where = [], items = [], conn }) => {
        if (!qry)
            qry = QryBuilder.update(table)
                .set(...(Array.isArray(set) ? set : [set]))
                .where(...(Array.isArray(where) ? where : [where]))
                .setItemValues(...items)
                .export();
        const result = await this.qry({ qry, conn });
        return result && result[0] ? result[0].affectedRows : 0;
    };
    delete = async ({ qry, table, where, items = [], conn }) => {
        if (!qry)
            qry = QryBuilder.delete()
                .from(table)
                .where(...(Array.isArray(where) ? where : [where]))
                .setItemValues(...items)
                .export();
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

export { MySQL, QryBuilder };
