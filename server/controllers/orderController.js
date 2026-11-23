const { store } = require('../services/dbAdapter');
const shiprocketService = require('../services/shiprocketService');
const { sendSuccess, sendError } = require('../utils/responseHandler');

// @desc    Create a new customer order (Supports multi-vendor items)
// @route   POST /api/orders
const createOrder = async (req, res, next) => {
  try {
    const { items, shippingAddress, paymentMethod = 'razorpay', couponCode, razorpayDetails } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return sendError(res, 'Order must contain at least one product item', 400);
    }

    if (!shippingAddress || !shippingAddress.fullName || !shippingAddress.addressLine1 || !shippingAddress.pincode) {
      return sendError(res, 'Please provide complete delivery shipping address', 400);
    }

    const orderNumber = `ORD-${Math.floor(100000 + Math.random() * 900000)}`;

    let subtotal = 0;
    let totalTax = 0;
    const processedItems = [];

    // 1. Verify stock & compute pricing & calculate vendor splits
    for (const item of items) {
      const product = store.findById('products', item.product || item.productId);
      if (!product) {
        return sendError(res, `Product not found: ${item.name || item.product}`, 404);
      }

      const qty = Number(item.quantity || 1);
      if (product.stock < qty) {
        return sendError(res, `Insufficient stock for '${product.name}'. Available: ${product.stock}`, 400);
      }

      const unitPrice = Number(product.price);
      const itemSubtotal = unitPrice * qty;
      const gstRate = Number(product.gstRate || 18);
      const taxAmount = (itemSubtotal * gstRate) / 100;

      // Find vendor commission rate
      const vendor = store.findById('vendors', product.vendor);
      const commissionRate = vendor ? vendor.commissionRate : 10;
      const commissionAmount = (itemSubtotal * commissionRate) / 100;
      const vendorEarning = itemSubtotal - commissionAmount;

      subtotal += itemSubtotal;
      totalTax += taxAmount;

      processedItems.push({
        product: product._id,
        variantId: item.variantId || null,
        name: product.name,
        productId: product.productId || (product.storeCode === 'AF' ? 'AF-000001' : 'AS-000001'),
        storeCode: product.storeCode || (product.name.toLowerCase().includes('fabric') || product.name.toLowerCase().includes('dress material') ? 'AF' : 'AS'),
        storeName: (product.storeCode === 'AF' || product.name.toLowerCase().includes('fabric') || product.name.toLowerCase().includes('dress material')) ? 'Aaradhya Fabrics' : 'Aaradhya Silks',
        sku: item.sku || product.sku,
        barcode: product.barcode || '',
        price: unitPrice,
        mrp: product.mrp,
        quantity: qty,
        image: product.images[0] || '',
        vendor: product.vendor,
        vendorStatus: 'pending',
        commissionAmount: 0,
        vendorEarning: itemSubtotal,
        shipment: {
          shiprocketOrderId: '',
          shiprocketShipmentId: '',
          awb: '',
          courierName: 'Blue Dart / Shiprocket',
          status: 'Order Placed',
          trackingUrl: '',
          labelUrl: '',
        },
      });
    }

    // 2. Coupon discount calculation
    let discountAmount = 0;
    if (couponCode) {
      const coupon = store.findOne('coupons', { code: couponCode.toUpperCase(), isActive: true });
      if (coupon && subtotal >= (coupon.minPurchaseAmount || 0)) {
        if (coupon.discountType === 'percentage') {
          discountAmount = (subtotal * coupon.discountValue) / 100;
          if (coupon.maxDiscountAmount) {
            discountAmount = Math.min(discountAmount, coupon.maxDiscountAmount);
          }
        } else {
          discountAmount = coupon.discountValue;
        }
      }
    }

    // Shipping calculation (free over ₹999)
    const shippingFee = subtotal > 999 ? 0 : 99;
    const totalAmount = Math.round((subtotal + totalTax + shippingFee - discountAmount) * 100) / 100;

    // 3. Atomically deduct stock for all items
    for (const itm of processedItems) {
      store.deductStock(itm.product, itm.sku, itm.quantity, {
        type: 'online_sale',
        refType: 'Order',
        refId: orderNumber,
        user: req.user ? req.user.name : 'Customer Checkout',
        notes: `Online checkout order ${orderNumber}`,
      });
    }

    // 4. Create Store Suborders for Aaradhya Silks (AS) and Aaradhya Fabrics (AF)
    const storeGroups = {};
    for (const item of processedItems) {
      const code = item.storeCode || 'AS';
      if (!storeGroups[code]) {
        storeGroups[code] = {
          storeCode: code,
          storeName: code === 'AF' ? 'Aaradhya Fabrics' : 'Aaradhya Silks',
          storeId: code === 'AF' ? 'store_fabrics_002' : 'store_silks_001',
          items: [],
          subtotal: 0,
        };
      }
      storeGroups[code].items.push(item);
      storeGroups[code].subtotal += item.price * item.quantity;
    }

    const suborders = Object.values(storeGroups).map((grp) => {
      const suborderNum = store.getNextSuborderNumber(grp.storeCode);
      const taxPart = Math.round((grp.subtotal * 0.05) * 100) / 100;
      const totalPart = Math.round((grp.subtotal + taxPart) * 100) / 100;

      // Update store wallet pending earnings
      const wallet = store.findOne('wallets', { storeCode: grp.storeCode });
      if (wallet) {
        store.findByIdAndUpdate('wallets', wallet._id, {
          pendingSettlement: (wallet.pendingSettlement || 0) + totalPart,
          totalEarned: (wallet.totalEarned || 0) + totalPart,
        });
        store.create('walletTransactions', {
          storeId: grp.storeId,
          storeCode: grp.storeCode,
          type: 'order_credit',
          amount: totalPart,
          previousBalance: wallet.balance || 0,
          newBalance: wallet.balance || 0,
          referenceId: suborderNum,
          description: `Order ${suborderNum} from parent ${orderNumber}`,
          status: 'pending',
        });
      }

      return {
        suborderNumber: suborderNum,
        storeId: grp.storeId,
        storeCode: grp.storeCode,
        storeName: grp.storeName,
        itemCount: grp.items.length,
        subtotal: grp.subtotal,
        taxAmount: taxPart,
        shippingFee: 0,
        totalAmount: totalPart,
        status: 'pending',
        courier: 'Blue Dart / Shiprocket Express',
        trackingNumber: `TRK-${grp.storeCode}-${Math.floor(100000 + Math.random() * 900000)}`,
        items: grp.items,
      };
    });

    // 5. Create Order Record with Parent & Suborders
    const newOrder = store.create('orders', {
      orderNumber,
      customer: req.user ? req.user._id : 'usr_guest',
      customerDetails: {
        name: shippingAddress.fullName,
        email: req.user ? req.user.email : shippingAddress.email || 'guest@example.com',
        phone: shippingAddress.phone,
      },
      shippingAddress,
      items: processedItems,
      suborders,
      subtotal,
      taxAmount: Math.round(totalTax * 100) / 100,
      shippingFee,
      discountAmount: Math.round(discountAmount * 100) / 100,
      totalAmount,
      couponCode: couponCode || '',
      paymentMethod,
      paymentStatus: paymentMethod === 'cod' ? 'pending' : 'paid',
      razorpayDetails: razorpayDetails || {
        orderId: `rzp_ord_${Date.now()}`,
        paymentId: `rzp_pay_${Date.now()}`,
        signature: 'sandbox_verified_signature',
      },
      orderStatus: 'confirmed',
      timeline: [
        { status: 'Order Placed', timestamp: new Date().toISOString(), note: `Payment confirmed via ${paymentMethod.toUpperCase()}` },
        { status: 'Order Confirmed', timestamp: new Date().toISOString(), note: `Generated ${suborders.length} store suborders: ${suborders.map(s => s.suborderNumber).join(', ')}` },
      ],
      isPosOrder: false,
    });

    // 5. Update vendor total sales & earnings
    for (const itm of processedItems) {
      const v = store.findById('vendors', itm.vendor);
      if (v) {
        store.findByIdAndUpdate('vendors', v._id, {
          totalSales: (v.totalSales || 0) + itm.price * itm.quantity,
          totalEarnings: (v.totalEarnings || 0) + itm.vendorEarning,
          pendingPayout: (v.pendingPayout || 0) + itm.vendorEarning,
        });
      }
    }

    return sendSuccess(res, newOrder, 'Order placed successfully', 201);
  } catch (error) {
    next(error);
  }
};

// @desc    Get orders for current customer
// @route   GET /api/orders/my-orders
const getMyOrders = async (req, res, next) => {
  try {
    const orders = store.find('orders', { customer: req.user._id });
    orders.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    return sendSuccess(res, orders);
  } catch (error) {
    next(error);
  }
};

// @desc    Get order by ID or orderNumber
// @route   GET /api/orders/:identifier
const getOrderById = async (req, res, next) => {
  try {
    const { identifier } = req.params;
    const order =
      store.findOne('orders', { orderNumber: identifier }) ||
      store.findById('orders', identifier);

    if (!order) {
      return sendError(res, 'Order not found', 404);
    }

    return sendSuccess(res, order);
  } catch (error) {
    next(error);
  }
};

// @desc    Get orders relevant to a vendor (Vendor portal)
// @route   GET /api/orders/vendor/list
const getVendorOrders = async (req, res, next) => {
  try {
    const vendor = store.findOne('vendors', { user: req.user._id });
    if (!vendor) {
      return sendError(res, 'Vendor profile not found', 404);
    }

    const allOrders = store.getCollection('orders');
    // Filter orders containing items belonging to this vendor
    const vendorOrders = [];

    for (const ord of allOrders) {
      const myItems = ord.items.filter((itm) => itm.vendor === vendor._id);
      if (myItems.length > 0) {
        vendorOrders.push({
          ...ord,
          vendorSpecificItems: myItems,
          vendorTotalEarnings: myItems.reduce((acc, itm) => acc + (itm.vendorEarning || 0), 0),
        });
      }
    }

    vendorOrders.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    return sendSuccess(res, vendorOrders, 'Vendor orders retrieved');
  } catch (error) {
    next(error);
  }
};

// @desc    Vendor updates item status (Packed, Shiprocket AWB creation)
// @route   PUT /api/orders/:orderId/items/:sku/status
const updateVendorItemStatus = async (req, res, next) => {
  try {
    const { orderId, sku } = req.params;
    const { status, courierName } = req.body; // 'accepted', 'packed', 'shipped', 'delivered'

    const order = store.findById('orders', orderId);
    if (!order) {
      return sendError(res, 'Order not found', 404);
    }

    const item = order.items.find((i) => i.sku === sku);
    if (!item) {
      return sendError(res, 'Item SKU not found in this order', 404);
    }

    item.vendorStatus = status;

    if (status === 'packed' || status === 'shipped') {
      if (!item.shipment.awb) {
        const awbNumber = `SR${Math.floor(100000000 + Math.random() * 900000000)}IN`;
        item.shipment = {
          shiprocketOrderId: `SR-ORD-${Math.floor(10000 + Math.random() * 90000)}`,
          shiprocketShipmentId: `SR-SHP-${Math.floor(10000 + Math.random() * 90000)}`,
          awb: awbNumber,
          courierName: courierName || 'BlueDart Express',
          status: status === 'shipped' ? 'In Transit' : 'Manifested / Ready for Courier Pickup',
          trackingUrl: `https://shiprocket.co/tracking/${awbNumber}`,
          labelUrl: `https://cdn.example.com/labels/${awbNumber}.pdf`,
        };
      }
    }

    order.timeline.push({
      status: `Item ${item.name} (${status.toUpperCase()})`,
      timestamp: new Date().toISOString(),
      note: `Vendor updated fulfillment status to ${status}`,
    });

    store.findByIdAndUpdate('orders', orderId, {
      items: order.items,
      timeline: order.timeline,
      orderStatus: status === 'delivered' ? 'delivered' : 'processing',
    });

    return sendSuccess(res, order, `Item status updated to ${status}`);
  } catch (error) {
    next(error);
  }
};

// @desc    Cancel order & return items to stock
// @route   PUT /api/orders/:id/cancel
const cancelOrder = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { reason = 'Cancelled by customer' } = req.body;

    const order = store.findById('orders', id);
    if (!order) {
      return sendError(res, 'Order not found', 404);
    }

    if (['shipped', 'delivered', 'cancelled'].includes(order.orderStatus)) {
      return sendError(res, `Cannot cancel order in '${order.orderStatus}' state`, 400);
    }

    // Reverse stock deductions
    for (const item of order.items) {
      store.addStock(item.product, item.sku, item.quantity, {
        type: 'return_in',
        refType: 'Order',
        refId: order.orderNumber,
        user: req.user ? req.user.name : 'System',
        notes: `Restocked due to order cancellation: ${reason}`,
      });
    }

    order.orderStatus = 'cancelled';
    order.timeline.push({
      status: 'Order Cancelled',
      timestamp: new Date().toISOString(),
      note: reason,
    });

    const updated = store.findByIdAndUpdate('orders', id, {
      orderStatus: 'cancelled',
      timeline: order.timeline,
      paymentStatus: order.paymentStatus === 'paid' ? 'refunded' : order.paymentStatus,
    });

    return sendSuccess(res, updated, 'Order cancelled and stock restocked successfully');
  } catch (error) {
    next(error);
  }
};

// @desc    Get store suborders for Aaradhya Silks or Aaradhya Fabrics
// @route   GET /api/orders/store/:storeCode
const getStoreOrders = async (req, res, next) => {
  try {
    const { storeCode } = req.params;
    const storeCodeUpper = storeCode.toUpperCase();
    const allOrders = store.find('orders');

    // Extract suborders matching this store
    const storeSuborders = [];
    allOrders.forEach((ord) => {
      // Find store suborder
      const sub = (ord.suborders || []).find((s) => s.storeCode === storeCodeUpper);
      if (sub) {
        storeSuborders.push({
          ...sub,
          parentOrderId: ord._id,
          parentOrderNumber: ord.orderNumber,
          customerDetails: ord.customerDetails,
          shippingAddress: ord.shippingAddress,
          createdAt: ord.createdAt,
          paymentMethod: ord.paymentMethod,
          paymentStatus: ord.paymentStatus,
        });
      } else {
        // Fallback: items matching storeCode
        const matchedItems = (ord.items || []).filter((it) => it.storeCode === storeCodeUpper);
        if (matchedItems.length > 0) {
          const subtotal = matchedItems.reduce((acc, it) => acc + (it.price * it.quantity), 0);
          storeSuborders.push({
            suborderNumber: `${storeCodeUpper}-ORD-${String(ord.orderNumber).slice(-6)}`,
            storeCode: storeCodeUpper,
            storeName: storeCodeUpper === 'AF' ? 'Aaradhya Fabrics' : 'Aaradhya Silks',
            itemCount: matchedItems.length,
            subtotal,
            taxAmount: Math.round(subtotal * 0.05),
            totalAmount: Math.round(subtotal * 1.05),
            status: ord.orderStatus || 'confirmed',
            items: matchedItems,
            parentOrderId: ord._id,
            parentOrderNumber: ord.orderNumber,
            customerDetails: ord.customerDetails,
            shippingAddress: ord.shippingAddress,
            createdAt: ord.createdAt,
            paymentMethod: ord.paymentMethod,
            paymentStatus: ord.paymentStatus,
          });
        }
      }
    });

    return sendSuccess(res, storeSuborders.reverse());
  } catch (err) {
    next(err);
  }
};

// @desc    Update store suborder dispatch status
// @route   PUT /api/orders/suborders/:suborderNumber/status
const updateSuborderStatus = async (req, res, next) => {
  try {
    const { suborderNumber } = req.params;
    const { status, courier, trackingNumber } = req.body;

    const allOrders = store.find('orders');
    let targetOrder = null;
    let targetSuborder = null;

    for (const ord of allOrders) {
      const sub = (ord.suborders || []).find((s) => s.suborderNumber === suborderNumber);
      if (sub) {
        targetOrder = ord;
        targetSuborder = sub;
        break;
      }
    }

    if (!targetOrder || !targetSuborder) {
      return sendError(res, `Suborder ${suborderNumber} not found`, 404);
    }

    targetSuborder.status = status;
    if (courier) targetSuborder.courier = courier;
    if (trackingNumber) targetSuborder.trackingNumber = trackingNumber;

    // Automatic Shiprocket Integration when order is packed or shipped
    if ((status === 'shipped' || status === 'packed') && !targetSuborder.trackingNumber) {
      try {
        const srResult = await shiprocketService.createOrder({
          orderNumber: suborderNumber,
          customer: {
            name: targetOrder.customerName || 'Customer',
            email: targetOrder.customerEmail || 'customer@aaradhya.com',
            phone: targetOrder.customerPhone || targetOrder.shippingAddress?.phone || '9876543210',
          },
          shippingAddress: targetOrder.shippingAddress || {},
          items: targetSuborder.items || [],
          paymentMethod: targetOrder.paymentMethod || 'Prepaid',
          subtotal: targetSuborder.totalAmount || 0,
        });

        targetSuborder.courier = srResult.courierName || 'BlueDart Express via Shiprocket';
        targetSuborder.trackingNumber = srResult.awb || `SR${Math.floor(100000000 + Math.random() * 900000000)}IN`;
        targetSuborder.shiprocketOrderId = srResult.shiprocketOrderId;
        targetSuborder.shiprocketShipmentId = srResult.shiprocketShipmentId;
        targetSuborder.labelUrl = srResult.labelUrl;
        targetSuborder.trackingUrl = srResult.trackingUrl;
      } catch (srErr) {
        console.warn('Shiprocket auto-creation notice:', srErr.message);
      }
    }

    // If delivered, credit the store wallet from pendingSettlement to balance
    if (status === 'delivered') {
      const wallet = store.findOne('wallets', { storeCode: targetSuborder.storeCode });
      if (wallet) {
        const amt = targetSuborder.totalAmount || 0;
        store.findByIdAndUpdate('wallets', wallet._id, {
          balance: (wallet.balance || 0) + amt,
          pendingSettlement: Math.max(0, (wallet.pendingSettlement || 0) - amt),
        });
        store.create('walletTransactions', {
          storeId: wallet.storeId,
          storeCode: targetSuborder.storeCode,
          type: 'order_credit',
          amount: amt,
          previousBalance: wallet.balance || 0,
          newBalance: (wallet.balance || 0) + amt,
          referenceId: suborderNumber,
          description: `Settlement payout for suborder ${suborderNumber}`,
          status: 'settled',
        });
      }
    }

    targetOrder.timeline = targetOrder.timeline || [];
    targetOrder.timeline.push({
      status: `Suborder ${suborderNumber} (${status.toUpperCase()})`,
      timestamp: new Date().toISOString(),
      note: `Store updated dispatch status to ${status}`,
    });

    store.findByIdAndUpdate('orders', targetOrder._id, {
      suborders: targetOrder.suborders,
      timeline: targetOrder.timeline,
    });

    return sendSuccess(res, targetSuborder, `Suborder status updated to ${status}`);
  } catch (err) {
    next(err);
  }
};

module.exports = {
  createOrder,
  getMyOrders,
  getOrderById,
  getVendorOrders,
  updateVendorItemStatus,
  cancelOrder,
  getStoreOrders,
  updateSuborderStatus,
};

