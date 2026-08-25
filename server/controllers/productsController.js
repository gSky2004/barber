const pool = require('../db/pool');
const { logAudit } = require('../utils/audit');

async function getProducts(req, res, next) {
  try {
    const { category } = req.query;
    let query = 'SELECT * FROM products ORDER BY created_at DESC';
    const params = [];

    if (category) {
      query = 'SELECT * FROM products WHERE category = $1 ORDER BY created_at DESC';
      params.push(category);
    }

    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (err) {
    next(err);
  }
}

async function getProduct(req, res, next) {
  try {
    const result = await pool.query('SELECT * FROM products WHERE id = $1', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Product not found' });
    res.json(result.rows[0]);
  } catch (err) {
    next(err);
  }
}

async function createProduct(req, res, next) {
  try {
    const { name, category, description, price, stock, image_url } = req.body;
    const result = await pool.query(
      `INSERT INTO products (name, category, description, price, stock, image_url)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [name, category, description, price, stock, image_url]
    );
    const product = result.rows[0];

    logAudit(req, {
      action: 'create',
      entityType: 'product',
      entityId: product.id,
      entityName: name,
      newValue: product,
    }).catch(() => {});

    res.status(201).json(product);
  } catch (err) {
    next(err);
  }
}

async function updateProduct(req, res, next) {
  try {
    const { name, category, description, price, stock, image_url } = req.body;
    const old = await pool.query('SELECT * FROM products WHERE id = $1', [req.params.id]);
    const result = await pool.query(
      `UPDATE products SET name=$1, category=$2, description=$3, price=$4, stock=$5, image_url=$6
       WHERE id=$7 RETURNING *`,
      [name, category, description, price, stock, image_url, req.params.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Product not found' });

    logAudit(req, {
      action: 'update',
      entityType: 'product',
      entityId: result.rows[0].id,
      entityName: name,
      oldValue: old.rows[0] || null,
      newValue: result.rows[0],
    }).catch(() => {});

    res.json(result.rows[0]);
  } catch (err) {
    next(err);
  }
}

async function deleteProduct(req, res, next) {
  try {
    const old = await pool.query('SELECT * FROM products WHERE id = $1', [req.params.id]);
    const result = await pool.query('DELETE FROM products WHERE id = $1 RETURNING id', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Product not found' });

    logAudit(req, {
      action: 'delete',
      entityType: 'product',
      entityId: parseInt(req.params.id),
      entityName: old.rows[0]?.name || null,
      oldValue: old.rows[0] || null,
    }).catch(() => {});

    res.json({ message: 'Product deleted' });
  } catch (err) {
    next(err);
  }
}

module.exports = { getProducts, getProduct, createProduct, updateProduct, deleteProduct };
