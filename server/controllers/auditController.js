const pool = require('../db/pool');

async function getAuditLogs(req, res, next) {
  try {
    const limit = Math.min(parseInt(req.query.limit) || 50, 200);
    const offset = parseInt(req.query.offset) || 0;
    const entityFilter = req.query.entity || '';
    const actionFilter = req.query.action || '';

    let where = 'WHERE 1=1';
    const params = [];

    if (entityFilter) {
      params.push(entityFilter);
      where += ` AND entity_type = $${params.length}`;
    }
    if (actionFilter) {
      params.push(actionFilter);
      where += ` AND action = $${params.length}`;
    }

    const [logs, countResult] = await Promise.all([
      pool.query(
        `SELECT * FROM admin_audit_log ${where} ORDER BY created_at DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`,
        [...params, limit, offset]
      ),
      pool.query(
        `SELECT COUNT(*)::int AS total FROM admin_audit_log ${where}`,
        params
      ),
    ]);

    res.json({
      logs: logs.rows,
      total: countResult.rows[0].total,
      limit,
      offset,
    });
  } catch (err) {
    next(err);
  }
}

async function getAuditStats(req, res, next) {
  try {
    const [byAction, byEntity, byAdmin, recentActivity] = await Promise.all([
      pool.query(`
        SELECT action, COUNT(*)::int AS count
        FROM admin_audit_log
        GROUP BY action ORDER BY count DESC
      `),
      pool.query(`
        SELECT entity_type, COUNT(*)::int AS count
        FROM admin_audit_log
        GROUP BY entity_type ORDER BY count DESC
      `),
      pool.query(`
        SELECT admin_username, COUNT(*)::int AS count
        FROM admin_audit_log
        GROUP BY admin_username ORDER BY count DESC
      `),
      pool.query(`
        SELECT DATE(created_at) AS date, COUNT(*)::int AS count
        FROM admin_audit_log
        WHERE created_at > NOW() - INTERVAL '30 days'
        GROUP BY DATE(created_at)
        ORDER BY date ASC
      `),
    ]);

    res.json({
      byAction: byAction.rows,
      byEntity: byEntity.rows,
      byAdmin: byAdmin.rows,
      dailyActivity: recentActivity.rows,
    });
  } catch (err) {
    next(err);
  }
}

module.exports = { getAuditLogs, getAuditStats };
