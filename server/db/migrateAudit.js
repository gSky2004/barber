require('dotenv').config();
const pool = require('./pool');
const fs = require('fs');
const path = require('path');

async function migrate() {
  const sql = fs.readFileSync(path.join(__dirname, 'migrate-audit.sql'), 'utf8');
  await pool.query(sql);
  console.log('Audit & notifications tables created');
  process.exit(0);
}

migrate().catch((e) => { console.error(e); process.exit(1); });
