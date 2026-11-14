const express = require('express');
const router = express.Router();
const {
  getInventoryList,
  adjustStock,
  getStockMovements,
  getBarcodeStickers,
} = require('../controllers/inventoryController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.get('/', protect, authorize('store_manager', 'staff', 'vendor', 'super_admin', 'silks_admin', 'fabrics_admin', 'store_admin'), getInventoryList);
router.post('/adjust', protect, authorize('store_manager', 'staff', 'super_admin', 'silks_admin', 'fabrics_admin', 'store_admin'), adjustStock);
router.get('/movements', protect, authorize('store_manager', 'staff', 'super_admin', 'silks_admin', 'fabrics_admin', 'store_admin'), getStockMovements);
router.post('/barcodes', protect, authorize('store_manager', 'staff', 'super_admin', 'silks_admin', 'fabrics_admin', 'store_admin'), getBarcodeStickers);

module.exports = router;

