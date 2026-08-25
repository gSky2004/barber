const { body } = require('express-validator');
const {
  getProducts, getProduct, createProduct, updateProduct, deleteProduct,
} = require('../controllers/productsController');
const auth = require('../middleware/auth');
const validate = require('../middleware/validate');

const productValidation = [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('category').trim().notEmpty().withMessage('Category is required'),
  body('price').isFloat({ min: 0 }).withMessage('Valid price is required'),
  body('stock').isInt({ min: 0 }).withMessage('Valid stock is required'),
];

module.exports = (router) => {
  router.get('/', getProducts);
  router.get('/:id', getProduct);
  router.post('/', auth, productValidation, validate, createProduct);
  router.put('/:id', auth, productValidation, validate, updateProduct);
  router.delete('/:id', auth, deleteProduct);
};
