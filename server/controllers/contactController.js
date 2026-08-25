const pool = require('../db/pool');
const { sendContactEmail } = require('../utils/email');

async function submitContact(req, res, next) {
  try {
    const { name, email, phone, message } = req.body;
    const result = await pool.query(
      `INSERT INTO contact_messages (name, email, phone, message) VALUES ($1, $2, $3, $4) RETURNING *`,
      [name, email, phone, message]
    );

    try {
      await sendContactEmail({ name, email, phone, message });
    } catch (emailErr) {
      console.error('Email send failed:', emailErr.message);
    }

    res.status(201).json({ message: 'Message sent successfully', data: result.rows[0] });
  } catch (err) {
    next(err);
  }
}

async function getMessages(req, res, next) {
  try {
    const result = await pool.query('SELECT * FROM contact_messages ORDER BY created_at DESC');
    res.json(result.rows);
  } catch (err) {
    next(err);
  }
}

module.exports = { submitContact, getMessages };
