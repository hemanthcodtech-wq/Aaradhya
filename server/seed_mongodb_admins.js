const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');
const path = require('path');
const fs = require('fs');

dotenv.config({ path: path.join(__dirname, '.env') });

const User = require('./models/User');

const seedAdmins = async () => {
  try {
    const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/multivendor';
    console.log('Connecting to MongoDB...');
    await mongoose.connect(mongoUri, { serverSelectionTimeoutMS: 5000 });
    console.log('MongoDB connected successfully!');

    const adminAccounts = [
      {
        name: 'Aaradhya Super Admin',
        email: 'admin@aaradhya.com',
        password: 'admin123',
        role: 'super_admin',
        storeCode: null,
        permissions: ['all'],
        isActive: true,
        isVerified: true,
        phone: '+91 98765 00001',
      },
      {
        name: 'Aaradhya Silks Admin',
        email: 'silks@aaradhya.com',
        password: 'silks123',
        role: 'silks_admin',
        storeCode: 'AS',
        permissions: ['store:silks', 'products:manage', 'orders:manage', 'inventory:manage'],
        isActive: true,
        isVerified: true,
        phone: '+91 98765 00002',
      },
      {
        name: 'Aaradhya Fabrics Admin',
        email: 'fabrics@aaradhya.com',
        password: 'fabrics123',
        role: 'fabrics_admin',
        storeCode: 'AF',
        permissions: ['store:fabrics', 'products:manage', 'orders:manage', 'inventory:manage'],
        isActive: true,
        isVerified: true,
        phone: '+91 98765 00003',
      },
      {
        name: 'Super Admin (ShopMart)',
        email: 'admin@shopmart.com',
        password: 'admin123',
        role: 'super_admin',
        storeCode: null,
        permissions: ['all'],
        isActive: true,
        isVerified: true,
        phone: '+91 98765 00000',
      },
    ];

    for (const acc of adminAccounts) {
      const existing = await User.findOne({ email: acc.email });
      if (existing) {
        existing.name = acc.name;
        existing.password = acc.password;
        existing.role = acc.role;
        existing.storeCode = acc.storeCode;
        existing.permissions = acc.permissions;
        existing.isActive = true;
        existing.isVerified = true;
        await existing.save();
        console.log(`[MongoDB] Updated user: ${acc.email} (${acc.role})`);
      } else {
        await User.create(acc);
        console.log(`[MongoDB] Created user: ${acc.email} (${acc.role})`);
      }
    }

    const allUsers = await User.find({}, 'name email role storeCode permissions');
    console.log('\n--- All MongoDB Users ---');
    allUsers.forEach(u => console.log(`• ${u.name} | ${u.email} | Role: ${u.role} | Store: ${u.storeCode || 'N/A'}`));

    // Also update server/data/store.json to keep in sync
    const storePath = path.join(__dirname, 'data', 'store.json');
    if (fs.existsSync(storePath)) {
      const storeData = JSON.parse(fs.readFileSync(storePath, 'utf8'));
      if (!storeData.users) storeData.users = [];

      for (const acc of adminAccounts) {
        const hash = bcrypt.hashSync(acc.password, 10);
        const uIdx = storeData.users.findIndex(u => u.email.toLowerCase() === acc.email.toLowerCase());
        const userObj = {
          _id: uIdx >= 0 ? storeData.users[uIdx]._id : `usr_${acc.role}_${Date.now()}`,
          name: acc.name,
          email: acc.email.toLowerCase(),
          password: hash,
          role: acc.role,
          storeCode: acc.storeCode,
          permissions: acc.permissions,
          isActive: true,
          isVerified: true,
          phone: acc.phone,
          addresses: [],
        };
        if (uIdx >= 0) {
          storeData.users[uIdx] = { ...storeData.users[uIdx], ...userObj };
        } else {
          storeData.users.push(userObj);
        }
      }
      fs.writeFileSync(storePath, JSON.stringify(storeData, null, 2), 'utf8');
      console.log('\n[DataStore] Synchronized server/data/store.json successfully.');
    }

    await mongoose.disconnect();
    console.log('MongoDB disconnected cleanly.');
  } catch (err) {
    console.error('Error seeding admin users:', err);
  }
};

seedAdmins();
