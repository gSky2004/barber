const nodemailer = require('nodemailer');
const { buildReceiptHtml } = require('./receipt');

let transporter = null;

function getTransporter() {
  if (transporter) return transporter;

  transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT || '587', 10),
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  return transporter;
}

async function sendContactEmail({ name, email, phone, message }) {
  if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
    console.warn('SMTP not configured — skipping email send');
    return false;
  }

  const mailOptions = {
    from: `"Milestone Accessories" <${process.env.SMTP_USER}>`,
    to: process.env.CONTACT_EMAIL || process.env.SMTP_USER,
    replyTo: email || undefined,
    subject: `New inquiry from ${name}`,
    html: `
      <h2>New Contact Message</h2>
      <p><strong>Name:</strong> ${name}</p>
      <p><strong>Email:</strong> ${email || 'N/A'}</p>
      <p><strong>Phone:</strong> ${phone || 'N/A'}</p>
      <p><strong>Message:</strong></p>
      <p>${message.replace(/\n/g, '<br>')}</p>
    `,
  };

  await getTransporter().sendMail(mailOptions);
  return true;
}

async function sendReceiptEmail(order, toEmail) {
  if (!toEmail) return false;
  if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
    console.warn('SMTP not configured — skipping receipt email');
    return false;
  }

  const html = buildReceiptHtml(order);
  await getTransporter().sendMail({
    from: `"Milestone Accessories" <${process.env.SMTP_USER}>`,
    to: toEmail,
    bcc: process.env.CONTACT_EMAIL || undefined,
    subject: `Receipt #${order.id} — Milestone Accessories`,
    html,
  });
  return true;
}

module.exports = { sendContactEmail, sendReceiptEmail };
