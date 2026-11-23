const express = require('express');
const router = express.Router();
const {
  checkPincode,
  calculateRate,
  trackShipment,
  createShiprocketOrder,
  generateShiprocketAWB,
  generateShiprocketLabel,
  requestShiprocketPickup,
} = require('../controllers/shippingController');

router.get('/check-pincode/:pincode', checkPincode);
router.post('/calculate-rate', calculateRate);
router.get('/track/:awb', trackShipment);

// Shiprocket Logistics Endpoints
router.post('/shiprocket/create-order', createShiprocketOrder);
router.post('/shiprocket/generate-awb', generateShiprocketAWB);
router.post('/shiprocket/generate-label', generateShiprocketLabel);
router.post('/shiprocket/request-pickup', requestShiprocketPickup);

module.exports = router;
