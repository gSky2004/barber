const pool = require('../db/pool');
const { sendWhatsAppMessage, buildBookingMessage } = require('../utils/whatsapp');
const { logAudit } = require('../utils/audit');
const { createNotification } = require('../utils/notify');

async function createBooking(req, res, next) {
  try {
    const { type, name, phone, date, time, details } = req.body;
    const result = await pool.query(
      `INSERT INTO bookings (type, name, phone, date, time, details)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [type, name, phone, date, time, JSON.stringify(details || {})]
    );
    const booking = result.rows[0];

    logAudit(req, {
      action: 'create',
      entityType: 'booking',
      entityId: booking.id,
      entityName: `${name} — ${type}`,
      newValue: booking,
    }).catch(() => {});

    createNotification({
      recipientType: 'admin',
      title: 'New Booking',
      message: `${name} booked ${type === 'barber' ? 'barbershop' : 'gaming'} for ${date} at ${time}`,
      type: 'booking_created',
      entityType: 'booking',
      entityId: booking.id,
    }).catch(() => {});

    sendWhatsAppMessage(buildBookingMessage({ type, name, phone, date, time, details }))
      .catch(() => {});

    res.status(201).json(booking);
  } catch (err) {
    next(err);
  }
}

async function getBookings(req, res, next) {
  try {
    const result = await pool.query('SELECT * FROM bookings ORDER BY date DESC, time ASC');
    res.json(result.rows);
  } catch (err) {
    next(err);
  }
}

async function updateBooking(req, res, next) {
  try {
    const { status } = req.body;
    const old = await pool.query('SELECT * FROM bookings WHERE id = $1', [req.params.id]);
    if (old.rows.length === 0) return res.status(404).json({ error: 'Booking not found' });

    const result = await pool.query(
      'UPDATE bookings SET status = $1 WHERE id = $2 RETURNING *',
      [status, req.params.id]
    );
    const updated = result.rows[0];

    logAudit(req, {
      action: 'update_status',
      entityType: 'booking',
      entityId: updated.id,
      entityName: `${updated.name} — ${updated.type}`,
      oldValue: { status: old.rows[0].status },
      newValue: { status },
    }).catch(() => {});

    const statusLabels = {
      confirmed: '✅ Confirmed',
      cancelled: '❌ Cancelled',
      completed: '✔️ Completed',
      pending: '⏳ Pending',
    };

    createNotification({
      recipientType: 'admin',
      title: `Booking ${statusLabels[status] || status}`,
      message: `${updated.name}'s ${updated.type} booking (${updated.date} ${updated.time}) is now ${status}`,
      type: 'booking_status_changed',
      entityType: 'booking',
      entityId: updated.id,
    }).catch(() => {});

    if (updated.phone) {
      const statusMsg = statusLabels[status] || status;
      const waMsg = [
        `Hello ${updated.name}! 👋`,
        '',
        `Your Milestone Accessories booking has been ${status}.`,
        `📅 Date: ${updated.date}`,
        `🕐 Time: ${updated.time}`,
        `💆 Service: ${updated.type === 'barber' ? 'Barbershop' : 'Gaming Station'}`,
        '',
        'Thank you for choosing Milestone Accessories!',
      ].join('\n');

      sendWhatsAppMessage(waMsg).catch(() => {});
    }

    res.json(updated);
  } catch (err) {
    next(err);
  }
}

module.exports = { createBooking, getBookings, updateBooking };
