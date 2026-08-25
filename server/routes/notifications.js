const { getNotifications, markRead, getCustomerNotifications } = require('../controllers/notificationsController');
const auth = require('../middleware/auth');

module.exports = (router) => {
  router.get('/', auth, getNotifications);
  router.put('/:id/read', auth, markRead);
  router.get('/customer', getCustomerNotifications);
};
