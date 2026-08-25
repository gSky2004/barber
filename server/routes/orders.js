const { body } = require('express-validator');
const { createOrder, getOrders, updateOrder } = require('../controllers/ordersController');
const auth = require('../middleware/auth');
const validate = require('../middleware/validate');

const orderValidation = [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('phone').trim().notEmpty().withMessage('Phone is required'),
  body('order_type').optional().isIn(['product', 'repair']),
];

module.exports = (router) => {
  router.post('/', orderValidation, validate, createOrder);
  router.get('/', auth, getOrders);
  router.put('/:id', auth, body('status').isIn(['pending', 'confirmed', 'completed', 'cancelled']), validate, updateOrder);
};
