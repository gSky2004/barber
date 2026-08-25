const { getAuditLogs, getAuditStats } = require('../controllers/auditController');
const auth = require('../middleware/auth');

module.exports = (router) => {
  router.get('/', auth, getAuditLogs);
  router.get('/stats', auth, getAuditStats);
};
