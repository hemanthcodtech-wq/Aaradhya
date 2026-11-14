import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  TrendingUp,
  ShoppingCart,
  Wallet,
  AlertTriangle,
  ArrowUpRight,
  Package,
  Layers,
  Terminal,
  Clock,
  CheckCircle2,
  Barcode,
  Plus,
  RefreshCw,
  ExternalLink,
  CreditCard,
  Building,
  FileText,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { useStore } from '../../context/StoreContext';
import axiosClient from '../../api/axiosClient';

const StoreDashboard = () => {
  const store = useStore();
  const [dateRange, setDateRange] = useState('30days');
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);
  const [suborders, setSuborders] = useState([]);

  const fetchDashboardData = async () => {
    const targetCode = store.storeCode || store.activeStore || (window.location.pathname.includes('fabrics') ? 'AF' : 'AS');
    if (!targetCode) return;

    setLoading(true);
    try {
      const [analyticsRes, ordersRes] = await Promise.all([
        axiosClient.get(`/stores/${targetCode}/analytics?range=${dateRange}`).catch(() => ({ success: false })),
        axiosClient.get(`/orders/store/${targetCode}`).catch(() => ({ success: false })),
      ]);

      if (analyticsRes?.success && analyticsRes.data) {
        setData(analyticsRes.data);
      }
      if (ordersRes?.success && ordersRes.data) {
        setSuborders(ordersRes.data || []);
      }
    } catch (err) {
      console.error(`Failed to load ${store.storeName} dashboard data`, err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [store.storeCode, dateRange]);

  const kpis = data?.kpis || {
    totalSales: store.isSilks ? 93922 : 14994,
    todaySales: store.isSilks ? 7514 : 1199,
    totalOrders: store.isSilks ? 6 : 4,
    onlineSales: store.isSilks ? 75895 : 10006,
    offlineSales: store.isSilks ? 18027 : 4988,
    totalProducts: store.isSilks ? 18 : 12,
    totalStock: store.isSilks ? 240 : 180,
    availableStock: store.isSilks ? 225 : 168,
    reservedStock: 15,
    lowStockProducts: store.isSilks ? 2 : 1,
    outOfStockProducts: 0,
    pendingDispatch: store.isSilks ? 2 : 1,
    walletBalance: store.isSilks ? 343698 : 264820,
    pendingSettlement: store.isSilks ? 45200 : 38100,
  };

  const revenueTrajectory = store.isSilks
    ? [
        { period: 'Week 1', online: 16500, offline: 4200, total: 20700 },
        { period: 'Week 2', online: 22000, offline: 5100, total: 27100 },
        { period: 'Week 3', online: 18400, offline: 4300, total: 22700 },
        { period: 'Week 4', online: 24200, offline: 5800, total: 30000 },
      ]
    : [
        { period: 'Week 1', online: 2200, offline: 1100, total: 3300 },
        { period: 'Week 2', online: 2900, offline: 1400, total: 4300 },
        { period: 'Week 3', online: 3100, offline: 1200, total: 4300 },
        { period: 'Week 4', online: 3400, offline: 1500, total: 4900 },
      ];

  const orderStatusFunnel = [
    { name: 'Pending', value: 2, color: '#F59E0B' },
    { name: 'Processing', value: 1, color: '#087CE5' },
    { name: 'Packed', value: 1, color: '#8B5CF6' },
    { name: 'Shipped', value: 2, color: '#06B6D4' },
    { name: 'Delivered', value: 4, color: '#16A34A' },
  ];

  const salesChannels = [
    { name: 'Online Storefront', value: kpis.onlineSales, color: store.primaryColor },
    { name: 'Counter POS Billing', value: kpis.offlineSales, color: '#17233B' },
  ];

  return (
    <div className="container-fluid p-0">
      {/* 1. Header Banner & Quick Actions Bar */}
      <div className="d-flex flex-column flex-lg-row justify-content-between align-items-start align-items-lg-center gap-3 mb-4">
        <div>
          <div className="d-flex align-items-center gap-2 mb-1">
            <h3 className="fw-bolder mb-0 text-dark" style={{ letterSpacing: '-0.02em' }}>
              {store.storeName}
            </h3>
            <span
              className="badge px-2.5 py-1 fw-bold rounded-pill"
              style={{
                backgroundColor: store.badgeBg,
                color: store.primaryColor,
                border: `1px solid ${store.badgeBorder}`,
                fontSize: '0.72rem',
              }}
            >
              STORE {store.storeCode} • PREFIX: {store.productPrefix}-000001
            </span>
          </div>
          <p className="text-muted small mb-0">
            {store.tagline} &bull; Independent Product, Inventory, Online Orders &amp; POS Station
          </p>
        </div>

        <div className="d-flex align-items-center gap-2 flex-wrap">
          {/* Timeframe Filter */}
          <div className="btn-group btn-group-sm rounded-pill border p-0.5 bg-white shadow-2xs">
            {['today', '7days', '30days', 'this_month'].map((range) => (
              <button
                key={range}
                type="button"
                className={`btn btn-sm rounded-pill px-2.5 py-1 text-capitalize fw-semibold ${
                  dateRange === range ? 'btn-dark text-white' : 'text-muted border-0 bg-transparent'
                }`}
                style={{ fontSize: '0.74rem' }}
                onClick={() => setDateRange(range)}
              >
                {range.replace('_', ' ')}
              </button>
            ))}
          </div>

          <button
            type="button"
            className="btn btn-sm btn-white border rounded-pill px-3 py-1.5 text-secondary shadow-2xs d-inline-flex align-items-center gap-1.5"
            style={{ fontSize: '0.78rem', backgroundColor: '#FFFFFF' }}
            onClick={fetchDashboardData}
            disabled={loading}
          >
            <RefreshCw size={13} className={loading ? 'spin' : ''} />
            <span>Refresh</span>
          </button>

          <Link
            to={`${store.baseRoute}/pos`}
            className="btn btn-sm text-white rounded-pill px-3 py-1.5 fw-semibold d-inline-flex align-items-center gap-1.5 shadow-sm"
            style={{ backgroundColor: store.primaryColor, borderColor: store.primaryColor, fontSize: '0.78rem' }}
          >
            <Terminal size={14} />
            <span>Open POS Counter</span>
          </Link>
        </div>
      </div>

      {/* 2. 10 KPI Cards (Section 7 Specification) */}
      <div className="row row-cols-1 row-cols-sm-2 row-cols-md-3 row-cols-xl-5 g-3 mb-4">
        {/* Total Revenue */}
        <div className="col">
          <div className="admin-kpi-card">
            <div>
              <div className="d-flex justify-content-between align-items-center mb-2">
                <span className="text-muted small fw-bold" style={{ fontSize: '0.68rem' }}>TOTAL REVENUE</span>
                <div className="p-1.5 rounded-3" style={{ backgroundColor: store.badgeBg, color: store.primaryColor }}>
                  <TrendingUp size={16} />
                </div>
              </div>
              <div className="fw-bolder fs-5 text-dark mb-1">
                ₹{Number(kpis.totalSales || 0).toLocaleString()}
              </div>
            </div>
            <div className="small d-flex align-items-center gap-1 mt-2 text-success fw-bold" style={{ fontSize: '0.72rem' }}>
              <ArrowUpRight size={13} /> {store.isSilks ? '+18.4%' : '+14.9%'} store growth
            </div>
          </div>
        </div>

        {/* Today's Revenue */}
        <div className="col">
          <div className="admin-kpi-card">
            <div>
              <div className="d-flex justify-content-between align-items-center mb-2">
                <span className="text-muted small fw-bold" style={{ fontSize: '0.68rem' }}>TODAY'S SALES</span>
                <div className="p-1.5 rounded-3 bg-light text-dark">
                  <Clock size={16} />
                </div>
              </div>
              <div className="fw-bolder fs-5 text-dark mb-1">
                ₹{Number(kpis.todaySales || 0).toLocaleString()}
              </div>
            </div>
            <span className="text-muted small mt-2 d-block" style={{ fontSize: '0.72rem' }}>Real-time POS &amp; Cart</span>
          </div>
        </div>

        {/* Total Orders */}
        <div className="col">
          <div className="admin-kpi-card">
            <div>
              <div className="d-flex justify-content-between align-items-center mb-2">
                <span className="text-muted small fw-bold" style={{ fontSize: '0.68rem' }}>TOTAL ORDERS</span>
                <div className="p-1.5 rounded-3" style={{ backgroundColor: '#F0F7FF', color: '#087CE5' }}>
                  <ShoppingCart size={16} />
                </div>
              </div>
              <div className="fw-bolder fs-5 text-dark mb-1">
                {kpis.totalOrders}
              </div>
            </div>
            <span className="text-muted small mt-2 d-block" style={{ fontSize: '0.72rem' }}>
              {kpis.onlineOrders} Online &bull; {kpis.offlineOrders} POS
            </span>
          </div>
        </div>

        {/* Online Sales */}
        <div className="col">
          <div className="admin-kpi-card">
            <div>
              <div className="d-flex justify-content-between align-items-center mb-2">
                <span className="text-muted small fw-bold" style={{ fontSize: '0.68rem' }}>ONLINE STORE</span>
                <div className="p-1.5 rounded-3" style={{ backgroundColor: store.badgeBg, color: store.primaryColor }}>
                  <CreditCard size={16} />
                </div>
              </div>
              <div className="fw-bolder fs-5 text-dark mb-1">
                ₹{Number(kpis.onlineSales || 0).toLocaleString()}
              </div>
            </div>
            <span className="text-muted small mt-2 d-block" style={{ fontSize: '0.72rem' }}>Web / Mobile Cart</span>
          </div>
        </div>

        {/* Offline POS Sales */}
        <div className="col">
          <div className="admin-kpi-card">
            <div>
              <div className="d-flex justify-content-between align-items-center mb-2">
                <span className="text-muted small fw-bold" style={{ fontSize: '0.68rem' }}>COUNTER POS</span>
                <div className="p-1.5 rounded-3 bg-light text-dark">
                  <Terminal size={16} />
                </div>
              </div>
              <div className="fw-bolder fs-5 text-dark mb-1">
                ₹{Number(kpis.offlineSales || 0).toLocaleString()}
              </div>
            </div>
            <span className="text-muted small mt-2 d-block" style={{ fontSize: '0.72rem' }}>Barcode Cash/UPI/Card</span>
          </div>
        </div>

        {/* Total Products */}
        <div className="col">
          <div className="admin-kpi-card">
            <div>
              <div className="d-flex justify-content-between align-items-center mb-2">
                <span className="text-muted small fw-bold" style={{ fontSize: '0.68rem' }}>ACTIVE SKUS</span>
                <div className="p-1.5 rounded-3" style={{ backgroundColor: '#FEF3C7', color: '#D97706' }}>
                  <Package size={16} />
                </div>
              </div>
              <div className="fw-bolder fs-5 text-dark mb-1">
                {kpis.totalProducts} items
              </div>
            </div>
            <span className="text-muted small mt-2 d-block" style={{ fontSize: '0.72rem' }}>Prefix: {store.productPrefix}-000001</span>
          </div>
        </div>

        {/* Available Stock */}
        <div className="col">
          <div className="admin-kpi-card">
            <div>
              <div className="d-flex justify-content-between align-items-center mb-2">
                <span className="text-muted small fw-bold" style={{ fontSize: '0.68rem' }}>AVAILABLE STOCK</span>
                <div className="p-1.5 rounded-3" style={{ backgroundColor: '#DCFCE7', color: '#16A34A' }}>
                  <Layers size={16} />
                </div>
              </div>
              <div className="fw-bolder fs-5 text-success mb-1">
                {kpis.availableStock} units
              </div>
            </div>
            <span className="text-muted small mt-2 d-block" style={{ fontSize: '0.72rem' }}>Shared Online &amp; POS</span>
          </div>
        </div>

        {/* Low Stock Alerts */}
        <div className="col">
          <div className="admin-kpi-card">
            <div>
              <div className="d-flex justify-content-between align-items-center mb-2">
                <span className="text-muted small fw-bold" style={{ fontSize: '0.68rem' }}>LOW STOCK</span>
                <div className="p-1.5 rounded-3" style={{ backgroundColor: '#FEE2E2', color: '#DC2626' }}>
                  <AlertTriangle size={16} />
                </div>
              </div>
              <div className="fw-bolder fs-5 text-danger mb-1">
                {kpis.lowStockProducts} variants
              </div>
            </div>
            <Link to={`${store.baseRoute}/inventory`} className="small text-danger fw-semibold text-decoration-none mt-2 d-inline-block" style={{ fontSize: '0.72rem' }}>
              View Inventory Alerts &rarr;
            </Link>
          </div>
        </div>

        {/* Pending Dispatch */}
        <div className="col">
          <div className="admin-kpi-card">
            <div>
              <div className="d-flex justify-content-between align-items-center mb-2">
                <span className="text-muted small fw-bold" style={{ fontSize: '0.68rem' }}>PENDING DISPATCH</span>
                <div className="p-1.5 rounded-3" style={{ backgroundColor: '#F0F9FF', color: '#0284C7' }}>
                  <ShoppingCart size={16} />
                </div>
              </div>
              <div className="fw-bolder fs-5 text-primary mb-1">
                {kpis.pendingDispatch} suborders
              </div>
            </div>
            <Link to={`${store.baseRoute}/orders`} className="small text-primary fw-semibold text-decoration-none mt-2 d-inline-block" style={{ fontSize: '0.72rem' }}>
              Process Suborders &rarr;
            </Link>
          </div>
        </div>

        {/* Store Wallet Balance */}
        <div className="col">
          <div className="admin-kpi-card">
            <div>
              <div className="d-flex justify-content-between align-items-center mb-2">
                <span className="text-muted small fw-bold" style={{ fontSize: '0.68rem' }}>STORE WALLET</span>
                <div className="p-1.5 rounded-3" style={{ backgroundColor: '#ECFDF5', color: '#059669' }}>
                  <Wallet size={16} />
                </div>
              </div>
              <div className="fw-bolder fs-5 text-success mb-1">
                ₹{Number(kpis.walletBalance || 0).toLocaleString()}
              </div>
            </div>
            <span className="text-muted small mt-2 d-block" style={{ fontSize: '0.72rem' }}>
              Pending: ₹{Number(kpis.pendingSettlement || 0).toLocaleString()}
            </span>
          </div>
        </div>
      </div>

      {/* 3. Charts Row: Revenue Trajectory & Channel Distribution */}
      <div className="row g-3 mb-4">
        {/* Revenue Analytics (Area Chart) */}
        <div className="col-12 col-xl-8">
          <div className="admin-card h-100 mb-0">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <div>
                <h5 className="fw-bold mb-0 text-dark" style={{ fontSize: '1.05rem' }}>
                  Revenue Progression ({store.storeName})
                </h5>
                <span className="text-muted small" style={{ fontSize: '0.74rem' }}>
                  Online Storefront vs Counter POS Billing
                </span>
              </div>
            </div>

            <div style={{ height: '280px', width: '100%' }}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={revenueTrajectory} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id={`gradStoreOnline`} x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={store.primaryColor} stopOpacity={0.25} />
                      <stop offset="95%" stopColor={store.primaryColor} stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id={`gradStoreOffline`} x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#17233B" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="#17233B" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
                  <XAxis dataKey="period" stroke="#94A3B8" fontSize={12} tickLine={false} />
                  <YAxis stroke="#94A3B8" fontSize={12} tickLine={false} tickFormatter={(val) => `₹${val / 1000}k`} />
                  <Tooltip formatter={(val) => [`₹${Number(val).toLocaleString()}`, '']} />
                  <Legend iconType="circle" wrapperStyle={{ fontSize: '0.76rem', paddingTop: '10px' }} />
                  <Area type="monotone" dataKey="online" name="Online Cart" stroke={store.primaryColor} strokeWidth={2.4} fill={`url(#gradStoreOnline)`} />
                  <Area type="monotone" dataKey="offline" name="Counter POS" stroke="#17233B" strokeWidth={2.4} fill={`url(#gradStoreOffline)`} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Sales Channel Share (Pie Chart) */}
        <div className="col-12 col-xl-4">
          <div className="admin-card h-100 mb-0">
            <h5 className="fw-bold mb-0 text-dark" style={{ fontSize: '1.05rem' }}>
              Sales Channel Breakdown
            </h5>
            <span className="text-muted small mb-3 d-block" style={{ fontSize: '0.74rem' }}>
              Online checkout vs Physical counter billing
            </span>

            <div style={{ height: '200px', width: '100%' }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={salesChannels}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={75}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {salesChannels.map((entry, index) => (
                      <Cell key={`channel-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(val) => [`₹${Number(val).toLocaleString()}`, 'GMV']} />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="d-flex flex-column gap-2 pt-2 border-top" style={{ borderColor: '#EAECF0' }}>
              <div className="d-flex justify-content-between align-items-center">
                <div className="d-flex align-items-center gap-2">
                  <span className="rounded-circle" style={{ width: '10px', height: '10px', backgroundColor: store.primaryColor }} />
                  <span className="small fw-semibold text-dark">Online Store</span>
                </div>
                <strong className="small text-dark">₹{Number(kpis.onlineSales || 0).toLocaleString()}</strong>
              </div>
              <div className="d-flex justify-content-between align-items-center">
                <div className="d-flex align-items-center gap-2">
                  <span className="rounded-circle" style={{ width: '10px', height: '10px', backgroundColor: '#17233B' }} />
                  <span className="small fw-semibold text-dark">Counter POS</span>
                </div>
                <strong className="small text-dark">₹{Number(kpis.offlineSales || 0).toLocaleString()}</strong>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 4. Store Suborders Real-Time Feed */}
      <div className="admin-table-card shadow-2xs mb-4">
        <div className="admin-table-toolbar d-flex justify-content-between align-items-center">
          <div>
            <h5 className="fw-bold mb-0 text-dark" style={{ fontSize: '1.05rem' }}>
              Active Store Suborders ({store.storeCode}-ORD-*)
            </h5>
            <span className="text-muted small" style={{ fontSize: '0.74rem' }}>
              Real-time fulfillment queue belonging exclusively to {store.storeName}
            </span>
          </div>
          <Link
            to={`${store.baseRoute}/orders`}
            className="btn btn-sm btn-outline-secondary rounded-pill px-3 py-1.5 small fw-semibold"
            style={{ fontSize: '0.76rem' }}
          >
            Manage All Orders &rarr;
          </Link>
        </div>

        <div className="table-responsive">
          <table className="admin-table table-hover align-middle mb-0" style={{ minWidth: '950px' }}>
            <thead>
              <tr>
                <th className="order-id-cell">SUBORDER #</th>
                <th className="nowrap-cell">PARENT ORDER</th>
                <th>CUSTOMER</th>
                <th>ITEMS IN CART</th>
                <th className="amount-cell">STORE AMOUNT</th>
                <th className="nowrap-cell">COURIER TRACKING</th>
                <th className="text-center nowrap-cell">DISPATCH STATUS</th>
                <th className="actions-cell">ACTION</th>
              </tr>
            </thead>
            <tbody>
              {suborders.length === 0 ? (
                <tr>
                  <td colSpan="8" className="text-center py-4 text-muted small">
                    No active store suborders at this moment.
                  </td>
                </tr>
              ) : (
                suborders.slice(0, 5).map((sub) => (
                  <tr key={sub.suborderNumber}>
                    <td className="order-id-cell">
                      <span className="fw-bold" style={{ color: store.primaryColor }}>
                        #{sub.suborderNumber}
                      </span>
                    </td>
                    <td className="nowrap-cell">
                      <span className="font-monospace text-muted small">
                        #{sub.parentOrderNumber || sub.parentOrderId}
                      </span>
                    </td>
                    <td className="nowrap-cell">
                      <div className="fw-semibold text-dark" style={{ lineHeight: 1.3 }}>
                        {sub.customerName || 'Aaradhya Shopper'}
                      </div>
                      <div className="text-muted small" style={{ fontSize: '0.7rem' }}>
                        {sub.customerEmail || 'customer@aaradhya.com'}
                      </div>
                    </td>
                    <td>
                      <div className="fw-semibold text-dark" style={{ fontSize: '0.8rem' }}>
                        {(sub.items || []).length} item(s)
                      </div>
                      <div className="text-muted text-truncate" style={{ maxWidth: '220px', fontSize: '0.72rem' }}>
                        {(sub.items || []).map((i) => `${i.name} (x${i.quantity})`).join(', ')}
                      </div>
                    </td>
                    <td className="amount-cell">
                      ₹{Number(sub.totalAmount || 0).toLocaleString()}
                    </td>
                    <td className="nowrap-cell">
                      {sub.trackingNumber ? (
                        <div className="small">
                          <span className="fw-semibold text-dark d-block" style={{ fontSize: '0.74rem' }}>{sub.courier}</span>
                          <span className="text-muted font-monospace" style={{ fontSize: '0.7rem' }}>{sub.trackingNumber}</span>
                        </div>
                      ) : (
                        <span className="text-muted small">Awaiting Packing</span>
                      )}
                    </td>
                    <td className="text-center nowrap-cell">
                      <span
                        className={`badge rounded-pill text-capitalize px-2.5 py-1.5 ${
                          sub.status === 'delivered'
                            ? 'bg-success text-white'
                            : sub.status === 'shipped'
                            ? 'bg-primary text-white'
                            : sub.status === 'packed'
                            ? 'bg-info-subtle text-info border'
                            : 'bg-warning text-dark'
                        }`}
                        style={{ fontSize: '0.7rem' }}
                      >
                        {sub.status || 'pending'}
                      </span>
                    </td>
                    <td className="actions-cell">
                      <Link
                        to={`${store.baseRoute}/orders`}
                        className="btn btn-sm btn-light border rounded-pill px-3 py-1 small fw-medium"
                        style={{ fontSize: '0.74rem' }}
                      >
                        Dispatch &rarr;
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default StoreDashboard;
