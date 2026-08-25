require('dotenv').config();
const pool = require('./pool');

const gamingProducts = [
  ['PS5 Gaming Session 1 Hour', 'gaming', 'Book 1 hour on our PlayStation 5 station with headset.', 5000, 50, '/images/gallery-gaming.png'],
  ['PS5 Gaming Session 2 Hours', 'gaming', 'Extended 2-hour PlayStation session — solo or with a friend.', 9000, 50, '/images/gallery-gaming.png'],
  ['DualSense Controller Rental', 'gaming', 'Extra DualSense controller for multiplayer sessions.', 3000, 10, '/images/gallery-gaming.png'],
];

async function seedGaming() {
  try {
    for (const p of gamingProducts) {
      const exists = await pool.query(
        'SELECT id FROM products WHERE name = $1',
        [p[0]]
      );
      if (exists.rows.length === 0) {
        await pool.query(
          `INSERT INTO products (name, category, description, price, stock, image_url)
           VALUES ($1, $2, $3, $4, $5, $6)`,
          p
        );
      }
    }
    console.log('✓ Gaming products seeded');
  } catch (err) {
    console.error(err.message);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

seedGaming();
