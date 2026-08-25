const pool = require('../db/pool');

/**
 * Audit logging helper.
 * Call logAudit(req, { action, entityType, entityId, entityName, oldValue, newValue })
 * from any admin controller after a successful action.
 */
async function logAudit(req, { action, entityType, entityId, entityName, oldValue, newValue }) {
  try {
    const admin = req.admin || {};
    await pool.query(
      `INSERT INTO admin_audit_log (admin_id, admin_username, action, entity_type, entity_id, entity_name, old_value, new_value, ip_address)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
      [
        admin.id || null,
        admin.username || 'system',
        action,
        entityType,
        entityId || null,
        entityName || null,
        oldValue ? JSON.stringify(oldValue) : null,
        newValue ? JSON.stringify(newValue) : null,
        req.ip || req.connection?.remoteAddress || null,
      ]
    );
  } catch (err) {
    console.warn('Audit log failed:', err.message);
  }
}

module.exports = { logAudit };
