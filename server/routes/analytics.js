const { getAnalytics } = require('../controllers/analyticsController');
const auth = require('../middleware/auth');

module.exports = (router) => {
  router.get('/', auth, getAnalytics);
};
