const mongoose = require('mongoose');

const gallerySchema = new mongoose.Schema(
  {
    imageUrl: {
      type: String,
      required: true,
      trim: true,
    },
    publicId: {
      type: String,
      default: '',
      trim: true,
    },
    caption: {
      type: String,
      default: '',
      trim: true,
    },
    tag: {
      type: String,
      default: 'Lookbook',
      trim: true,
    },
    aspect: {
      type: String,
      enum: ['portrait', 'square', 'wide', 'stacked', 'hero'],
      default: 'portrait',
    },
    order: {
      type: Number,
      default: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Gallery', gallerySchema);
