const { sendSuccess, sendError } = require('../utils/responseHandler');

// Mock pincode database of tier 1, tier 2 cities
const SERVICEABLE_ZONES = {
  '110001': { city: 'New Delhi', state: 'Delhi', standardDays: '2-3', expressDays: '1-2', cod: true },
  '110020': { city: 'New Delhi', state: 'Delhi', standardDays: '2-3', expressDays: '1-2', cod: true },
  '201301': { city: 'Noida', state: 'Uttar Pradesh', standardDays: '2-3', expressDays: '1-2', cod: true },
  '201309': { city: 'Noida', state: 'Uttar Pradesh', standardDays: '2-3', expressDays: '1-2', cod: true },
  '400001': { city: 'Mumbai', state: 'Maharashtra', standardDays: '3-4', expressDays: '1-2', cod: true },
  '560001': { city: 'Bengaluru', state: 'Karnataka', standardDays: '3-4', expressDays: '1-2', cod: true },
  '560100': { city: 'Bengaluru', state: 'Karnataka', standardDays: '3-4', expressDays: '1-2', cod: true },
  '600001': { city: 'Chennai', state: 'Tamil Nadu', standardDays: '3-5', expressDays: '2', cod: true },
  '700001': { city: 'Kolkata', state: 'West Bengal', standardDays: '3-5', expressDays: '2', cod: true },
};

// @desc    Check pincode serviceability & estimated delivery days
// @route   GET /api/shipping/check-pincode/:pincode
const checkPincode = async (req, res, next) => {
  try {
    const { pincode } = req.params;

    if (!pincode || pincode.length !== 6 || isNaN(pincode)) {
      return sendError(res, 'Please enter a valid 6-digit Indian postal code', 400);
    }

    const zone = SERVICEABLE_ZONES[pincode] || {
      city: 'Metro / Regional City',
      state: 'India',
      standardDays: '3-5',
      expressDays: '2-3',
      cod: true,
    };

    return sendSuccess(res, {
      pincode,
      isServiceable: true,
      city: zone.city,
      state: zone.state,
      courierPartner: 'Shiprocket Multi-Courier (BlueDart / Delhivery)',
      standardDelivery: {
        charges: 0,
        estimatedDays: `${zone.standardDays} days`,
      },
      expressDelivery: {
        charges: 99,
        estimatedDays: `${zone.expressDays} days`,
      },
      codAvailable: zone.cod,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Calculate shipping rate by weight & destination
// @route   POST /api/shipping/calculate-rate
const calculateRate = async (req, res, next) => {
  try {
    const { deliveryPincode, weightGrams = 500, orderTotal = 0 } = req.body;

    const baseShipping = Number(orderTotal) >= 999 ? 0 : 99;
    const expressAddon = 99;

    return sendSuccess(res, {
      deliveryPincode,
      standardRate: baseShipping,
      expressRate: baseShipping + expressAddon,
      isFreeEligible: Number(orderTotal) >= 999,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Track shipment by AWB number
// @route   GET /api/shipping/track/:awb
const trackShipment = async (req, res, next) => {
  try {
    const { awb } = req.params;
    if (!awb) {
      return sendError(res, 'AWB tracking number is required', 400);
    }

    const mockEvents = [
      { status: 'Order Manifested', location: 'Merchant Warehouse', timestamp: new Date(Date.now() - 86400000 * 2).toISOString() },
      { status: 'Picked Up by Courier', location: 'Shiprocket Logistics Hub', timestamp: new Date(Date.now() - 86400000 * 1.5).toISOString() },
      { status: 'In Transit', location: 'National Sorting Center', timestamp: new Date(Date.now() - 86400000).toISOString() },
      { status: 'Out for Delivery', location: 'Local Delivery Station', timestamp: new Date(Date.now() - 3600000 * 3).toISOString() },
    ];

    return sendSuccess(res, {
      awb,
      currentStatus: 'Out for Delivery',
      courier: 'BlueDart Express via Shiprocket',
      expectedDelivery: 'Today by 8:00 PM',
      events: mockEvents,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  checkPincode,
  calculateRate,
  trackShipment,
};

