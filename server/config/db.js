const mongoose = require('mongoose');

let isConnected = false;

const connectDB = async () => {
  try {
    const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/multivendor';
    const conn = await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 3000,
    });
    isConnected = true;
    console.log(`[Database] MongoDB Connected successfully to: ${conn.connection.host}`);
    return true;
  } catch (error) {
    console.warn(`[Database] Notice: MongoDB not reachable at ${process.env.MONGO_URI || '127.0.0.1:27017'}.`);
    console.log(`[Database] Activating integrated persistent storage engine fallback with full CRUD, indexing, and seed data.`);
    isConnected = false;
    return false;
  }
};

const getStatus = () => isConnected;

module.exports = { connectDB, getStatus };

