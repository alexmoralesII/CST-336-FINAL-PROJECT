/**
 * routes/auth.mjs
 * Handles user registration, login, and logout.
 */

import express from 'express';
import bcrypt  from 'bcrypt';
import { pool } from '../config/db.js';

const router = express.Router();
const SALT_ROUNDS = 10;

// ── Registration ──────────────────────────────────────────────────────────────

router.get('/register', (req, res) => {
  res.render('register.ejs', { error: null });
});

router.post('/register', async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.render('register.ejs', { error: 'All fields are required.' });
  }

  try {
    // Check if username already exists
    const [existing] = await pool.query(
      'SELECT userId FROM users WHERE username = ?', [username]
    );
    if (existing.length > 0) {
      return res.render('register.ejs', { error: 'Username already taken.' });
    }

    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

    await pool.query(
      'INSERT INTO users (username, password, role) VALUES (?, ?, ?)',
      [username, hashedPassword, 'user']
    );

    res.redirect('/login');
  } catch (err) {
    console.error('Registration error:', err);
    res.status(500).render('error.ejs', { message: 'Registration failed.' });
  }
});

// ── Login ─────────────────────────────────────────────────────────────────────

router.get('/', (req, res) => {
   res.render('login.ejs')
});

router.get('/login', (req, res) => {
   res.render('login.ejs')
});

router.post('/login', async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.render('login.ejs', { error: 'Username and password are required.' });
  }

  try {
    const [rows] = await pool.query(
      'SELECT * FROM user WHERE username = ?', [username]
    );

    if (rows.length === 0) {
      return res.render('login.ejs', { error: 'Invalid email or password.' });
    }

    const user  = rows[0];
    const match = await bcrypt.compare(password, user.password);

    if (!match) {
      return res.render('login.ejs', { error: 'Invalid email or password.' });
    }

    req.session.userId   = user.userId;
    req.session.username = user.username;
    req.session.role     = user.role;

    res.redirect('/artist');
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).render('error.ejs', { message: 'Login failed.' });
  }
});

// ── Logout ────────────────────────────────────────────────────────────────────

router.get('/logout', (req, res) => {
  req.session.destroy(err => {
    if (err) console.error('Session destroy error:', err);
    res.redirect('/login');
  });
});

export default router;
