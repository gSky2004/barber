require('dotenv').config();
const pool = require('./pool');

const productImagesByName = {
  'Wireless Earbuds Pro': '/images/product-earbuds-pro.png',
};

const productImages = [
  'https://images.unsplash.com/photo-1591290619762-d2c6f2844c8b?w=600&q=80&auto=format&fit=crop',
  '/images/product-earbuds-pro.png',
  'https://images.unsplash.com/photo-1601784551445-20c9e07cdbdb?w=600&q=80&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1609091839311-d5365f9ff1c8?w=600&q=80&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1625729140849-a491e1c146db?w=600&q=80&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=600&q=80&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=600&q=80&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=600&q=80&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=600&q=80&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1565814636199-ae8133055c1c?w=600&q=80&auto=format&fit=crop',
];

const galleryImages = [
  ['/images/gallery-barbershop.png', 'Premium cuts and precision barbershop'],
  ['/images/gallery-barbershop-interior.png', 'Modern barbershop interior — book your appointment'],
  ['https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=800&q=80&auto=format&fit=crop', 'Phone accessories & gadget display'],
  ['/images/gallery-gaming.png', 'Gaming lounge with PlayStation setup'],
  ['/images/phone-repair.png', 'Mobile repair & diagnostics workstation'],
  ['/images/gallery-electrical-led.png', 'Electrical accessories & LED lighting'],
  ['https://images.unsplash.com/photo-1560250097-0b93528c311a?w=800&q=80&auto=format&fit=crop', 'Welcoming storefront in Mbeya'],
];

async function updateImages() {
  try {
    const products = await pool.query('SELECT id, name FROM products ORDER BY id');
    for (let i = 0; i < products.rows.length; i++) {
      const row = products.rows[i];
      const imageUrl =
        productImagesByName[row.name] || productImages[i % productImages.length];
      await pool.query('UPDATE products SET image_url = $1 WHERE id = $2', [
        imageUrl,
        row.id,
      ]);
    }

    await pool.query('DELETE FROM gallery');
    for (const [url, caption] of galleryImages) {
      await pool.query('INSERT INTO gallery (image_url, caption) VALUES ($1, $2)', [url, caption]);
    }

    console.log('✓ Product and gallery images updated to real photos');
  } catch (err) {
    console.error('Update failed:', err.message);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

updateImages();
