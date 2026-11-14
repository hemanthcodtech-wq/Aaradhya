const express = require('express');
const router = express.Router();
const {
  getProducts,
  getProductByIdOrSlug,
  getHomeHighlights,
  createProduct,
  updateProduct,
  deleteProduct,
  bulkUploadProducts,
} = require('../controllers/productController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.get('/', getProducts);
router.get('/home/highlights', getHomeHighlights);
router.get('/:identifier', getProductByIdOrSlug);

router.post('/', protect, authorize('vendor', 'super_admin', 'sub_admin', 'silks_admin', 'fabrics_admin', 'store_admin', 'store_manager'), createProduct);
router.post('/bulk-upload', protect, authorize('vendor', 'super_admin', 'silks_admin', 'fabrics_admin', 'store_admin'), bulkUploadProducts);
router.put('/:id', protect, authorize('vendor', 'super_admin', 'sub_admin', 'silks_admin', 'fabrics_admin', 'store_admin', 'store_manager'), updateProduct);
router.delete('/:id', protect, authorize('vendor', 'super_admin', 'silks_admin', 'fabrics_admin', 'store_admin'), deleteProduct);

module.exports = router;

