const mongoose = require('mongoose');

const stockMovementSchema = new mongoose.Schema(
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
    productName: {
      type: String,
      default: '',
    },
    movementType: {
      type: String,
      enum: ['purchase_in', 'online_sale', 'pos_sale', 'return_in', 'manual_adjustment', 'damaged'],
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
    },
    previousStock: {
      type: Number,
      required: true,
    },
    newStock: {
      type: Number,
      required: true,
    },
    referenceType: {
      type: String,
      enum: ['Order', 'POSBill', 'Purchase', 'Adjustment', 'Return'],
      default: 'Adjustment',
    },
    referenceId: {
      type: String,
      default: '',
    },
    performedBy: {
      type: String,
      default: 'System',
    },
    notes: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.models.StockMovement || mongoose.model('StockMovement', stockMovementSchema);

