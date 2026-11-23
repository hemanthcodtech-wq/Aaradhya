const mongoose = require('mongoose');

const instagramFeedSchema = new mongoose.Schema(
  {
    instagramId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    handle: {
      type: String,
      required: true,
      default: 'aaradhya_silks_kphb',
      trim: true,
    },
    mediaType: {
      type: String,
      enum: ['REEL', 'VIDEO', 'IMAGE', 'CAROUSEL_ALBUM'],
      default: 'IMAGE',
    },
    isReel: {
      type: Boolean,
      default: false,
    },
    mediaUrl: {
      type: String,
      required: true,
      trim: true,
    },
    videoUrl: {
      type: String,
      default: '',
      trim: true,
    },
    thumbnailUrl: {
      type: String,
      default: '',
      trim: true,
    },
    caption: {
      type: String,
      default: '',
      trim: true,
    },
    hashtags: {
      type: String,
      default: '#AaradhyaSilks #Kanjeevaram #HeirloomWeaves #HyderabadFashion',
      trim: true,
    },
    permalink: {
      type: String,
      default: 'https://www.instagram.com/aaradhya_silks_kphb/',
      trim: true,
    },
    likesCount: {
      type: Number,
      default: 1200,
    },
    commentsCount: {
      type: Number,
      default: 45,
    },
    viewsCount: {
      type: Number,
      default: 0,
    },
    musicTitle: {
      type: String,
      default: 'Traditional Mangala Vadhyam • Original Audio',
    },
    location: {
      type: String,
      default: 'Aaradhya Silks & Sarees, KPHB Hyderabad',
    },
    timestamp: {
      type: Date,
      default: Date.now,
    },
    taggedProduct: {
      productId: { type: String, default: '' },
      name: { type: String, default: '' },
      slug: { type: String, default: '' },
      price: { type: Number, default: 0 },
      mrp: { type: Number, default: 0 },
      discount: { type: Number, default: 0 },
      image: { type: String, default: '' },
      storeCode: { type: String, default: 'AS' },
      storeName: { type: String, default: 'Aaradhya Silks' },
      color: { type: String, default: '' },
    },
    displayOrder: {
      type: Number,
      default: 0,
    },
    isPinned: {
      type: Boolean,
      default: false,
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

instagramFeedSchema.index({ handle: 1, isActive: 1, displayOrder: 1 });

module.exports = mongoose.model('InstagramFeed', instagramFeedSchema);
