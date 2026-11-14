const fs = require('fs');
const path = require('path');
const { getStatus } = require('../config/db');
const { getInitialSeedData } = require('./seedData');

// Models
const Store = require('../models/Store');
const User = require('../models/User');
const Vendor = require('../models/Vendor');
const Category = require('../models/Category');
const Brand = require('../models/Brand');
const Product = require('../models/Product');
const Order = require('../models/Order');
const POSBill = require('../models/POSBill');
const StockMovement = require('../models/StockMovement');
const Coupon = require('../models/Coupon');
const Banner = require('../models/Banner');
const Wallet = require('../models/Wallet');
const WalletTransaction = require('../models/WalletTransaction');

const DATA_DIR = path.join(__dirname, '../data');
const STORE_FILE = path.join(DATA_DIR, 'store.json');

class DataStore {
  constructor() {
    this.memoryData = null;
    this.initStore();
  }

  initStore() {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }

      if (fs.existsSync(STORE_FILE)) {
        const fileContent = fs.readFileSync(STORE_FILE, 'utf8');
        this.memoryData = JSON.parse(fileContent);
      } else {
        this.memoryData = getInitialSeedData();
        this.saveToFile();
      }
    } catch (err) {
      console.warn('[DataStore] Notice: fallback data initialized in memory.');
      this.memoryData = getInitialSeedData();
    }
  }

  saveToFile() {
    try {
      fs.writeFileSync(STORE_FILE, JSON.stringify(this.memoryData, null, 2), 'utf8');
    } catch (err) {
      console.error('[DataStore] Failed to persist data to store.json', err.message);
    }
  }

  resetToInitial() {
    this.memoryData = getInitialSeedData();
    this.saveToFile();
    return this.memoryData;
  }

  getCollection(name) {
    if (!this.memoryData[name]) {
      this.memoryData[name] = [];
    }
    return this.memoryData[name];
  }

  find(collectionName, filter = {}) {
    const list = this.getCollection(collectionName);
    return list.filter((item) => {
      for (const [key, value] of Object.entries(filter)) {
        if (value === undefined) continue;
        if (typeof value === 'object' && value !== null) {
          if (value.$ne !== undefined && item[key] === value.$ne) return false;
          if (value.$in !== undefined && !value.$in.includes(item[key])) return false;
          if (value.$regex !== undefined) {
            const regex = new RegExp(value.$regex, value.$options || 'i');
            if (!regex.test(item[key] || '')) return false;
          }
          if (value.$gte !== undefined && item[key] < value.$gte) return false;
          if (value.$lte !== undefined && item[key] > value.$lte) return false;
        } else if (item[key] !== value) {
          return false;
        }
      }
      return true;
    });
  }

  findOne(collectionName, filter = {}) {
    const results = this.find(collectionName, filter);
    return results.length > 0 ? results[0] : null;
  }

  findById(collectionName, id) {
    const list = this.getCollection(collectionName);
    return list.find((item) => item._id === id || String(item._id) === String(id)) || null;
  }

  create(collectionName, data) {
    const list = this.getCollection(collectionName);
    const newItem = {
      ...data,
      _id: data._id || `${collectionName.slice(0, 3)}_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      createdAt: data.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    list.unshift(newItem);
    this.saveToFile();
    return newItem;
  }

  findByIdAndUpdate(collectionName, id, updates) {
    const list = this.getCollection(collectionName);
    const index = list.findIndex((item) => item._id === id || String(item._id) === String(id));
    if (index === -1) return null;

    const existing = list[index];
    const updated = {
      ...existing,
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    list[index] = updated;
    this.saveToFile();
    return updated;
  }

  findByIdAndDelete(collectionName, id) {
    const list = this.getCollection(collectionName);
    const index = list.findIndex((item) => item._id === id || String(item._id) === String(id));
    if (index === -1) return null;

    const deleted = list.splice(index, 1)[0];
    this.saveToFile();
    return deleted;
  }

  delete(collectionName, id) {
    return this.findByIdAndDelete(collectionName, id);
  }

  // Populate helper to enrich products with store, category, brand objects
  populateProduct(product) {
    if (!product) return null;
    const enriched = { ...product };
    if (typeof enriched.category === 'string') {
      enriched.category = this.findById('categories', enriched.category) || enriched.category;
    }
    if (enriched.storeId) {
      enriched.store = this.findById('stores', enriched.storeId) || { name: enriched.storeName, code: enriched.storeCode };
    } else if (enriched.storeCode) {
      enriched.store = this.findOne('stores', { code: enriched.storeCode }) || { name: enriched.storeName, code: enriched.storeCode };
    }
    if (typeof enriched.vendor === 'string') {
      enriched.vendor = this.findById('vendors', enriched.vendor) || enriched.vendor;
    }
    if (typeof enriched.brand === 'string') {
      enriched.brand = this.findById('brands', enriched.brand) || enriched.brand;
    }
    return enriched;
  }

  // Atomic Store Product ID counter: AS-000001 or AF-000001
  getNextProductId(storeCode = 'AS') {
    const code = (storeCode || 'AS').toUpperCase();
    const store = this.findOne('stores', { code });
    if (!store) {
      return `${code}-000001`;
    }
    const currentCounter = store.currentCounter || 1;
    const formattedId = `${store.prefix || code}-${String(currentCounter).padStart(6, '0')}`;
    this.findByIdAndUpdate('stores', store._id, { currentCounter: currentCounter + 1 });
    return formattedId;
  }

  // Atomic Store Suborder counter: AS-ORD-000001 or AF-ORD-000001
  getNextSuborderNumber(storeCode = 'AS') {
    const code = (storeCode || 'AS').toUpperCase();
    const store = this.findOne('stores', { code });
    const orderCounter = store && store.orderCounter ? store.orderCounter : 1;
    const suborderNum = `${code}-ORD-${String(orderCounter).padStart(6, '0')}`;
    if (store) {
      this.findByIdAndUpdate('stores', store._id, { orderCounter: orderCounter + 1 });
    }
    return suborderNum;
  }

  // Concurrency-safe atomic stock decrement
  deductStock(productId, sku, quantity, context = { type: 'online_sale', refId: '', user: 'System' }) {
    const product = this.findById('products', productId);
    if (!product) {
      throw new Error(`Product ${productId} not found`);
    }

    if (product.stock < quantity) {
      throw new Error(`Insufficient stock for ${product.name}. Available: ${product.stock}, Requested: ${quantity}`);
    }

    const previousStock = product.stock;
    const newStock = previousStock - quantity;

    // Update main product stock
    this.findByIdAndUpdate('products', productId, { stock: newStock });

    // Record audit stock movement
    this.create('stockMovements', {
      product: productId,
      sku: sku || product.sku,
      productName: product.name,
      movementType: context.type,
      quantity: -quantity,
      previousStock,
      newStock,
      referenceType: context.refType || 'Order',
      referenceId: context.refId || '',
      performedBy: context.user || 'System',
      notes: context.notes || `Stock deducted via ${context.type}`,
    });

    return { success: true, previousStock, newStock };
  }

  // Stock In / Addition (for POS and inventory purchase entries)
  addStock(productId, sku, quantity, context = { type: 'purchase_in', refId: '', user: 'Store Staff' }) {
    const product = this.findById('products', productId);
    if (!product) {
      throw new Error(`Product ${productId} not found`);
    }

    const previousStock = product.stock;
    const newStock = previousStock + Number(quantity);

    this.findByIdAndUpdate('products', productId, { stock: newStock });

    this.create('stockMovements', {
      product: productId,
      sku: sku || product.sku,
      productName: product.name,
      movementType: context.type,
      quantity: Number(quantity),
      previousStock,
      newStock,
      referenceType: context.refType || 'Purchase',
      referenceId: context.refId || '',
      performedBy: context.user || 'Store Manager',
      notes: context.notes || `Stock added via ${context.type}`,
    });

    return { success: true, previousStock, newStock };
  }
}

const store = new DataStore();

module.exports = {
  store,
  models: {
    User,
    Vendor,
    Category,
    Brand,
    Product,
    Order,
    POSBill,
    StockMovement,
    Coupon,
    Banner,
  },
};

