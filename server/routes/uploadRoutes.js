const express = require('express');
const router = express.Router();
const multer = require('multer');
const { uploadToCloudinary } = require('../services/cloudinaryService');
const { sendSuccess, sendError } = require('../utils/responseHandler');

const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'), false);
    }
  },
});

// @desc    Upload image to Cloudinary (or fallback storage)
// @route   POST /api/upload/cloudinary
router.post('/cloudinary', upload.single('image'), async (req, res, next) => {
  try {
    const folder = req.body.folder || 'aaradhya';

    // 1. If uploaded as multipart file
    if (req.file) {
      const result = await uploadToCloudinary(req.file.buffer, { folder });
      return sendSuccess(res, result, 'Image uploaded to Cloudinary successfully');
    }

    // 2. If uploaded as Base64 string in JSON body
    if (req.body.base64) {
      const base64Data = req.body.base64.replace(/^data:image\/\w+;base64,/, '');
      const buffer = Buffer.from(base64Data, 'base64');
      const result = await uploadToCloudinary(buffer, { folder });
      return sendSuccess(res, result, 'Image uploaded to Cloudinary successfully');
    }

    // 3. If direct URL is passed
    if (req.body.imageUrl || req.body.url) {
      return sendSuccess(
        res,
        {
          url: req.body.imageUrl || req.body.url,
          secure_url: req.body.imageUrl || req.body.url,
          public_id: 'external_url',
        },
        'Image URL registered successfully'
      );
    }

    return sendError(res, 'No image file or URL provided', 400);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
