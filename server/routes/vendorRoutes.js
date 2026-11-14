const express = require('express');
const router = express.Router();
const {
  getVendorProfile,
  updateVendorProfile,
  uploadKyc,
  getVendorStats,
  getVendorProducts,
  requestPayout,
} = require('../controllers/vendorController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.get('/profile', protect, authorize('vendor', 'super_admin'), getVendorProfile);
router.put('/profile', protect, authorize('vendor'), updateVendorProfile);
router.post('/kyc', protect, authorize('vendor'), uploadKyc);
router.get('/stats', protect, authorize('vendor'), getVendorStats);
router.get('/products', protect, authorize('vendor'), getVendorProducts);
router.post('/payouts/request', protect, authorize('vendor'), requestPayout);

module.exports = router;

