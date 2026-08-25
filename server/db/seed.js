require('dotenv').config();
const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');
const pool = require('./pool');

async function seed() {
  try {
    const passwordHash = await bcrypt.hash(process.env.ADMIN_PASSWORD || 'admin123', 10);

    await pool.query(
      `INSERT INTO admin_users (username, password_hash)
       VALUES ($1, $2)
       ON CONFLICT (username) DO UPDATE SET password_hash = EXCLUDED.password_hash`,
      [process.env.ADMIN_USERNAME || 'admin', passwordHash]
    );

    const productCount = await pool.query('SELECT COUNT(*)::int AS count FROM products');
    if (productCount.rows[0].count === 0) {
      const seedPath = path.join(__dirname, 'seed.sql');
      const sql = fs.readFileSync(seedPath, 'utf8');
      await pool.query(sql);
    } else {
      console.log('  Seed data already exists — skipping product/gallery/testimonial inserts');
    }

    console.log('✓ Seed data applied successfully');
    console.log(`  Admin login: ${process.env.ADMIN_USERNAME || 'admin'} / ${process.env.ADMIN_PASSWORD || 'admin123'}`);
  } catch (err) {
    console.error('Seed failed:', err.message);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

seed();
