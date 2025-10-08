import mysql2 from 'mysql2/promise';
import { Database } from '../build/esm/index.js';

const mysql = mysql2.createPool({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'dbot',
});

const database = new Database(mysql);

// const result = await database.tableExists().table('users');
const result = await database.tableExists({ table: 'users' });

console.log(result.exists); // true or false

database.close();
