const { store } = require('../services/dbAdapter');
const { sendSuccess, sendError } = require('../utils/responseHandler');

// @desc    Get all products with filtering, search, sorting & pagination
// @route   GET /api/products
const getProducts = async (req, res, next) => {
  try {
    const {
      search,
      category,
      brand,
      vendor,
      minPrice,
      maxPrice,
      inStock,
      rating,
      sortBy = 'newest',
      page = 1,
      limit = 12,
    } = req.query;

    let products = store.getCollection('products');

    // Filter by approval & active status (unless vendor viewing their own)
    if (!req.query.allStatus) {
      products = products.filter((p) => p.isActive !== false && p.approvalStatus === 'approved');
    }

    // Keyword Search
    if (search && search.trim()) {
      const q = search.trim().toLowerCase();
      products = products.filter(
        (p) =>
          (p.name && p.name.toLowerCase().includes(q)) ||
          (p.sku && p.sku.toLowerCase().includes(q)) ||
          (p.barcode && p.barcode.toLowerCase().includes(q)) ||
          (p.tags && p.tags.some((t) => t.toLowerCase().includes(q))) ||
          (p.description && p.description.toLowerCase().includes(q))
      );
    }

    // Category filter
    if (category) {
      // Find category by slug or id
      const cat =
        store.findOne('categories', { slug: category }) ||
        store.findById('categories', category);
      if (cat) {
        products = products.filter((p) => p.category === cat._id || p.category === cat.slug);
      }
    }

    // Brand filter
    if (brand) {
      const brd =
        store.findOne('brands', { slug: brand }) ||
        store.findById('brands', brand);
      if (brd) {
        products = products.filter((p) => p.brand === brd._id || p.brand === brd.slug);
      }
    }

    // Vendor filter
    if (vendor) {
      products = products.filter((p) => p.vendor === vendor);
    }

    // Store filter (AS for Aaradhya Silks, AF for Aaradhya Fabrics)
    if (req.query.store || req.query.storeCode) {
      const code = (req.query.store || req.query.storeCode).toUpperCase();
      products = products.filter((p) => (p.storeCode || '').toUpperCase() === code || p.storeId === req.query.store);
    }

    // Price range filter
    if (minPrice) {
      products = products.filter((p) => p.price >= Number(minPrice));
    }
    if (maxPrice) {
      products = products.filter((p) => p.price <= Number(maxPrice));
    }

    // Stock availability
    if (inStock === 'true' || inStock === true) {
      products = products.filter((p) => p.stock > 0);
    }

    // Minimum rating
    if (rating) {
      products = products.filter((p) => (p.rating || 0) >= Number(rating));
    }

    // Sorting
    switch (sortBy) {
      case 'price_asc':
        products.sort((a, b) => a.price - b.price);
        break;
      case 'price_desc':
        products.sort((a, b) => b.price - a.price);
        break;
      case 'rating':
        products.sort((a, b) => (b.rating || 0) - (a.rating || 0));
        break;
      case 'popular':
      case 'best_selling':
        products.sort((a, b) => (b.reviewCount || 0) - (a.reviewCount || 0));
        break;
      case 'newest':
      default:
        products.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        break;
    }

    const total = products.length;
    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 12;
    const startIndex = (pageNum - 1) * limitNum;
    const paginated = products.slice(startIndex, startIndex + limitNum);

    const populated = paginated.map((p) => store.populateProduct(p));

    return sendSuccess(res, populated, 'Products fetched successfully', 200, {
      total,
      page: pageNum,
      limit: limitNum,
      totalPages: Math.ceil(total / limitNum),
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single product by slug or ID
// @route   GET /api/products/:identifier
const getProductByIdOrSlug = async (req, res, next) => {
  try {
    const { identifier } = req.params;
    let product =
      store.findOne('products', { slug: identifier }) ||
      store.findById('products', identifier);

    if (!product) {
      return sendError(res, 'Product not found', 404);
    }

    const populated = store.populateProduct(product);

    // Fetch related products in the same category
    const catId = typeof product.category === 'object' ? product.category._id : product.category;
    const related = store
      .find('products', { category: catId })
      .filter((p) => p._id !== product._id)
      .slice(0, 4)
      .map((p) => store.populateProduct(p));

    return sendSuccess(res, { product: populated, relatedProducts: related });
  } catch (error) {
    next(error);
  }
};

// @desc    Get homepage sections (Aaradhya Silks, Aaradhya Fabrics, Popular Collections, Most Wanted)
// @route   GET /api/products/home/highlights
const getHomeHighlights = async (req, res, next) => {
  try {
    const banners = store.find('banners', { isActive: true });
    const categories = store.find('categories', { isActive: true, isFeatured: true });
    const storesList = store.find('stores', { isActive: true });
    const vendors = storesList.length > 0 ? storesList : store.find('vendors', { status: 'approved' });

    const allApproved = store.find('products', { approvalStatus: 'approved', isActive: true });

    // Store Collections
    const silksCollection = allApproved
      .filter((p) => (p.storeCode || '').toUpperCase() === 'AS')
      .slice(0, 14)
      .map((p) => store.populateProduct(p));

    const fabricsCollection = allApproved
      .filter((p) => (p.storeCode || '').toUpperCase() === 'AF')
      .slice(0, 14)
      .map((p) => store.populateProduct(p));

    let flashDeals = allApproved.filter((p) => p.isFlashDeal || (p.discountPercent && p.discountPercent >= 15));
    if (flashDeals.length < 7) {
      flashDeals = [...flashDeals, ...allApproved.filter((p) => !flashDeals.includes(p))];
    }
    flashDeals = flashDeals.slice(0, 14).map((p) => store.populateProduct(p));

    let bestSellers = allApproved.filter((p) => p.isBestSeller || (p.rating && p.rating >= 4.4));
    if (bestSellers.length < 7) {
      bestSellers = [...bestSellers, ...allApproved.filter((p) => !bestSellers.includes(p))];
    }
    bestSellers = bestSellers.slice(0, 14).map((p) => store.populateProduct(p));

    let newArrivals = [...allApproved].reverse();
    newArrivals = newArrivals.slice(0, 14).map((p) => store.populateProduct(p));

    return sendSuccess(res, {
      banners,
      categories,
      vendors,
      stores: storesList,
      silksCollection: silksCollection.length > 0 ? silksCollection : bestSellers.slice(0, 7),
      fabricsCollection: fabricsCollection.length > 0 ? fabricsCollection : newArrivals.slice(0, 7),
      flashDeals,
      bestSellers,
      newArrivals,
      mostWanted: bestSellers.slice(0, 8),
      popularCollections: newArrivals.slice(0, 8),
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new product
// @route   POST /api/products
const createProduct = async (req, res, next) => {
  try {
    const {
      name,
      description,
      shortDescription,
      category,
      brand,
      price,
      mrp,
      sku,
      barcode,
      stock,
      lowStockThreshold = 5,
      images = [],
      variants = [],
      specifications = [],
      tags = [],
      isFeatured = false,
      isFlashDeal = false,
      gstRate = 18,
      weightGrams = 500,
    } = req.body;

    if (!name || !price || !category) {
      return sendError(res, 'Please provide product name, price, and category', 400);
    }

    // Determine vendor ownership
    let vendorId = req.body.vendor;
    if (req.user && req.user.role === 'vendor') {
      const v = store.findOne('vendors', { user: req.user._id });
      if (!v) {
        return sendError(res, 'Vendor profile not found for this account', 400);
      }
      vendorId = v._id;
    } else if (!vendorId) {
      const defaultVendor = store.getCollection('vendors')[0];
      vendorId = defaultVendor ? defaultVendor._id : 'ven_default_01';
    }

    // Generate Store-Specific Atomic Product ID (AS-000001 or AF-000001)
    // Strictly enforce store ownership from authenticated user session
    let storeCode = (req.body.storeCode || 'AS').toUpperCase();
    if (req.user && req.user.storeCode) {
      storeCode = req.user.storeCode.toUpperCase();
    }
    const storeRecord = store.findOne('stores', { code: storeCode });
    const storeId = storeRecord ? storeRecord._id : (storeCode === 'AF' ? 'store_fabrics_002' : 'store_silks_001');
    const storeName = storeCode === 'AF' ? 'Aaradhya Fabrics' : 'Aaradhya Silks';
    const finalProductId = req.body.productId || store.getNextProductId(storeCode);

    const calculatedDiscount = mrp && mrp > price ? Math.round(((mrp - price) / mrp) * 100) : 0;
    const finalSku = (sku || `${finalProductId}-MAIN`).toUpperCase().trim();
    const finalBarcode = barcode || `${finalProductId}-BAR`;

    // Process variant barcodes in Code 128 style: AS-000001-GRN-M
    const processedVariants = (variants || []).map((v, idx) => ({
      ...v,
      sku: v.sku || `${finalProductId}-${(v.attributes?.color || 'COL').substring(0, 3).toUpperCase()}-${(v.attributes?.size || 'SZ').toUpperCase()}`,
      barcode: v.barcode || `${finalProductId}-${(v.attributes?.color || 'COL').substring(0, 3).toUpperCase()}-${(v.attributes?.size || 'SZ').toUpperCase()}`,
    }));

    const slug = `${name.toLowerCase().replace(/[^a-z0-9]/g, '-')}-${Date.now().toString().slice(-4)}`;

    const isStoreAdminUser = req.user && ['super_admin', 'silks_admin', 'fabrics_admin', 'store_admin', 'store_manager'].includes(req.user.role);

    const newProduct = store.create('products', {
      name,
      slug,
      productId: finalProductId,
      storeId,
      storeCode,
      storeName,
      description: description || '',
      shortDescription: shortDescription || '',
      category,
      brand: brand || store.getCollection('brands')[0]?._id,
      vendor: vendorId,
      price: Number(price),
      mrp: Number(mrp || price),
      discountPercent: calculatedDiscount,
      sku: finalSku,
      barcode: finalBarcode,
      stock: Number(stock || 0),
      lowStockThreshold: Number(lowStockThreshold),
      images: images.length > 0 ? images : ['https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=800&auto=format&fit=crop&q=80'],
      sizes: req.body.sizes || ['S', 'M', 'L', 'XL'],
      fabricType: req.body.fabricType || (storeCode === 'AS' ? 'Pure Silk' : 'Cotton Linen'),
      variants: processedVariants,
      specifications,
      tags: Array.isArray(tags) ? tags : [],
      rating: 5.0,
      reviewCount: 0,
      approvalStatus: isStoreAdminUser ? 'approved' : 'pending',
      isFeatured,
      isFlashDeal,
      isBestSeller: false,
      isNewArrival: true,
      isActive: true,
      gstRate: Number(gstRate),
      weightGrams: Number(weightGrams),
    });

    // Create initial stock movement ledger
    if (Number(stock) > 0) {
      store.create('stockMovements', {
        product: newProduct._id,
        sku: finalSku,
        productName: name,
        movementType: 'purchase_in',
        quantity: Number(stock),
        previousStock: 0,
        newStock: Number(stock),
        referenceType: 'Purchase',
        referenceId: `INIT-${newProduct._id}`,
        performedBy: req.user ? req.user.name : 'System',
        notes: 'Initial inventory creation',
      });
    }

    return sendSuccess(res, store.populateProduct(newProduct), 'Product created successfully', 201);
  } catch (error) {
    next(error);
  }
};

// @desc    Update product
// @route   PUT /api/products/:id
const updateProduct = async (req, res, next) => {
  try {
    const { id } = req.params;
    const product = store.findById('products', id);

    if (!product) {
      return sendError(res, 'Product not found', 404);
    }

    // Store isolation check
    if (req.user && req.user.role !== 'super_admin' && req.user.storeCode) {
      if (product.storeCode && product.storeCode.toUpperCase() !== req.user.storeCode.toUpperCase()) {
        return sendError(res, `Store isolation: You are not authorized to modify products belonging to ${product.storeName || product.storeCode}`, 403);
      }
    }

    // Role check: vendor can only update their own product
    if (req.user && req.user.role === 'vendor') {
      const v = store.findOne('vendors', { user: req.user._id });
      if (!v || product.vendor !== v._id) {
        return sendError(res, 'You do not have permission to modify this product', 403);
      }
    }

    const updates = { ...req.body };
    if (updates.price && updates.mrp) {
      updates.discountPercent = Math.round(((updates.mrp - updates.price) / updates.mrp) * 100);
    }

    const updated = store.findByIdAndUpdate('products', id, updates);
    return sendSuccess(res, store.populateProduct(updated), 'Product updated successfully');
  } catch (error) {
    next(error);
  }
};

// @desc    Delete product
// @route   DELETE /api/products/:id
const deleteProduct = async (req, res, next) => {
  try {
    const { id } = req.params;
    const product = store.findById('products', id);

    if (!product) {
      return sendError(res, 'Product not found', 404);
    }

    // Store isolation check
    if (req.user && req.user.role !== 'super_admin' && req.user.storeCode) {
      if (product.storeCode && product.storeCode.toUpperCase() !== req.user.storeCode.toUpperCase()) {
        return sendError(res, `Store isolation: You are not authorized to delete products belonging to ${product.storeName || product.storeCode}`, 403);
      }
    }

    if (req.user && req.user.role === 'vendor') {
      const v = store.findOne('vendors', { user: req.user._id });
      if (!v || product.vendor !== v._id) {
        return sendError(res, 'You do not have permission to delete this product', 403);
      }
    }

    store.findByIdAndDelete('products', id);
    return sendSuccess(res, { id }, 'Product deleted successfully');
  } catch (error) {
    next(error);
  }
};

// @desc    Bulk upload products from CSV/Excel JSON rows
// @route   POST /api/products/bulk-upload
const bulkUploadProducts = async (req, res, next) => {
  try {
    const { products } = req.body;
    if (!products || !Array.isArray(products) || products.length === 0) {
      return sendError(res, 'Please provide an array of product rows to import', 400);
    }

    let vendorId = 'ven_technova_001';
    if (req.user && req.user.role === 'vendor') {
      const v = store.findOne('vendors', { user: req.user._id });
      if (v) vendorId = v._id;
    }

    const createdList = [];
    for (const item of products) {
      const price = Number(item.price || item.Price || 100);
      const mrp = Number(item.mrp || item.MRP || price);
      const stock = Number(item.stock || item.Stock || 10);
      const sku = (item.sku || item.SKU || `SKU-${Date.now().toString().slice(-5)}`).toUpperCase();
      const barcode = item.barcode || item.Barcode || `890${Math.floor(100000000 + Math.random() * 900000000)}`;

      const created = store.create('products', {
        name: item.name || item.Name || 'Imported Product',
        slug: `${(item.name || 'product').toLowerCase().replace(/[^a-z0-9]/g, '-')}-${Date.now().toString().slice(-4)}`,
        category: item.category || 'cat_electronics',
        brand: item.brand || 'brd_apple',
        vendor: vendorId,
        price,
        mrp,
        discountPercent: mrp > price ? Math.round(((mrp - price) / mrp) * 100) : 0,
        sku,
        barcode,
        stock,
        lowStockThreshold: 5,
        images: [item.image || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&auto=format&fit=crop&q=80'],
        approvalStatus: 'approved',
        isActive: true,
      });
      createdList.push(created);
    }

    return sendSuccess(res, { count: createdList.length, products: createdList }, `Successfully imported ${createdList.length} products`);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getProducts,
  getProductByIdOrSlug,
  getHomeHighlights,
  createProduct,
  updateProduct,
  deleteProduct,
  bulkUploadProducts,
};

