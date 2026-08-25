const { body } = require('express-validator');
const { getGallery, addGalleryImage, deleteGalleryImage } = require('../controllers/galleryController');
const auth = require('../middleware/auth');
const validate = require('../middleware/validate');

module.exports = (router) => {
  router.get('/', getGallery);
  router.post('/', auth, body('image_url').trim().notEmpty(), validate, addGalleryImage);
  router.delete('/:id', auth, deleteGalleryImage);
};
