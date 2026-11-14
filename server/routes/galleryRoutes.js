const express = require('express');
const router = express.Router();
const multer = require('multer');
const {
  getGalleryImages,
  createGalleryImage,
  deleteGalleryImage,
} = require('../controllers/galleryController');

const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'), false);
    }
  },
});

router.get('/', getGalleryImages);
router.post('/', upload.single('image'), createGalleryImage);
router.delete('/:id', deleteGalleryImage);

module.exports = router;
