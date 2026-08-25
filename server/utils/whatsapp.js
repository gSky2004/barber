/**
 * WhatsApp notification helper — sends a message to the shop owner.
 *
 * Provider options (set WHATSAPP_PROVIDER in .env):
 *   - "callmebot"  (default, free)  — https://www.callmebot.com/
 *   - "whatsapp"   (direct link fallback — opens wa.me, no API needed)
 *
 * For production, sign up for CallMeBot or switch to Twilio WhatsApp Business API.
 */

const https = require('https');
const http = require('http');

const OWNER_PHONE = '255675029833';

function getProvider() {
  return (process.env.WHATSAPP_PROVIDER || 'callmebot').toLowerCase();
}

/** Send via CallMeBot free API */
async function sendViaCallmebot(phone, message) {
  const apiKey = process.env.CALLMEBOT_API_KEY;
  if (!apiKey) {
    console.warn('CALLMEBOT_API_KEY not set — skipping WhatsApp send');
    return { ok: false, reason: 'no_api_key' };
  }

  const params = new URLSearchParams({ phone, text: message, apikey: apiKey });
  const url = `https://api.callmebot.com/whatsapp.php?${params}`;

  return new Promise((resolve) => {
    const req = https.get(url, { timeout: 10000 }, (res) => {
      let body = '';
      res.on('data', (chunk) => { body += chunk; });
      res.on('end', () => {
        if (res.statusCode === 200) {
          resolve({ ok: true });
        } else {
          console.warn('CallMeBot response:', res.statusCode, body.slice(0, 200));
          resolve({ ok: false, reason: `status_${res.statusCode}` });
        }
      });
    });
    req.on('error', (err) => {
      console.warn('CallMeBot error:', err.message);
      resolve({ ok: false, reason: err.message });
    });
    req.on('timeout', () => {
      req.destroy();
      resolve({ ok: false, reason: 'timeout' });
    });
  });
}

/** Fallback — log to console (always works in dev) */
function logFallback(phone, message) {
  console.log(`\n📱 WhatsApp to ${phone}:\n${message}\n`);
  return { ok: true, fallback: true };
}

async function sendWhatsAppMessage(message) {
  const provider = getProvider();
  const phone = OWNER_PHONE;

  if (provider === 'callmebot') {
    const result = await sendViaCallmebot(phone, message);
    if (result.ok) return result;
    // fallback
    return logFallback(phone, message);
  }

  return logFallback(phone, message);
}

function buildBookingMessage({ type, name, phone, date, time, details }) {
  const serviceLabel = type === 'barber'
    ? `Barbershop — ${details?.service || 'haircut'}`
    : `Gaming — ${details?.duration || '1'}h × ${details?.players || 1} player(s)`;

  return [
    '🎙 *New Booking — Milestone Accessories*',
    '',
    `👤 *Name:* ${name}`,
    `📱 *Phone:* ${phone}`,
    `📅 *Date:* ${date}`,
    `🕐 *Time:* ${time}`,
    `💆 *Type:* ${type === 'barber' ? 'Barbershop' : 'Gaming Station'}`,
    `✨ *Service:* ${serviceLabel}`,
    '',
    `_Booking #${Date.now().toString(36).toUpperCase()}_`,
  ].join('\n');
}

function buildOrderMessage({ name, phone, order_type, items, total, issue_description, delivery_preference }) {
  const isRepair = order_type === 'repair';

  if (isRepair) {
    return [
      '🔧 *New Repair Request — Milestone Accessories*',
      '',
      `👤 *Name:* ${name}`,
      `📱 *Phone:* ${phone}`,
      `🖥️ *Device:* ${items?.[0]?.name || 'N/A'}`,
      `📝 *Issue:* ${issue_description || 'N/A'}`,
      '',
      `_Order #${Date.now().toString(36).toUpperCase()}_`,
    ].join('\n');
  }

  const itemList = (items || []).map((i) => `  • ${i.name} × ${i.quantity} — ${Number(i.price * i.quantity).toLocaleString()} TZS`).join('\n');

  return [
    '📦 *New Product Order — Milestone Accessories*',
    '',
    `👤 *Name:* ${name}`,
    `📱 *Phone:* ${phone}`,
    `🛒 *Items:*`,
    itemList || '  (no items)',
    total ? `💰 *Total:* ${Number(total).toLocaleString()} TZS` : '',
    `🚚 *Delivery:* ${delivery_preference === 'delivery' ? 'Delivery' : 'Pickup'}`,
    '',
    `_Order #${Date.now().toString(36).toUpperCase()}_`,
  ].filter(Boolean).join('\n');
}

module.exports = { sendWhatsAppMessage, buildBookingMessage, buildOrderMessage, OWNER_PHONE };
