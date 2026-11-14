const mongoose = require('mongoose');

const WalletTransactionSchema = new mongoose.Schema(
  {
    storeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Store',
      required: true,
    },
    storeCode: {
      type: String,
      enum: ['AS', 'AF'],
      required: true,
    },
    type: {
      type: String,
      enum: ['order_credit', 'pos_sale', 'payout', 'refund_debit', 'adjustment'],
      required: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    previousBalance: {
      type: Number,
      required: true,
    },
    newBalance: {
      type: Number,
      required: true,
    },
    referenceId: {
      type: String,
      default: '',
    },
    description: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ['settled', 'pending', 'cancelled'],
      default: 'settled',
    },
  },
  { timestamps: true }
);

module.exports = mongoose.models.WalletTransaction || mongoose.model('WalletTransaction', WalletTransactionSchema);
