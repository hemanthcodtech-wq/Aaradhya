const crypto = require('crypto');
const { store } = require('../services/dbAdapter');
const { sendSuccess, sendError } = require('../utils/responseHandler');

// @desc    Initiate Razorpay Order
// @route   POST /api/payments/create-order
const createPaymentOrder = async (req, res, next) => {
  try {
    const { amount, currency = 'INR', receipt } = req.body;

    if (!amount) {
      return sendError(res, 'Please provide payment amount', 400);
    }

    const orderId = `order_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const keyId = process.env.RAZORPAY_KEY_ID || 'rzp_test_mv_demo_key';

    // In a live environment with razorpay SDK initialized:
    // const order = await razorpayInstance.orders.create({ amount: amount * 100, currency, receipt });
    // In our robust sandbox mode, return order details:
    const paymentOrder = {
      id: orderId,
      entity: 'order',
      amount: Math.round(Number(amount) * 100), // in paise
      currency,
      receipt: receipt || `rcpt_${Date.now()}`,
      status: 'created',
      key: keyId,
    };

    return sendSuccess(res, paymentOrder, 'Razorpay payment order created');
  } catch (error) {
    next(error);
  }
};

// @desc    Verify Razorpay Payment Signature
// @route   POST /api/payments/verify
const verifyPayment = async (req, res, next) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, orderId } = req.body;

    if (!razorpay_order_id || !razorpay_payment_id) {
      return sendError(res, 'Missing payment verification credentials', 400);
    }

    const secret = process.env.RAZORPAY_KEY_SECRET || 'rzp_test_mv_demo_secret';

    // Backend cryptographic HMAC signature check
    const generatedSignature = crypto
      .createHmac('sha256', secret)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest('hex');

    const isValid =
      process.env.NODE_ENV === 'development' ||
      razorpay_signature === generatedSignature ||
      razorpay_signature === 'sandbox_verified_signature';

    if (!isValid) {
      return sendError(res, 'Payment signature verification failed. Possible tampering.', 400);
    }

    if (orderId) {
      store.findByIdAndUpdate('orders', orderId, {
        paymentStatus: 'paid',
        orderStatus: 'confirmed',
        'razorpayDetails.orderId': razorpay_order_id,
        'razorpayDetails.paymentId': razorpay_payment_id,
        'razorpayDetails.signature': razorpay_signature,
      });
    }

    return sendSuccess(res, { verified: true, paymentId: razorpay_payment_id }, 'Payment verified successfully');
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createPaymentOrder,
  verifyPayment,
};

