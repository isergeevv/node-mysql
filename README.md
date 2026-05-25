# @isergeevv/node-mysql

TypeScript-friendly MySQL helpers built on [mysql2](https://github.com/sidorares/node-mysql2). Wrap a `mysql2/promise` pool with a fluent query builder, typed results, transactions, and optional `using` disposal.

## Features

- **Fluent builders** for `SELECT`, `INSERT`, `UPDATE`, `DELETE`, `CREATE TABLE`, and table-exists checks
- **Parameterized queries** via `?` placeholders and `setParams()` / `generateParameterizedQuery()`
- **Typed results** — `rows`, `fields`, `affectedRows`, `insertId`, `exists`, and raw mysql2 tuples
- **Pool and connection APIs** — run on the pool or inside a transaction on a dedicated connection
- **Dual module format** — ESM (`import`) and CommonJS (`require`) with TypeScript declarations
- **Explicit disposal** — `Symbol.dispose` on `Database` and `DatabaseConnection` (Node 20+ `using`)

## Requirements

- Node.js 18+ (20+ recommended for `using` disposal)
- [mysql2](https://www.npmjs.com/package/mysql2) `^3.6.0` (peer dependency — install in your app)

## Installation

This package is published to **GitHub Packages** under the `@isergeevv` scope.

1. Create or update `.npmrc` in your project (or user config):

```ini
@isergeevv:registry=https://npm.pkg.github.com
//npm.pkg.github.com/:_authToken=YOUR_GITHUB_TOKEN
```

The token needs the `read:packages` scope (and `repo` if the package is private).

2. Install dependencies:

```bash
npm install @isergeevv/node-mysql mysql2
```

## Quick start

```ts
import mysql from 'mysql2/promise';
import { Database, AND, ORDER_DIRECTION } from '@isergeevv/node-mysql';

const pool = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'myapp',
});

const db = new Database(pool);

const users = await db
  .select()
  .from('users')
  .items('id', 'name')
  .where('id = ?')
  .setParams(1);

console.log(users.rows);

await db.close();
```

### ESM and CommonJS

```ts
// ESM
import { Database } from '@isergeevv/node-mysql';
```

```js
// CommonJS
const { Database } = require('@isergeevv/node-mysql');
```

## Core API

### `Database`

Construct with an existing `mysql2/promise` `Pool`:

```ts
const db = new Database(pool);
```

| Method | Description |
|--------|-------------|
| `getConnection()` | Checkout a `DatabaseConnection` from the pool |
| `beginTransaction()` | Get a connection with an open transaction |
| `query(sql, items?)` | Run raw SQL on a short-lived connection |
| `select()` / `insert()` / `update()` / `delete()` / `createTable()` / `tableExists()` | Start a fluent query (optional `import()` props) |
| `escape(value)` | Delegate to pool escaping |
| `generateParameterizedQuery(sql, values)` | Replace `?` with escaped values |
| `close()` | End the pool (`pool.end()`) |

Access the underlying pool via `db.pool`.

### `DatabaseConnection`

Use for transactions and multi-statement work on one connection:

```ts
const conn = await db.beginTransaction();

try {
  await conn.update().table('accounts').set('balance = balance - ?').where('id = ?').setParams(100, 1);
  await conn.update().table('accounts').set('balance = balance + ?').where('id = ?').setParams(100, 2);
  await conn.commitTransaction();
} catch (err) {
  await conn.rollbackTransaction();
  throw err;
} finally {
  conn.release();
}
```

| Method | Description |
|--------|-------------|
| `beginTransaction()` / `commitTransaction()` / `rollbackTransaction()` | Transaction control |
| `release()` | Return connection to the pool |
| Same query builders and `query()` as `Database` | Executed on this connection |

### Explicit disposal (`using`)

```ts
{
  using db = new Database(pool);
  const row = await db.select().from('users').items('id').where('id = ?').setParams(1);
  // pool.end() called when block exits
}
```

## Query builders

All builders support:

- **Chaining** — configure with method calls
- **`import(partialProps)`** — set options from a props object
- **`export()`** — return the final SQL string (after parameter substitution)
- **`execute()`** — run the query and return a typed result
- **`await builder`** — same as `execute()` (thenable)

### SELECT

```ts
import { AND, OR, ORDER_DIRECTION, TABLE_JOIN_TYPE } from '@isergeevv/node-mysql';

// Fluent
const result = await db
  .select()
  .from('users')
  .items('id', 'name')
  .where(AND('id = ?', 'active = ?'))
  .setParams(1, 1)
  .order({ direction: ORDER_DIRECTION.DESC, columns: ['id'] })
  .limit(10)
  .startItem(0);

// Or props object
const result2 = await db.select({
  table: 'users',
  items: ['id', 'name'],
  where: 'id = ?',
  params: [1],
});
```

| Method | Description |
|--------|-------------|
| `from(table)` | `FROM` table |
| `items(...columns)` | Column list (`*` if empty) |
| `forUpdate()` | Append `FOR UPDATE` |
| `join(...joins)` | `{ type?: TABLE_JOIN_TYPE, join: 'other ON ...' }` |
| `where(condition)` | `WHERE` clause (use `AND()` / `OR()` for grouping) |
| `order({ direction, columns })` | `ORDER BY` (repeatable) |
| `limit(n)` / `startItem(offset)` | `LIMIT offset, count` |
| `extra(sql)` | Append raw SQL before `;` |
| `setParams(...values)` | Bind `?` in `where` / `extra` |

Result: **`ISelectResult`** — `rows`, `fields`, `raw`.

### INSERT

```ts
const result = await db
  .insert()
  .into('users')
  .items({ name: 'Ada', email: 'ada@example.com' });
```

Values are escaped via the connection. Result: **`IInsertResult`** — `insertId`, `raw`.

### UPDATE

```ts
const result = await db
  .update()
  .table('users')
  .set('name = ?', 'updated_at = NOW()')
  .where('id = ?')
  .setParams('Ada', 1);
```

Result: **`IUpdateResult`** — `affectedRows`, `raw`.

### DELETE

```ts
const result = await db
  .delete()
  .from('users')
  .where('id = ?')
  .setParams(1);
```

Result: **`IDeleteResult`** — `affectedRows`, `raw`.

### CREATE TABLE

```ts
await db
  .createTable()
  .table('users')
  .ifNotExists()
  .columns(
    { name: 'id', type: 'INT', isAutoIncrement: true, isPrimary: true, isNull: false },
    { name: 'email', type: 'VARCHAR(255)', isNull: false, isUnique: true },
  )
  .unique(['email'])
  .constraint('email_format', "email LIKE '%@%'");
```

Column options: `name`, `type`, `isAutoIncrement`, `isPrimary`, `isUnique`, `isNull`, `default`.

Result: **`ICreateTableResult`** — `raw`.

### Table exists

```ts
const result = await db.tableExists().table('users');
// or
const result2 = await db.tableExists({ table: 'users' });

console.log(result.exists); // boolean
```

Checks `information_schema.tables` for the current database.

## Utilities

```ts
import { AND, OR } from '@isergeevv/node-mysql';

AND('a = ?', 'b = ?'); // (a = ? AND b = ?)
OR('a = ?', 'b = ?');  // (a = ? OR b = ?)
```

## Raw queries

```ts
const result = await db.query('SELECT 1 AS n');
console.log(result.rows);
```

On failure, errors include the query text and bound items for easier debugging.

## TypeScript

Types and interfaces are exported from the package entry:

- `Database`, `DatabaseConnection`
- `ORDER_DIRECTION`, `TABLE_JOIN_TYPE`
- `SelectProps`, `InsertProps`, `UpdateProps`, `DeleteProps`, `CreateTableProps`, `TableExistsProps`
- `IDatabase`, `IDatabaseConnection`, `ISelectQuery`, `IResult`, and related interfaces

Point `tsconfig` `moduleResolution` at `node16` / `nodenext` (or bundler) so `exports` in `package.json` resolve correctly.

## Development

From a clone of the repository:

```bash
npm install
npm run build
npm test
```

Published artifacts include only the `build/` output (see `.npmignore`).

## License

[MIT](LICENSE)

## Links

- [Repository](https://github.com/isergeevv/node-mysql)
- [Issues](https://github.com/isergeevv/node-mysql/issues)
