const { body } = require('express-validator');
const { login, logout, me } = require('../controllers/authController');
const auth = require('../middleware/auth');
const validate = require('../middleware/validate');

const loginValidation = [
  body('username').trim().notEmpty().withMessage('Username is required'),
  body('password').notEmpty().withMessage('Password is required'),
];

module.exports = (router) => {
  router.post('/login', loginValidation, validate, login);
  router.post('/logout', logout);
  router.get('/me', auth, me);
};
