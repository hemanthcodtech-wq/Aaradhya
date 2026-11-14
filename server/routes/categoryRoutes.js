const express = require('express');
const router = express.Router();
const {
  getCategories,
  getCategoryBySlug,
  getBrands,
  createCategory,
  updateCategory,
  deleteCategory,
} = require('../controllers/categoryController');

router.get('/', getCategories);
router.get('/brands', getBrands);
router.get('/:slug', getCategoryBySlug);
router.post('/', createCategory);
router.put('/:id', updateCategory);
router.delete('/:id', deleteCategory);

module.exports = router;
