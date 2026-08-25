const Stripe = require('stripe');

function getStripe() {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) return null;
  return new Stripe(key);
}

function isConfigured() {
  return Boolean(process.env.STRIPE_SECRET_KEY && process.env.STRIPE_PUBLISHABLE_KEY);
}

/** Stripe zero-decimal currencies (amount is already in major units) */
const ZERO_DECIMAL = new Set(['tzs', 'ugx', 'jpy', 'krw', 'vnd']);

function getChargeCurrency() {
  return String(process.env.STRIPE_CURRENCY || 'usd').toLowerCase();
}

/**
 * Convert shop total (stored in TZS) to Stripe unit amount.
 * Default: charge USD using TZS_PER_USD rate (Stripe test accounts usually use USD).
 * Set STRIPE_CURRENCY=tzs if your Stripe account supports TZS.
 */
function toStripeAmount(tzsAmount) {
  const currency = getChargeCurrency();
  const tzs = Number(tzsAmount) || 0;

  if (currency === 'tzs') {
    return { currency: 'tzs', unitAmount: Math.max(1, Math.round(tzs)) };
  }

  const rate = Number(process.env.TZS_PER_USD || 2600);
  const usd = tzs / (rate > 0 ? rate : 2600);
  // Stripe USD uses cents
  const cents = Math.max(50, Math.round(usd * 100)); // min $0.50
  return { currency: 'usd', unitAmount: cents, usdApprox: cents / 100 };
}

function formatChargeLabel(tzsAmount) {
  const { currency, unitAmount, usdApprox } = toStripeAmount(tzsAmount);
  if (currency === 'tzs') {
    return `TZS ${Number(tzsAmount).toLocaleString('en-TZ')}`;
  }
  return `≈ $${(usdApprox || unitAmount / 100).toFixed(2)} USD (from TZS ${Number(tzsAmount).toLocaleString('en-TZ')})`;
}

async function createCheckoutSession({
  paymentSessionId,
  orderId,
  amountTzs,
  items = [],
  customerEmail,
  customerName,
  successUrl,
  cancelUrl,
}) {
  const stripe = getStripe();
  if (!stripe) throw new Error('Stripe is not configured. Set STRIPE_SECRET_KEY.');

  const { currency, unitAmount } = toStripeAmount(amountTzs);

  const lineItems =
    items.length > 0
      ? items.map((item) => {
          const lineTzs = Number(item.price) * Number(item.quantity || 1);
          const share = amountTzs > 0 ? lineTzs / amountTzs : 1 / items.length;
          let itemAmount = Math.max(1, Math.round(unitAmount * share));
          return {
            quantity: 1,
            price_data: {
              currency,
              unit_amount: itemAmount,
              product_data: {
                name: String(item.name || 'Item').slice(0, 120),
                description: `Qty ${item.quantity || 1} · Milestone Accessories`,
              },
            },
          };
        })
      : [
          {
            quantity: 1,
            price_data: {
              currency,
              unit_amount: unitAmount,
              product_data: {
                name: 'Milestone Accessories order',
                description: `Order #${orderId}`,
              },
            },
          },
        ];

  // Fix rounding drift so sum matches unitAmount
  if (lineItems.length > 1) {
    const sum = lineItems.reduce((s, li) => s + li.price_data.unit_amount, 0);
    const diff = unitAmount - sum;
    lineItems[0].price_data.unit_amount += diff;
  }

  const session = await stripe.checkout.sessions.create({
    mode: 'payment',
    payment_method_types: ['card'],
    line_items: lineItems,
    success_url: successUrl,
    cancel_url: cancelUrl,
    customer_email: customerEmail || undefined,
    client_reference_id: String(orderId),
    metadata: {
      payment_session_id: paymentSessionId,
      order_id: String(orderId),
      amount_tzs: String(amountTzs),
      customer_name: customerName || '',
    },
  });

  return session;
}

async function retrieveCheckoutSession(checkoutSessionId) {
  const stripe = getStripe();
  if (!stripe) throw new Error('Stripe is not configured');
  return stripe.checkout.sessions.retrieve(checkoutSessionId);
}

function constructWebhookEvent(rawBody, signature) {
  const stripe = getStripe();
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!stripe || !secret) {
    throw new Error('Stripe webhook is not configured');
  }
  return stripe.webhooks.constructEvent(rawBody, signature, secret);
}

module.exports = {
  isConfigured,
  getStripe,
  getChargeCurrency,
  toStripeAmount,
  formatChargeLabel,
  createCheckoutSession,
  retrieveCheckoutSession,
  constructWebhookEvent,
  ZERO_DECIMAL,
};
