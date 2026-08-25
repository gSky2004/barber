const pool = require('../db/pool');
const { logAudit } = require('../utils/audit');

async function getGallery(req, res, next) {
  try {
    const result = await pool.query('SELECT * FROM gallery ORDER BY created_at DESC');
    res.json(result.rows);
  } catch (err) {
    next(err);
  }
}

async function addGalleryImage(req, res, next) {
  try {
    const { image_url, caption } = req.body;
    const result = await pool.query(
      'INSERT INTO gallery (image_url, caption) VALUES ($1, $2) RETURNING *',
      [image_url, caption]
    );

    logAudit(req, {
      action: 'create',
      entityType: 'gallery',
      entityId: result.rows[0].id,
      entityName: caption || 'Image',
      newValue: result.rows[0],
    }).catch(() => {});

    res.status(201).json(result.rows[0]);
  } catch (err) {
    next(err);
  }
}

async function deleteGalleryImage(req, res, next) {
  try {
    const old = await pool.query('SELECT * FROM gallery WHERE id = $1', [req.params.id]);
    const result = await pool.query('DELETE FROM gallery WHERE id = $1 RETURNING id', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Image not found' });

    logAudit(req, {
      action: 'delete',
      entityType: 'gallery',
      entityId: parseInt(req.params.id),
      entityName: old.rows[0]?.caption || 'Image',
      oldValue: old.rows[0] || null,
    }).catch(() => {});

    res.json({ message: 'Image deleted' });
  } catch (err) {
    next(err);
  }
}

module.exports = { getGallery, addGalleryImage, deleteGalleryImage };
