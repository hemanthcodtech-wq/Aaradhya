const mongoose = require('mongoose');

const WalletSchema = new mongoose.Schema(
  {
    storeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Store',
      required: true,
      unique: true,
    },
    storeCode: {
      type: String,
      enum: ['AS', 'AF'],
      required: true,
    },
    storeName: {
      type: String,
      required: true,
    },
    balance: {
      type: Number,
      default: 0,
    },
    pendingSettlement: {
      type: Number,
      default: 0,
    },
    totalEarned: {
      type: Number,
      default: 0,
    },
    totalWithdrawn: {
      type: Number,
      default: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.models.Wallet || mongoose.model('Wallet', WalletSchema);
