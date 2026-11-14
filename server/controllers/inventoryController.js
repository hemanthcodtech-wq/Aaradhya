const { store } = require('../services/dbAdapter');
const { sendSuccess, sendError } = require('../utils/responseHandler');

// @desc    Get real-time consolidated inventory list
// @route   GET /api/inventory
const getInventoryList = async (req, res, next) => {
  try {
    const { status, search } = req.query;
    let products = store.getCollection('products');

    if (search && search.trim()) {
      const q = search.trim().toLowerCase();
      products = products.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.sku.toLowerCase().includes(q) ||
          (p.barcode && p.barcode.toLowerCase().includes(q))
      );
    }

    const inventoryItems = products.map((p) => {
      let stockStatus = 'in_stock';
      if (p.stock <= 0) stockStatus = 'out_of_stock';
      else if (p.stock <= (p.lowStockThreshold || 5)) stockStatus = 'low_stock';

      return {
        _id: p._id,
        name: p.name,
        sku: p.sku,
        barcode: p.barcode,
        price: p.price,
        stock: p.stock,
        lowStockThreshold: p.lowStockThreshold || 5,
        stockStatus,
        category: p.category,
        vendor: p.vendor,
        updatedAt: p.updatedAt,
      };
    });

    if (status && status !== 'all') {
      const filtered = inventoryItems.filter((i) => i.stockStatus === status);
      return sendSuccess(res, filtered);
    }

    return sendSuccess(res, inventoryItems);
  } catch (error) {
    next(error);
  }
};

// @desc    Stock In / Purchase Entry / Manual Adjustment
// @route   POST /api/inventory/adjust
const adjustStock = async (req, res, next) => {
  try {
    const {
      productId,
      sku,
      quantity,
      type = 'purchase_in', // 'purchase_in' | 'manual_adjustment' | 'damaged'
      notes = '',
      referenceId = '',
    } = req.body;

    if (!productId || quantity === undefined) {
      return sendError(res, 'Please provide productId and quantity', 400);
    }

    const qty = Number(quantity);
    if (isNaN(qty)) {
      return sendError(res, 'Quantity must be a valid number', 400);
    }

    if (qty >= 0) {
      store.addStock(productId, sku, qty, {
        type,
        refType: 'Purchase',
        refId: referenceId || `PUR-${Date.now().toString().slice(-6)}`,
        user: req.user ? req.user.name : 'Store Manager',
        notes: notes || `Stock intake adjustment (+${qty})`,
      });
    } else {
      store.deductStock(productId, sku, Math.abs(qty), {
        type: type === 'purchase_in' ? 'manual_adjustment' : type,
        refType: 'Adjustment',
        refId: referenceId || `ADJ-${Date.now().toString().slice(-6)}`,
        user: req.user ? req.user.name : 'Store Manager',
        notes: notes || `Stock decrement adjustment (${qty})`,
      });
    }

    const updatedProduct = store.findById('products', productId);
    return sendSuccess(res, updatedProduct, 'Stock updated successfully');
  } catch (error) {
    next(error);
  }
};

// @desc    Get stock movement ledger / audit history
// @route   GET /api/inventory/movements
const getStockMovements = async (req, res, next) => {
  try {
    const { productId, type } = req.query;
    let movements = store.getCollection('stockMovements');

    if (productId) {
      movements = movements.filter((m) => m.product === productId);
    }

    if (type && type !== 'all') {
      movements = movements.filter((m) => m.movementType === type);
    }

    movements.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    return sendSuccess(res, movements, 'Stock movements retrieved');
  } catch (error) {
    next(error);
  }
};

// @desc    Get bulk barcode stickers for printing (supports thermal sticker & 24/30 stickers A4 sheet)
// @route   POST /api/inventory/barcodes
const getBarcodeStickers = async (req, res, next) => {
  try {
    const { items = [] } = req.body; // array of { productId, count }
    const stickers = [];

    for (const itm of items) {
      const p = store.findById('products', itm.productId);
      if (p) {
        const count = Math.min(Number(itm.count || 1), 100);
        for (let i = 0; i < count; i++) {
          stickers.push({
            id: `${p._id}_${i}`,
            productId: p._id,
            productName: p.name,
            sku: p.sku,
            barcode: p.barcode,
            price: p.price,
            mrp: p.mrp,
            storeName: 'ShopMart Retail',
          });
        }
      }
    }

    return sendSuccess(res, { totalStickers: stickers.length, stickers });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getInventoryList,
  adjustStock,
  getStockMovements,
  getBarcodeStickers,
};

