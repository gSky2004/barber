require('dotenv').config();
const fs = require('fs');
const path = require('path');
const pool = require('./pool');

async function migratePayments() {
  const sqlPath = path.join(__dirname, 'migrate-payments.sql');
  const sql = fs.readFileSync(sqlPath, 'utf8');
  try {
    await pool.query(sql);
    console.log('✓ Payment tables / columns applied');
  } catch (err) {
    console.error('Payment migration failed:', err.message);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

migratePayments();
