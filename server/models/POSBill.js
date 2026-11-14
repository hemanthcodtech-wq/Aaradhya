const mongoose = require('mongoose');

const posBillItemSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true,
  },
  name: { type: String, required: true },
  sku: { type: String, required: true },
  barcode: { type: String, default: '' },
  variantName: { type: String, default: '' },
  price: { type: Number, required: true },
  mrp: { type: Number, default: 0 },
  quantity: { type: Number, required: true, default: 1 },
  gstRate: { type: Number, default: 18 },
  taxAmount: { type: Number, default: 0 },
  total: { type: Number, required: true },
});

const posBillSchema = new mongoose.Schema(
  {
    billNumber: {
      type: String,
      required: true,
      unique: true,
    },
    storeId: {
      type: String,
      default: 'STORE-01',
    },
    storeName: {
      type: String,
      default: 'ShopMart Flagship Store',
    },
    cashier: {
      id: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      name: { type: String, default: 'Cashier Staff' },
    },
    customer: {
      name: { type: String, default: 'Walk-in Customer' },
      phone: { type: String, default: '' },
      email: { type: String, default: '' },
    },
    items: [posBillItemSchema],
    subtotal: {
      type: Number,
      required: true,
    },
    taxAmount: {
      type: Number,
      default: 0,
    },
    discountAmount: {
      type: Number,
      default: 0,
    },
    totalPayable: {
      type: Number,
      required: true,
    },
    paymentMode: {
      type: String,
      enum: ['Cash', 'Card', 'UPI', 'Split'],
      default: 'Cash',
    },
    paymentDetails: {
      cashTendered: { type: Number, default: 0 },
      changeReturned: { type: Number, default: 0 },
      upiRef: { type: String, default: '' },
      cardLast4: { type: String, default: '' },
    },
    status: {
      type: String,
      enum: ['Completed', 'Held', 'Cancelled', 'Refunded'],
      default: 'Completed',
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.models.POSBill || mongoose.model('POSBill', posBillSchema);

