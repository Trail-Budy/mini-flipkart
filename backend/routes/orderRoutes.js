const express = require('express');
const { query, pool } = require('../db');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/orders
// @desc    Get all orders for authenticated user
router.get('/', authenticate, async (req, res) => {
  try {
    const userId = req.user.id;
    const result = await query(
      `SELECT o.*, 
        (SELECT COUNT(*) FROM order_items oi WHERE oi.order_id = o.id) as total_items
       FROM orders o 
       WHERE o.user_id = $1 
       ORDER BY o.created_at DESC`,
      [userId]
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Fetch orders error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// @route   GET /api/orders/:id
// @desc    Get order details for authenticated user
router.get('/:id', authenticate, async (req, res) => {
  try {
    const userId = req.user.id;
    const orderId = req.params.id;

    // Fetch order ensuring it belongs to user
    const orderResult = await query(
      'SELECT * FROM orders WHERE id = $1 AND user_id = $2',
      [orderId, userId]
    );

    if (orderResult.rows.length === 0) {
      return res.status(404).json({ error: 'Order not found or unauthorized' });
    }

    const order = orderResult.rows[0];

    // Fetch order items (snapshots)
    const itemsResult = await query(
      `SELECT oi.*, p.image_url 
       FROM order_items oi
       LEFT JOIN products p ON oi.product_id = p.id
       WHERE oi.order_id = $1`,
      [orderId]
    );
    
    // Fetch address details
    const addressResult = await query(
      'SELECT * FROM addresses WHERE id = $1',
      [order.address_id]
    );

    res.json({
      ...order,
      items: itemsResult.rows,
      address: addressResult.rows[0]
    });
  } catch (error) {
    console.error('Fetch order details error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// @route   POST /api/orders
// @desc    Place a new order
router.post('/', authenticate, async (req, res) => {
  const client = await pool.connect();
  try {
    const userId = req.user.id;
    const { address_id } = req.body;

    if (!address_id) {
      return res.status(400).json({ error: 'Delivery address is required' });
    }

    // Begin Transaction
    await client.query('BEGIN');

    // 1. Verify address belongs to user
    const addressCheck = await client.query('SELECT id FROM addresses WHERE id = $1 AND user_id = $2', [address_id, userId]);
    if (addressCheck.rows.length === 0) {
      throw new Error('Address not found or unauthorized');
    }

    // 2. Get user's cart id
    const cartResult = await client.query('SELECT id FROM carts WHERE user_id = $1', [userId]);
    if (cartResult.rows.length === 0) {
      throw new Error('Cart is empty');
    }
    const cartId = cartResult.rows[0].id;

    // 3. Get cart items joined with real-time product data
    const cartItemsResult = await client.query(`
      SELECT 
        ci.product_id, ci.quantity, p.name as product_name, p.price, p.stock
      FROM cart_items ci
      JOIN products p ON ci.product_id = p.id
      WHERE ci.cart_id = $1
    `, [cartId]);

    const items = cartItemsResult.rows;
    if (items.length === 0) {
      throw new Error('Cart is empty');
    }

    // 4. Verify stock and calculate total (ignoring frontend prices entirely)
    let totalAmount = 0;
    for (let item of items) {
      if (item.quantity > item.stock) {
        throw new Error(`Not enough stock for ${item.product_name}. Available: ${item.stock}, Requested: ${item.quantity}`);
      }
      totalAmount += Number(item.price) * item.quantity;
    }

    // 5. Create the Order
    const orderResult = await client.query(
      'INSERT INTO orders (user_id, address_id, total_amount, status) VALUES ($1, $2, $3, $4) RETURNING id',
      [userId, address_id, totalAmount, 'pending']
    );
    const orderId = orderResult.rows[0].id;

    // 6. Create Order Items and Decrease Stock
    for (let item of items) {
      const subtotal = Number(item.price) * item.quantity;
      
      // Snapshot item in order_items
      await client.query(
        'INSERT INTO order_items (order_id, product_id, product_name, price, quantity, subtotal) VALUES ($1, $2, $3, $4, $5, $6)',
        [orderId, item.product_id, item.product_name, item.price, item.quantity, subtotal]
      );
      
      // Decrease stock atomically
      await client.query(
        'UPDATE products SET stock = stock - $1 WHERE id = $2',
        [item.quantity, item.product_id]
      );
    }

    // 7. Clear the Cart
    await client.query('DELETE FROM cart_items WHERE cart_id = $1', [cartId]);

    // Commit Transaction
    await client.query('COMMIT');
    
    res.status(201).json({ id: orderId, message: 'Order placed successfully' });
  } catch (error) {
    // Rollback Transaction on ANY error
    await client.query('ROLLBACK');
    console.error('Order creation error:', error);
    
    // Send specific error message if it's one we threw, otherwise generic 500
    if (['Cart is empty', 'Address not found or unauthorized'].includes(error.message) || error.message.includes('Not enough stock')) {
      return res.status(400).json({ error: error.message });
    }
    res.status(500).json({ error: 'Internal server error while placing order' });
  } finally {
    // ALWAYS release the client back to the pool
    client.release();
  }
});

// @route   PATCH /api/orders/:id/cancel
// @desc    Cancel an order
router.patch('/:id/cancel', authenticate, async (req, res) => {
  const client = await pool.connect();
  try {
    const userId = req.user.id;
    const orderId = req.params.id;

    await client.query('BEGIN');

    // Verify order exists, belongs to user, and is eligible for cancellation
    const orderResult = await client.query(
      'SELECT id, status FROM orders WHERE id = $1 AND user_id = $2 FOR UPDATE', // Lock row to prevent race conditions
      [orderId, userId]
    );

    if (orderResult.rows.length === 0) {
      throw new Error('Order not found or unauthorized');
    }

    const order = orderResult.rows[0];
    if (order.status !== 'pending' && order.status !== 'confirmed' && order.status !== 'processing') {
      throw new Error(`Order cannot be cancelled because it is already ${order.status}`);
    }

    // Update status
    await client.query(
      "UPDATE orders SET status = 'cancelled', updated_at = CURRENT_TIMESTAMP WHERE id = $1",
      [orderId]
    );

    // Restore stock
    const itemsResult = await client.query('SELECT product_id, quantity FROM order_items WHERE order_id = $1', [orderId]);
    for (let item of itemsResult.rows) {
      await client.query(
        'UPDATE products SET stock = stock + $1 WHERE id = $2',
        [item.quantity, item.product_id]
      );
    }

    await client.query('COMMIT');
    res.json({ message: 'Order cancelled successfully' });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Order cancellation error:', error);
    
    if (error.message.includes('Order cannot be cancelled') || error.message === 'Order not found or unauthorized') {
      return res.status(400).json({ error: error.message });
    }
    res.status(500).json({ error: 'Internal server error' });
  } finally {
    client.release();
  }
});

module.exports = router;
