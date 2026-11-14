const express = require('express');
const router = express.Router();
const {
  checkPincode,
  calculateRate,
  trackShipment,
} = require('../controllers/shippingController');

router.get('/check-pincode/:pincode', checkPincode);
router.post('/calculate-rate', calculateRate);
router.get('/track/:awb', trackShipment);

module.exports = router;

