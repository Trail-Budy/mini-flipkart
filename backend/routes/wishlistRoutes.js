const express = require('express');
const { query } = require('../db');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/wishlist
// @desc    Get authenticated user's wishlist
router.get('/', authenticate, async (req, res) => {
  try {
    const userId = req.user.id;

    const result = await query(`
      SELECT 
        p.id as product_id, 
        p.name as product_name, 
        p.image_url as product_image, 
        p.price as product_price,
        p.original_price,
        p.stock
      FROM wishlist_items wi
      JOIN products p ON wi.product_id = p.id
      WHERE wi.user_id = $1
      ORDER BY wi.created_at DESC
    `, [userId]);

    res.json(result.rows);
  } catch (error) {
    console.error('Fetch wishlist error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// @route   POST /api/wishlist/:productId
// @desc    Add product to wishlist
router.post('/:productId', authenticate, async (req, res) => {
  try {
    const userId = req.user.id;
    const { productId } = req.params;
    
    // Verify product exists
    const productResult = await query('SELECT id FROM products WHERE id = $1', [productId]);
    if (productResult.rows.length === 0) {
      return res.status(404).json({ error: 'Product not found' });
    }

    // Attempt to insert, ignore if exists due to unique constraint
    try {
      await query(
        'INSERT INTO wishlist_items (user_id, product_id) VALUES ($1, $2)',
        [userId, productId]
      );
      res.json({ message: 'Added to wishlist successfully' });
    } catch (err) {
      // PostgreSQL unique violation error code is 23505
      if (err.code === '23505') {
        return res.status(400).json({ error: 'Product is already in your wishlist' });
      }
      throw err;
    }
  } catch (error) {
    console.error('Add to wishlist error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// @route   DELETE /api/wishlist/:productId
// @desc    Remove product from wishlist
router.delete('/:productId', authenticate, async (req, res) => {
  try {
    const userId = req.user.id;
    const { productId } = req.params;

    await query('DELETE FROM wishlist_items WHERE user_id = $1 AND product_id = $2', [userId, productId]);
    
    res.json({ message: 'Product removed from wishlist' });
  } catch (error) {
    console.error('Remove from wishlist error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
