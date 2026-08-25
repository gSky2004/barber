const crypto = require('crypto');
const pool = require('../db/pool');
const stripePay = require('../services/stripe');
const snippePay = require('../services/snippe');
const { markOrderPaid, getOrderWithCustomer } = require('../services/paymentService');
const { buildReceiptHtml } = require('../utils/receipt');
const { sendReceiptEmail } = require('../utils/email');

const PAYMENT_MODE = process.env.PAYMENT_MODE || 'sandbox';

const SANDBOX_CARDS = {
  success: '4242424242424242',
  decline: '4000000000000002',
};

function cleanCard(number = '') {
  return String(number).replace(/\s+/g, '');
}

function clientBaseUrl() {
  return (process.env.CLIENT_URL || 'http://localhost:5173').replace(/\/$/, '');
}

function resolveMode() {
  if (PAYMENT_MODE === 'snippe' && snippePay.isConfigured()) return 'snippe';
  if (PAYMENT_MODE === 'stripe' && stripePay.isConfigured()) return 'stripe';
  return 'sandbox';
}

async function createPaymentSession({ orderId, customerId, amount }) {
  const id = crypto.randomUUID().replace(/-/g, '');
  const mode = resolveMode();
  const result = await pool.query(
    `INSERT INTO payment_sessions (id, order_id, customer_id, amount, currency, status, mode)
     VALUES ($1, $2, $3, $4, 'TZS', 'pending', $5)
     RETURNING *`,
    [id, orderId, customerId || null, amount, mode]
  );
  return result.rows[0];
}

async function finalizeSuccessfulPayment({ session, paymentRef, paymentMethod }) {
  const existing = await getOrderWithCustomer(session.order_id);
  if (existing?.payment_status === 'paid') {
    return existing;
  }

  const order = await markOrderPaid({
    sessionId: session.id,
    orderId: session.order_id,
    paymentRef,
    paymentMethod,
    customerId: session.customer_id,
  });

  const full = await getOrderWithCustomer(order.id);
  try {
    await sendReceiptEmail(full, full.customer_email);
  } catch (mailErr) {
    console.warn('Receipt email failed:', mailErr.message);
  }
  return full;
}

async function getSession(req, res, next) {
  try {
    const result = await pool.query(
      `SELECT ps.*, o.name AS customer_name, o.items, o.delivery_preference, o.status AS order_status,
              o.payment_status, o.payment_ref, o.phone
       FROM payment_sessions ps
       JOIN orders o ON o.id = ps.order_id
       WHERE ps.id = $1`,
      [req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Payment session not found' });
    }

    const row = result.rows[0];
    if (req.customer && row.customer_id && row.customer_id !== req.customer.id) {
      return res.status(403).json({ error: 'Not your payment session' });
    }

    const charge = stripePay.toStripeAmount(row.amount);

    const mode = resolveMode();

    res.json({
      id: row.id,
      amount: Number(row.amount),
      currency: row.currency,
      status: row.status,
      mode: row.mode || mode,
      order_id: row.order_id,
      delivery_preference: row.delivery_preference,
      items: row.items,
      customer_name: row.customer_name,
      phone: row.phone,
      payment_status: row.payment_status,
      payment_ref: row.payment_ref,
      snippe_configured: snippePay.isConfigured(),
      stripe_configured: stripePay.isConfigured(),
      stripe_publishable_key:
        row.mode === 'stripe' ? process.env.STRIPE_PUBLISHABLE_KEY : undefined,
      charge_hint:
        row.mode === 'stripe' ? stripePay.formatChargeLabel(row.amount) : undefined,
      charge_currency: charge.currency,
      test_cards:
        row.mode === 'sandbox'
          ? {
              success: '4242 4242 4242 4242',
              decline: '4000 0000 0000 0002',
            }
          : {
              success: '4242 4242 4242 4242',
              note: 'Use Stripe test card 4242… in Test mode',
            },
    });
  } catch (err) {
    next(err);
  }
}

async function startStripeCheckout(req, res, next) {
  try {
    if (!stripePay.isConfigured()) {
      return res.status(503).json({
        error: 'Stripe is not configured. Add STRIPE_SECRET_KEY and STRIPE_PUBLISHABLE_KEY to server/.env',
      });
    }

    const sessionResult = await pool.query(
      `SELECT ps.*, o.name, o.phone, o.items, o.customer_id,
              c.email AS customer_email
       FROM payment_sessions ps
       JOIN orders o ON o.id = ps.order_id
       LEFT JOIN customers c ON c.id = o.customer_id
       WHERE ps.id = $1`,
      [req.params.id]
    );

    if (sessionResult.rows.length === 0) {
      return res.status(404).json({ error: 'Payment session not found' });
    }

    const session = sessionResult.rows[0];
    if (req.customer && session.customer_id && session.customer_id !== req.customer.id) {
      return res.status(403).json({ error: 'Not your payment session' });
    }
    if (session.status === 'paid') {
      return res.json({ already_paid: true, path: `/receipt/${session.order_id}` });
    }

    const email =
      session.customer_email ||
      req.body?.email ||
      undefined;

    const items = Array.isArray(session.items)
      ? session.items
      : typeof session.items === 'string'
        ? JSON.parse(session.items || '[]')
        : [];

    const checkout = await stripePay.createCheckoutSession({
      paymentSessionId: session.id,
      orderId: session.order_id,
      amountTzs: Number(session.amount),
      items,
      customerEmail: email,
      customerName: session.name,
      successUrl: `${clientBaseUrl()}/pay/${session.id}/callback?session_id={CHECKOUT_SESSION_ID}`,
      cancelUrl: `${clientBaseUrl()}/pay/${session.id}?canceled=1`,
    });

    await pool.query(`UPDATE payment_sessions SET mode = 'stripe' WHERE id = $1`, [session.id]);
    await pool.query(`UPDATE orders SET payment_method = 'stripe' WHERE id = $1`, [
      session.order_id,
    ]);

    // Store Stripe checkout id for later verify (optional column via payment_ref pending)
    await pool.query(
      `UPDATE payment_sessions SET status = 'pending' WHERE id = $1`,
      [session.id]
    );

    res.json({
      checkout_url: checkout.url,
      stripe_session_id: checkout.id,
      mode: 'stripe',
      charge_hint: stripePay.formatChargeLabel(session.amount),
    });
  } catch (err) {
    next(err);
  }
}

async function verifyStripeReturn(req, res, next) {
  try {
    const localSession = await pool.query(
      'SELECT * FROM payment_sessions WHERE id = $1',
      [req.params.id]
    );
    if (localSession.rows.length === 0) {
      return res.status(404).json({ error: 'Payment session not found' });
    }
    const session = localSession.rows[0];

    if (session.status === 'paid') {
      const order = await getOrderWithCustomer(session.order_id);
      return res.json({
        status: 'paid',
        order_id: session.order_id,
        payment_ref: order.payment_ref,
        receipt_path: `/receipt/${session.order_id}`,
      });
    }

    const checkoutSessionId =
      req.query.session_id || req.body?.session_id || req.query.checkout_session_id;

    if (!checkoutSessionId) {
      return res.status(400).json({ error: 'Missing Stripe session_id' });
    }

    const checkout = await stripePay.retrieveCheckoutSession(checkoutSessionId);

    if (checkout.metadata?.payment_session_id && checkout.metadata.payment_session_id !== session.id) {
      return res.status(400).json({ error: 'Session mismatch' });
    }

    if (checkout.payment_status !== 'paid' && checkout.status !== 'complete') {
      return res.status(402).json({
        error: 'Payment not completed yet',
        stripe_status: checkout.status,
        payment_status: checkout.payment_status,
      });
    }

    const paymentRef =
      (typeof checkout.payment_intent === 'string'
        ? checkout.payment_intent
        : checkout.payment_intent?.id) || checkout.id;

    const order = await finalizeSuccessfulPayment({
      session,
      paymentRef,
      paymentMethod: 'stripe',
    });

    res.json({
      status: 'paid',
      message: 'Payment confirmed',
      order_id: order.id,
      payment_ref: paymentRef,
      receipt_path: `/receipt/${order.id}`,
    });
  } catch (err) {
    next(err);
  }
}

/** Express raw-body webhook handler */
async function stripeWebhook(req, res) {
  const signature = req.headers['stripe-signature'];
  let event;

  try {
    if (process.env.STRIPE_WEBHOOK_SECRET) {
      event = stripePay.constructWebhookEvent(req.body, signature);
    } else {
      // Dev fallback without webhook secret (not for production)
      event = typeof req.body === 'string' || Buffer.isBuffer(req.body)
        ? JSON.parse(req.body.toString())
        : req.body;
    }
  } catch (err) {
    console.error('Stripe webhook signature error:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  try {
    if (event.type === 'checkout.session.completed') {
      const checkout = event.data.object;
      if (checkout.payment_status === 'paid' || checkout.status === 'complete') {
        const paymentSessionId = checkout.metadata?.payment_session_id;
        if (paymentSessionId) {
          const r = await pool.query('SELECT * FROM payment_sessions WHERE id = $1', [
            paymentSessionId,
          ]);
          const session = r.rows[0];
          if (session && session.status !== 'paid') {
            const paymentRef =
              (typeof checkout.payment_intent === 'string'
                ? checkout.payment_intent
                : checkout.payment_intent?.id) || checkout.id;
            await finalizeSuccessfulPayment({
              session,
              paymentRef,
              paymentMethod: 'stripe',
            });
          }
        }
      }
    }
    res.json({ received: true });
  } catch (err) {
    console.error('Stripe webhook handler error:', err);
    res.status(500).json({ error: 'Webhook handler failed' });
  }
}

async function confirmSandboxPayment(req, res, next) {
  try {
    if (resolveMode() === 'stripe') {
      return res.status(400).json({
        error: 'Sandbox card form is disabled while Stripe is active. Use Pay with Stripe.',
      });
    }

    const { card_number, card_name, expiry, cvc } = req.body;
    if (!card_number || !card_name || !expiry || !cvc) {
      return res.status(400).json({ error: 'Fill in all card details' });
    }

    const sessionResult = await pool.query(
      'SELECT * FROM payment_sessions WHERE id = $1',
      [req.params.id]
    );
    if (sessionResult.rows.length === 0) {
      return res.status(404).json({ error: 'Payment session not found' });
    }

    const session = sessionResult.rows[0];
    if (req.customer && session.customer_id && session.customer_id !== req.customer.id) {
      return res.status(403).json({ error: 'Not your payment session' });
    }
    if (session.status === 'paid') {
      return res.json({
        message: 'Already paid',
        status: 'paid',
        order_id: session.order_id,
        receipt_path: `/receipt/${session.order_id}`,
      });
    }
    if (session.status !== 'pending') {
      return res.status(400).json({ error: `Session is ${session.status}` });
    }

    const card = cleanCard(card_number);
    if (card === SANDBOX_CARDS.decline) {
      await pool.query(`UPDATE payment_sessions SET status = 'failed' WHERE id = $1`, [session.id]);
      await pool.query(`UPDATE orders SET payment_status = 'failed' WHERE id = $1`, [
        session.order_id,
      ]);
      return res.status(402).json({
        error: 'Card declined (sandbox). Try 4242 4242 4242 4242',
      });
    }

    if (card !== SANDBOX_CARDS.success) {
      return res.status(400).json({
        error: 'Sandbox only accepts test card 4242 4242 4242 4242',
      });
    }

    const paymentRef = `SANDBOX-${crypto.randomBytes(4).toString('hex').toUpperCase()}`;
    const order = await finalizeSuccessfulPayment({
      session,
      paymentRef,
      paymentMethod: 'sandbox_card',
    });

    res.json({
      message: 'Payment successful (sandbox)',
      status: 'paid',
      payment_ref: paymentRef,
      order_id: order.id,
      mode: 'sandbox',
      receipt_path: `/receipt/${order.id}`,
    });
  } catch (err) {
    next(err);
  }
}

async function getReceipt(req, res, next) {
  try {
    const order = await getOrderWithCustomer(req.params.orderId);
    if (!order) return res.status(404).json({ error: 'Order not found' });
    if (order.payment_status !== 'paid') {
      return res.status(400).json({ error: 'Order is not paid yet' });
    }

    if (req.customer && order.customer_id && order.customer_id !== req.customer.id) {
      return res.status(403).json({ error: 'Not your receipt' });
    }

    if (req.query.format === 'html') {
      res.setHeader('Content-Type', 'text/html; charset=utf-8');
      return res.send(buildReceiptHtml(order));
    }

    res.json({
      order: {
        id: order.id,
        name: order.name,
        phone: order.phone,
        items: order.items,
        total: Number(order.total),
        delivery_preference: order.delivery_preference,
        payment_ref: order.payment_ref,
        payment_method: order.payment_method,
        payment_status: order.payment_status,
        status: order.status,
        created_at: order.created_at,
      },
      receipt_html_url: `/api/payments/receipt/${order.id}?format=html`,
    });
  } catch (err) {
    next(err);
  }
}

// ── Snippe Mobile Money ──────────────────────────────────────────────

const MOBILE_POLL_INTERVAL = 4000;
const MOBILE_POLL_MAX_ATTEMPTS = 45;

async function initiateMobilePayment(req, res, next) {
  try {
    if (resolveMode() !== 'snippe') {
      return res.status(400).json({
        error: 'Mobile money is not enabled. Add SNIPPE_API_KEY to server/.env and set PAYMENT_MODE=snippe.',
      });
    }

    const snippe = snippePay.getClient();
    if (!snippe) {
      return res.status(503).json({ error: 'Snippe is not configured' });
    }

    const { phone } = req.body;
    if (!phone || !phone.trim()) {
      return res.status(400).json({ error: 'Phone number is required' });
    }

    const sessionResult = await pool.query(
      `SELECT ps.*, o.name, o.phone AS order_phone, o.items, o.customer_id,
              c.full_name AS customer_name, c.email AS customer_email
       FROM payment_sessions ps
       JOIN orders o ON o.id = ps.order_id
       LEFT JOIN customers c ON c.id = o.customer_id
       WHERE ps.id = $1`,
      [req.params.id]
    );

    if (sessionResult.rows.length === 0) {
      return res.status(404).json({ error: 'Payment session not found' });
    }

    const session = sessionResult.rows[0];
    if (req.customer && session.customer_id && session.customer_id !== req.customer.id) {
      return res.status(403).json({ error: 'Not your payment session' });
    }
    if (session.status === 'paid') {
      return res.json({ already_paid: true, path: `/receipt/${session.order_id}` });
    }

    const paymentPhone = phone.trim();
    const fullName = session.customer_name || session.name || 'Customer';
    const nameParts = fullName.trim().split(/\s+/);
    const firstName = nameParts[0] || 'Customer';
    const lastName = nameParts.slice(1).join(' ') || '';

    let payment;
    try {
      payment = await snippe.payments.mobile.create({
        amount: Math.round(Number(session.amount)),
        phoneNumber: paymentPhone,
        customer: {
          firstName,
          lastName,
          email: session.customer_email || '',
        },
        webhookUrl: snippePay.webhookUrl(),
        metadata: {
          payment_session_id: session.id,
          order_id: String(session.order_id),
        },
      });
    } catch (snippeErr) {
      console.error('Snippe mobile payment error:', snippeErr);
      return res.status(502).json({
        error: snippeErr.message || 'Failed to initiate mobile payment',
      });
    }

    await pool.query(
      `UPDATE payment_sessions SET mode = 'snippe', status = 'pending' WHERE id = $1`,
      [session.id]
    );
    await pool.query(
      `UPDATE orders SET payment_method = 'mobile_money' WHERE id = $1`,
      [session.order_id]
    );

    res.json({
      mode: 'snippe',
      status: payment.status,
      reference: payment.reference,
      expires_at: payment.expiresAt,
    });

    if (payment.status === 'pending') {
      pollMobilePayment(session.id, payment.reference);
    }
  } catch (err) {
    next(err);
  }
}

async function pollMobilePayment(sessionId, snippeRef, attempt = 0) {
  if (attempt >= MOBILE_POLL_MAX_ATTEMPTS) {
    await pool.query(`UPDATE payment_sessions SET status = 'expired' WHERE id = $1 AND status = 'pending'`, [sessionId]);
    return;
  }

  try {
    await new Promise((r) => setTimeout(r, MOBILE_POLL_INTERVAL));

    const snippe = snippePay.getClient();
    if (!snippe) return;

    const payment = await snippe.payments.get(snippeRef);

    if (payment.status === 'completed') {
      const sessionResult = await pool.query('SELECT * FROM payment_sessions WHERE id = $1', [sessionId]);
      const session = sessionResult.rows[0];
      if (session && session.status !== 'paid') {
        const paymentRef = payment.metadata?.external_reference || snippeRef;
        const channelProvider = payment.channel?.provider || 'mobile_money';
        const order = await finalizeSuccessfulPayment({
          session,
          paymentRef,
          paymentMethod: `snippe_${channelProvider}`,
        });
        console.log(`Snippe payment completed for order #${session.order_id}`);
      }
      return;
    }

    if (payment.status === 'failed' || payment.status === 'expired' || payment.status === 'voided') {
      await pool.query(`UPDATE payment_sessions SET status = $1 WHERE id = $2`, [payment.status, sessionId]);
      const sessionResult = await pool.query('SELECT order_id FROM payment_sessions WHERE id = $1', [sessionId]);
      if (sessionResult.rows[0]) {
        await pool.query(`UPDATE orders SET payment_status = $1 WHERE id = $2`, [payment.status, sessionResult.rows[0].order_id]);
      }
      return;
    }

    pollMobilePayment(sessionId, snippeRef, attempt + 1);
  } catch (err) {
    console.error('Snippe poll error:', err.message);
    pollMobilePayment(sessionId, snippeRef, attempt + 1);
  }
}

async function snippeWebhook(req, res) {
  let event;
  try {
    event = snippePay.parseWebhookEvent(req.body, req.headers);
  } catch (err) {
    console.error('Snippe webhook verification failed:', err.message);
    return res.status(400).json({ error: 'Invalid webhook signature' });
  }

  try {
    const { type, data } = event;

    if (type === 'payment.completed') {
      const sessionId = data.metadata?.payment_session_id;
      if (sessionId) {
        const r = await pool.query('SELECT * FROM payment_sessions WHERE id = $1', [sessionId]);
        const session = r.rows[0];
        if (session && session.status !== 'paid') {
          const paymentRef = data.external_reference || data.reference;
          const channelProvider = data.channel?.provider || 'mobile_money';
          await finalizeSuccessfulPayment({
            session,
            paymentRef,
            paymentMethod: `snippe_${channelProvider}`,
          });
          console.log(`Snippe webhook: order #${session.order_id} paid via ${channelProvider}`);
        }
      }
    } else if (type === 'payment.failed' || type === 'payment.expired') {
      const sessionId = data.metadata?.payment_session_id;
      if (sessionId) {
        await pool.query(`UPDATE payment_sessions SET status = $1 WHERE id = $2`, [data.status, sessionId]);
        const r = await pool.query('SELECT order_id FROM payment_sessions WHERE id = $1', [sessionId]);
        if (r.rows[0]) {
          await pool.query(`UPDATE orders SET payment_status = $1 WHERE id = $2`, [data.status, r.rows[0].order_id]);
        }
      }
    }

    res.json({ received: true });
  } catch (err) {
    console.error('Snippe webhook handler error:', err);
    res.status(500).json({ error: 'Webhook handler failed' });
  }
}

async function getSnippeBalance(req, res, next) {
  try {
    const snippe = snippePay.getClient();
    if (!snippe) return res.status(503).json({ error: 'Snippe not configured' });
    const balance = await snippe.payments.balance();
    res.json(balance);
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getSession,
  confirmSandboxPayment,
  startStripeCheckout,
  verifyStripeReturn,
  stripeWebhook,
  getReceipt,
  createPaymentSession,
  initiateMobilePayment,
  snippeWebhook,
  getSnippeBalance,
  PAYMENT_MODE,
};
