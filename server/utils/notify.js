const pool = require('../db/pool');

async function createNotification({ recipientType, recipientId, title, message, type, entityType, entityId }) {
  try {
    await pool.query(
      `INSERT INTO notifications (recipient_type, recipient_id, title, message, type, entity_type, entity_id)
       VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [recipientType || 'admin', recipientId || null, title, message, type, entityType || null, entityId || null]
    );
  } catch (err) {
    console.warn('Notification failed:', err.message);
  }
}

module.exports = { createNotification };
