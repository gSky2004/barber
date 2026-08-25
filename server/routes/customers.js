const { body } = require('express-validator');
const { register, login, logout, me } = require('../controllers/customerAuthController');
const customerAuth = require('../middleware/customerAuth');
const validate = require('../middleware/validate');

module.exports = (router) => {
  router.post(
    '/register',
    [
      body('full_name').trim().notEmpty().withMessage('Full name is required'),
      body('email').isEmail().withMessage('Valid email is required'),
      body('phone').optional().trim(),
      body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
    ],
    validate,
    register
  );

  router.post(
    '/login',
    [
      body('email').isEmail().withMessage('Valid email is required'),
      body('password').notEmpty().withMessage('Password is required'),
    ],
    validate,
    login
  );

  router.post('/logout', logout);
  router.get('/me', customerAuth, me);
};
