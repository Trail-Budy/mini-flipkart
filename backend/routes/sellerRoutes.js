const express = require('express');
const { query } = require('../db');
const { authenticate, authorizeRole } = require('../middleware/auth');

const router = express.Router();

// Apply middleware to all routes in this router
router.use(authenticate);
router.use(authorizeRole('seller', 'admin'));

// @route   GET /api/seller/dashboard
// @desc    Get seller overview stats
router.get('/dashboard', async (req, res) => {
  try {
    const sellerId = req.user.id;
    
    const productsRes = await query(
      'SELECT COUNT(id) as total_products, COALESCE(SUM(stock), 0) as total_stock FROM products WHERE seller_id = $1', 
      [sellerId]
    );
    
    const ordersRes = await query(`
      SELECT COUNT(DISTINCT o.id) as total_orders, COALESCE(SUM(oi.quantity * oi.price_at_time), 0) as total_sales
      FROM orders o
      JOIN order_items oi ON o.id = oi.order_id
      JOIN products p ON oi.product_id = p.id
      WHERE p.seller_id = $1
    `, [sellerId]);

    res.json({
      total_products: parseInt(productsRes.rows[0].total_products),
      total_stock: parseInt(productsRes.rows[0].total_stock),
      total_orders: parseInt(ordersRes.rows[0].total_orders),
      estimated_sales: parseFloat(ordersRes.rows[0].total_sales)
    });
  } catch (error) {
    console.error('Fetch seller dashboard error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// @route   GET /api/seller/products
// @desc    Get products owned by the seller
router.get('/products', async (req, res) => {
  try {
    const sellerId = req.user.id;
    const result = await query(`
      SELECT p.*, c.name as category_name
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE p.seller_id = $1
      ORDER BY p.created_at DESC
    `, [sellerId]);
    
    res.json(result.rows);
  } catch (error) {
    console.error('Fetch seller products error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// @route   POST /api/seller/products
// @desc    Create a new product owned by the seller
router.post('/products', async (req, res) => {
  try {
    const sellerId = req.user.id;
    const { name, description, category_id, price, original_price, stock, image_url } = req.body;
    
    if (!name || !description || !category_id || price == null || stock == null) {
      return res.status(400).json({ error: 'Please provide all required fields' });
    }
    
    if (price <= 0 || (original_price && original_price <= 0) || stock < 0) {
      return res.status(400).json({ error: 'Price and stock must be valid positive numbers' });
    }

    const result = await query(
      `INSERT INTO products 
       (seller_id, name, description, category_id, price, original_price, stock, image_url) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8) 
       RETURNING *`,
      [sellerId, name, description, category_id, price, original_price, stock, image_url]
    );
    
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Create seller product error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// @route   PUT /api/seller/products/:id
// @desc    Update a product owned by the seller
router.put('/products/:id', async (req, res) => {
  try {
    const sellerId = req.user.id;
    const productId = req.params.id;
    const { name, description, category_id, price, original_price, stock, image_url } = req.body;
    
    if (!name || !description || !category_id || price == null || stock == null) {
      return res.status(400).json({ error: 'Please provide all required fields' });
    }

    // Attempt update but ONLY if it belongs to this seller
    const result = await query(
      `UPDATE products 
       SET name = $1, description = $2, category_id = $3, price = $4, 
           original_price = $5, stock = $6, image_url = $7, updated_at = CURRENT_TIMESTAMP
       WHERE id = $8 AND seller_id = $9
       RETURNING *`,
      [name, description, category_id, price, original_price, stock, image_url, productId, sellerId]
    );
    
    if (result.rows.length === 0) {
      return res.status(403).json({ error: 'Product not found or you do not have permission to edit it.' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Update seller product error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// @route   DELETE /api/seller/products/:id
// @desc    Delete a product owned by the seller (safe delete)
router.delete('/products/:id', async (req, res) => {
  try {
    const sellerId = req.user.id;
    const productId = req.params.id;
    
    // Check ownership first
    const ownershipCheck = await query('SELECT id FROM products WHERE id = $1 AND seller_id = $2', [productId, sellerId]);
    if (ownershipCheck.rows.length === 0) {
      return res.status(403).json({ error: 'Product not found or you do not have permission to delete it.' });
    }

    // Check if referenced in orders
    const orderCheck = await query('SELECT id FROM order_items WHERE product_id = $1 LIMIT 1', [productId]);
    if (orderCheck.rows.length > 0) {
      return res.status(400).json({ 
        error: 'Cannot delete product because it has been ordered by customers. Please set stock to 0 instead to hide it.' 
      });
    }

    // Perform delete
    await query('DELETE FROM products WHERE id = $1 AND seller_id = $2', [productId, sellerId]);
    
    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    console.error('Delete seller product error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// @route   GET /api/seller/orders
// @desc    Get orders containing products owned by the seller
router.get('/orders', async (req, res) => {
  try {
    const sellerId = req.user.id;
    
    const result = await query(`
      SELECT 
        o.id as order_id, 
        o.created_at, 
        o.status, 
        u.name as customer_name,
        p.name as product_name, 
        oi.quantity, 
        oi.price_at_time,
        (oi.quantity * oi.price_at_time) as total_amount
      FROM orders o
      JOIN users u ON o.user_id = u.id
      JOIN order_items oi ON o.id = oi.order_id
      JOIN products p ON oi.product_id = p.id
      WHERE p.seller_id = $1
      ORDER BY o.created_at DESC
    `, [sellerId]);
    
    res.json(result.rows);
  } catch (error) {
    console.error('Fetch seller orders error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// @route   PATCH /api/seller/orders/:id/status
// @desc    Update order status
router.patch('/orders/:id/status', async (req, res) => {
  try {
    const sellerId = req.user.id;
    const orderId = req.params.id;
    const { status } = req.body;
    
    const allowedStatuses = ['pending', 'processing', 'shipped', 'delivered'];
    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({ error: 'Invalid status value' });
    }

    // Verify the order contains at least one product owned by this seller
    const orderCheck = await query(`
      SELECT o.id 
      FROM orders o
      JOIN order_items oi ON o.id = oi.order_id
      JOIN products p ON oi.product_id = p.id
      WHERE o.id = $1 AND p.seller_id = $2
      LIMIT 1
    `, [orderId, sellerId]);

    if (orderCheck.rows.length === 0) {
      return res.status(403).json({ error: 'Order not found or contains no products owned by you.' });
    }

    // Update the order status
    await query('UPDATE orders SET status = $1 WHERE id = $2', [status, orderId]);
    
    res.json({ message: 'Order status updated successfully' });
  } catch (error) {
    console.error('Update order status error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
