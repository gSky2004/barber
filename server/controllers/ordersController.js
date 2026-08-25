const pool = require('../db/pool');
const { sendWhatsAppMessage, buildOrderMessage } = require('../utils/whatsapp');
const { logAudit } = require('../utils/audit');
const { createNotification } = require('../utils/notify');

async function createOrder(req, res, next) {
  try {
    const { name, phone, order_type, items, total, issue_description, delivery_preference } = req.body;
    const result = await pool.query(
      `INSERT INTO orders (name, phone, order_type, items, total, issue_description, delivery_preference)
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
      [name, phone, order_type || 'product', JSON.stringify(items || []), total || 0, issue_description, delivery_preference || 'pickup']
    );
    const order = result.rows[0];

    logAudit(req, {
      action: 'create',
      entityType: 'order',
      entityId: order.id,
      entityName: `${name} — ${order_type}`,
      newValue: order,
    }).catch(() => {});

    createNotification({
      recipientType: 'admin',
      title: `New ${order_type === 'repair' ? 'Repair Request' : 'Product Order'}`,
      message: order_type === 'repair'
        ? `${name} requested repair for ${items?.[0]?.name || 'device'}`
        : `${name} ordered ${items?.length || 0} product(s) — Total: ${Number(total || 0).toLocaleString()} TZS`,
      type: 'order_created',
      entityType: 'order',
      entityId: order.id,
    }).catch(() => {});

    sendWhatsAppMessage(buildOrderMessage({ name, phone, order_type, items, total, issue_description, delivery_preference }))
      .catch(() => {});

    res.status(201).json(order);
  } catch (err) {
    next(err);
  }
}

async function getOrders(req, res, next) {
  try {
    const result = await pool.query('SELECT * FROM orders ORDER BY created_at DESC');
    res.json(result.rows);
  } catch (err) {
    next(err);
  }
}

async function updateOrder(req, res, next) {
  try {
    const { status } = req.body;
    const old = await pool.query('SELECT * FROM orders WHERE id = $1', [req.params.id]);
    if (old.rows.length === 0) return res.status(404).json({ error: 'Order not found' });

    const result = await pool.query(
      'UPDATE orders SET status = $1 WHERE id = $2 RETURNING *',
      [status, req.params.id]
    );
    const updated = result.rows[0];

    logAudit(req, {
      action: 'update_status',
      entityType: 'order',
      entityId: updated.id,
      entityName: `${updated.name} — ${updated.order_type}`,
      oldValue: { status: old.rows[0].status },
      newValue: { status },
    }).catch(() => {});

    const statusLabels = {
      confirmed: '✅ Confirmed',
      cancelled: '❌ Cancelled',
      completed: '✔️ Completed',
      pending: '⏳ Pending',
    };

    const typeLabel = updated.order_type === 'repair' ? 'repair request' : 'product order';

    createNotification({
      recipientType: 'admin',
      title: `Order ${statusLabels[status] || status}`,
      message: `${updated.name}'s ${typeLabel} is now ${status}`,
      type: 'order_status_changed',
      entityType: 'order',
      entityId: updated.id,
    }).catch(() => {});

    if (updated.phone) {
      const statusMsg = statusLabels[status] || status;
      let waMsg = '';

      if (updated.order_type === 'repair') {
        waMsg = [
          `Hello ${updated.name}! 👋`,
          '',
          `Your Milestone Accessories repair request has been ${status}.`,
          `📱 Device: ${updated.items?.[0]?.name || 'Device'}`,
          updated.issue_description ? `📝 Issue: ${updated.issue_description}` : '',
          '',
          'Thank you for choosing Milestone Accessories!',
        ].filter(Boolean).join('\n');
      } else {
        const itemList = (updated.items || []).map((i) => `• ${i.name} × ${i.quantity}`).join('\n');
        waMsg = [
          `Hello ${updated.name}! 👋`,
          '',
          `Your Milestone Accessories product order has been ${status}.`,
          `🛒 Items:\n${itemList}`,
          updated.total > 0 ? `💰 Total: ${Number(updated.total).toLocaleString()} TZS` : '',
          `🚚 ${updated.delivery_preference === 'delivery' ? 'Delivery' : 'Pickup'}`,
          '',
          'Thank you for choosing Milestone Accessories!',
        ].filter(Boolean).join('\n');
      }

      sendWhatsAppMessage(waMsg).catch(() => {});
    }

    res.json(updated);
  } catch (err) {
    next(err);
  }
}

module.exports = { createOrder, getOrders, updateOrder };
