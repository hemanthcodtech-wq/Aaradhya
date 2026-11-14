const mongoose = require('mongoose');

const productVariantSchema = new mongoose.Schema({
  name: { type: String, required: true },
  sku: { type: String, required: true },
  barcode: { type: String, default: '' },
  price: { type: Number, required: true },
  mrp: { type: Number, default: 0 },
  stock: { type: Number, default: 0 },
  image: { type: String, default: '' },
  attributes: {
    color: String,
    size: String,
    storage: String,
    ram: String,
  },
});

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide product name'],
      trim: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },
    shortDescription: {
      type: String,
      default: '',
    },
    description: {
      type: String,
      default: '',
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      required: true,
    },
    brand: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Brand',
      required: false,
    },
    vendor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Vendor',
      required: false,
    },
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
    productId: {
      type: String,
      required: false,
      trim: true,
      index: true,
    },
    sizes: {
      type: [String],
      default: ['S', 'M', 'L', 'XL'],
    },
    colors: {
      type: [String],
      default: [],
    },
    fabricType: {
      type: String,
      default: '',
    },
    hsnCode: {
      type: String,
      default: '5007',
    },
    price: {
      type: Number,
      required: [true, 'Please provide selling price'],
    },
    mrp: {
      type: Number,
      required: [true, 'Please provide MRP / base price'],
    },
    discountPercent: {
      type: Number,
      default: 0,
    },
    sku: {
      type: String,
      required: [true, 'Please provide SKU'],
      unique: true,
      trim: true,
    },
    barcode: {
      type: String,
      default: '',
      trim: true,
    },
    stock: {
      type: Number,
      required: true,
      default: 0,
    },
    lowStockThreshold: {
      type: Number,
      default: 5,
    },
    images: [
      {
        type: String,
      },
    ],
    variants: [productVariantSchema],
    specifications: [
      {
        title: String,
        value: String,
      },
    ],
    tags: [String],
    rating: {
      type: Number,
      default: 4.5,
    },
    reviewCount: {
      type: Number,
      default: 0,
    },
    approvalStatus: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'approved',
    },
    rejectionReason: {
      type: String,
      default: '',
    },
    isFeatured: {
      type: Boolean,
      default: false,
    },
    isFlashDeal: {
      type: Boolean,
      default: false,
    },
    flashDealEndsAt: {
      type: Date,
      default: null,
    },
    isBestSeller: {
      type: Boolean,
      default: false,
    },
    isNewArrival: {
      type: Boolean,
      default: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    gstRate: {
      type: Number,
      default: 18,
    },
    weightGrams: {
      type: Number,
      default: 500,
    },
  },
  {
    timestamps: true,
  }
);

productSchema.index({ name: 'text', description: 'text', sku: 'text', barcode: 'text' });

module.exports = mongoose.models.Product || mongoose.model('Product', productSchema);

