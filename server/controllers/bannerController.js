const { store } = require('../services/dbAdapter');
const { sendSuccess, sendError } = require('../utils/responseHandler');

// @desc    Get all active banners (for storefront hero and promos)
// @route   GET /api/banners
const getBanners = async (req, res, next) => {
  try {
    const { position, all } = req.query;
    let banners = store.getCollection('banners') || [];

    if (!all) {
      banners = banners.filter((b) => b.isActive !== false);
    }

    if (position) {
      banners = banners.filter((b) => b.position === position);
    }

    // Sort by order ascending
    banners.sort((a, b) => (a.order || a.displayOrder || 0) - (b.order || b.displayOrder || 0));

    return sendSuccess(res, banners, 'Banners fetched successfully');
  } catch (error) {
    next(error);
  }
};

// @desc    Create a new banner (Admin)
// @route   POST /api/banners
const createBanner = async (req, res, next) => {
  try {
    const {
      title,
      subtitle = '',
      scriptTagline = 'Style Your World',
      badgeText = 'Up to 50% OFF',
      image,
      imageUrl,
      linkUrl = '/products',
      ctaText = 'Shop Now →',
      position = 'hero_main',
      bgGradient = 'linear-gradient(135deg, #FFF0F6 0%, #F0FDF4 100%)',
      order = 0,
    } = req.body;

    if (!title) {
      return sendError(res, 'Banner title is required', 400);
    }

    const finalImage = image || imageUrl || 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=1600';

    const newBanner = store.create('banners', {
      title,
      subtitle,
      scriptTagline,
      badgeText,
      image: finalImage,
      imageUrl: finalImage,
      linkUrl,
      ctaText,
      position,
      bgGradient,
      order: Number(order) || 0,
      displayOrder: Number(order) || 0,
      isActive: true,
    });

    return sendSuccess(res, newBanner, 'Banner created successfully', 201);
  } catch (error) {
    next(error);
  }
};

// @desc    Update a banner (Admin)
// @route   PUT /api/banners/:id
const updateBanner = async (req, res, next) => {
  try {
    const { id } = req.params;
    const banner = store.findById('banners', id);
    if (!banner) {
      return sendError(res, 'Banner not found', 404);
    }

    const updated = store.findByIdAndUpdate('banners', id, {
      ...req.body,
      image: req.body.image || req.body.imageUrl || banner.image,
      imageUrl: req.body.image || req.body.imageUrl || banner.imageUrl,
    });

    return sendSuccess(res, updated, 'Banner updated successfully');
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a banner (Admin)
// @route   DELETE /api/banners/:id
const deleteBanner = async (req, res, next) => {
  try {
    const { id } = req.params;
    const banner = store.findById('banners', id);
    if (!banner) {
      return sendError(res, 'Banner not found', 404);
    }

    store.delete('banners', id);
    return sendSuccess(res, { id }, 'Banner deleted successfully');
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getBanners,
  createBanner,
  updateBanner,
  deleteBanner,
};
