const mongoose = require('mongoose');

const bannerSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    subtitle: { type: String, default: '' },
    tag: { type: String, default: '' },
    imageUrl: { type: String, required: true },
    linkUrl: { type: String, default: '/products' },
    buttonText: { type: String, default: 'Shop Now' },
    position: {
      type: String,
      enum: ['hero_main', 'hero_side_top', 'hero_side_bottom', 'middle_promo', 'category_banner'],
      default: 'hero_main',
    },
    isActive: { type: Boolean, default: true },
    order: { type: Number, default: 0 },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.models.Banner || mongoose.model('Banner', bannerSchema);

