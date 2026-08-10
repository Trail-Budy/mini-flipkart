const { pool } = require('../db');

async function run() {
  console.log('Connecting to the database to add users table...');
  try {
    const sql = `
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        email VARCHAR(255) NOT NULL UNIQUE,
        password_hash VARCHAR(255) NOT NULL,
        role VARCHAR(20) DEFAULT 'customer' CHECK (role IN ('customer', 'seller', 'admin')),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `;
    
    await pool.query(sql);
    console.log('✅ Users table created successfully (if it didn\'t already exist).');
  } catch (error) {
    console.error('❌ Error creating users table:', error.message);
  } finally {
    await pool.end();
  }
}

run();
