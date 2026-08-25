const { body } = require('express-validator');
const {
  getTestimonials, submitTestimonial, updateTestimonial, deleteTestimonial,
} = require('../controllers/testimonialsController');
const auth = require('../middleware/auth');
const validate = require('../middleware/validate');

const optionalAuth = (req, res, next) => {
  const token = req.cookies?.token || req.headers.authorization?.replace('Bearer ', '');
  if (token) {
    try {
      const jwt = require('jsonwebtoken');
      req.admin = jwt.verify(token, process.env.JWT_SECRET);
    } catch { /* public access */ }
  }
  next();
};

module.exports = (router) => {
  router.get('/', optionalAuth, getTestimonials);
  router.post('/', [
    body('customer_name').trim().notEmpty(),
    body('message').trim().notEmpty(),
    body('rating').optional().isInt({ min: 1, max: 5 }),
  ], validate, submitTestimonial);
  router.put('/:id', auth, body('approved').isBoolean(), validate, updateTestimonial);
  router.delete('/:id', auth, deleteTestimonial);
};
