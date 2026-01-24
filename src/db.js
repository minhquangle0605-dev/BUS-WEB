require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT,
});

pool
  .query('SELECT 1')
  .then(() => {
    console.log('DB connected');
  })
  .catch((err) => {
    console.error('DB connection error', err);
  });

module.exports = pool;
