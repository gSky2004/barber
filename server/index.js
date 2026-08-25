require('dotenv').config();
const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const path = require('path');
const errorHandler = require('./middleware/errorHandler');

const app = express();
const PORT = process.env.PORT || 5000;

const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:5174',
  'http://localhost:5175',
  'http://localhost:3000',
  process.env.CLIENT_URL,
].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    const isLocalVite =
      process.env.NODE_ENV !== 'production' &&
      origin &&
      /^http:\/\/localhost:\d+$/.test(origin);
    if (!origin || allowedOrigins.includes(origin) || isLocalVite) {
      callback(null, true);
    } else {
      callback(null, false);
    }
  },
  credentials: true,
}));

// Stripe webhook needs raw body for signature verification
const { stripeWebhook, snippeWebhook } = require('./controllers/paymentController');
app.post(
  '/api/payments/webhook/stripe',
  express.raw({ type: 'application/json' }),
  stripeWebhook
);

// Snippe mobile money webhook (also needs raw body for HMAC verification)
app.post(
  '/api/payments/webhook/snippe',
  express.raw({ type: 'application/json' }),
  snippeWebhook
);

app.use(express.json());
app.use(cookieParser());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

const routes = ['auth', 'products', 'bookings', 'orders', 'contact', 'gallery', 'testimonials', 'analytics', 'customers', 'cart', 'payments', 'audit', 'notifications'];
routes.forEach((name) => {
  const router = express.Router();
  require(`./routes/${name}`)(router);
  app.use(`/api/${name}`, router);
});

app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Milestone API running on port ${PORT}`);
});
