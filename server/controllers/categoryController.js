const { store } = require('../services/dbAdapter');
const { sendSuccess, sendError } = require('../utils/responseHandler');

const getCategories = async (req, res, next) => {
  try {
    const { all } = req.query;
    let categories = store.getCollection('categories') || [];
    if (!all) {
      categories = categories.filter((c) => c.isActive !== false);
    }

    // Attach count of active products in each category
    const products = store.find('products', { isActive: true });
    const enriched = categories.map((cat) => {
      const productCount = products.filter((p) => p.category === cat._id || p.category === cat.slug || p.category?._id === cat._id).length;
      return {
        ...cat,
        productCount,
        assignedStores: cat.assignedStores || 'both',
        displayOrder: cat.displayOrder || 0,
      };
    });

    // Sort by displayOrder
    enriched.sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0));

    return sendSuccess(res, enriched, 'Categories retrieved');
  } catch (error) {
    next(error);
  }
};

const getCategoryBySlug = async (req, res, next) => {
  try {
    const { slug } = req.params;
    const cat = store.findOne('categories', { slug }) || store.findById('categories', slug);
    if (!cat) {
      return sendError(res, 'Category not found', 404);
    }
    return sendSuccess(res, cat);
  } catch (error) {
    next(error);
  }
};

const getBrands = async (req, res, next) => {
  try {
    const brands = store.find('brands', { isActive: true });
    return sendSuccess(res, brands, 'Brands retrieved');
  } catch (error) {
    next(error);
  }
};

const createCategory = async (req, res, next) => {
  try {
    const {
      name,
      description = '',
      icon = 'Package',
      image = '',
      assignedStores = 'both',
      parent = null,
      displayOrder = 0,
      seoTitle = '',
      seoDescription = '',
      commissionRate = 0,
      gstRate = 5,
      isActive = true,
      isFeatured = true,
    } = req.body;

    if (!name || !name.trim()) {
      return sendError(res, 'Category name is required', 400);
    }

    const cleanName = name.trim();
    const slug = cleanName.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-');

    const existing = store.findOne('categories', { slug });
    if (existing) {
      return sendError(res, `Category with slug '${slug}' already exists`, 400);
    }

    const newCat = store.create('categories', {
      name: cleanName,
      slug,
      description,
      icon,
      image: image || 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=500',
      assignedStores,
      parent,
      displayOrder: Number(displayOrder) || 0,
      seoTitle: seoTitle || cleanName,
      seoDescription: seoDescription || description,
      commissionRate: 0,
      gstRate: Number(gstRate) || 5,
      isActive: Boolean(isActive),
      isFeatured: Boolean(isFeatured),
    });

    return sendSuccess(res, newCat, 'Category created successfully', 201);
  } catch (error) {
    next(error);
  }
};

const updateCategory = async (req, res, next) => {
  try {
    const { id } = req.params;
    const cat = store.findById('categories', id);
    if (!cat) {
      return sendError(res, 'Category not found', 404);
    }

    const updated = store.findByIdAndUpdate('categories', id, {
      ...req.body,
      name: req.body.name ? req.body.name.trim() : cat.name,
      slug: req.body.slug ? req.body.slug.trim().toLowerCase() : (req.body.name ? req.body.name.toLowerCase().trim().replace(/[^a-z0-9]/g, '-') : cat.slug),
      assignedStores: req.body.assignedStores || cat.assignedStores || 'both',
      displayOrder: req.body.displayOrder !== undefined ? Number(req.body.displayOrder) : (cat.displayOrder || 0),
    });

    return sendSuccess(res, updated, 'Category updated successfully');
  } catch (error) {
    next(error);
  }
};

const deleteCategory = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { force = false } = req.query;

    const cat = store.findById('categories', id);
    if (!cat) {
      return sendError(res, 'Category not found', 404);
    }

    // Safety check: Prevent deleting categories that still have associated products
    const products = store.find('products');
    const associatedCount = products.filter(
      (p) => p.category === cat._id || p.category === cat.slug || p.category?._id === cat._id
    ).length;

    if (associatedCount > 0 && !force) {
      return sendError(
        res,
        `Cannot delete category '${cat.name}' because ${associatedCount} product(s) are currently assigned to it. Please reassign or remove the products first.`,
        400
      );
    }

    store.delete('categories', id);
    return sendSuccess(res, { id }, `Category '${cat.name}' deleted successfully`);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getCategories,
  getCategoryBySlug,
  getBrands,
  createCategory,
  updateCategory,
  deleteCategory,
};
