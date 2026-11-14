const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const { store } = require('../services/dbAdapter');
const {
  createOrder,
  getMyOrders,
  getOrderById,
  getVendorOrders,
  updateVendorItemStatus,
  cancelOrder,
  getStoreOrders,
  updateSuborderStatus,
} = require('../controllers/orderController');
const { protect, authorize } = require('../middleware/authMiddleware');

// Optional customer auth for checkout: decodes JWT if present, else creates guest customer context
const optionalCustomerAuth = async (req, res, next) => {
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'multivendor_jwt_super_secure_key_2026_9876543210');
      const user = store.findById('users', decoded.id);
      if (user) {
        const { password, ...userWithoutPassword } = user;
        req.user = userWithoutPassword;
        return next();
      }
    } catch (e) {}
  }

  // Guest checkout fallback
  req.user = {
    _id: 'usr_guest',
    name: req.body?.shippingAddress?.fullName || 'Aaradhya Customer',
    email: req.body?.shippingAddress?.email || 'customer@aaradhya.com',
    role: 'customer',
  };
  next();
};

router.post('/', optionalCustomerAuth, createOrder);
router.get('/my-orders', protect, getMyOrders);
router.get('/store/:storeCode', getStoreOrders);
router.put('/suborders/:suborderNumber/status', updateSuborderStatus);
router.get('/vendor/list', protect, authorize('vendor', 'super_admin'), getVendorOrders);
router.get('/:identifier', optionalCustomerAuth, getOrderById);
router.put('/:orderId/items/:sku/status', protect, authorize('vendor', 'super_admin'), updateVendorItemStatus);
router.put('/:id/cancel', protect, cancelOrder);

module.exports = router;