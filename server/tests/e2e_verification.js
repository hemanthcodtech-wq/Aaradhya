const axios = require('axios');

const BASE_URL = 'http://localhost:5000/api';

async function runVerification() {
  console.log('====================================================');
  console.log('🧪 RUNNING COMPREHENSIVE MULTI-VENDOR PLATFORM TESTS');
  console.log('====================================================\n');

  let passed = 0;
  let failed = 0;

  const test = async (name, fn) => {
    try {
      await fn();
      console.log(`✅ [PASS] ${name}`);
      passed++;
    } catch (err) {
      console.error(`❌ [FAIL] ${name}: ${err.message}`);
      if (err.response?.data) {
        console.error('   API Response Error:', err.response.data);
      }
      failed++;
    }
  };

  let customerToken = '';
  let vendorToken = '';
  let adminToken = '';
  let testProductId = '';
  let testProductBarcode = '';
  let testProductSku = '';
  let initialStock = 0;

  // 1. Healthcheck
  await test('API Healthcheck & Status', async () => {
    const res = await axios.get(`${BASE_URL}/health`);
    if (res.data.status !== 'healthy') throw new Error('Status not healthy');
  });

  // 2. Authentication - Customer Login
  await test('Customer Authentication (JWT Login)', async () => {
    const res = await axios.post(`${BASE_URL}/auth/login`, {
      email: 'customer@example.com',
      password: 'customer123',
    });
    if (!res.data.success || !res.data.data.token) throw new Error('Token not returned');
    customerToken = res.data.data.token;
  });

  // 3. Authentication - Vendor Login
  await test('Vendor Authentication (TechNova Merchant)', async () => {
    const res = await axios.post(`${BASE_URL}/auth/login`, {
      email: 'vendor@technova.com',
      password: 'vendor123',
    });
    if (!res.data.success || !res.data.data.token) throw new Error('Vendor token not returned');
    vendorToken = res.data.data.token;
  });

  // 4. Authentication - Super Admin Login
  await test('Super Admin Authentication', async () => {
    const res = await axios.post(`${BASE_URL}/auth/login`, {
      email: 'admin@shopmart.com',
      password: 'admin123',
    });
    if (!res.data.success || !res.data.data.token) throw new Error('Admin token not returned');
    adminToken = res.data.data.token;
  });

  // 5. Products Catalog & Filtering
  await test('Storefront Products Catalog & Filters', async () => {
    const res = await axios.get(`${BASE_URL}/products?sortBy=newest&limit=6`);
    if (!res.data.success || !Array.isArray(res.data.data) || res.data.data.length === 0) {
      throw new Error('Products array empty');
    }
    const sample = res.data.data[0];
    testProductId = sample._id;
    testProductBarcode = sample.barcode;
    testProductSku = sample.sku;
    initialStock = sample.stock;
  });

  // 6. Homepage Highlights
  await test('Storefront Homepage Highlights (Banners, Flash Deals, Categories)', async () => {
    const res = await axios.get(`${BASE_URL}/products/home/highlights`);
    if (!res.data.success || !res.data.data.flashDeals || !res.data.data.categories) {
      throw new Error('Incomplete highlights structure');
    }
  });

  // 7. Pincode Serviceability (Shiprocket integration)
  await test('Shiprocket Pincode Serviceability Check', async () => {
    const res = await axios.get(`${BASE_URL}/shipping/check-pincode/201309`);
    if (!res.data.success || !res.data.data.isServiceable) {
      throw new Error('Pincode serviceability check failed');
    }
  });

  // 8. Order Placement & Stock Deduction Concurrency
  let placedOrderNumber = '';
  let placedOrderId = '';
  await test('Customer Checkout & Multi-Vendor Order Creation', async () => {
    const res = await axios.post(
      `${BASE_URL}/orders`,
      {
        items: [
          {
            product: testProductId,
            sku: testProductSku,
            name: 'Test Product',
            quantity: 1,
            price: 1999,
            vendor: 'ven_technova_001',
          },
        ],
        shippingAddress: {
          fullName: 'Rahul Sharma',
          phone: '+91 98765 43210',
          addressLine1: 'B-202, Maple Residency',
          city: 'Noida',
          state: 'Uttar Pradesh',
          pincode: '201309',
        },
        paymentMethod: 'razorpay',
        couponCode: 'WELCOME10',
      },
      { headers: { Authorization: `Bearer ${customerToken}` } }
    );

    if (!res.data.success || !res.data.data.orderNumber) {
      throw new Error('Order creation failed');
    }
    placedOrderNumber = res.data.data.orderNumber;
    placedOrderId = res.data.data._id;
  });

  // 9. Vendor Order Fulfillment & Shiprocket AWB Generation
  await test('Vendor Fulfillment: Pack Item & Auto-Generate Shiprocket AWB', async () => {
    const res = await axios.put(
      `${BASE_URL}/orders/${placedOrderId}/items/${testProductSku}/status`,
      {
        status: 'packed',
        courierName: 'BlueDart Express',
      },
      { headers: { Authorization: `Bearer ${vendorToken}` } }
    );

    if (!res.data.success) throw new Error('Vendor item status update failed');
    const updatedItem = res.data.data.items.find((i) => i.sku === testProductSku);
    if (!updatedItem.shipment?.awb) {
      throw new Error('Shiprocket AWB was not generated');
    }
  });

  // 10. POS Barcode Scan Lookup
  await test('POS Counter: Scan Barcode Input', async () => {
    const res = await axios.get(`${BASE_URL}/pos/scan/${testProductBarcode}`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    if (!res.data.success || res.data.data.sku !== testProductSku) {
      throw new Error('Barcode scan failed to identify correct product');
    }
  });

  // 11. POS Bill Generation with GST & Inventory Deduction
  await test('POS Counter: Generate Sale Bill & Atomic Inventory Sync', async () => {
    const res = await axios.post(
      `${BASE_URL}/pos/bills`,
      {
        items: [
          {
            product: testProductId,
            sku: testProductSku,
            name: 'Scanned Item',
            price: 1999,
            quantity: 1,
            gstRate: 18,
          },
        ],
        paymentMode: 'Cash',
        paymentDetails: { cashTendered: 2500, changeReturned: 141.18 },
      },
      { headers: { Authorization: `Bearer ${adminToken}` } }
    );

    if (!res.data.success || !res.data.data.billNumber) {
      throw new Error('POS Bill generation failed');
    }
  });

  // 12. Verify Stock Ledger Updated Twice (1 online sale + 1 POS sale)
  await test('Real-Time Inventory Ledger Verification (Online + POS Deduction)', async () => {
    const res = await axios.get(`${BASE_URL}/inventory?search=${testProductSku}`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    if (!res.data.success || res.data.data.length === 0) {
      throw new Error('Inventory fetch failed');
    }
    const currentStock = res.data.data[0].stock;
    const expectedStock = initialStock - 2;
    if (currentStock !== expectedStock) {
      throw new Error(`Stock mismatch! Expected ${expectedStock}, got ${currentStock}`);
    }
  });

  // 13. Super Admin Analytics
  await test('Super Admin Platform Analytics (Sales, Orders, Donut Chart)', async () => {
    const res = await axios.get(`${BASE_URL}/admin/analytics`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    if (!res.data.success || !res.data.data.statusDonutData || !res.data.data.totalSales) {
      throw new Error('Admin analytics incomplete');
    }
  });

  // 14. Vendor Payout Request
  await test('Vendor Earnings & Payout Settlement Request', async () => {
    const res = await axios.post(
      `${BASE_URL}/vendor/payouts/request`,
      { amount: 5000 },
      { headers: { Authorization: `Bearer ${vendorToken}` } }
    );
    if (!res.data.success || !res.data.data.payoutNumber) {
      throw new Error('Payout request failed');
    }
  });

  console.log('\n====================================================');
  console.log(`📊 TEST SUMMARY: ${passed} Passed, ${failed} Failed`);
  console.log('====================================================');

  if (failed > 0) {
    process.exit(1);
  }
}

runVerification();

