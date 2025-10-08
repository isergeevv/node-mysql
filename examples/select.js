import mysql2 from 'mysql2/promise';
import { Database, AND } from '../build/esm/index.js';

const mysql = mysql2.createPool({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'dbot',
});

const database = new Database(mysql);

// const result = await database.select().from('users').items('id', 'name').where('id = ?').setParams(1);
// const result = await database.select({ table: 'users', items: ['id', 'name'], where: 'id = ?', params: [1] });
// const result = await database.select({ table: 'users', items: ['id', 'name'], where: `id = ${database.escape(1)}` });
const result = await database.select({
  table: 'users',
  items: ['id', 'name'],
  where: AND('id = ?', 'name = ?'),
  params: [1, 'username'],
});

console.log(result.rows); // [ { id: 1, name: 'username' } ]

database.close();
