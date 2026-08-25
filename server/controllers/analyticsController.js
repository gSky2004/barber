const pool = require('../db/pool');

async function getAnalytics(req, res, next) {
  try {
    const [
      bookings, orders, products, messages, recentBookings, recentOrders,
      serviceBreakdown, orderStatusBreakdown, bookingStatusBreakdown,
      revenueByDay, bookingsByDay, ordersByDay,
      totalRevenue, lowStockProducts, recentAudit
    ] = await Promise.all([
      pool.query("SELECT COUNT(*)::int AS total FROM bookings"),
      pool.query("SELECT COUNT(*)::int AS total FROM orders"),
      pool.query('SELECT COUNT(*)::int AS total FROM products'),
      pool.query('SELECT COUNT(*)::int AS total FROM contact_messages'),
      pool.query('SELECT * FROM bookings ORDER BY created_at DESC LIMIT 5'),
      pool.query('SELECT * FROM orders ORDER BY created_at DESC LIMIT 5'),
      pool.query("SELECT type, COUNT(*)::int AS count FROM bookings GROUP BY type ORDER BY count DESC"),
      pool.query("SELECT status, COUNT(*)::int AS count FROM orders GROUP BY status ORDER BY count DESC"),
      pool.query("SELECT status, COUNT(*)::int AS count FROM bookings GROUP BY status ORDER BY count DESC"),
      pool.query(`
        SELECT DATE(created_at) AS date, COALESCE(SUM(total), 0)::int AS revenue
        FROM orders WHERE created_at > NOW() - INTERVAL '30 days' AND payment_status = 'paid'
        GROUP BY DATE(created_at) ORDER BY date ASC
      `),
      pool.query(`
        SELECT DATE(created_at) AS date, COUNT(*)::int AS count
        FROM bookings WHERE created_at > NOW() - INTERVAL '30 days'
        GROUP BY DATE(created_at) ORDER BY date ASC
      `),
      pool.query(`
        SELECT DATE(created_at) AS date, COUNT(*)::int AS count
        FROM orders WHERE created_at > NOW() - INTERVAL '30 days'
        GROUP BY DATE(created_at) ORDER BY date ASC
      `),
      pool.query("SELECT COALESCE(SUM(total), 0)::int AS total FROM orders WHERE payment_status = 'paid'"),
      pool.query('SELECT id, name, stock, price FROM products WHERE stock < 5 ORDER BY stock ASC LIMIT 10'),
      pool.query('SELECT * FROM admin_audit_log ORDER BY created_at DESC LIMIT 8'),
    ]);

    const pendingBookings = await pool.query(
      "SELECT COUNT(*)::int AS total FROM bookings WHERE status = 'pending'"
    );
    const pendingOrders = await pool.query(
      "SELECT COUNT(*)::int AS total FROM orders WHERE status = 'pending'"
    );
    const completedOrders = await pool.query(
      "SELECT COUNT(*)::int AS total FROM orders WHERE status = 'completed'"
    );
    const completedBookings = await pool.query(
      "SELECT COUNT(*)::int AS total FROM bookings WHERE status = 'completed'"
    );
    const unreadNotifications = await pool.query(
      "SELECT COUNT(*)::int AS total FROM notifications WHERE recipient_type = 'admin' AND read = FALSE"
    );

    res.json({
      totals: {
        bookings: bookings.rows[0].total,
        orders: orders.rows[0].total,
        products: products.rows[0].total,
        messages: messages.rows[0].total,
        pendingBookings: pendingBookings.rows[0].total,
        pendingOrders: pendingOrders.rows[0].total,
        completedOrders: completedOrders.rows[0].total,
        completedBookings: completedBookings.rows[0].total,
        totalRevenue: totalRevenue.rows[0].total,
        unreadNotifications: unreadNotifications.rows[0].total,
      },
      serviceBreakdown: serviceBreakdown.rows,
      orderStatusBreakdown: orderStatusBreakdown.rows,
      bookingStatusBreakdown: bookingStatusBreakdown.rows,
      revenueByDay: revenueByDay.rows,
      bookingsByDay: bookingsByDay.rows,
      ordersByDay: ordersByDay.rows,
      lowStockProducts: lowStockProducts.rows,
      recentBookings: recentBookings.rows,
      recentOrders: recentOrders.rows,
      recentAudit: recentAudit.rows,
    });
  } catch (err) {
    next(err);
  }
}

module.exports = { getAnalytics };
