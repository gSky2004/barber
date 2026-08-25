const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../db/pool');

function signCustomer(user) {
  return jwt.sign(
    { id: user.id, email: user.email, full_name: user.full_name, role: 'customer' },
    process.env.JWT_SECRET,
    { expiresIn: '14d' }
  );
}

function setCookie(res, token) {
  res.cookie('customerToken', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    maxAge: 14 * 24 * 60 * 60 * 1000,
  });
}

async function register(req, res, next) {
  try {
    const { full_name, email, phone, password } = req.body;
    const existing = await pool.query('SELECT id FROM customers WHERE email = $1', [
      email.toLowerCase().trim(),
    ]);
    if (existing.rows.length > 0) {
      return res.status(409).json({ error: 'An account with this email already exists' });
    }

    const password_hash = await bcrypt.hash(password, 10);
    const result = await pool.query(
      `INSERT INTO customers (full_name, email, phone, password_hash)
       VALUES ($1, $2, $3, $4)
       RETURNING id, full_name, email, phone, created_at`,
      [full_name.trim(), email.toLowerCase().trim(), phone || null, password_hash]
    );

    const user = result.rows[0];
    res.status(201).json({
      message: 'Registration successful! Please log in to continue.',
      user: { id: user.id, full_name: user.full_name, email: user.email },
    });
  } catch (err) {
    next(err);
  }
}

async function login(req, res, next) {
  try {
    const { email, password } = req.body;
    const result = await pool.query('SELECT * FROM customers WHERE email = $1', [
      email.toLowerCase().trim(),
    ]);

    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const user = result.rows[0];
    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const safe = {
      id: user.id,
      full_name: user.full_name,
      email: user.email,
      phone: user.phone,
    };
    const token = signCustomer(safe);
    setCookie(res, token);
    res.json({ token, user: safe });
  } catch (err) {
    next(err);
  }
}

function logout(req, res) {
  res.clearCookie('customerToken');
  res.json({ message: 'Logged out' });
}

async function me(req, res, next) {
  try {
    const result = await pool.query(
      'SELECT id, full_name, email, phone, created_at FROM customers WHERE id = $1',
      [req.customer.id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Account not found' });
    }
    res.json({ user: result.rows[0] });
  } catch (err) {
    next(err);
  }
}

module.exports = { register, login, logout, me };
