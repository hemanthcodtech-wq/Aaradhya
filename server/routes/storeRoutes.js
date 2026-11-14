const express = require('express');
const router = express.Router();
const {
  getStores,
  getStoreByCode,
  updateStore,
  getStoreWallet,
  getStoreAnalytics,
  getNextProductIdPreview,
  getStoreProducts,
  getStoreInventory,
  adjustStoreInventory,
  getStoreReturns,
  inspectStoreReturn,
  getStorePayouts,
  requestStorePayout,
  getStoreCustomers,
  getStoreReports,
} = require('../controllers/storeController');
const { protect, authorize } = require('../middleware/authMiddleware');

const storeRoles = authorize('silks_admin', 'fabrics_admin', 'store_admin', 'store_manager', 'super_admin');

// Middleware to safely resolve storeCode from query, body, user profile, or default to AS
const resolveStoreCode = (req, res, next) => {
  if (!req.params.code) {
    req.params.code = (req.query.storeCode || req.query.store || req.body?.storeCode || req.user?.storeCode || 'AS').toUpperCase();
  }
  next();
};

// Public Store Lookup
router.get('/', getStores);

// Direct root-level store routes (Prevent 404 when :code is omitted)
router.get('/analytics', protect, storeRoles, resolveStoreCode, getStoreAnalytics);
router.get('/products', protect, storeRoles, resolveStoreCode, getStoreProducts);
router.get('/inventory', protect, storeRoles, resolveStoreCode, getStoreInventory);
router.get('/wallet', protect, storeRoles, resolveStoreCode, getStoreWallet);
router.get('/returns', protect, storeRoles, resolveStoreCode, getStoreReturns);
router.get('/payouts', protect, storeRoles, resolveStoreCode, getStorePayouts);
router.get('/customers', protect, storeRoles, resolveStoreCode, getStoreCustomers);
router.get('/reports', protect, storeRoles, resolveStoreCode, getStoreReports);
router.get('/next-product-id', resolveStoreCode, getNextProductIdPreview);

// Parameterized Store Routes
router.get('/:code', (req, res, next) => {
  const reserved = ['analytics', 'products', 'inventory', 'wallet', 'returns', 'payouts', 'customers', 'reports', 'next-product-id'];
  if (reserved.includes((req.params.code || '').toLowerCase())) {
    return next('route');
  }
  return getStoreByCode(req, res, next);
});

router.get('/:code/next-product-id', getNextProductIdPreview);

// Protected Store Management Routes
router.put('/:code', protect, storeRoles, updateStore);
router.get('/:code/analytics', protect, storeRoles, getStoreAnalytics);
router.get('/:code/products', protect, storeRoles, getStoreProducts);
router.get('/:code/inventory', protect, storeRoles, getStoreInventory);
router.post('/:code/inventory/adjust', protect, storeRoles, adjustStoreInventory);
router.get('/:code/wallet', protect, storeRoles, getStoreWallet);
router.get('/:code/returns', protect, storeRoles, getStoreReturns);
router.put('/:code/returns/:id/inspect', protect, storeRoles, inspectStoreReturn);
router.get('/:code/payouts', protect, storeRoles, getStorePayouts);
router.post('/:code/payouts', protect, storeRoles, requestStorePayout);
router.get('/:code/customers', protect, storeRoles, getStoreCustomers);
router.get('/:code/reports', protect, storeRoles, getStoreReports);

module.exports = router;
