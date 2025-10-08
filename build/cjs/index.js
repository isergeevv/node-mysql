'use strict';

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

class Result {
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

class SelectResult {
    _result;
    constructor(result) {
        this._result = result;
    }
    get rows() {
        return this._result[0];
    }
    get fields() {
        return this._result[1];
    }
    get raw() {
        return this._result;
    }
}

class InsertResult {
    _result;
    constructor(result) {
        this._result = result;
    }
    get insertId() {
        return this._result[0].insertId ?? 0;
    }
    get raw() {
        return this._result;
    }
}

class UpdateResult {
    _result;
    constructor(result) {
        this._result = result;
    }
    get affectedRows() {
        return this._result[0].affectedRows ?? 0;
    }
    get raw() {
        return this._result;
    }
}

class DeleteResult {
    _result;
    constructor(result) {
        this._result = result;
    }
    get affectedRows() {
        return this._result[0].affectedRows ?? 0;
    }
    get raw() {
        return this._result;
    }
}

class DeleteQuery {
    _connection;
    _props;
    constructor(connection) {
        this._connection = connection;
        this._props = {
            table: '',
            where: '',
            params: [],
        };
    }
    from(table) {
        this._props.table = table;
        return this;
    }
    where(where) {
        this._props.where = where;
        return this;
    }
    setParams(...params) {
        this._props.params = params;
        return this;
    }
    import(qryProps) {
        this._props = { ...this._props, ...qryProps };
        return this;
    }
    export() {
        if (!this._props.table.length) {
            throw new Error('[DeleteQuery] Missing table.');
        }
        const qry = `DELETE FROM ${this._props.table}` + (this._props.where.length ? ` WHERE ${this._props.where}` : '') + ';';
        return this._connection.generateParameterizedQuery(qry, this._props.params);
    }
    async execute() {
        const qryResult = await this._connection.query(this.export());
        return new DeleteResult(qryResult.raw);
    }
    async then(onfulfilled, onrejected) {
        return this.execute().then(onfulfilled, onrejected);
    }
}

class InsertQuery {
    _connection;
    _props;
    constructor(connection) {
        this._connection = connection;
        this._props = {
            table: '',
            items: {},
        };
    }
    into(table) {
        this._props.table = table;
        return this;
    }
    items(items) {
        this._props.items = items;
        return this;
    }
    import(qryProps) {
        this._props = { ...this._props, ...qryProps };
        return this;
    }
    export() {
        if (!this._props.table.length) {
            throw new Error('[InsertQuery] Missing table.');
        }
        const keys = Object.keys(this._props.items);
        return (`INSERT INTO ${this._props.table}` +
            (keys.length
                ? ` SET ${keys.map((key) => `${key} = ${this._connection.escape(this._props.items[key])}`).join(', ')}`
                : '') +
            ';');
    }
    async execute() {
        const qryResult = await this._connection.query(this.export());
        return new InsertResult(qryResult.raw);
    }
    async then(onfulfilled, onrejected) {
        return this.execute().then(onfulfilled, onrejected);
    }
}

class SelectQuery {
    _connection;
    _props;
    constructor(connection) {
        this._connection = connection;
        this._props = {
            items: [],
            forUpdate: false,
            table: '',
            joins: [],
            where: '',
            limit: 0,
            order: [],
            startItem: 0,
            extra: '',
            params: [],
        };
    }
    items(...items) {
        this._props.items = items;
        return this;
    }
    forUpdate() {
        this._props.forUpdate = true;
        return this;
    }
    from(table) {
        this._props.table = table;
        return this;
    }
    join(...joins) {
        this._props.joins.push(...joins);
        return this;
    }
    where(where) {
        this._props.where = where;
        return this;
    }
    limit(limit) {
        this._props.limit = limit;
        return this;
    }
    order(...orders) {
        for (const order of orders) {
            if (!order.columns.length) {
                throw new Error('[SelectQuery] Need to set columns to be ordered by.');
            }
            this._props.order.push(order);
        }
        return this;
    }
    startItem(startItem) {
        if (startItem !== 0 && this._props.limit === 0) {
            throw new Error('[SelectQuery] Need to set limit before setting startItem.');
        }
        this._props.startItem = startItem;
        return this;
    }
    extra(extra) {
        this._props.extra = extra;
        return this;
    }
    setParams(...items) {
        this._props.params = items;
        return this;
    }
    import(qryProps) {
        this._props = { ...this._props, ...qryProps };
        return this;
    }
    export() {
        if (this._props.table.length === 0) {
            throw new Error('[SelectQuery] Missing table.');
        }
        let qry = `SELECT ${this._props.items.length > 0 ? this._props.items.join(', ') : '*'}`;
        if (this._props.forUpdate) {
            qry = qry.concat(' FOR UPDATE');
        }
        qry = qry.concat(` FROM ${this._props.table}`);
        for (const join of this._props.joins) {
            qry = qry.concat(`${join.type?.length ? ` ${join.type}` : ''} JOIN ${join.join}`);
        }
        if (this._props.where.length) {
            qry = qry.concat(` WHERE ${this._props.where}`);
        }
        if (this._props.order.length) {
            qry = qry.concat(` ORDER BY ${this._props.order.map((order) => `${order.columns.join(', ')} ${order.direction}`).join(',')}`);
        }
        if (this._props.limit) {
            qry = qry.concat(` LIMIT ${this._props.startItem}, ${this._props.limit}`);
        }
        if (this._props.extra.length > 0) {
            qry = qry.concat(` ${this._props.extra}`);
        }
        qry = qry.concat(';');
        return this._connection.generateParameterizedQuery(qry, this._props.params);
    }
    async execute() {
        const qryResult = await this._connection.query(this.export());
        return new SelectResult(qryResult.raw);
    }
    async then(onfulfilled, onrejected) {
        return this.execute().then(onfulfilled, onrejected);
    }
}

class UpdateQuery {
    _connection;
    _props;
    constructor(connection) {
        this._connection = connection;
        this._props = {
            table: '',
            items: [],
            where: '',
            params: [],
        };
    }
    table(table) {
        this._props.table = table;
        return this;
    }
    set(...items) {
        this._props.items.push(...items);
        return this;
    }
    where(where) {
        this._props.where = where;
        return this;
    }
    setParams(...params) {
        this._props.params = params;
        return this;
    }
    import(qryProps) {
        this._props = { ...this._props, ...qryProps };
        return this;
    }
    export() {
        if (!this._props.table.length) {
            throw new Error('[UpdateQuery] Missing table.');
        }
        if (!this._props.items.length) {
            throw new Error('[UpdateQuery] Missing set items.');
        }
        const qry = `UPDATE ${this._props.table} SET ${this._props.items.join(', ')}` +
            (this._props.where.length ? ` WHERE ${this._props.where}` : '') +
            ';';
        return this._connection.generateParameterizedQuery(qry, this._props.params);
    }
    async execute() {
        const qryResult = await this._connection.query(this.export());
        return new UpdateResult(qryResult.raw);
    }
    async then(onfulfilled, onrejected) {
        return this.execute().then(onfulfilled, onrejected);
    }
}

class TableExistsResult {
    _result;
    constructor(result) {
        this._result = result;
    }
    get exists() {
        const rows = this._result[0];
        return rows.length > 0 && rows[0]['COUNT(*)'] === 1;
    }
    get raw() {
        return this._result;
    }
}

class TableExistsQuery {
    _connection;
    _props;
    constructor(connection) {
        this._connection = connection;
        this._props = {
            table: '',
        };
    }
    table(table) {
        this._props.table = table;
        return this;
    }
    import(props) {
        this._props = { ...this._props, ...props };
        return this;
    }
    export() {
        if (!this._props.table.length) {
            throw new Error('[TableExistsQuery] Missing table.');
        }
        return `SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = DATABASE() AND table_name = ${this._connection.escape(this._props.table)};`;
    }
    async execute() {
        const qryResult = await this._connection.query(this.export());
        return new TableExistsResult(qryResult.raw);
    }
    async then(onfulfilled, onrejected) {
        return this.execute().then(onfulfilled, onrejected);
    }
}

class CreateTableResult {
    _result;
    constructor(result) {
        this._result = result;
    }
    get raw() {
        return this._result;
    }
}

class CreateTableQuery {
    _connection;
    _props;
    constructor(connection) {
        this._connection = connection;
        this._props = {
            table: '',
            columns: [],
            ifNotExists: false,
        };
    }
    table(table) {
        this._props.table = table;
        return this;
    }
    columns(...columns) {
        this._props.columns.push(...columns);
        return this;
    }
    ifNotExists(ifNotExists = true) {
        this._props.ifNotExists = ifNotExists;
        return this;
    }
    import(qryProps) {
        this._props = { ...this._props, ...qryProps };
        return this;
    }
    export() {
        if (!this._props.table.length) {
            throw new Error('[CreateTableQuery] Missing table.');
        }
        let qry = `CREATE TABLE ${this._props.table}`;
        if (this._props.ifNotExists) {
            qry = qry.concat(' IF NOT EXISTS');
        }
        qry = qry.concat(` (
      ${this._props.columns.map((columnData) => {
            let c = '';
            if (!columnData.name) {
                throw new Error(`[CreateTableQuery] Column missing name.`);
            }
            c = c.concat(columnData.name);
            if (!columnData.type) {
                throw new Error(`[CreateTableQuery] Column missing type.`);
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
    );`);
        return qry;
    }
    async execute() {
        const qryResult = await this._connection.query(this.export());
        return new CreateTableResult(qryResult.raw);
    }
    async then(onfulfilled, onrejected) {
        return this.execute().then(onfulfilled, onrejected);
    }
}

const AND = (a, b) => `(${a} AND ${b})`;
const OR = (a, b) => `(${a} OR ${b})`;

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
            return new Result(await this._connection.query(qry, items));
        }
        catch (e) {
            throw new Error(`Error: ${e.message}.\nQuery: ${qry}\nItems: ${items.join(', ')}`);
        }
    }
    select(qryProps) {
        const selectQuery = new SelectQuery(this);
        if (qryProps) {
            selectQuery.import(qryProps);
        }
        return selectQuery;
    }
    insert(qryProps) {
        const insertQuery = new InsertQuery(this);
        if (qryProps) {
            insertQuery.import(qryProps);
        }
        return insertQuery;
    }
    update(qryProps) {
        const updateQuery = new UpdateQuery(this);
        if (qryProps) {
            updateQuery.import(qryProps);
        }
        return updateQuery;
    }
    delete(qryProps) {
        const deleteQuery = new DeleteQuery(this);
        if (qryProps) {
            deleteQuery.import(qryProps);
        }
        return deleteQuery;
    }
    createTable(qryProps) {
        const createTableQuery = new CreateTableQuery(this);
        if (qryProps) {
            createTableQuery.import(qryProps);
        }
        return createTableQuery;
    }
    tableExists(qryProps) {
        const tableExistsQuery = new TableExistsQuery(this);
        if (qryProps) {
            tableExistsQuery.import(qryProps);
        }
        return tableExistsQuery;
    }
    escape(value) {
        return this._connection.escape(value);
    }
    generateParameterizedQuery(queryString, values = []) {
        const placeholders = queryString.match(/\?/g);
        if (!placeholders)
            return queryString;
        if (placeholders.length !== values.length) {
            throw new Error('[util->generateParameterizedQuery] Mismatch between placeholders and values.');
        }
        // Prepare the statement with placeholders
        const preparedQuery = queryString.replace(/\?/g, () => {
            // Ensure proper escaping and formatting based on data type
            return this.escape(values.shift());
        });
        return preparedQuery;
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
        return result;
    }
    select(qryProps) {
        const selectQuery = new SelectQuery(this);
        if (qryProps) {
            selectQuery.import(qryProps);
        }
        return selectQuery;
    }
    insert(qryProps) {
        const insertQuery = new InsertQuery(this);
        if (qryProps) {
            insertQuery.import(qryProps);
        }
        return insertQuery;
    }
    update(qryProps) {
        const updateQuery = new UpdateQuery(this);
        if (qryProps) {
            updateQuery.import(qryProps);
        }
        return updateQuery;
    }
    delete(qryProps) {
        const deleteQuery = new DeleteQuery(this);
        if (qryProps) {
            deleteQuery.import(qryProps);
        }
        return deleteQuery;
    }
    createTable(qryProps) {
        const createTableQuery = new CreateTableQuery(this);
        if (qryProps) {
            createTableQuery.import(qryProps);
        }
        return createTableQuery;
    }
    tableExists(qryProps) {
        const tableExistsQuery = new TableExistsQuery(this);
        if (qryProps) {
            tableExistsQuery.import(qryProps);
        }
        return tableExistsQuery;
    }
    escape(value) {
        return this._pool.escape(value);
    }
    generateParameterizedQuery(queryString, values = []) {
        const placeholders = queryString.match(/\?/g);
        if (!placeholders)
            return queryString;
        if (placeholders.length !== values.length) {
            throw new Error('[util->generateParameterizedQuery] Mismatch between placeholders and values.');
        }
        // Prepare the statement with placeholders
        const preparedQuery = queryString.replace(/\?/g, () => {
            // Ensure proper escaping and formatting based on data type
            return this.escape(values.shift());
        });
        return preparedQuery;
    }
    close() {
        this._pool.end();
    }
}

exports.AND = AND;
exports.CreateTableQuery = CreateTableQuery;
exports.Database = Database;
exports.DatabaseConnection = DatabaseConnection;
exports.DeleteQuery = DeleteQuery;
exports.DeleteResult = DeleteResult;
exports.InsertQuery = InsertQuery;
exports.InsertResult = InsertResult;
exports.OR = OR;
exports.Result = Result;
exports.SelectQuery = SelectQuery;
exports.SelectResult = SelectResult;
exports.TableExistsQuery = TableExistsQuery;
exports.UpdateQuery = UpdateQuery;
exports.UpdateResult = UpdateResult;
