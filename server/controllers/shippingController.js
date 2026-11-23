const shiprocketService = require('../services/shiprocketService');
const { sendSuccess, sendError } = require('../utils/responseHandler');

// @desc    Check pincode serviceability & estimated delivery days
// @route   GET /api/shipping/check-pincode/:pincode
const checkPincode = async (req, res, next) => {
  try {
    const { pincode } = req.params;

    if (!pincode || pincode.length !== 6 || isNaN(pincode)) {
      return sendError(res, 'Please enter a valid 6-digit Indian postal code', 400);
    }

    const serviceability = await shiprocketService.checkServiceability(pincode);

    return sendSuccess(res, {
      pincode,
      isServiceable: true,
      city: serviceability.city || 'Metro / Hub City',
      state: serviceability.state || 'India',
      courierPartner: serviceability.courierPartner || 'Shiprocket Multi-Courier (BlueDart / Delhivery)',
      standardDelivery: {
        charges: 0,
        estimatedDays: serviceability.estimatedDays || '2-3 Business Days',
      },
      expressDelivery: {
        charges: 99,
        estimatedDays: '1-2 Days Express',
      },
      codAvailable: serviceability.codAvailable !== false,
      couriers: serviceability.couriers || [],
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
    const serviceability = await shiprocketService.checkServiceability(deliveryPincode || '500072');

    return sendSuccess(res, {
      deliveryPincode,
      standardRate: baseShipping,
      expressRate: baseShipping + expressAddon,
      isFreeEligible: Number(orderTotal) >= 999,
      courierPartner: serviceability.courierPartner,
      estimatedDays: serviceability.estimatedDays,
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

    const tracking = await shiprocketService.trackShipment(awb);
    return sendSuccess(res, tracking);
  } catch (error) {
    next(error);
  }
};

// @desc    Create Shiprocket Order & generate adhoc shipment
// @route   POST /api/shipping/shiprocket/create-order
const createShiprocketOrder = async (req, res, next) => {
  try {
    const {
      orderNumber,
      orderDate,
      customer = {},
      shippingAddress = {},
      items = [],
      paymentMethod = 'Prepaid',
      subtotal = 0,
    } = req.body;

    if (!orderNumber || !items.length) {
      return sendError(res, 'Order number and line items are required to create a shipment', 400);
    }

    const result = await shiprocketService.createOrder({
      orderNumber,
      orderDate: orderDate || new Date().toISOString(),
      customer,
      shippingAddress,
      items,
      paymentMethod,
      subtotal,
    });

    return sendSuccess(res, result, 'Shiprocket shipment created and AWB assigned', 201);
  } catch (error) {
    next(error);
  }
};

// @desc    Generate Shiprocket AWB for shipment
// @route   POST /api/shipping/shiprocket/generate-awb
const generateShiprocketAWB = async (req, res, next) => {
  try {
    const { shipmentId, courierId } = req.body;
    if (!shipmentId) {
      return sendError(res, 'Shipment ID is required to generate AWB', 400);
    }

    const result = await shiprocketService.generateAWB(shipmentId, courierId);
    return sendSuccess(res, result, 'AWB successfully generated');
  } catch (error) {
    next(error);
  }
};

// @desc    Generate Shipping Label PDF
// @route   POST /api/shipping/shiprocket/generate-label
const generateShiprocketLabel = async (req, res, next) => {
  try {
    const { shipmentId } = req.body;
    if (!shipmentId) {
      return sendError(res, 'Shipment ID is required to generate label', 400);
    }

    const result = await shiprocketService.generateLabel(shipmentId);
    return sendSuccess(res, result, 'Shipping label generated');
  } catch (error) {
    next(error);
  }
};

// @desc    Request Courier Pickup
// @route   POST /api/shipping/shiprocket/request-pickup
const requestShiprocketPickup = async (req, res, next) => {
  try {
    const { shipmentId } = req.body;
    if (!shipmentId) {
      return sendError(res, 'Shipment ID is required to schedule pickup', 400);
    }

    const result = await shiprocketService.requestPickup(shipmentId);
    return sendSuccess(res, result, 'Courier pickup scheduled with Shiprocket');
  } catch (error) {
    next(error);
  }
};

module.exports = {
  checkPincode,
  calculateRate,
  trackShipment,
  createShiprocketOrder,
  generateShiprocketAWB,
  generateShiprocketLabel,
  requestShiprocketPickup,
};
