const express = require('express');
const { query } = require('../db');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/addresses
// @desc    Get all addresses for authenticated user
router.get('/', authenticate, async (req, res) => {
  try {
    const userId = req.user.id;
    const result = await query(
      'SELECT * FROM addresses WHERE user_id = $1 ORDER BY created_at DESC', 
      [userId]
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Fetch addresses error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// @route   POST /api/addresses
// @desc    Create a new address for authenticated user
router.post('/', authenticate, async (req, res) => {
  try {
    const userId = req.user.id;
    const { full_name, phone, address_line1, address_line2, city, state, postal_code, country } = req.body;

    if (!full_name || !phone || !address_line1 || !city || !state || !postal_code || !country) {
      return res.status(400).json({ error: 'Please provide all required fields' });
    }

    const result = await query(
      `INSERT INTO addresses 
        (user_id, full_name, phone, address_line1, address_line2, city, state, postal_code, country) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) 
       RETURNING *`,
      [userId, full_name, phone, address_line1, address_line2 || null, city, state, postal_code, country]
    );
    
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Create address error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// @route   PUT /api/addresses/:id
// @desc    Update an address for authenticated user
router.put('/:id', authenticate, async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;
    const { full_name, phone, address_line1, address_line2, city, state, postal_code, country } = req.body;

    if (!full_name || !phone || !address_line1 || !city || !state || !postal_code || !country) {
      return res.status(400).json({ error: 'Please provide all required fields' });
    }

    // Update ONLY if it belongs to user_id
    const result = await query(
      `UPDATE addresses 
       SET full_name = $1, phone = $2, address_line1 = $3, address_line2 = $4, 
           city = $5, state = $6, postal_code = $7, country = $8, updated_at = CURRENT_TIMESTAMP
       WHERE id = $9 AND user_id = $10 
       RETURNING *`,
      [full_name, phone, address_line1, address_line2 || null, city, state, postal_code, country, id, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Address not found or unauthorized' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Update address error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// @route   DELETE /api/addresses/:id
// @desc    Delete an address for authenticated user
router.delete('/:id', authenticate, async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    // Delete ONLY if it belongs to user_id
    const result = await query('DELETE FROM addresses WHERE id = $1 AND user_id = $2 RETURNING id', [id, userId]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Address not found or unauthorized' });
    }

    res.json({ message: 'Address deleted successfully' });
  } catch (error) {
    console.error('Delete address error:', error);
    // If it's a foreign key constraint error (e.g. order exists using this address)
    if (error.code === '23503') {
      return res.status(400).json({ error: 'Cannot delete address because it is associated with an order' });
    }
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
