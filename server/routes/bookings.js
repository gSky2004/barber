const { body } = require('express-validator');
const { createBooking, getBookings, updateBooking } = require('../controllers/bookingsController');
const auth = require('../middleware/auth');
const validate = require('../middleware/validate');

const bookingValidation = [
  body('type').isIn(['barber', 'gaming']).withMessage('Type must be barber or gaming'),
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('phone').trim().notEmpty().withMessage('Phone is required'),
  body('date').trim().matches(/^\d{4}-\d{2}-\d{2}$/).withMessage('Valid date is required'),
  body('time').trim().notEmpty().withMessage('Time is required'),
];

module.exports = (router) => {
  router.post('/', bookingValidation, validate, createBooking);
  router.get('/', auth, getBookings);
  router.put('/:id', auth, body('status').isIn(['pending', 'confirmed', 'cancelled', 'completed']), validate, updateBooking);
};
