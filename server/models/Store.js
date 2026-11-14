const mongoose = require('mongoose');

const StoreSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    code: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
    },
    prefix: {
      type: String,
      required: true,
      uppercase: true,
      default: 'AS',
    },
    currentCounter: {
      type: Number,
      default: 1,
    },
    orderCounter: {
      type: Number,
      default: 1,
    },
    description: {
      type: String,
      trim: true,
    },
    logo: {
      type: String,
      default: '/logo.jpeg',
    },
    banner: {
      type: String,
      default: '',
    },
    phone: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
    },
    address: {
      street: String,
      city: String,
      state: String,
      pincode: String,
      country: { type: String, default: 'India' },
    },
    gstin: {
      type: String,
      default: '',
    },
    walletBalance: {
      type: Number,
      default: 0,
    },
    pendingSettlement: {
      type: Number,
      default: 0,
    },
    totalRevenue: {
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

module.exports = mongoose.models.Store || mongoose.model('Store', StoreSchema);
