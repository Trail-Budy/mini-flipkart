const { Pool } = require('pg');
require('dotenv').config();

// Create a new pool using connection string or individual environment variables
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  // If DATABASE_URL is not provided, pg will automatically try to use:
  // PGHOST, PGPORT, PGDATABASE, PGUSER, PGPASSWORD
});

pool.on('error', (err, client) => {
  console.error('Unexpected error on idle client', err);
  process.exit(-1);
});

module.exports = {
  query: (text, params) => pool.query(text, params),
  pool
};
