const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../db/pool');
const { logAudit } = require('../utils/audit');

async function login(req, res, next) {
  try {
    const { username, password } = req.body;
    const result = await pool.query('SELECT * FROM admin_users WHERE username = $1', [username]);

    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const user = result.rows[0];
    const valid = await bcrypt.compare(password, user.password_hash);

    if (!valid) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { id: user.id, username: user.username, role: 'admin' },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    logAudit({ admin: { id: user.id, username: user.username }, ip: req.ip }, {
      action: 'login',
      entityType: 'admin',
      entityId: user.id,
      entityName: user.username,
    }).catch(() => {});

    res.json({ token, user: { id: user.id, username: user.username } });
  } catch (err) {
    next(err);
  }
}

function logout(req, res) {
  res.clearCookie('token');
  res.json({ message: 'Logged out' });
}

function me(req, res) {
  res.json({ user: req.admin });
}

module.exports = { login, logout, me };
