const { Snippe, verifyWebhook } = require('@snippe/sdk');

let _client = null;

function getClient() {
  const key = process.env.SNIPPE_API_KEY;
  if (!key) return null;
  if (!_client) {
    _client = new Snippe({
      apiKey: key,
      environment: process.env.NODE_ENV === 'production' ? 'production' : 'sandbox',
    });
  }
  return _client;
}

function isConfigured() {
  return Boolean(process.env.SNIPPE_API_KEY);
}

function apiBaseUrl() {
  return (process.env.API_URL || 'http://localhost:5000').replace(/\/$/, '');
}

function webhookUrl() {
  return `${apiBaseUrl()}/api/payments/webhook/snippe`;
}

function parseWebhookEvent(rawBody, headers) {
  const secret = process.env.SNIPPE_WEBHOOK_SECRET;
  if (!secret) {
    // Dev fallback — parse without verification
    const body = typeof rawBody === 'string' || Buffer.isBuffer(rawBody)
      ? JSON.parse(rawBody.toString())
      : rawBody;
    return body;
  }
  return verifyWebhook({
    rawBody,
    signature: headers['x-webhook-signature'],
    timestamp: headers['x-webhook-timestamp'],
    signingKey: secret,
    toleranceSeconds: 300,
  });
}

module.exports = { getClient, isConfigured, webhookUrl, parseWebhookEvent };
