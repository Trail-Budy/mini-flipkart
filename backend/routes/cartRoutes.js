const express = require('express');
const { query } = require('../db');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

// Helper function to get or create cart for user
const getOrCreateCart = async (userId) => {
  let result = await query('SELECT id FROM carts WHERE user_id = $1', [userId]);
  if (result.rows.length === 0) {
    result = await query('INSERT INTO carts (user_id) VALUES ($1) RETURNING id', [userId]);
  }
  return result.rows[0].id;
};

// @route   GET /api/cart
// @desc    Get authenticated user's cart
router.get('/', authenticate, async (req, res) => {
  try {
    const userId = req.user.id;
    const cartId = await getOrCreateCart(userId);

    const itemsResult = await query(`
      SELECT 
        ci.product_id, 
        p.name as product_name, 
        p.image_url, 
        p.price, 
        ci.quantity, 
        p.stock,
        (p.price * ci.quantity) as item_subtotal
      FROM cart_items ci
      JOIN products p ON ci.product_id = p.id
      WHERE ci.cart_id = $1
      ORDER BY ci.created_at ASC
    `, [cartId]);

    const items = itemsResult.rows;
    
    // Calculate total on the backend securely
    const cartTotal = items.reduce((total, item) => total + Number(item.item_subtotal), 0);

    res.json({
      items,
      total: cartTotal.toFixed(2)
    });
  } catch (error) {
    console.error('Fetch cart error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// @route   POST /api/cart
// @desc    Add product to cart or increase quantity
router.post('/', authenticate, async (req, res) => {
  try {
    const userId = req.user.id;
    const { product_id, quantity } = req.body;
    
    const qty = parseInt(quantity);

    if (!product_id || isNaN(qty) || qty <= 0) {
      return res.status(400).json({ error: 'Valid product_id and positive quantity are required' });
    }

    // Verify product exists and check stock
    const productResult = await query('SELECT id, stock FROM products WHERE id = $1', [product_id]);
    if (productResult.rows.length === 0) {
      return res.status(404).json({ error: 'Product not found' });
    }
    
    const product = productResult.rows[0];
    const cartId = await getOrCreateCart(userId);

    // Check if item already exists in cart
    const existingItem = await query('SELECT quantity FROM cart_items WHERE cart_id = $1 AND product_id = $2', [cartId, product_id]);
    
    let currentQtyInCart = 0;
    if (existingItem.rows.length > 0) {
      currentQtyInCart = existingItem.rows[0].quantity;
    }

    const newTotalQty = currentQtyInCart + qty;

    if (newTotalQty > product.stock) {
      return res.status(400).json({ error: `Not enough stock available. Only ${product.stock} items left.` });
    }

    if (existingItem.rows.length > 0) {
      // Update existing
      await query(
        'UPDATE cart_items SET quantity = $1, updated_at = CURRENT_TIMESTAMP WHERE cart_id = $2 AND product_id = $3',
        [newTotalQty, cartId, product_id]
      );
    } else {
      // Insert new
      await query(
        'INSERT INTO cart_items (cart_id, product_id, quantity) VALUES ($1, $2, $3)',
        [cartId, product_id, qty]
      );
    }

    res.json({ message: 'Added to cart successfully' });
  } catch (error) {
    console.error('Add to cart error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// @route   PUT /api/cart/:productId
// @desc    Update specific item quantity in cart
router.put('/:productId', authenticate, async (req, res) => {
  try {
    const userId = req.user.id;
    const { productId } = req.params;
    const { quantity } = req.body;
    
    const qty = parseInt(quantity);

    if (isNaN(qty) || qty <= 0) {
      return res.status(400).json({ error: 'Quantity must be a positive integer' });
    }

    const cartId = await getOrCreateCart(userId);
    
    // Check if product exists in cart
    const existingItem = await query('SELECT id FROM cart_items WHERE cart_id = $1 AND product_id = $2', [cartId, productId]);
    if (existingItem.rows.length === 0) {
      return res.status(404).json({ error: 'Product not found in cart' });
    }

    // Verify stock limits
    const productResult = await query('SELECT stock FROM products WHERE id = $1', [productId]);
    if (productResult.rows.length === 0) {
      return res.status(404).json({ error: 'Product not found' });
    }

    if (qty > productResult.rows[0].stock) {
      return res.status(400).json({ error: `Requested quantity exceeds available stock (${productResult.rows[0].stock})` });
    }

    await query(
      'UPDATE cart_items SET quantity = $1, updated_at = CURRENT_TIMESTAMP WHERE cart_id = $2 AND product_id = $3',
      [qty, cartId, productId]
    );

    res.json({ message: 'Cart updated successfully' });
  } catch (error) {
    console.error('Update cart error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// @route   DELETE /api/cart/:productId
// @desc    Remove product from cart
router.delete('/:productId', authenticate, async (req, res) => {
  try {
    const userId = req.user.id;
    const { productId } = req.params;
    const cartId = await getOrCreateCart(userId);

    await query('DELETE FROM cart_items WHERE cart_id = $1 AND product_id = $2', [cartId, productId]);
    
    res.json({ message: 'Product removed from cart' });
  } catch (error) {
    console.error('Remove from cart error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// @route   DELETE /api/cart
// @desc    Clear entire cart
router.delete('/', authenticate, async (req, res) => {
  try {
    const userId = req.user.id;
    const cartId = await getOrCreateCart(userId);

    await query('DELETE FROM cart_items WHERE cart_id = $1', [cartId]);
    
    res.json({ message: 'Cart cleared successfully' });
  } catch (error) {
    console.error('Clear cart error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// @route   GET /api/cart/count
// @desc    Get total number of items in cart
router.get('/count', authenticate, async (req, res) => {
  try {
    const userId = req.user.id;
    const cartId = await getOrCreateCart(userId);

    const result = await query('SELECT SUM(quantity) as total_items FROM cart_items WHERE cart_id = $1', [cartId]);
    
    // PostgreSQL SUM returns string, parsing to int. Default to 0 if null.
    const count = parseInt(result.rows[0].total_items) || 0;
    
    res.json({ count });
  } catch (error) {
    console.error('Cart count error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
