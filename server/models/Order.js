const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true,
  },
  variantId: {
    type: String,
    default: null,
  },
  name: { type: String, required: true },
  sku: { type: String, required: true },
  barcode: { type: String, default: '' },
  price: { type: Number, required: true },
  mrp: { type: Number, default: 0 },
  quantity: { type: Number, required: true, min: 1 },
  image: { type: String, default: '' },
  storeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Store',
    required: false,
  },
  storeCode: {
    type: String,
    enum: ['AS', 'AF'],
    default: 'AS',
  },
  storeName: {
    type: String,
    default: 'Aaradhya Silks',
  },
  suborderNumber: {
    type: String,
    default: '',
  },
  vendor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Vendor',
    required: false,
  },
  vendorStatus: {
    type: String,
    enum: ['pending', 'accepted', 'packed', 'shipped', 'delivered', 'cancelled'],
    default: 'pending',
  },
  commissionAmount: { type: Number, default: 0 },
  vendorEarning: { type: Number, default: 0 },
  shipment: {
    shiprocketOrderId: { type: String, default: '' },
    shiprocketShipmentId: { type: String, default: '' },
    awb: { type: String, default: '' },
    courierName: { type: String, default: 'Shiprocket Express' },
    status: { type: String, default: 'Pending Pickup' },
    trackingUrl: { type: String, default: '' },
    labelUrl: { type: String, default: '' },
  },
});

const orderSchema = new mongoose.Schema(
  {
    orderNumber: {
      type: String,
      required: true,
      unique: true,
    },
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    customerDetails: {
      name: String,
      email: String,
      phone: String,
    },
    shippingAddress: {
      fullName: String,
      phone: String,
      addressLine1: String,
      addressLine2: String,
      city: String,
      state: String,
      pincode: String,
      country: { type: String, default: 'India' },
    },
    items: [orderItemSchema],
    suborders: [
      {
        suborderNumber: { type: String, required: true },
        storeId: String,
        storeCode: { type: String, enum: ['AS', 'AF'] },
        storeName: String,
        itemCount: Number,
        subtotal: Number,
        taxAmount: Number,
        shippingFee: Number,
        totalAmount: Number,
        status: {
          type: String,
          enum: ['pending', 'accepted', 'packed', 'shipped', 'delivered', 'cancelled'],
          default: 'pending',
        },
        courier: { type: String, default: 'Shiprocket / Blue Dart' },
        trackingNumber: { type: String, default: '' },
        items: [orderItemSchema],
      },
    ],
    subtotal: {
      type: Number,
      required: true,
    },
    taxAmount: {
      type: Number,
      default: 0,
    },
    shippingFee: {
      type: Number,
      default: 0,
    },
    discountAmount: {
      type: Number,
      default: 0,
    },
    totalAmount: {
      type: Number,
      required: true,
    },
    couponCode: {
      type: String,
      default: '',
    },
    paymentMethod: {
      type: String,
      enum: ['razorpay', 'cod', 'pos_cash', 'pos_card', 'pos_upi'],
      default: 'razorpay',
    },
    paymentStatus: {
      type: String,
      enum: ['pending', 'paid', 'failed', 'refunded'],
      default: 'pending',
    },
    razorpayDetails: {
      orderId: String,
      paymentId: String,
      signature: String,
    },
    orderStatus: {
      type: String,
      enum: ['placed', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'returned'],
      default: 'placed',
    },
    timeline: [
      {
        status: String,
        timestamp: { type: Date, default: Date.now },
        note: String,
      },
    ],
    isPosOrder: {
      type: Boolean,
      default: false,
    },
    posBillId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'POSBill',
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.models.Order || mongoose.model('Order', orderSchema);

