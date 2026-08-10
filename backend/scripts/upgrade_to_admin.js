const { pool } = require('../db');

async function run() {
  console.log('Connecting to the database to upgrade account to admin...');
  try {
    const result = await pool.query(
      "UPDATE users SET role = 'admin' WHERE email = 'aadil@gmail.com' RETURNING id, name, email, role"
    );
    
    if (result.rows.length > 0) {
      console.log('✅ Account successfully upgraded to admin!');
      console.log(result.rows[0]);
    } else {
      console.log('❌ Could not find account with email aadil@gmail.com');
    }
  } catch (error) {
    console.error('❌ Error upgrading account:', error.message);
  } finally {
    await pool.end();
  }
}

run();
