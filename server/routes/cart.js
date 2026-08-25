const { body } = require('express-validator');
const {
  getCart, addToCart, updateCartItem, removeCartItem, checkout,
} = require('../controllers/cartController');
const customerAuth = require('../middleware/customerAuth');
const validate = require('../middleware/validate');

module.exports = (router) => {
  router.use(customerAuth);

  router.get('/', getCart);
  router.post(
    '/',
    [body('product_id').isInt({ min: 1 }), body('quantity').optional().isInt({ min: 1 })],
    validate,
    addToCart
  );
  router.put('/:id', [body('quantity').isInt()], validate, updateCartItem);
  router.delete('/:id', removeCartItem);
  router.post('/checkout', checkout);
};
