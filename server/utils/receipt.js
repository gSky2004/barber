function formatTZS(amount) {
  const n = Number(amount) || 0;
  return `TZS ${n.toLocaleString('en-TZ', { maximumFractionDigits: 0 })}`;
}

function escapeHtml(str = '') {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function buildReceiptHtml(order) {
  const items = Array.isArray(order.items)
    ? order.items
    : (typeof order.items === 'string' ? JSON.parse(order.items || '[]') : []);

  const rows = items
    .map(
      (item) => `
      <tr>
        <td style="padding:10px 8px;border-bottom:1px solid #eee;">${escapeHtml(item.name)}</td>
        <td style="padding:10px 8px;border-bottom:1px solid #eee;text-align:center;">${item.quantity}</td>
        <td style="padding:10px 8px;border-bottom:1px solid #eee;text-align:right;">${formatTZS(item.price)}</td>
        <td style="padding:10px 8px;border-bottom:1px solid #eee;text-align:right;">${formatTZS(Number(item.price) * Number(item.quantity))}</td>
      </tr>`
    )
    .join('');

  const paidAt = order.paid_at || order.created_at || new Date().toISOString();
  const dateStr = new Date(paidAt).toLocaleString('en-TZ', { dateStyle: 'medium', timeStyle: 'short' });

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <title>Receipt #${order.id} — Milestone Accessories</title>
</head>
<body style="margin:0;padding:24px;background:#f4f5f7;font-family:Arial,Helvetica,sans-serif;color:#111;">
  <div style="max-width:640px;margin:0 auto;background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 8px 24px rgba(0,0,0,0.08);">
    <div style="background:#101827;color:#f5d36b;padding:24px 28px;">
      <div style="font-size:22px;font-weight:700;letter-spacing:0.04em;">Milestone Accessories</div>
      <div style="color:#a5adc8;font-size:13px;margin-top:6px;">Mbeya, Tanzania · Official Payment Receipt</div>
    </div>
    <div style="padding:28px;">
      <h1 style="margin:0 0 8px;font-size:20px;">Payment Receipt</h1>
      <p style="margin:0 0 20px;color:#555;font-size:14px;">Thank you for your purchase. This confirms a successful payment.</p>

      <table style="width:100%;font-size:14px;margin-bottom:20px;">
        <tr><td style="padding:4px 0;color:#666;">Receipt / Order #</td><td style="text-align:right;font-weight:600;">${order.id}</td></tr>
        <tr><td style="padding:4px 0;color:#666;">Payment Ref</td><td style="text-align:right;font-weight:600;">${escapeHtml(order.payment_ref || '—')}</td></tr>
        <tr><td style="padding:4px 0;color:#666;">Date</td><td style="text-align:right;">${escapeHtml(dateStr)}</td></tr>
        <tr><td style="padding:4px 0;color:#666;">Customer</td><td style="text-align:right;">${escapeHtml(order.name)}</td></tr>
        <tr><td style="padding:4px 0;color:#666;">Phone</td><td style="text-align:right;">${escapeHtml(order.phone || '—')}</td></tr>
        <tr><td style="padding:4px 0;color:#666;">Delivery</td><td style="text-align:right;text-transform:capitalize;">${escapeHtml(order.delivery_preference || 'pickup')}</td></tr>
        <tr><td style="padding:4px 0;color:#666;">Method</td><td style="text-align:right;text-transform:capitalize;">${escapeHtml(order.payment_method || 'card')}</td></tr>
        <tr><td style="padding:4px 0;color:#666;">Status</td><td style="text-align:right;color:#15803d;font-weight:700;">PAID</td></tr>
      </table>

      <table style="width:100%;border-collapse:collapse;font-size:14px;">
        <thead>
          <tr style="background:#f8fafc;">
            <th style="text-align:left;padding:10px 8px;">Item</th>
            <th style="text-align:center;padding:10px 8px;">Qty</th>
            <th style="text-align:right;padding:10px 8px;">Price</th>
            <th style="text-align:right;padding:10px 8px;">Subtotal</th>
          </tr>
        </thead>
        <tbody>
          ${rows || '<tr><td colspan="4" style="padding:12px;color:#666;">No line items</td></tr>'}
        </tbody>
      </table>

      <div style="margin-top:20px;padding-top:16px;border-top:2px solid #101827;display:flex;justify-content:space-between;align-items:center;">
        <span style="font-size:15px;font-weight:600;">Total Paid</span>
        <span style="font-size:22px;font-weight:700;color:#b45309;">${formatTZS(order.total)}</span>
      </div>

      <p style="margin-top:28px;font-size:12px;color:#888;line-height:1.5;">
        Keep this receipt for your records. For pickup or delivery questions, contact Milestone Accessories in Mbeya.
        Email: ${escapeHtml(process.env.CONTACT_EMAIL || 'support@milestoneaccessories.co.tz')}
      </p>
    </div>
  </div>
</body>
</html>`;
}

module.exports = { buildReceiptHtml, formatTZS };
