const express = require('express');
const path = require('path');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const dotenv = require('dotenv');
const { connectDB } = require('./config/db');
const { notFound, errorHandler } = require('./middleware/errorMiddleware');

// Load environment configuration
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Security & utility middleware
app.use(helmet({
  crossOriginResourcePolicy: false,
}));
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use(express.json({ limit: '15mb' }));
app.use(express.urlencoded({ extended: true, limit: '15mb' }));

if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('dev'));
}

// Serve static uploads
app.use(express.static(path.join(__dirname, 'public')));

// Root API Status Endpoint (for Render root checks and browser visits)
app.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    service: 'AARADHYA Fashion & Fabrics Core API',
    status: 'online',
    timestamp: new Date().toISOString(),
    healthCheck: '/api/health',
    stores: ['Aaradhya Silks (AS)', 'Aaradhya Fabrics (AF)'],
  });
});

// System Health Check
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'AARADHYA Two-Store Fashion & Fabrics Core API',
    version: '2.0.0',
    stores: ['Aaradhya Silks (AS)', 'Aaradhya Fabrics (AF)'],
  });
});

// Route Handlers
app.use('/api/stores', require('./routes/storeRoutes'));
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/products', require('./routes/productRoutes'));
app.use('/api/categories', require('./routes/categoryRoutes'));
app.use('/api/banners', require('./routes/bannerRoutes'));
app.use('/api/gallery', require('./routes/galleryRoutes'));
app.use('/api/upload', require('./routes/uploadRoutes'));
app.use('/api/orders', require('./routes/orderRoutes'));
app.use('/api/pos', require('./routes/posRoutes'));
app.use('/api/inventory', require('./routes/inventoryRoutes'));
app.use('/api/vendor', require('./routes/vendorRoutes'));
app.use('/api/admin', require('./routes/adminRoutes'));
app.use('/api/payments', require('./routes/paymentRoutes'));
app.use('/api/shipping', require('./routes/shippingRoutes'));

// 404 & Centralized Error Handler
app.use(notFound);
app.use(errorHandler);

// Connect DB and Start Server
const startServer = async () => {
  await connectDB();
  const server = app.listen(PORT, () => {
    console.log(`====================================================`);
    console.log(`🚀 Multi-Vendor Backend API running on port ${PORT}`);
    console.log(`📍 Health Check: http://localhost:${PORT}/api/health`);
    console.log(`✨ Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`====================================================`);
  });
  return server;
};

if (process.env.NODE_ENV !== 'test') {
  startServer();
}

module.exports = { app, startServer };

