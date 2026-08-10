require('dotenv').config();
const { pool } = require('../db');

async function migrateProducts() {
  console.log('Migrating products table to add seller_id...');
  try {
    // 1. Add column if it doesn't exist
    await pool.query(`
      ALTER TABLE products 
      ADD COLUMN IF NOT EXISTS seller_id INTEGER REFERENCES users(id) ON DELETE SET NULL;
    `);
    console.log('✅ Added seller_id column to products table.');

    // 2. Find the default user (aadil@gmail.com)
    const userRes = await pool.query("SELECT id FROM users WHERE email = 'aadil@gmail.com'");
    
    if (userRes.rows.length > 0) {
      const defaultUserId = userRes.rows[0].id;
      
      // 3. Make them a seller (or admin, I'll make them 'seller' for this test)
      await pool.query("UPDATE users SET role = 'seller' WHERE id = $1", [defaultUserId]);
      console.log(`✅ Upgraded aadil@gmail.com (ID: ${defaultUserId}) to seller role.`);

      // 4. Assign all existing unassigned products to this user
      const updateRes = await pool.query("UPDATE products SET seller_id = $1 WHERE seller_id IS NULL", [defaultUserId]);
      console.log(`✅ Assigned ${updateRes.rowCount} existing products to the default seller.`);
    } else {
      console.log('⚠️ Could not find user aadil@gmail.com to assign products. Please create a seller manually.');
    }

  } catch (error) {
    console.error('❌ Error migrating products table:', error);
  } finally {
    await pool.end();
  }
}

migrateProducts();
