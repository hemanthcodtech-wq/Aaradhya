const mongoose = require('mongoose');

const instagramConfigSchema = new mongoose.Schema(
  {
    instagramId: {
      type: String,
      default: 'aaradhya_silks_kphb',
      trim: true,
    },
    username: {
      type: String,
      default: 'aaradhya_silks_kphb',
      trim: true,
    },
    accessToken: {
      type: String,
      default: '',
      trim: true,
    },
    autoSync: {
      type: Boolean,
      default: true,
    },
    syncIntervalHours: {
      type: Number,
      default: 6,
    },
    lastSyncedAt: {
      type: Date,
      default: Date.now,
    },
    profileInfo: {
      fullName: { type: String, default: 'Aaradhya Sarees & Silks' },
      bio: {
        type: String,
        default: 'Official Aaradhya Silks • Pure Kanjeevarams, Banarasi Brocades & Handloom Fabrics ✨ KPHB Colony, Hyderabad',
      },
      followersCount: { type: Number, default: 48600 },
      followingCount: { type: Number, default: 142 },
      postsCount: { type: Number, default: 1280 },
      isVerified: { type: Boolean, default: true },
      profilePicUrl: { type: String, default: '/logo.jpeg' },
      externalUrl: {
        type: String,
        default: 'https://www.instagram.com/aaradhya_silks_kphb?vrfl=MWQ4OG5lNnFpY3Bzbg==',
      },
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('InstagramConfig', instagramConfigSchema);
