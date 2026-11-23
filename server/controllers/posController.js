const { store } = require('../services/dbAdapter');
const { sendSuccess, sendError } = require('../utils/responseHandler');

// @desc    Get products formatted for POS counter grid & barcode search
// @route   GET /api/pos/products
const getPosProducts = async (req, res, next) => {
  try {
    const { category, search, storeCode, store: storeQuery } = req.query;
    let products = store.getCollection('products').filter((p) => p.isActive !== false);

    // Filter by Store (Aaradhya Silks 'AS' or Aaradhya Fabrics 'AF')
    const activeStoreCode = (storeCode || storeQuery || '').toUpperCase();
    if (activeStoreCode) {
      products = products.filter(
        (p) => (p.storeCode || '').toUpperCase() === activeStoreCode || p.storeId === storeQuery
      );
    }

    if (category && category !== 'all') {
      const cat = store.findOne('categories', { slug: category }) || store.findById('categories', category);
      if (cat) {
        products = products.filter((p) => p.category === cat._id || p.category === cat.slug);
      }
    }

    if (search && search.trim()) {
      const q = search.trim().toLowerCase();
      products = products.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.sku.toLowerCase().includes(q) ||
          (p.productId && p.productId.toLowerCase().includes(q)) ||
          (p.barcode && p.barcode.toLowerCase().includes(q))
      );
    }

    const posItems = products.map((p) => ({
      _id: p._id,
      name: p.name,
      productId: p.productId || (p.storeCode === 'AF' ? 'AF-000001' : 'AS-000001'),
      storeCode: p.storeCode || 'AS',
      storeName: p.storeName || (p.storeCode === 'AF' ? 'Aaradhya Fabrics' : 'Aaradhya Silks'),
      sku: p.sku,
      barcode: p.barcode,
      price: p.price,
      mrp: p.mrp,
      stock: p.stock,
      category: p.category,
      gstRate: p.gstRate || 5,
      image: (p.images && p.images[0]) || 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=300&auto=format&fit=crop&q=80',
    }));

    return sendSuccess(res, posItems, 'POS products fetched');
  } catch (error) {
    next(error);
  }
};

// @desc    Lookup product by barcode scanner input or SKU
// @route   GET /api/pos/scan/:code
const scanBarcodeOrSku = async (req, res, next) => {
  try {
    const { code } = req.params;
    if (!code) {
      return sendError(res, 'Barcode or SKU code is required', 400);
    }

    const trimmed = code.trim().toLowerCase();
    const product = store
      .getCollection('products')
      .find(
        (p) =>
          (p.barcode && p.barcode.toLowerCase() === trimmed) ||
          (p.productId && p.productId.toLowerCase() === trimmed) ||
          p.sku.toLowerCase() === trimmed ||
          p._id.toLowerCase() === trimmed
      );

    if (!product) {
      return sendError(res, `No product found matching code: ${code}`, 404);
    }

    return sendSuccess(res, {
      _id: product._id,
      name: product.name,
      productId: product.productId,
      storeCode: product.storeCode || 'AS',
      storeName: product.storeName || (product.storeCode === 'AF' ? 'Aaradhya Fabrics' : 'Aaradhya Silks'),
      sku: product.sku,
      barcode: product.barcode,
      price: product.price,
      mrp: product.mrp,
      stock: product.stock,
      gstRate: product.gstRate || 5,
      image: (product.images && product.images[0]) || '',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Generate a POS Counter Sale Bill & atomically update inventory
// @route   POST /api/pos/bills
const createPosBill = async (req, res, next) => {
  try {
    const {
      items,
      customer: inputCustomer,
      customerName,
      customerPhone,
      customerEmail,
      discountAmount = 0,
      discount = 0,
      paymentMode = 'Cash',
      paymentMethod,
      paymentDetails = {},
      storeId,
      storeName,
      storeCode: inputStoreCode,
    } = req.body;

    const customer = {
      name: inputCustomer?.name || customerName || 'Walk-in Customer',
      phone: inputCustomer?.phone || customerPhone || '',
      email: inputCustomer?.email || customerEmail || '',
    };

    const finalPaymentMode = paymentMode || paymentMethod || 'Cash';
    const disc = Number(discountAmount || discount || 0);

    if (!items || !Array.isArray(items) || items.length === 0) {
      return sendError(res, 'Cart is empty. Please add items before generating a bill.', 400);
    }

    const detectedStoreCode = (inputStoreCode || (storeName && storeName.toLowerCase().includes('fabric') ? 'AF' : 'AS')).toUpperCase();
    const billNumber = `${detectedStoreCode}-POS-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${Math.floor(1000 + Math.random() * 9000)}`;

    let subtotal = 0;
    let totalGst = 0;
    const processedItems = [];

    // Verify stock and compute GST per item
    for (const item of items) {
      const product =
        store.findById('products', item.product || item._id) ||
        store.findOne('products', { productId: item.productId }) ||
        store.findOne('products', { sku: item.sku }) ||
        store.findOne('products', { barcode: item.barcode });
      if (!product) {
        return sendError(res, `Product ${item.name} not found`, 404);
      }

      const qty = Number(item.quantity || 1);
      if (product.stock < qty) {
        return sendError(
          res,
          `Cannot bill '${product.name}'. Requested ${qty}, but current store stock is only ${product.stock}`,
          400
        );
      }

      const price = Number(item.price || product.price);
      const itemSubtotal = price * qty;
      const gstRate = Number(item.gstRate || product.gstRate || 18);
      const taxAmount = (itemSubtotal * gstRate) / 100;
      const itemTotal = itemSubtotal + taxAmount;

      subtotal += itemSubtotal;
      totalGst += taxAmount;

      processedItems.push({
        product: product._id,
        name: product.name,
        sku: item.sku || product.sku,
        barcode: product.barcode || '',
        variantName: item.variantName || '',
        price,
        mrp: product.mrp,
        quantity: qty,
        gstRate,
        taxAmount: Math.round(taxAmount * 100) / 100,
        total: Math.round(itemTotal * 100) / 100,
      });
    }

    const finalPayable = Math.max(0, Math.round((subtotal + totalGst - disc) * 100) / 100);

    // Atomically decrement stock
    for (const itm of processedItems) {
      store.deductStock(itm.product, itm.sku, itm.quantity, {
        type: 'pos_sale',
        refType: 'POSBill',
        refId: billNumber,
        user: req.user ? req.user.name : 'Counter Cashier',
        notes: `Offline counter checkout ${billNumber}`,
      });
    }

    const storeCode = detectedStoreCode;
    const finalStoreName = storeCode === 'AF' ? 'Aaradhya Fabrics' : 'Aaradhya Silks';

    // Credit Store Wallet immediately for in-store POS collection
    const wallet = store.findOne('wallets', { storeCode });
    if (wallet) {
      store.findByIdAndUpdate('wallets', wallet._id, {
        balance: (wallet.balance || 0) + finalPayable,
        totalEarned: (wallet.totalEarned || 0) + finalPayable,
      });
      store.create('walletTransactions', {
        storeId: wallet.storeId,
        storeCode,
        type: 'pos_sale',
        amount: finalPayable,
        previousBalance: wallet.balance || 0,
        newBalance: (wallet.balance || 0) + finalPayable,
        referenceId: billNumber,
        reference: billNumber,
        description: `Counter POS Sale ${billNumber} (${finalPaymentMode})`,
        status: 'settled',
        createdAt: new Date().toISOString(),
      });
    }

    // Save POS Bill
    const newBill = store.create('posBills', {
      billNumber,
      storeId: storeCode === 'AF' ? 'store_fabrics_002' : 'store_silks_001',
      storeCode,
      storeName: finalStoreName,
      cashier: {
        id: req.user ? req.user._id : 'usr_pos_001',
        name: req.user ? req.user.name : 'Terminal 01 Cashier',
      },
      customer: {
        name: customer.name || 'Walk-in Customer',
        phone: customer.phone || '',
        email: customer.email || '',
      },
      items: processedItems,
      subtotal: Math.round(subtotal * 100) / 100,
      taxAmount: Math.round(totalGst * 100) / 100,
      discountAmount: disc,
      totalPayable: finalPayable,
      paymentMode: finalPaymentMode,
      paymentDetails: {
        cashTendered: paymentDetails.cashTendered || finalPayable,
        changeReturned: paymentDetails.changeReturned || 0,
        upiRef: paymentDetails.upiRef || '',
        cardLast4: paymentDetails.cardLast4 || '',
      },
      status: 'Completed',
    });

    return sendSuccess(res, newBill, 'POS Bill generated successfully', 201);
  } catch (error) {
    next(error);
  }
};

// @desc    Get bill history
// @route   GET /api/pos/bills
const getPosBills = async (req, res, next) => {
  try {
    const { search, paymentMode } = req.query;
    let bills = store.getCollection('posBills');

    if (paymentMode && paymentMode !== 'all') {
      bills = bills.filter((b) => b.paymentMode.toLowerCase() === paymentMode.toLowerCase());
    }

    if (search && search.trim()) {
      const q = search.trim().toLowerCase();
      bills = bills.filter(
        (b) =>
          b.billNumber.toLowerCase().includes(q) ||
          (b.customer && b.customer.name && b.customer.name.toLowerCase().includes(q)) ||
          (b.customer && b.customer.phone && b.customer.phone.includes(q))
      );
    }

    bills.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    return sendSuccess(res, bills, 'Bill history retrieved');
  } catch (error) {
    next(error);
  }
};

// @desc    Get POS Daily Summary & Register Totals
// @route   GET /api/pos/summary
const getPosSummary = async (req, res, next) => {
  try {
    const bills = store.getCollection('posBills');
    const totalSales = bills.reduce((acc, b) => acc + (b.totalPayable || 0), 0);
    const totalTax = bills.reduce((acc, b) => acc + (b.taxAmount || 0), 0);
    const cashTotal = bills.filter((b) => b.paymentMode === 'Cash').reduce((acc, b) => acc + (b.totalPayable || 0), 0);
    const upiTotal = bills.filter((b) => b.paymentMode === 'UPI').reduce((acc, b) => acc + (b.totalPayable || 0), 0);
    const cardTotal = bills.filter((b) => b.paymentMode === 'Card').reduce((acc, b) => acc + (b.totalPayable || 0), 0);

    return sendSuccess(res, {
      totalBills: bills.length,
      totalSales: Math.round(totalSales * 100) / 100,
      totalTax: Math.round(totalTax * 100) / 100,
      cashTotal: Math.round(cashTotal * 100) / 100,
      upiTotal: Math.round(upiTotal * 100) / 100,
      cardTotal: Math.round(cardTotal * 100) / 100,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getPosProducts,
  scanBarcodeOrSku,
  createPosBill,
  getPosBills,
  getPosSummary,
};

