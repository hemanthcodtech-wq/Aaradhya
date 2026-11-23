const { store } = require('../services/dbAdapter');
const { sendSuccess, sendError } = require('../utils/responseHandler');

// Store security helper: ensures store admins only access their own store
const checkStoreAccess = (req, targetStoreCode) => {
  if (!req.user) return false;
  if (req.user.role === 'super_admin') return true;
  const userStoreCode = (req.user.storeCode || '').toUpperCase();
  return userStoreCode === targetStoreCode.toUpperCase();
};

// @desc    Get all stores
// @route   GET /api/stores
const getStores = async (req, res, next) => {
  try {
    const stores = store.find('stores', { isActive: true });
    return sendSuccess(res, stores);
  } catch (err) {
    next(err);
  }
};

// @desc    Get store by code (AS or AF)
// @route   GET /api/stores/:code
const getStoreByCode = async (req, res, next) => {
  try {
    const { code } = req.params;
    const storeRecord = store.findOne('stores', { code: code.toUpperCase() });
    if (!storeRecord) {
      return sendError(res, `Store with code ${code} not found`, 404);
    }
    return sendSuccess(res, storeRecord);
  } catch (err) {
    next(err);
  }
};

// @desc    Update store settings
// @route   PUT /api/stores/:code
const updateStore = async (req, res, next) => {
  try {
    const { code } = req.params;
    const storeCodeUpper = code.toUpperCase();
    if (req.user && !checkStoreAccess(req, storeCodeUpper)) {
      return sendError(res, `Forbidden: You do not have permission to manage store ${storeCodeUpper}`, 403);
    }

    const storeRecord = store.findOne('stores', { code: storeCodeUpper });
    if (!storeRecord) {
      return sendError(res, `Store ${code} not found`, 404);
    }
    const updated = store.findByIdAndUpdate('stores', storeRecord._id, req.body);
    return sendSuccess(res, updated, 'Store updated successfully');
  } catch (err) {
    next(err);
  }
};

// @desc    Get store wallet & ledger
// @route   GET /api/stores/:code/wallet
const getStoreWallet = async (req, res, next) => {
  try {
    const { code } = req.params;
    const storeCodeUpper = code.toUpperCase();
    if (req.user && !checkStoreAccess(req, storeCodeUpper)) {
      return sendError(res, `Forbidden: You cannot access wallet data for store ${storeCodeUpper}`, 403);
    }

    const storeRecord = store.findOne('stores', { code: storeCodeUpper });
    if (!storeRecord) {
      return sendError(res, `Store ${code} not found`, 404);
    }

    let wallet = store.findOne('wallets', { storeCode: storeCodeUpper });
    if (!wallet) {
      wallet = {
        _id: `wal_${code.toLowerCase()}_001`,
        storeId: storeRecord._id,
        storeCode: storeCodeUpper,
        storeName: storeRecord.name,
        balance: storeRecord.walletBalance || 0,
        pendingSettlement: storeRecord.pendingSettlement || 0,
        totalEarned: storeRecord.totalRevenue || 0,
        totalWithdrawn: 0,
      };
    }

    const existingTx = store.find('walletTransactions', { storeCode: storeCodeUpper }) || [];
    const existingRefs = new Set(existingTx.map((t) => t.referenceId || t.reference));

    const posBills = store.find('posBills', { storeCode: storeCodeUpper }) || [];
    const synthesizedPosTx = posBills
      .filter((b) => !existingRefs.has(b.billNumber))
      .map((b) => ({
        _id: b._id || `tx_pos_${b.billNumber}`,
        storeCode: storeCodeUpper,
        type: 'pos_sale',
        referenceId: b.billNumber,
        reference: b.billNumber,
        channel: 'Counter POS',
        method: b.paymentMode || 'Cash',
        amount: b.totalPayable || b.subtotal || 0,
        customer: b.customer?.name || 'Walk-in Customer',
        phone: b.customer?.phone || '',
        status: 'settled',
        createdAt: b.createdAt || new Date().toISOString(),
        date: new Date(b.createdAt || Date.now()).toLocaleDateString('en-IN', {
          day: '2-digit',
          month: 'short',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        }),
      }));

    const transactions = [...existingTx, ...synthesizedPosTx]
      .sort((a, b) => new Date(b.createdAt || b.date) - new Date(a.createdAt || a.date))
      .slice(0, 50);

    return sendSuccess(res, { wallet, transactions });
  } catch (err) {
    next(err);
  }
};

// @desc    Get store-specific analytics & KPIs
// @route   GET /api/stores/:code/analytics
const getStoreAnalytics = async (req, res, next) => {
  try {
    const { code } = req.params;
    const storeCodeUpper = code.toUpperCase();
    if (req.user && !checkStoreAccess(req, storeCodeUpper)) {
      return sendError(res, `Forbidden: You cannot access analytics for store ${storeCodeUpper}`, 403);
    }

    const storeRecord = store.findOne('stores', { code: storeCodeUpper });
    if (!storeRecord) {
      return sendError(res, `Store ${code} not found`, 404);
    }

    const products = store.find('products', { storeCode: storeCodeUpper });
    const lowStock = products.filter((p) => p.stock <= (p.lowStockThreshold || 5)).length;
    const outOfStock = products.filter((p) => p.stock <= 0).length;
    const totalInventoryStock = products.reduce((acc, p) => acc + (p.stock || 0), 0);
    const inventoryValuation = products.reduce((acc, p) => acc + ((p.stock || 0) * (p.price || 0)), 0);

    const allOrders = store.find('orders');
    let storeOrdersCount = 0;
    let storeRevenue = 0;
    let onlineSales = 0;
    let pendingDispatch = 0;
    let deliveredOrders = 0;
    let processingOrders = 0;
    let shippedOrders = 0;
    let cancelledOrders = 0;

    allOrders.forEach((ord) => {
      const sub = (ord.suborders || []).find((s) => s.storeCode === storeCodeUpper);
      if (sub) {
        storeOrdersCount++;
        storeRevenue += sub.totalAmount || 0;
        onlineSales += sub.totalAmount || 0;
        if (sub.status === 'delivered') deliveredOrders++;
        else if (sub.status === 'shipped') shippedOrders++;
        else if (sub.status === 'processing' || sub.status === 'packed') processingOrders++;
        else if (sub.status === 'cancelled') cancelledOrders++;
        else pendingDispatch++;
      } else {
        const storeItems = (ord.items || []).filter((i) => i.storeCode === storeCodeUpper);
        if (storeItems.length > 0) {
          storeOrdersCount++;
          const itemsTotal = storeItems.reduce((acc, it) => acc + (it.price * it.quantity), 0);
          storeRevenue += itemsTotal;
          onlineSales += itemsTotal;
        }
      }
    });

    const posBills = store.find('posBills', { storeCode: storeCodeUpper });
    const posSales = posBills.reduce((acc, b) => acc + (b.totalAmount || 0), 0);
    const totalSales = onlineSales + posSales;

    const categoryCounts = {};
    products.forEach((p) => {
      const catName = typeof p.category === 'object' ? p.category.name : p.category;
      categoryCounts[catName] = (categoryCounts[catName] || 0) + 1;
    });

    const topCategories = Object.entries(categoryCounts).map(([name, count]) => ({
      name,
      count,
      percent: Math.round((count / (products.length || 1)) * 100),
    }));

    return sendSuccess(res, {
      store: storeRecord,
      kpis: {
        totalSales,
        onlineSales,
        offlineSales: posSales,
        todaySales: Math.round(totalSales * 0.08),
        monthlyRevenue: totalSales,
        totalOrders: storeOrdersCount + posBills.length,
        onlineOrders: storeOrdersCount,
        offlineOrders: posBills.length,
        pendingDispatch,
        processingOrders,
        shippedOrders,
        deliveredOrders,
        cancelledOrders,
        totalProducts: products.length,
        totalStock: totalInventoryStock,
        availableStock: Math.max(0, totalInventoryStock - 15),
        reservedStock: 15,
        lowStockProducts: lowStock,
        outOfStockProducts: outOfStock,
        inventoryValuation,
        walletBalance: storeRecord.walletBalance || 0,
        pendingSettlement: storeRecord.pendingSettlement || (storeCodeUpper === 'AS' ? 45200 : 38100),
      },
      topCategories,
      recentBills: posBills.slice(-5).reverse(),
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Preview next atomic product ID for store
// @route   GET /api/stores/:code/next-product-id
const getNextProductIdPreview = async (req, res, next) => {
  try {
    const { code } = req.params;
    const storeCodeUpper = code.toUpperCase();
    const nextId = store.getNextProductId(storeCodeUpper);
    return sendSuccess(res, { nextId, storeCode: storeCodeUpper });
  } catch (err) {
    next(err);
  }
};

// @desc    Get store products
// @route   GET /api/stores/:code/products
const getStoreProducts = async (req, res, next) => {
  try {
    const { code } = req.params;
    const storeCodeUpper = code.toUpperCase();
    if (req.user && !checkStoreAccess(req, storeCodeUpper)) {
      return sendError(res, `Forbidden: You cannot access products for store ${storeCodeUpper}`, 403);
    }

    const { search, category, inStock, status, page = 1, limit = 50 } = req.query;
    let products = store.find('products', { storeCode: storeCodeUpper });

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

    if (category && category !== 'all') {
      products = products.filter((p) => p.category === category || p.category?.slug === category || p.category?.name === category);
    }

    if (status && status !== 'all') {
      if (status === 'active') products = products.filter((p) => p.isActive !== false);
      else if (status === 'inactive') products = products.filter((p) => p.isActive === false);
    }

    if (inStock === 'true') {
      products = products.filter((p) => p.stock > 0);
    } else if (inStock === 'false') {
      products = products.filter((p) => p.stock <= 0);
    }

    const populated = products.map((p) => store.populateProduct(p));
    return sendSuccess(res, {
      total: products.length,
      page: Number(page),
      limit: Number(limit),
      products: populated,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get store inventory & movement history
// @route   GET /api/stores/:code/inventory
const getStoreInventory = async (req, res, next) => {
  try {
    const { code } = req.params;
    const storeCodeUpper = code.toUpperCase();
    if (req.user && !checkStoreAccess(req, storeCodeUpper)) {
      return sendError(res, `Forbidden: You cannot access inventory for store ${storeCodeUpper}`, 403);
    }

    const products = store.find('products', { storeCode: storeCodeUpper });
    const allMovements = store.getCollection('stockMovements') || [];
    
    // Filter stock movements belonging to this store's products
    const productIds = new Set(products.map((p) => String(p._id)));
    const storeMovements = allMovements
      .filter((m) => productIds.has(String(m.product)))
      .slice(-40)
      .reverse();

    const totalStock = products.reduce((acc, p) => acc + (p.stock || 0), 0);
    const lowStockCount = products.filter((p) => p.stock <= (p.lowStockThreshold || 5)).length;
    const outOfStockCount = products.filter((p) => p.stock <= 0).length;
    const totalValuation = products.reduce((acc, p) => acc + ((p.stock || 0) * (p.price || 0)), 0);

    return sendSuccess(res, {
      summary: {
        totalProducts: products.length,
        totalStock,
        availableStock: Math.max(0, totalStock - 12),
        reservedStock: 12,
        lowStockCount,
        outOfStockCount,
        totalValuation,
      },
      products: products.map((p) => store.populateProduct(p)),
      movements: storeMovements,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Adjust inventory (Stock In, Stock Out, Adjustment)
// @route   POST /api/stores/:code/inventory/adjust
const adjustStoreInventory = async (req, res, next) => {
  try {
    const { code } = req.params;
    const storeCodeUpper = code.toUpperCase();
    if (req.user && !checkStoreAccess(req, storeCodeUpper)) {
      return sendError(res, `Forbidden: You cannot modify inventory for store ${storeCodeUpper}`, 403);
    }

    const { productId, sku, quantity, type = 'purchase_in', notes = '', supplier = '', referenceId = '' } = req.body;
    if (!productId || quantity === undefined) {
      return sendError(res, 'Please provide productId and quantity', 400);
    }

    const product = store.findById('products', productId);
    if (!product) {
      return sendError(res, 'Product not found', 404);
    }

    if (product.storeCode && product.storeCode.toUpperCase() !== storeCodeUpper) {
      return sendError(res, `This product belongs to store ${product.storeCode}, not ${storeCodeUpper}`, 403);
    }

    const qty = Number(quantity);
    if (isNaN(qty)) {
      return sendError(res, 'Quantity must be a valid number', 400);
    }

    const ref = referenceId || `${type === 'purchase_in' ? 'PUR' : 'ADJ'}-${Date.now().toString().slice(-6)}`;
    const performer = req.user ? req.user.name : `${storeCodeUpper} Store Manager`;

    if (qty >= 0 && type === 'purchase_in') {
      store.addStock(productId, sku || product.sku, qty, {
        type: 'purchase_in',
        refType: 'Purchase',
        refId: ref,
        user: performer,
        notes: notes ? `${notes} (Supplier: ${supplier || 'Default Mills'})` : `Stock intake adjustment (+${qty})`,
      });
    } else {
      const deductionQty = Math.abs(qty);
      if (product.stock < deductionQty && type !== 'manual_adjustment') {
        return sendError(res, `Cannot deduct ${deductionQty} units. Current stock is only ${product.stock}`, 400);
      }
      store.deductStock(productId, sku || product.sku, deductionQty, {
        type: type === 'damaged' ? 'damaged' : 'manual_adjustment',
        refType: 'Adjustment',
        refId: ref,
        user: performer,
        notes: notes || `Stock correction adjustment (-${deductionQty})`,
      });
    }

    const updated = store.findById('products', productId);
    return sendSuccess(res, store.populateProduct(updated), 'Inventory updated successfully');
  } catch (err) {
    next(err);
  }
};

// @desc    Get store returns & exchanges
// @route   GET /api/stores/:code/returns
const getStoreReturns = async (req, res, next) => {
  try {
    const { code } = req.params;
    const storeCodeUpper = code.toUpperCase();
    if (req.user && !checkStoreAccess(req, storeCodeUpper)) {
      return sendError(res, `Forbidden: You cannot access returns for store ${storeCodeUpper}`, 403);
    }

    let returns = store.getCollection('storeReturns') || [];
    if (returns.length === 0) {
      // Seed realistic store returns
      returns = [
        {
          _id: 'ret_001',
          returnNumber: 'RET-AS-2026-001',
          storeCode: 'AS',
          storeName: 'Aaradhya Silks',
          suborderNumber: 'AS-ORD-488764',
          customerName: 'Pooja Venkatesh',
          customerEmail: 'customer@aaradhya.com',
          productName: 'Kanjeevaram Bridal Silk Saree',
          productId: 'AS-000001',
          sku: 'AS-000001-RED-FS',
          quantity: 1,
          refundAmount: 19939,
          reason: 'Color tone difference from display',
          condition: 'Original packaging intact with silk mark tag',
          status: 'pending_inspection',
          restocked: false,
          createdAt: new Date(Date.now() - 86400000).toISOString(),
        },
        {
          _id: 'ret_002',
          returnNumber: 'RET-AF-2026-002',
          storeCode: 'AF',
          storeName: 'Aaradhya Fabrics',
          suborderNumber: 'AF-ORD-488765',
          customerName: 'Kavita Reddy',
          customerEmail: 'kavita@gmail.com',
          productName: 'Pure Mulmul Cotton Running Yardage (5M)',
          productId: 'AF-000002',
          sku: 'AF-000002-BLU-5M',
          quantity: 1,
          refundAmount: 2450,
          reason: 'Excess meterage ordered',
          condition: 'Uncut, original fabric fold',
          status: 'approved',
          restocked: true,
          createdAt: new Date(Date.now() - 172800000).toISOString(),
        },
        {
          _id: 'ret_003',
          returnNumber: 'RET-AS-2026-003',
          storeCode: 'AS',
          storeName: 'Aaradhya Silks',
          suborderNumber: 'AS-ORD-488766',
          customerName: 'Ananya Sharma',
          customerEmail: 'ananya@gmail.com',
          productName: 'Banarasi Brocade Silk Dupatta',
          productId: 'AS-000003',
          sku: 'AS-000003-GLD-FS',
          quantity: 1,
          refundAmount: 4850,
          reason: 'Zari border frayed near edge',
          condition: 'Damaged in transit',
          status: 'rejected_restock',
          restocked: false,
          createdAt: new Date(Date.now() - 259200000).toISOString(),
        },
      ];
      store.memoryData.storeReturns = returns;
      store.saveToFile();
    }

    const filtered = returns.filter((r) => r.storeCode === storeCodeUpper);
    return sendSuccess(res, filtered.reverse());
  } catch (err) {
    next(err);
  }
};

// @desc    Inspect return & approve/reject restocking
// @route   PUT /api/stores/:code/returns/:id/inspect
const inspectStoreReturn = async (req, res, next) => {
  try {
    const { code, id } = req.params;
    const storeCodeUpper = code.toUpperCase();
    if (req.user && !checkStoreAccess(req, storeCodeUpper)) {
      return sendError(res, `Forbidden: You cannot inspect returns for store ${storeCodeUpper}`, 403);
    }

    const { action, restock = false, notes = '' } = req.body;
    let returns = store.getCollection('storeReturns') || [];
    const ret = returns.find((r) => r._id === id || r.returnNumber === id);
    if (!ret) {
      return sendError(res, 'Return request not found', 404);
    }

    ret.status = action === 'approve' ? 'approved' : 'rejected';
    ret.inspectionNotes = notes;
    ret.inspectedBy = req.user ? req.user.name : 'Store Manager';
    ret.inspectedAt = new Date().toISOString();

    // Critical business rule: "Restock only after inspection and approval. Damaged items must be recorded separately."
    if (action === 'approve' && restock && !ret.restocked) {
      const product = store.findOne('products', { sku: ret.sku }) || store.findOne('products', { productId: ret.productId });
      if (product) {
        store.addStock(product._id, ret.sku || product.sku, Number(ret.quantity || 1), {
          type: 'return_in',
          refType: 'Return',
          refId: ret.returnNumber,
          user: req.user ? req.user.name : 'Store Manager',
          notes: `Restocked approved return: ${ret.returnNumber}`,
        });
        ret.restocked = true;
      }
    }

    store.saveToFile();
    return sendSuccess(res, ret, `Return request ${action === 'approve' ? 'approved' : 'rejected'}`);
  } catch (err) {
    next(err);
  }
};

// @desc    Get store payouts
// @route   GET /api/stores/:code/payouts
const getStorePayouts = async (req, res, next) => {
  try {
    const { code } = req.params;
    const storeCodeUpper = code.toUpperCase();
    if (req.user && !checkStoreAccess(req, storeCodeUpper)) {
      return sendError(res, `Forbidden: You cannot access payouts for store ${storeCodeUpper}`, 403);
    }

    let payouts = store.getCollection('storePayouts') || [];
    const filtered = payouts.filter((p) => p.storeCode === storeCodeUpper);
    const wallet = store.findOne('wallets', { storeCode: storeCodeUpper }) || {};

    return sendSuccess(res, {
      availableBalance: wallet.balance || 0,
      pendingSettlement: wallet.pendingSettlement || 0,
      payouts: filtered.reverse(),
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Submit store payout request
// @route   POST /api/stores/:code/payouts
const requestStorePayout = async (req, res, next) => {
  try {
    const { code } = req.params;
    const storeCodeUpper = code.toUpperCase();
    if (req.user && !checkStoreAccess(req, storeCodeUpper)) {
      return sendError(res, `Forbidden: You cannot request payouts for store ${storeCodeUpper}`, 403);
    }

    const { amount, bankDetails, notes = '' } = req.body;
    const reqAmount = Number(amount);
    if (!reqAmount || reqAmount <= 0) {
      return sendError(res, 'Please provide a valid payout amount', 400);
    }

    const wallet = store.findOne('wallets', { storeCode: storeCodeUpper });
    const currentBalance = wallet?.balance || 0;
    if (reqAmount > currentBalance) {
      return sendError(res, `Requested payout ₹${reqAmount.toLocaleString()} exceeds your available wallet balance of ₹${currentBalance.toLocaleString()}`, 400);
    }

    const storeRecord = store.findOne('stores', { code: storeCodeUpper });
    let payouts = store.getCollection('storePayouts') || [];
    const payoutNumber = `PO-${storeCodeUpper}-${Date.now().toString().slice(-6)}`;

    const newPayout = {
      _id: `po_${Date.now()}`,
      payoutNumber,
      storeCode: storeCodeUpper,
      storeName: storeRecord?.name || (storeCodeUpper === 'AF' ? 'Aaradhya Fabrics' : 'Aaradhya Silks'),
      requestedAmount: reqAmount,
      approvedAmount: 0,
      status: 'pending',
      requestedAt: new Date().toISOString(),
      bankDetails: bankDetails || (storeCodeUpper === 'AF' ? 'HDFC Bank - A/C 9876543210 (IFSC: HDFC0001234)' : 'SBI - A/C 1234567890 (IFSC: SBIN0004321)'),
      notes,
    };

    payouts.push(newPayout);
    store.memoryData.storePayouts = payouts;
    store.saveToFile();

    return sendSuccess(res, newPayout, 'Payout request submitted successfully to Super Admin', 201);
  } catch (err) {
    next(err);
  }
};

// @desc    Get store customer directory
// @route   GET /api/stores/:code/customers
const getStoreCustomers = async (req, res, next) => {
  try {
    const { code } = req.params;
    const storeCodeUpper = code.toUpperCase();
    if (req.user && !checkStoreAccess(req, storeCodeUpper)) {
      return sendError(res, `Forbidden: You cannot access customer data for store ${storeCodeUpper}`, 403);
    }

    const allOrders = store.find('orders');
    const posBills = store.find('posBills', { storeCode: storeCodeUpper });
    const customerMap = new Map();

    // Scan online orders for this store
    allOrders.forEach((ord) => {
      const sub = (ord.suborders || []).find((s) => s.storeCode === storeCodeUpper);
      if (sub && ord.customerEmail) {
        const key = ord.customerEmail.toLowerCase();
        if (!customerMap.has(key)) {
          customerMap.set(key, {
            id: ord.customer || `cust_${key}`,
            name: ord.customerName || 'Online Shopper',
            email: ord.customerEmail,
            phone: ord.shippingAddress?.phone || '+91 98765 43210',
            city: ord.shippingAddress?.city || 'Hyderabad',
            totalOrders: 0,
            totalSpent: 0,
            lastOrderDate: ord.createdAt,
            channel: 'Online Store',
          });
        }
        const record = customerMap.get(key);
        record.totalOrders += 1;
        record.totalSpent += sub.totalAmount || 0;
        if (new Date(ord.createdAt) > new Date(record.lastOrderDate)) {
          record.lastOrderDate = ord.createdAt;
        }
      }
    });

    // Scan POS bills
    posBills.forEach((b) => {
      const custPhone = b.customer?.phone || (b.customer?.name ? `pos_${b.customer.name.replace(/\s+/g, '_').toLowerCase()}` : null);
      if (custPhone) {
        const key = custPhone;
        if (!customerMap.has(key)) {
          customerMap.set(key, {
            id: `pos_cust_${key}`,
            name: b.customer.name || 'In-Store Shopper',
            email: b.customer.email || 'counter@aaradhya.com',
            phone: b.customer.phone || 'In-Store',
            city: 'KPHB Store Counter',
            totalOrders: 0,
            totalSpent: 0,
            lastOrderDate: b.createdAt || new Date().toISOString(),
            channel: 'Counter POS',
          });
        }
        const record = customerMap.get(key);
        record.totalOrders += 1;
        record.totalSpent += (b.totalPayable || b.subtotal || b.totalAmount || 0);
        if (new Date(b.createdAt || Date.now()) > new Date(record.lastOrderDate)) {
          record.lastOrderDate = b.createdAt || new Date().toISOString();
        }
      }
    });

    const customersList = Array.from(customerMap.values())
      .map((c) => ({
        ...c,
        _id: c.id,
        ordersCount: c.totalOrders,
        totalSpend: c.totalSpent,
        lastOrderDate: new Date(c.lastOrderDate).toLocaleDateString('en-IN', {
          day: '2-digit',
          month: 'short',
          year: 'numeric',
        }),
      }))
      .sort((a, b) => b.totalSpent - a.totalSpent);

    return sendSuccess(res, customersList);
  } catch (err) {
    next(err);
  }
};

// @desc    Get store reports & exports
// @route   GET /api/stores/:code/reports
const getStoreReports = async (req, res, next) => {
  try {
    const { code } = req.params;
    const storeCodeUpper = code.toUpperCase();
    if (req.user && !checkStoreAccess(req, storeCodeUpper)) {
      return sendError(res, `Forbidden: You cannot access reports for store ${storeCodeUpper}`, 403);
    }

    const products = store.find('products', { storeCode: storeCodeUpper });
    const posBills = store.find('posBills', { storeCode: storeCodeUpper });
    const allOrders = store.find('orders');

    const suborders = [];
    allOrders.forEach((o) => {
      const sub = (o.suborders || []).find((s) => s.storeCode === storeCodeUpper);
      if (sub) suborders.push(sub);
    });

    const onlineGMV = suborders.reduce((acc, s) => acc + (s.totalAmount || 0), 0);
    const offlineGMV = posBills.reduce((acc, b) => acc + (b.totalAmount || 0), 0);

    return sendSuccess(res, {
      storeCode: storeCodeUpper,
      summary: {
        onlineGMV,
        offlineGMV,
        totalGMV: onlineGMV + offlineGMV,
        totalOnlineOrders: suborders.length,
        totalPosBills: posBills.length,
        totalProducts: products.length,
      },
      recentPosBills: posBills.slice(-10).reverse(),
      recentSuborders: suborders.slice(-10).reverse(),
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
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
};
