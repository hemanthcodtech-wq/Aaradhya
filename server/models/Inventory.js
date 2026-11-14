const mongoose = require('mongoose');

const inventorySchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true,
    },
    sku: {
      type: String,
      required: true,
    },
    barcode: {
      type: String,
      default: '',
    },
    location: {
      type: String,
      default: 'Central Warehouse / Store #01',
    },
    availableStock: {
      type: Number,
      required: true,
      default: 0,
      min: 0,
    },
    reservedStock: {
      type: Number,
      default: 0,
      min: 0,
    },
    lowStockThreshold: {
      type: Number,
      default: 5,
    },
    version: {
      type: Number,
      default: 1, // Concurrency control token
    },
  },
  {
    timestamps: true,
  }
);

inventorySchema.index({ sku: 1, location: 1 }, { unique: true });

module.exports = mongoose.models.Inventory || mongoose.model('Inventory', inventorySchema);

