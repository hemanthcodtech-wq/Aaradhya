const express = require('express');
const router = express.Router();
const {
  getFeed,
  getConfig,
  updateConfig,
  syncFeed,
  updateFeedItem,
  deleteFeedItem,
} = require('../controllers/instagramController');

// Public route for customer storefront
router.get('/feed', getFeed);

// Super Admin management routes
router.get('/config', getConfig);
router.put('/config', updateConfig);
router.post('/sync', syncFeed);
router.put('/feed/:id', updateFeedItem);
router.delete('/feed/:id', deleteFeedItem);

module.exports = router;
