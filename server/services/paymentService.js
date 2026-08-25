const pool = require('../db/pool');

/**
 * Mark a payment session + order as paid, clear cart, return order row.
 */
async function markOrderPaid({
  sessionId,
  orderId,
  paymentRef,
  paymentMethod = 'flutterwave',
  customerId = null,
}) {
  await pool.query('BEGIN');
  try {
    if (sessionId) {
      await pool.query(
        `UPDATE payment_sessions
         SET status = 'paid', paid_at = NOW()
         WHERE id = $1 AND status = 'pending'`,
        [sessionId]
      );
    }

    const orderResult = await pool.query(
      `UPDATE orders
       SET payment_status = 'paid',
           payment_ref = $1,
           payment_method = $2,
           status = 'confirmed'
       WHERE id = $3
       RETURNING *`,
      [paymentRef, paymentMethod, orderId]
    );

    const order = orderResult.rows[0];
    const cartCustomerId = customerId || order?.customer_id;
    if (cartCustomerId) {
      await pool.query('DELETE FROM cart_items WHERE customer_id = $1', [cartCustomerId]);
    }

    await pool.query('COMMIT');
    return order;
  } catch (err) {
    await pool.query('ROLLBACK');
    throw err;
  }
}

async function getOrderWithCustomer(orderId) {
  const result = await pool.query(
    `SELECT o.*,
            c.email AS customer_email,
            c.full_name AS customer_full_name
     FROM orders o
     LEFT JOIN customers c ON c.id = o.customer_id
     WHERE o.id = $1`,
    [orderId]
  );
  return result.rows[0] || null;
}

module.exports = { markOrderPaid, getOrderWithCustomer };
