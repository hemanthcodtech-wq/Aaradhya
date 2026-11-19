const mongoose = require('mongoose');
const dotenv = require('dotenv');
const fs = require('fs');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '.env') });

const STORE_FILE = path.join(__dirname, 'data', 'store.json');

async function syncAllToMongoDB() {
  try {
    console.log('Connecting to MongoDB Atlas...');
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB Atlas successfully!\n');

    const rawData = JSON.parse(fs.readFileSync(STORE_FILE, 'utf8'));
    const db = mongoose.connection.db;

    const collectionMapping = {
      stores: 'stores',
      categories: 'categories',
      brands: 'brands',
      vendors: 'vendors',
      products: 'products',
      users: 'users',
      orders: 'orders',
      posBills: 'posbills',
      wallets: 'wallets',
      walletTransactions: 'wallettransactions',
      stockMovements: 'stockmovements',
      coupons: 'coupons',
      banners: 'banners',
    };

    for (const [storeKey, mongoCollection] of Object.entries(collectionMapping)) {
      const items = rawData[storeKey] || [];
      if (items.length === 0) continue;

      const col = db.collection(mongoCollection);

      for (const item of items) {
        const { _id, ...fields } = item;
        if (mongoCollection === 'users' && item.email) {
          await col.updateOne(
            { email: item.email.toLowerCase() },
            { $set: fields },
            { upsert: true }
          );
        } else if (_id) {
          await col.updateOne(
            { _id },
            { $set: fields },
            { upsert: true }
          );
        }
      }

      const totalInMongo = await col.countDocuments();
      console.log(`✅ [${mongoCollection}] Synced ${items.length} records. Total in MongoDB: ${totalInMongo}`);
    }

    console.log('\n--- Final MongoDB Collection Summary ---');
    const allCollections = await db.listCollections().toArray();
    for (const c of allCollections) {
      const count = await db.collection(c.name).countDocuments();
      console.log(` • ${c.name}: ${count} documents`);
    }

    console.log('\n🎉 ALL data successfully synchronized to MongoDB Atlas!');
  } catch (error) {
    console.error('❌ Sync error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected cleanly from MongoDB Atlas.');
  }
}

syncAllToMongoDB();
