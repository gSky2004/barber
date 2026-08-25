const pool = require('../db/pool');
const { createPaymentSession, PAYMENT_MODE } = require('./paymentController');

async function getCart(req, res, next) {
  try {
    const result = await pool.query(
      `SELECT c.id, c.quantity, c.product_id,
              p.name, p.price, p.image_url, p.stock, p.category
       FROM cart_items c
       JOIN products p ON p.id = c.product_id
       WHERE c.customer_id = $1
       ORDER BY c.created_at DESC`,
      [req.customer.id]
    );
    const items = result.rows;
    const total = items.reduce((sum, i) => sum + Number(i.price) * i.quantity, 0);
    res.json({ items, total, count: items.reduce((n, i) => n + i.quantity, 0) });
  } catch (err) {
    next(err);
  }
}

async function addToCart(req, res, next) {
  try {
    const { product_id, quantity = 1 } = req.body;
    const product = await pool.query('SELECT id, stock FROM products WHERE id = $1', [product_id]);
    if (product.rows.length === 0) {
      return res.status(404).json({ error: 'Product not found' });
    }

    await pool.query(
      `INSERT INTO cart_items (customer_id, product_id, quantity)
       VALUES ($1, $2, $3)
       ON CONFLICT (customer_id, product_id)
       DO UPDATE SET quantity = cart_items.quantity + EXCLUDED.quantity`,
      [req.customer.id, product_id, quantity]
    );

    const cart = await pool.query(
      `SELECT c.id, c.quantity, c.product_id, p.name, p.price, p.image_url, p.stock, p.category
       FROM cart_items c JOIN products p ON p.id = c.product_id
       WHERE c.customer_id = $1 ORDER BY c.created_at DESC`,
      [req.customer.id]
    );
    res.status(201).json({ message: 'Added to cart', items: cart.rows });
  } catch (err) {
    next(err);
  }
}

async function updateCartItem(req, res, next) {
  try {
    const { quantity } = req.body;
    if (quantity <= 0) {
      await pool.query('DELETE FROM cart_items WHERE id = $1 AND customer_id = $2', [
        req.params.id,
        req.customer.id,
      ]);
    } else {
      await pool.query(
        'UPDATE cart_items SET quantity = $1 WHERE id = $2 AND customer_id = $3',
        [quantity, req.params.id, req.customer.id]
      );
    }
    res.json({ message: 'Cart updated' });
  } catch (err) {
    next(err);
  }
}

async function removeCartItem(req, res, next) {
  try {
    await pool.query('DELETE FROM cart_items WHERE id = $1 AND customer_id = $2', [
      req.params.id,
      req.customer.id,
    ]);
    res.json({ message: 'Item removed' });
  } catch (err) {
    next(err);
  }
}

async function checkout(req, res, next) {
  try {
    const { delivery_preference = 'pickup', phone } = req.body;
    const cart = await pool.query(
      `SELECT c.quantity, p.id AS product_id, p.name, p.price
       FROM cart_items c JOIN products p ON p.id = c.product_id
       WHERE c.customer_id = $1`,
      [req.customer.id]
    );

    if (cart.rows.length === 0) {
      return res.status(400).json({ error: 'Your cart is empty' });
    }

    const customer = await pool.query(
      'SELECT full_name, phone, email FROM customers WHERE id = $1',
      [req.customer.id]
    );
    const user = customer.rows[0];
    const items = cart.rows.map((r) => ({
      product_id: r.product_id,
      name: r.name,
      quantity: r.quantity,
      price: Number(r.price),
    }));
    const total = items.reduce((s, i) => s + i.price * i.quantity, 0);

    const order = await pool.query(
      `INSERT INTO orders (name, phone, order_type, items, total, delivery_preference, customer_id, status, payment_status)
       VALUES ($1, $2, 'product', $3, $4, $5, $6, 'pending', 'awaiting_payment')
       RETURNING *`,
      [
        user.full_name,
        phone || user.phone || '',
        JSON.stringify(items),
        total,
        delivery_preference,
        req.customer.id,
      ]
    );

    const paymentSession = await createPaymentSession({
      orderId: order.rows[0].id,
      customerId: req.customer.id,
      amount: total,
    });

    res.status(201).json({
      message: 'Order created — complete payment to confirm.',
      order: order.rows[0],
      payment: {
        session_id: paymentSession.id,
        mode: paymentSession.mode || PAYMENT_MODE,
        amount: total,
        currency: 'TZS',
        path: `/pay/${paymentSession.id}`,
      },
    });
  } catch (err) {
    next(err);
  }
}

module.exports = { getCart, addToCart, updateCartItem, removeCartItem, checkout };
