const Gallery = require('../models/Gallery');
const { uploadToCloudinary, cloudinary } = require('../services/cloudinaryService');
const { sendSuccess, sendError } = require('../utils/responseHandler');

// Curated initial lifestyle lookbook images with authentic high-resolution photography
const DEFAULT_LOOKBOOK_ITEMS = [
  {
    imageUrl: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=900&auto=format&fit=crop&q=80',
    caption: 'Classic Kanjeevaram Silk Silhouette',
    tag: 'Silks',
    aspect: 'portrait',
    order: 1,
  },
  {
    imageUrl: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=700&auto=format&fit=crop&q=80',
    caption: 'Celebrations with Aaradhya Friends',
    tag: 'Lookbook',
    aspect: 'stacked',
    order: 2,
  },
  {
    imageUrl: 'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?w=700&auto=format&fit=crop&q=80',
    caption: 'Midnight Printed Festive Kurtis',
    tag: 'Silks',
    aspect: 'stacked',
    order: 3,
  },
  {
    imageUrl: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=700&auto=format&fit=crop&q=80',
    caption: 'Pastel Chanderi Festive Ensemble',
    tag: 'Fabrics',
    aspect: 'stacked',
    order: 4,
  },
  {
    imageUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=700&auto=format&fit=crop&q=80',
    caption: 'Laughter & Pure Moments',
    tag: 'Lookbook',
    aspect: 'stacked',
    order: 5,
  },
  {
    imageUrl: 'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=1200&auto=format&fit=crop&q=80',
    caption: 'Moments in Aaradhya • Festive Celebrations',
    tag: 'Lookbook',
    aspect: 'hero',
    order: 6,
  },
  {
    imageUrl: 'https://images.unsplash.com/photo-1594223274512-ad4803739b7c?w=700&auto=format&fit=crop&q=80',
    caption: 'Bespoke Handloom Silk Weaves',
    tag: 'Silks',
    aspect: 'stacked',
    order: 7,
  },
  {
    imageUrl: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=700&auto=format&fit=crop&q=80',
    caption: 'Modern Fusion Kurti Cuts',
    tag: 'Fabrics',
    aspect: 'stacked',
    order: 8,
  },
  {
    imageUrl: 'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=900&auto=format&fit=crop&q=80',
    caption: 'Bridal Crimson Silk Grace',
    tag: 'Silks',
    aspect: 'portrait',
    order: 9,
  },
  {
    imageUrl: 'https://images.unsplash.com/photo-1607083206869-4c7672e72a8a?w=700&auto=format&fit=crop&q=80',
    caption: 'Handwoven Running Yardage',
    tag: 'Fabrics',
    aspect: 'stacked',
    order: 10,
  },
  {
    imageUrl: 'https://images.unsplash.com/photo-1539109136881-3be0616acf4b?w=700&auto=format&fit=crop&q=80',
    caption: 'Contemporary Festive Drapes',
    tag: 'Lookbook',
    aspect: 'stacked',
    order: 11,
  },
  {
    imageUrl: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=1200&auto=format&fit=crop&q=80',
    caption: 'Golden Hour Handloom Moments',
    tag: 'Silks',
    aspect: 'hero',
    order: 12,
  },
];

// @desc    Get all gallery images (Auto-seeds defaults if empty)
// @route   GET /api/gallery
exports.getGalleryImages = async (req, res, next) => {
  try {
    if (req.query.reset === 'true') {
      await Gallery.deleteMany({});
    }

    let images = await Gallery.find({ isActive: true }).sort({ order: 1, createdAt: -1 });

    if (images.length === 0 || images.some((i) => i.imageUrl.includes('/gallery/lookbook'))) {
      await Gallery.deleteMany({});
      images = await Gallery.insertMany(DEFAULT_LOOKBOOK_ITEMS);
    }

    return sendSuccess(res, images, 'Gallery images retrieved successfully');
  } catch (err) {
    next(err);
  }
};

// @desc    Create / Upload new gallery image to Cloudinary
// @route   POST /api/gallery
exports.createGalleryImage = async (req, res, next) => {
  try {
    let imageUrl = req.body.imageUrl;
    let publicId = '';

    // If file was uploaded via Multer
    if (req.file) {
      const uploadResult = await uploadToCloudinary(req.file.buffer, {
        folder: 'aaradhya_gallery',
      });
      imageUrl = uploadResult.secure_url || uploadResult.url;
      publicId = uploadResult.public_id || '';
    }

    if (!imageUrl) {
      return sendError(res, 'Image file or image URL is required', 400);
    }

    const newImage = await Gallery.create({
      imageUrl,
      publicId,
      caption: req.body.caption || 'Aaradhya Fashion Lookbook',
      tag: req.body.tag || 'Lookbook',
      aspect: req.body.aspect || 'portrait',
      order: Number(req.body.order) || 0,
      isActive: req.body.isActive !== undefined ? req.body.isActive : true,
    });

    return sendSuccess(res, newImage, 'Gallery image added successfully', 201);
  } catch (err) {
    next(err);
  }
};

// @desc    Delete gallery image
// @route   DELETE /api/gallery/:id
exports.deleteGalleryImage = async (req, res, next) => {
  try {
    const image = await Gallery.findById(req.params.id);
    if (!image) {
      return sendError(res, 'Gallery image not found', 404);
    }

    // Try deleting from Cloudinary if publicId exists and is remote
    if (image.publicId && !image.publicId.startsWith('local_')) {
      try {
        if (process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY) {
          await cloudinary.uploader.destroy(image.publicId);
        }
      } catch (cloudErr) {
        console.warn('Could not delete image from Cloudinary:', cloudErr.message);
      }
    }

    await Gallery.findByIdAndDelete(req.params.id);
    return sendSuccess(res, null, 'Gallery image deleted successfully');
  } catch (err) {
    next(err);
  }
};
