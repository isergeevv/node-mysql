import mysql2 from 'mysql2/promise';
import { Database } from '../build/esm/index.js';

const mysql = mysql2.createPool({
  host: '192.168.1.6',
  user: 'root',
  password: '',
  database: 'dbot',
});

const database = new Database(mysql);

const result = await database
  .createTable()
  .table('testtt')
  .ifNotExists()
  .columns(
    { name: 'id', type: 'INT', autoIncrement: true, primaryKey: true },
    { name: 'name', type: 'VARCHAR(64)', notNull: true },
    { name: 'email', type: 'VARCHAR(255)', notNull: true },
  )
  .unique(['name', 'email']);

console.log(result.raw); // true or false

database.close();
