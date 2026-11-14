import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

// Layouts
import StorefrontLayout from '../components/layouts/StorefrontLayout';
import VendorLayout from '../components/layouts/VendorLayout';
import PosLayout from '../components/layouts/PosLayout';
import AdminLayout from '../components/layouts/AdminLayout';
import StoreAdminLayout from '../components/layouts/StoreAdminLayout';

// Store Admin Pages
import StoreDashboard from '../pages/store/StoreDashboard';
import StoreAnalytics from '../pages/store/StoreAnalytics';
import StoreProducts from '../pages/store/StoreProducts';
import StoreCategories from '../pages/store/StoreCategories';
import StoreInventory from '../pages/store/StoreInventory';
import StoreBarcodes from '../pages/store/StoreBarcodes';
import StoreOrders from '../pages/store/StoreOrders';
import StorePos from '../pages/store/StorePos';
import StoreSales from '../pages/store/StoreSales';
import StoreReturns from '../pages/store/StoreReturns';
import StoreWallet from '../pages/store/StoreWallet';
import StorePayouts from '../pages/store/StorePayouts';
import StoreTransactions from '../pages/store/StoreTransactions';
import StoreCustomers from '../pages/store/StoreCustomers';
import StoreNotifications from '../pages/store/StoreNotifications';
import StoreReports from '../pages/store/StoreReports';
import StoreSettings from '../pages/store/StoreSettings';

// Storefront Pages
import HomePage from '../pages/storefront/HomePage';
import ProductListingPage from '../pages/storefront/ProductListingPage';
import ProductDetailPage from '../pages/storefront/ProductDetailPage';
import CartPage from '../pages/storefront/CartPage';
import WishlistPage from '../pages/storefront/WishlistPage';
import CheckoutPage from '../pages/storefront/CheckoutPage';
import OrderConfirmationPage from '../pages/storefront/OrderConfirmationPage';
import OrderTrackingPage from '../pages/storefront/OrderTrackingPage';
import MyOrdersPage from '../pages/storefront/MyOrdersPage';
import CustomerProfilePage from '../pages/storefront/CustomerProfilePage';
import VendorStorePage from '../pages/storefront/VendorStorePage';
import AboutPage from '../pages/storefront/AboutPage';
import ContactPage from '../pages/storefront/ContactPage';
import { PoliciesPage } from '../pages/storefront/StaticPages';

// Auth Pages
import LoginPage from '../pages/auth/LoginPage';
import AdminLoginPage from '../pages/auth/AdminLoginPage';
import ForgotPasswordPage from '../pages/auth/ForgotPasswordPage';
import ResetPasswordPage from '../pages/auth/ResetPasswordPage';
import RegisterPage from '../pages/auth/RegisterPage';
import AuthGuard from '../components/auth/AuthGuard';

// Vendor Pages
import VendorDashboard from '../pages/vendor/VendorDashboard';
import VendorProducts from '../pages/vendor/VendorProducts';
import VendorOrders from '../pages/vendor/VendorOrders';
import VendorPayouts from '../pages/vendor/VendorPayouts';
import VendorSettings from '../pages/vendor/VendorSettings';

// POS Pages
import PosTerminal from '../pages/pos/PosTerminal';
import PosBillsHistory from '../pages/pos/PosBillsHistory';
import PosInventory from '../pages/pos/PosInventory';
import PosBarcodeStickers from '../pages/pos/PosBarcodeStickers';

// Lazy-Loaded Enterprise Admin Consoles (Code-Splitting)
const AdminDashboard = React.lazy(() => import('../pages/admin/AdminDashboard'));
const AdminStoreAnalytics = React.lazy(() => import('../pages/admin/AdminStoreAnalytics'));
const AdminOrders = React.lazy(() => import('../pages/admin/AdminOrders'));
const AdminTransactions = React.lazy(() => import('../pages/admin/AdminTransactions'));
const AdminWallets = React.lazy(() => import('../pages/admin/AdminWallets'));
const AdminProducts = React.lazy(() => import('../pages/admin/AdminProducts'));
const AdminInventory = React.lazy(() => import('../pages/admin/AdminInventory'));
const AdminCategories = React.lazy(() => import('../pages/admin/AdminCategories'));
const AdminBanners = React.lazy(() => import('../pages/admin/AdminBanners'));
const AdminPromotions = React.lazy(() => import('../pages/admin/AdminPromotions'));
const AdminCustomers = React.lazy(() => import('../pages/admin/AdminCustomers'));
const AdminReports = React.lazy(() => import('../pages/admin/AdminReports'));
const AdminNotifications = React.lazy(() => import('../pages/admin/AdminNotifications'));
const AdminSettings = React.lazy(() => import('../pages/admin/AdminSettings'));
const AdminAuditLogs = React.lazy(() => import('../pages/admin/AdminAuditLogs'));
const AdminGallery = React.lazy(() => import('../pages/admin/AdminGallery'));
const StoreAdminDashboard = React.lazy(() => import('../pages/store/StoreAdminDashboard'));

const AdminSuspenseFallback = () => (
  <div className="d-flex align-items-center justify-content-center p-5" style={{ minHeight: '400px' }}>
    <div className="text-center">
      <div className="spinner-border spinner-border-sm text-primary mb-2" style={{ color: '#E90064' }} role="status" />
      <div className="text-muted small fw-semibold" style={{ fontSize: '0.78rem' }}>Loading enterprise console...</div>
    </div>
  </div>
);

const AppRouter = () => {
  return (
    <Routes>
      {/* 1. Customer Storefront Layout */}
      <Route path="/" element={<StorefrontLayout />}>
        <Route index element={<HomePage />} />
        <Route path="products" element={<ProductListingPage />} />
        <Route path="categories" element={<ProductListingPage />} />
        <Route path="category/:slug" element={<ProductListingPage />} />
        <Route path="product/:identifier" element={<ProductDetailPage />} />
        <Route path="cart" element={<CartPage />} />
        <Route path="wishlist" element={<WishlistPage />} />
        <Route path="checkout" element={<CheckoutPage />} />
        <Route path="order-confirmation/:orderNumber" element={<OrderConfirmationPage />} />
        <Route path="orders/track" element={<OrderTrackingPage />} />
        <Route path="customer/orders" element={<MyOrdersPage />} />
        <Route path="customer/profile" element={<CustomerProfilePage />} />
        <Route path="vendor/store/:slug" element={<VendorStorePage />} />
        <Route path="about" element={<AboutPage />} />
        <Route path="contact" element={<ContactPage />} />
        <Route path="terms" element={<PoliciesPage title="Terms of Service" type="terms" />} />
        <Route path="privacy" element={<PoliciesPage title="Privacy Policy" type="privacy" />} />
        <Route path="returns" element={<PoliciesPage title="Return & Refund Policy" type="returns" />} />
      </Route>

      {/* 2. Authentication */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/admin/login" element={<AdminLoginPage />} />
      <Route path="/super-admin/login" element={<AdminLoginPage initialPortalType="super_admin" />} />
      <Route path="/silks-admin/login" element={<AdminLoginPage initialPortalType="silks_admin" />} />
      <Route path="/fabrics-admin/login" element={<AdminLoginPage initialPortalType="fabrics_admin" />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/admin/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/reset-password" element={<ResetPasswordPage />} />
      <Route path="/portal/login" element={<AdminLoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/vendor/register" element={<RegisterPage />} />

      {/* 3. Vendor Portal */}
      <Route path="/vendor" element={<VendorLayout />}>
        <Route index element={<VendorDashboard />} />
        <Route path="products" element={<VendorProducts />} />
        <Route path="orders" element={<VendorOrders />} />
        <Route path="inventory" element={<PosInventory />} />
        <Route path="payouts" element={<VendorPayouts />} />
        <Route path="settings" element={<VendorSettings />} />
      </Route>

      {/* 4. Offline Store POS & Inventory */}
      <Route path="/pos" element={<PosLayout />}>
        <Route index element={<PosTerminal />} />
        <Route path="bills" element={<PosBillsHistory />} />
        <Route path="inventory" element={<PosInventory />} />
        <Route path="barcodes" element={<PosBarcodeStickers />} />
      </Route>

      {/* 5. Aaradhya Silks Store Admin Panel (Store AS) */}
      <Route
        path="/silks-admin"
        element={
          <AuthGuard allowedRoles={['silks_admin', 'store_manager', 'store_admin', 'super_admin']} requiredStoreCode="AS">
            <StoreAdminLayout />
          </AuthGuard>
        }
      >
        <Route index element={<StoreDashboard />} />
        <Route path="dashboard" element={<StoreDashboard />} />
        <Route path="analytics" element={<StoreAnalytics />} />
        <Route path="products" element={<StoreProducts />} />
        <Route path="categories" element={<StoreCategories />} />
        <Route path="inventory" element={<StoreInventory />} />
        <Route path="barcodes" element={<StoreBarcodes />} />
        <Route path="orders" element={<StoreOrders />} />
        <Route path="pos" element={<StorePos />} />
        <Route path="sales" element={<StoreSales />} />
        <Route path="returns" element={<StoreReturns />} />
        <Route path="wallet" element={<StoreWallet />} />
        <Route path="payouts" element={<StorePayouts />} />
        <Route path="transactions" element={<StoreTransactions />} />
        <Route path="customers" element={<StoreCustomers />} />
        <Route path="notifications" element={<StoreNotifications />} />
        <Route path="reports" element={<StoreReports />} />
        <Route path="settings" element={<StoreSettings />} />
      </Route>
      <Route path="/silks" element={<Navigate to="/silks-admin" replace />} />
      <Route path="/silks/admin" element={<Navigate to="/silks-admin" replace />} />

      {/* 6. Aaradhya Fabrics Store Admin Panel (Store AF) */}
      <Route
        path="/fabrics-admin"
        element={
          <AuthGuard allowedRoles={['fabrics_admin', 'store_manager', 'store_admin', 'super_admin']} requiredStoreCode="AF">
            <StoreAdminLayout />
          </AuthGuard>
        }
      >
        <Route index element={<StoreDashboard />} />
        <Route path="dashboard" element={<StoreDashboard />} />
        <Route path="analytics" element={<StoreAnalytics />} />
        <Route path="products" element={<StoreProducts />} />
        <Route path="categories" element={<StoreCategories />} />
        <Route path="inventory" element={<StoreInventory />} />
        <Route path="barcodes" element={<StoreBarcodes />} />
        <Route path="orders" element={<StoreOrders />} />
        <Route path="pos" element={<StorePos />} />
        <Route path="sales" element={<StoreSales />} />
        <Route path="returns" element={<StoreReturns />} />
        <Route path="wallet" element={<StoreWallet />} />
        <Route path="payouts" element={<StorePayouts />} />
        <Route path="transactions" element={<StoreTransactions />} />
        <Route path="customers" element={<StoreCustomers />} />
        <Route path="notifications" element={<StoreNotifications />} />
        <Route path="reports" element={<StoreReports />} />
        <Route path="settings" element={<StoreSettings />} />
      </Route>
      <Route path="/fabrics" element={<Navigate to="/fabrics-admin" replace />} />
      <Route path="/fabrics/admin" element={<Navigate to="/fabrics-admin" replace />} />

      {/* Unified Dynamic Store Admin */}
      <Route
        path="/store-admin"
        element={
          <AuthGuard allowedRoles={['silks_admin', 'fabrics_admin', 'store_manager', 'store_admin', 'super_admin']}>
            <StoreAdminLayout />
          </AuthGuard>
        }
      >
        <Route index element={<StoreDashboard />} />
        <Route path="dashboard" element={<StoreDashboard />} />
        <Route path="analytics" element={<StoreAnalytics />} />
        <Route path="products" element={<StoreProducts />} />
        <Route path="categories" element={<StoreCategories />} />
        <Route path="inventory" element={<StoreInventory />} />
        <Route path="barcodes" element={<StoreBarcodes />} />
        <Route path="orders" element={<StoreOrders />} />
        <Route path="pos" element={<StorePos />} />
        <Route path="sales" element={<StoreSales />} />
        <Route path="returns" element={<StoreReturns />} />
        <Route path="wallet" element={<StoreWallet />} />
        <Route path="payouts" element={<StorePayouts />} />
        <Route path="transactions" element={<StoreTransactions />} />
        <Route path="customers" element={<StoreCustomers />} />
        <Route path="notifications" element={<StoreNotifications />} />
        <Route path="reports" element={<StoreReports />} />
        <Route path="settings" element={<StoreSettings />} />
      </Route>

      {/* 7. Central Super Admin Dashboard & 15 Management Consoles */}
      <Route
        path="/super-admin/dashboard"
        element={<Navigate to="/admin" replace />}
      />
      <Route
        path="/admin"
        element={
          <AuthGuard allowedRoles={['super_admin', 'admin', 'sub_admin']}>
            <AdminLayout />
          </AuthGuard>
        }
      >
        <Route index element={<AdminDashboard />} />
        <Route path="store-analytics" element={<AdminStoreAnalytics />} />
        <Route path="orders" element={<AdminOrders />} />
        <Route path="transactions" element={<AdminTransactions />} />
        <Route path="wallets" element={<AdminWallets />} />
        <Route path="products" element={<AdminProducts />} />
        <Route path="inventory" element={<AdminInventory />} />
        <Route path="categories" element={<AdminCategories />} />
        <Route path="banners" element={<AdminBanners />} />
        <Route path="gallery" element={<AdminGallery />} />
        <Route path="promotions" element={<AdminPromotions />} />
        <Route path="customers" element={<AdminCustomers />} />
        <Route path="reports" element={<AdminReports />} />
        <Route path="notifications" element={<AdminNotifications />} />
        <Route path="settings" element={<AdminSettings />} />
        <Route path="audit-logs" element={<AdminAuditLogs />} />
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default AppRouter;

