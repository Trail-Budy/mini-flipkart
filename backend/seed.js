const fs = require('fs');
const path = require('path');
const { pool } = require('./db');

async function runSeed() {
  console.log('Connecting to the database...');
  try {
    const sqlPath = path.join(__dirname, 'seed.sql');
    const sql = fs.readFileSync(sqlPath, 'utf8');

    console.log('Executing seed.sql...');
    await pool.query(sql);

    console.log('✅ Database seeded successfully!');
  } catch (error) {
    console.error('❌ Error seeding database:', error.message);
    if (error.code === 'ECONNREFUSED' || error.code === '28P01') {
      console.error('\n--> Please ensure PostgreSQL is running and your .env credentials are correct.');
    }
  } finally {
    await pool.end();
  }
}

runSeed();
