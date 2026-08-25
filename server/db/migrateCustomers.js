require('dotenv').config();
const fs = require('fs');
const path = require('path');
const pool = require('./pool');

async function migrate() {
  const sql = fs.readFileSync(path.join(__dirname, 'migrate-customers.sql'), 'utf8');
  try {
    await pool.query(sql);
    console.log('✓ Customer tables applied');
  } catch (err) {
    console.error('Customer migration failed:', err.message);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

migrate();
