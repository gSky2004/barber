const pool = require('../db/pool');
const { logAudit } = require('../utils/audit');

async function getTestimonials(req, res, next) {
  try {
    const admin = req.admin;
    const query = admin
      ? 'SELECT * FROM testimonials ORDER BY created_at DESC'
      : 'SELECT * FROM testimonials WHERE approved = true ORDER BY created_at DESC';
    const result = await pool.query(query);
    res.json(result.rows);
  } catch (err) {
    next(err);
  }
}

async function submitTestimonial(req, res, next) {
  try {
    const { customer_name, message, rating } = req.body;
    const result = await pool.query(
      `INSERT INTO testimonials (customer_name, message, rating, approved)
       VALUES ($1, $2, $3, false) RETURNING *`,
      [customer_name, message, rating]
    );
    res.status(201).json({ message: 'Thank you! Your review will appear after approval.', data: result.rows[0] });
  } catch (err) {
    next(err);
  }
}

async function updateTestimonial(req, res, next) {
  try {
    const { approved } = req.body;
    const old = await pool.query('SELECT * FROM testimonials WHERE id = $1', [req.params.id]);
    const result = await pool.query(
      'UPDATE testimonials SET approved = $1 WHERE id = $2 RETURNING *',
      [approved, req.params.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Testimonial not found' });

    logAudit(req, {
      action: approved ? 'approve' : 'update_status',
      entityType: 'testimonial',
      entityId: result.rows[0].id,
      entityName: result.rows[0].customer_name,
      oldValue: { approved: old.rows[0]?.approved },
      newValue: { approved },
    }).catch(() => {});

    res.json(result.rows[0]);
  } catch (err) {
    next(err);
  }
}

async function deleteTestimonial(req, res, next) {
  try {
    const old = await pool.query('SELECT * FROM testimonials WHERE id = $1', [req.params.id]);
    const result = await pool.query('DELETE FROM testimonials WHERE id = $1 RETURNING id', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Testimonial not found' });

    logAudit(req, {
      action: 'delete',
      entityType: 'testimonial',
      entityId: parseInt(req.params.id),
      entityName: old.rows[0]?.customer_name || null,
      oldValue: old.rows[0] || null,
    }).catch(() => {});

    res.json({ message: 'Testimonial deleted' });
  } catch (err) {
    next(err);
  }
}

module.exports = { getTestimonials, submitTestimonial, updateTestimonial, deleteTestimonial };
