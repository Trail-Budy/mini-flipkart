const express = require('express');
const { query, pool } = require('../db');
const { authenticate, authorizeRole } = require('../middleware/auth');

const router = express.Router();

// All admin routes must be protected
router.use(authenticate);
router.use(authorizeRole('admin'));

// ============================================================================
// STATS API
// ============================================================================

// @route   GET /api/admin/stats
// @desc    Get dashboard overview statistics
router.get('/stats', async (req, res) => {
  try {
    const statsResult = await query(`
      SELECT 
        (SELECT COUNT(*) FROM users) as total_users,
        (SELECT COUNT(*) FROM users WHERE role = 'seller') as total_sellers,
        (SELECT COUNT(*) FROM products) as total_products,
        (SELECT COUNT(*) FROM orders) as total_orders,
        (SELECT COALESCE(SUM(total_amount), 0) FROM orders WHERE status != 'cancelled') as total_revenue,
        (SELECT COUNT(*) FROM orders WHERE status = 'pending') as pending_orders,
        (SELECT COUNT(*) FROM products WHERE stock < 10) as low_stock_products
    `);

    res.json(statsResult.rows[0]);
  } catch (error) {
    console.error('Admin stats error:', error);
    res.status(500).json({ error: 'Failed to retrieve statistics' });
  }
});

// ============================================================================
// USERS API
// ============================================================================

// @route   GET /api/admin/users
// @desc    Get all users (excluding password hashes)
router.get('/users', async (req, res) => {
  try {
    const usersResult = await query(`
      SELECT id, name, email, role, created_at 
      FROM users 
      ORDER BY created_at DESC
    `);
    res.json(usersResult.rows);
  } catch (error) {
    console.error('Admin users error:', error);
    res.status(500).json({ error: 'Failed to retrieve users' });
  }
});

// @route   GET /api/admin/users/:id
// @desc    Get a single user details and their activity
router.get('/users/:id', async (req, res) => {
  try {
    const userId = req.params.id;
    
    const userResult = await query(`
      SELECT id, name, email, role, created_at 
      FROM users 
      WHERE id = $1
    `, [userId]);

    if (userResult.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    const user = userResult.rows[0];

    // Activity stats for user
    const ordersResult = await query('SELECT COUNT(*) as order_count FROM orders WHERE user_id = $1', [userId]);
    const productsResult = await query('SELECT COUNT(*) as product_count FROM products WHERE seller_id = $1', [userId]);

    user.order_count = parseInt(ordersResult.rows[0].order_count);
    user.product_count = parseInt(productsResult.rows[0].product_count);

    res.json(user);
  } catch (error) {
    console.error('Admin user details error:', error);
    res.status(500).json({ error: 'Failed to retrieve user details' });
  }
});

// @route   PATCH /api/admin/users/:id/role
// @desc    Change user role (with safety checks)
router.patch('/users/:id/role', async (req, res) => {
  try {
    const userId = req.params.id;
    const { role } = req.body;

    if (!['customer', 'seller', 'admin'].includes(role)) {
      return res.status(400).json({ error: 'Invalid role provided' });
    }

    // Get current user details to check if we're modifying an admin
    const userResult = await query('SELECT role FROM users WHERE id = $1', [userId]);
    if (userResult.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    const currentRole = userResult.rows[0].role;

    // Safety: Prevent removing the last admin
    if (currentRole === 'admin' && role !== 'admin') {
      const adminCountResult = await query('SELECT COUNT(*) as count FROM users WHERE role = $1', ['admin']);
      if (parseInt(adminCountResult.rows[0].count) <= 1) {
        return res.status(400).json({ error: 'Cannot demote the last remaining administrator' });
      }
    }

    await query('UPDATE users SET role = $1 WHERE id = $2', [role, userId]);
    res.json({ message: 'User role updated successfully' });
  } catch (error) {
    console.error('Admin update role error:', error);
    res.status(500).json({ error: 'Failed to update user role' });
  }
});

// ============================================================================
// PRODUCTS API
// ============================================================================

// @route   GET /api/admin/products
// @desc    Get all products with seller details
router.get('/products', async (req, res) => {
  try {
    const productsResult = await query(`
      SELECT p.*, c.name as category_name, u.name as seller_name 
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      LEFT JOIN users u ON p.seller_id = u.id
      ORDER BY p.created_at DESC
    `);
    res.json(productsResult.rows);
  } catch (error) {
    console.error('Admin products error:', error);
    res.status(500).json({ error: 'Failed to retrieve products' });
  }
});

// @route   DELETE /api/admin/products/:id
// @desc    Delete a product (safe deletion)
router.delete('/products/:id', async (req, res) => {
  try {
    const productId = req.params.id;

    // Safety: check if product exists in any orders
    const orderCheck = await query('SELECT id FROM order_items WHERE product_id = $1 LIMIT 1', [productId]);
    
    if (orderCheck.rows.length > 0) {
      return res.status(400).json({ 
        error: 'This product cannot be permanently deleted because it is associated with an existing order.' 
      });
    }

    const result = await query('DELETE FROM products WHERE id = $1 RETURNING id', [productId]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Product not found' });
    }

    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    console.error('Admin delete product error:', error);
    res.status(500).json({ error: 'Failed to delete product' });
  }
});

// ============================================================================
// CATEGORIES API
// ============================================================================

// @route   GET /api/admin/categories
// @desc    Get all categories with product count
router.get('/categories', async (req, res) => {
  try {
    const categoriesResult = await query(`
      SELECT c.*, COUNT(p.id) as product_count
      FROM categories c
      LEFT JOIN products p ON c.id = p.category_id
      GROUP BY c.id
      ORDER BY c.name ASC
    `);
    res.json(categoriesResult.rows);
  } catch (error) {
    console.error('Admin categories error:', error);
    res.status(500).json({ error: 'Failed to retrieve categories' });
  }
});

// @route   POST /api/admin/categories
// @desc    Create a category
router.post('/categories', async (req, res) => {
  try {
    const { name, description } = req.body;
    
    if (!name) {
      return res.status(400).json({ error: 'Category name is required' });
    }

    // Name must be unique
    const existing = await query('SELECT id FROM categories WHERE name = $1', [name]);
    if (existing.rows.length > 0) {
      return res.status(400).json({ error: 'A category with this name already exists' });
    }

    const result = await query(
      'INSERT INTO categories (name, description) VALUES ($1, $2) RETURNING *',
      [name, description || null]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Admin create category error:', error);
    res.status(500).json({ error: 'Failed to create category' });
  }
});

// @route   PUT /api/admin/categories/:id
// @desc    Update a category
router.put('/categories/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description } = req.body;
    
    if (!name) {
      return res.status(400).json({ error: 'Category name is required' });
    }

    // Name must be unique, except for this category itself
    const existing = await query('SELECT id FROM categories WHERE name = $1 AND id != $2', [name, id]);
    if (existing.rows.length > 0) {
      return res.status(400).json({ error: 'A category with this name already exists' });
    }

    const result = await query(
      'UPDATE categories SET name = $1, description = $2 WHERE id = $3 RETURNING *',
      [name, description || null, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Category not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Admin update category error:', error);
    res.status(500).json({ error: 'Failed to update category' });
  }
});

// @route   DELETE /api/admin/categories/:id
// @desc    Delete a category (Safe delete)
router.delete('/categories/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Safety check: Does this category contain products?
    const productsResult = await query('SELECT COUNT(*) as count FROM products WHERE category_id = $1', [id]);
    const productCount = parseInt(productsResult.rows[0].count);
    
    if (productCount > 0) {
      return res.status(400).json({ 
        error: `Cannot delete category. It currently contains ${productCount} product(s). Please reassign or delete those products first.` 
      });
    }

    const result = await query('DELETE FROM categories WHERE id = $1 RETURNING id', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Category not found' });
    }

    res.json({ message: 'Category deleted successfully' });
  } catch (error) {
    console.error('Admin delete category error:', error);
    res.status(500).json({ error: 'Failed to delete category' });
  }
});

// ============================================================================
// ORDERS API
// ============================================================================

// @route   GET /api/admin/orders
// @desc    Get all orders
router.get('/orders', async (req, res) => {
  try {
    const ordersResult = await query(`
      SELECT o.*, u.name as customer_name, u.email as customer_email
      FROM orders o
      JOIN users u ON o.user_id = u.id
      ORDER BY o.created_at DESC
    `);
    res.json(ordersResult.rows);
  } catch (error) {
    console.error('Admin orders error:', error);
    res.status(500).json({ error: 'Failed to retrieve orders' });
  }
});

// @route   GET /api/admin/orders/:id
// @desc    Get order details
router.get('/orders/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const orderResult = await query(`
      SELECT o.*, u.name as customer_name, u.email as customer_email
      FROM orders o
      JOIN users u ON o.user_id = u.id
      WHERE o.id = $1
    `, [id]);

    if (orderResult.rows.length === 0) {
      return res.status(404).json({ error: 'Order not found' });
    }
    
    const order = orderResult.rows[0];

    const itemsResult = await query(`
      SELECT oi.*, p.image_url, u.name as seller_name
      FROM order_items oi
      LEFT JOIN products p ON oi.product_id = p.id
      LEFT JOIN users u ON p.seller_id = u.id
      WHERE oi.order_id = $1
    `, [id]);
    
    const addressResult = await query('SELECT * FROM addresses WHERE id = $1', [order.address_id]);

    res.json({
      ...order,
      items: itemsResult.rows,
      address: addressResult.rows[0]
    });
  } catch (error) {
    console.error('Admin order details error:', error);
    res.status(500).json({ error: 'Failed to retrieve order details' });
  }
});

// @route   PATCH /api/admin/orders/:id/status
// @desc    Update order status
router.patch('/orders/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    const validStatuses = ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: 'Invalid status provided' });
    }

    const result = await query(
      'UPDATE orders SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING *',
      [status, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Order not found' });
    }

    res.json({ message: 'Order status updated successfully', order: result.rows[0] });
  } catch (error) {
    console.error('Admin update order status error:', error);
    res.status(500).json({ error: 'Failed to update order status' });
  }
});

module.exports = router;
