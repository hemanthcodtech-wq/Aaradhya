const instagramService = require('../services/instagramService');
const InstagramFeed = require('../models/InstagramFeed');
const InstagramConfig = require('../models/InstagramConfig');
const { sendSuccess, sendError } = require('../utils/responseHandler');

// @desc    Get active Instagram feed for storefront (Supports ?type=all|reels|photos&store=all|silks|fabrics&limit=20)
// @route   GET /api/instagram/feed
exports.getFeed = async (req, res, next) => {
  try {
    const { type = 'all', store = 'all', limit = 20 } = req.query;
    const items = await instagramService.getActiveFeed(type, store, limit);
    const config = await instagramService.getOrCreateConfig();

    return sendSuccess(
      res,
      {
        profile: config.profileInfo,
        handle: config.username,
        lastSyncedAt: config.lastSyncedAt,
        items,
      },
      'Instagram feed fetched successfully'
    );
  } catch (err) {
    next(err);
  }
};

// @desc    Get Instagram integration settings for Super Admin
// @route   GET /api/instagram/config
exports.getConfig = async (req, res, next) => {
  try {
    const config = await instagramService.getOrCreateConfig();
    const count = await InstagramFeed.countDocuments();
    const reelsCount = await InstagramFeed.countDocuments({ isReel: true });
    const photosCount = await InstagramFeed.countDocuments({ isReel: false });

    return sendSuccess(
      res,
      {
        ...config.toObject(),
        stats: {
          total: count,
          reels: reelsCount,
          photos: photosCount,
        },
      },
      'Instagram configuration retrieved'
    );
  } catch (err) {
    next(err);
  }
};

// @desc    Update Instagram configuration (Super Admin sets Instagram ID/Handle)
// @route   PUT /api/instagram/config
exports.updateConfig = async (req, res, next) => {
  try {
    const { instagramId, username, accessToken, autoSync, syncIntervalHours } = req.body;
    const config = await instagramService.getOrCreateConfig();

    if (instagramId) config.instagramId = instagramId.trim();
    if (username) config.username = username.trim();
    if (accessToken !== undefined) config.accessToken = accessToken.trim();
    if (autoSync !== undefined) config.autoSync = Boolean(autoSync);
    if (syncIntervalHours) config.syncIntervalHours = Number(syncIntervalHours);

    await config.save();

    return sendSuccess(res, config, 'Instagram configuration updated successfully');
  } catch (err) {
    next(err);
  }
};

// @desc    Trigger instant auto-fetch and sync of Instagram posts & reels
// @route   POST /api/instagram/sync
exports.syncFeed = async (req, res, next) => {
  try {
    const { handle, accessToken } = req.body || {};
    const result = await instagramService.syncInstagramFeed(handle, accessToken);

    return sendSuccess(
      res,
      result,
      `Successfully fetched & synchronized ${result.count} Instagram posts and reels for @${result.handle}`
    );
  } catch (err) {
    next(err);
  }
};

// @desc    Update individual feed item (order, pin, tag product)
// @route   PUT /api/instagram/feed/:id
exports.updateFeedItem = async (req, res, next) => {
  try {
    const item = await InstagramFeed.findByIdAndUpdate(req.params.id, { $set: req.body }, { new: true });
    if (!item) {
      return sendError(res, 'Instagram feed item not found', 404);
    }
    return sendSuccess(res, item, 'Feed item updated successfully');
  } catch (err) {
    next(err);
  }
};

// @desc    Delete feed item
// @route   DELETE /api/instagram/feed/:id
exports.deleteFeedItem = async (req, res, next) => {
  try {
    const item = await InstagramFeed.findByIdAndDelete(req.params.id);
    if (!item) {
      return sendError(res, 'Instagram feed item not found', 404);
    }
    return sendSuccess(res, null, 'Feed item removed successfully');
  } catch (err) {
    next(err);
  }
};
