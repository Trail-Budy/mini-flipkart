const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { query } = require('../db');
const { authenticate } = require('../middleware/auth');
const rateLimit = require('express-rate-limit');

const authLimiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutes
  max: 10, // Limit each IP to 10 requests per windowMs
  message: { error: 'Too many requests from this IP, please try again after 10 minutes' }
});

const router = express.Router();

// Helper to generate JWT and set cookie
const setAuthCookie = (res, user) => {
  const token = jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: '7d' } // Token valid for 7 days
  );

  res.cookie('token', token, {
    httpOnly: true, // Secure, cannot be accessed via JS (prevents XSS)
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax', 
    maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days in ms
  });
};

// @route   POST /api/auth/register
router.post('/register', authLimiter, async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Please provide all required fields' });
    }

    if (name.length > 100 || email.length > 255 || password.length > 255) {
      return res.status(400).json({ error: 'Input fields exceed maximum allowed length' });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters long' });
    }

    // Check if user exists
    const existingUser = await query('SELECT id FROM users WHERE email = $1', [email]);
    if (existingUser.rows.length > 0) {
      return res.status(400).json({ error: 'User with this email already exists' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // Insert user
    const newUser = await query(
      'INSERT INTO users (name, email, password_hash) VALUES ($1, $2, $3) RETURNING id, name, email, role, created_at',
      [name, email, passwordHash]
    );

    const user = newUser.rows[0];
    
    // Auto-login after register
    setAuthCookie(res, user);

    res.status(201).json(user); // Returns safe info, no password_hash
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Internal server error during registration' });
  }
});

// @route   POST /api/auth/login
router.post('/login', authLimiter, async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Please provide email and password' });
    }

    if (email.length > 255 || password.length > 255) {
      return res.status(400).json({ error: 'Input fields exceed maximum allowed length' });
    }

    // Find user
    const result = await query('SELECT * FROM users WHERE email = $1', [email]);
    if (result.rows.length === 0) {
      console.log(`Login failed: user not found for email ${email}`);
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const user = result.rows[0];

    // Check password
    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      console.log(`Login failed: wrong password for email ${email}`);
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Login successful
    setAuthCookie(res, user);

    // Remove password_hash before sending response
    delete user.password_hash;
    res.json(user);
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error during login' });
  }
});

// @route   POST /api/auth/logout
router.post('/logout', (req, res) => {
  res.clearCookie('token');
  res.json({ message: 'Logged out successfully' });
});

// @route   GET /api/auth/me
// Uses authenticate middleware to verify token
router.get('/me', authenticate, async (req, res) => {
  try {
    // req.user has the token payload, but let's fetch fresh data from DB to be safe
    const result = await query('SELECT id, name, email, role, created_at FROM users WHERE id = $1', [req.user.id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Fetch me error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
