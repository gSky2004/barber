const {
  getSession,
  confirmSandboxPayment,
  startStripeCheckout,
  verifyStripeReturn,
  getReceipt,
  initiateMobilePayment,
  snippeWebhook,
  getSnippeBalance,
} = require('../controllers/paymentController');
const jwt = require('jsonwebtoken');

function optionalCustomerAuth(req, res, next) {
  const token =
    req.cookies?.customerToken ||
    req.headers.authorization?.replace('Bearer ', '');

  if (!token) return next();

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    if (payload.role === 'customer') {
      req.customer = payload;
    }
  } catch {
    /* ignore */
  }
  next();
}

module.exports = (router) => {
  router.get('/receipt/:orderId', optionalCustomerAuth, getReceipt);

  // Snippe mobile money
  router.post('/:id/mobile', optionalCustomerAuth, initiateMobilePayment);
  router.get('/snippe/balance', optionalCustomerAuth, getSnippeBalance);

  router.get('/:id', optionalCustomerAuth, getSession);
  router.post('/:id/confirm', optionalCustomerAuth, confirmSandboxPayment);
  router.post('/:id/stripe/init', optionalCustomerAuth, startStripeCheckout);
  router.get('/:id/stripe/verify', optionalCustomerAuth, verifyStripeReturn);
  router.post('/:id/stripe/verify', optionalCustomerAuth, verifyStripeReturn);
};
