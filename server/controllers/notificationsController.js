const pool = require('../db/pool');

async function getNotifications(req, res, next) {
  try {
    const limit = Math.min(parseInt(req.query.limit) || 30, 100);
    const unreadOnly = req.query.unread === 'true';

    let where = "WHERE recipient_type = 'admin'";
    const params = [];
    if (unreadOnly) {
      where += ' AND read = FALSE';
    }

    const [notifications, unreadCount] = await Promise.all([
      pool.query(
        `SELECT * FROM notifications ${where} ORDER BY created_at DESC LIMIT $${params.length + 1}`,
        [...params, limit]
      ),
      pool.query(
        "SELECT COUNT(*)::int AS total FROM notifications WHERE recipient_type = 'admin' AND read = FALSE"
      ),
    ]);

    res.json({
      notifications: notifications.rows,
      unreadCount: unreadCount.rows[0].total,
    });
  } catch (err) {
    next(err);
  }
}

async function markRead(req, res, next) {
  try {
    const { id } = req.params;
    if (id === 'all') {
      await pool.query("UPDATE notifications SET read = TRUE WHERE recipient_type = 'admin' AND read = FALSE");
    } else {
      await pool.query('UPDATE notifications SET read = TRUE WHERE id = $1', [id]);
    }
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
}

async function getCustomerNotifications(req, res, next) {
  try {
    const { phone } = req.query;
    if (!phone) return res.json([]);

    const result = await pool.query(
      `SELECT * FROM notifications
       WHERE recipient_type = 'customer' AND entity_id IS NOT NULL
       ORDER BY created_at DESC LIMIT 20`
    );
    res.json(result.rows);
  } catch (err) {
    next(err);
  }
}

module.exports = { getNotifications, markRead, getCustomerNotifications };
