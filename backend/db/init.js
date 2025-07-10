require('dotenv').config({ path: __dirname + '/../.env' });
const fs = require('fs');
const { Pool } = require('pg');

const dbName = process.argv[2]; // Get database name from command line argument

if (!dbName) {
  console.error('Error: Database name not provided as argument.');
  process.exit(1);
}

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: dbName, // Use the provided database name
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

const initScript = fs.readFileSync(__dirname + '/database.sql').toString();

pool.query(initScript)
  .then(() => {
    console.log('Database initialized');
    pool.end();
    process.exit(0);
  })
  .catch(err => {
    console.error(err);
    pool.end();
    process.exit(1);
  });