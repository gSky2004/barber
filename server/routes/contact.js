const { body } = require('express-validator');
const { submitContact, getMessages } = require('../controllers/contactController');
const auth = require('../middleware/auth');
const validate = require('../middleware/validate');

const contactValidation = [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('message').trim().notEmpty().withMessage('Message is required'),
  body('email').optional().isEmail().withMessage('Valid email required'),
];

module.exports = (router) => {
  router.post('/', contactValidation, validate, submitContact);
  router.get('/', auth, getMessages);
};
