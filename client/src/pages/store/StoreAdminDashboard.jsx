import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  TrendingUp,
  ShoppingCart,
  Store,
  Wallet,
  AlertTriangle,
  ArrowUpRight,
  ShieldCheck,
  CheckCircle2,
  Package,
  Printer,
  ChevronRight,
  Barcode,
  Search,
  Filter,
  Truck,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import axiosClient from '../../api/axiosClient';
import { useAuth } from '../../context/AuthContext';

const StoreAdminDashboard = ({ defaultStoreCode = 'AS' }) => {
  const location = useLocation();
  const { user } = useAuth();
  const isSuperAdmin = user?.role === 'super_admin';

  // Determine store code from prop or path
  const storeCode = location.pathname.includes('/fabrics') ? 'AF' : defaultStoreCode;
  const isSilks = storeCode === 'AS';

  const [data, setData] = useState(null);
  const [suborders, setSuborders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingSuborder, setUpdatingSuborder] = useState(null);

  const primaryColor = isSilks ? '#E90064' : '#087CE5';
  const storeTitle = isSilks ? 'Aaradhya Silks (Store A)' : 'Aaradhya Fabrics (Store B)';
  const storeCodeLabel = isSilks ? 'AS' : 'AF';
  const productPrefix = isSilks ? 'AS-000001+' : 'AF-000001+';

  useEffect(() => {
    const fetchStoreData = async () => {
      setLoading(true);
      try {
        const [analyticsRes, ordersRes] = await Promise.all([
          axiosClient.get(`/stores/${storeCode}/analytics`),
          axiosClient.get(`/orders/store/${storeCode}`),
        ]);

        if (analyticsRes.success) {
          setData(analyticsRes.data);
        }
        if (ordersRes.success) {
          setSuborders(ordersRes.data || []);
        }
      } catch (err) {
        console.error(`Failed to load ${storeTitle} data`, err);
      } finally {
        setLoading(false);
      }
    };
    fetchStoreData();
  }, [storeCode]);

  const handleUpdateStatus = async (suborderNumber, nextStatus) => {
    setUpdatingSuborder(suborderNumber);
    try {
      const res = await axiosClient.put(`/orders/suborders/${suborderNumber}/status`, {
        status: nextStatus,
        courier: isSilks ? 'Blue Dart Express' : 'Shiprocket Surface',
        trackingNumber: `TRK-${storeCode}-${Math.floor(100000 + Math.random() * 900000)}`,
      });
      if (res.success) {
        // Refresh orders
        const ordersRes = await axiosClient.get(`/orders/store/${storeCode}`);
        if (ordersRes.success) setSuborders(ordersRes.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setUpdatingSuborder(null);
    }
  };

  const trendData = isSilks
    ? [
        { date: '1 Oct', sales: 42000 },
        { date: '8 Oct', sales: 68000 },
        { date: '15 Oct', sales: 94000 },
        { date: '22 Oct', sales: 135000 },
        { date: '29 Oct', sales: 182000 },
      ]
    : [
        { date: '1 Oct', sales: 34000 },
        { date: '8 Oct', sales: 52000 },
        { date: '15 Oct', sales: 78000 },
        { date: '22 Oct', sales: 110000 },
        { date: '29 Oct', sales: 146000 },
      ];

  const defaultTopCategories = isSilks
    ? [
        { name: 'Pure Silk Sarees', percent: 54 },
        { name: 'Festive Kurtis', percent: 26 },
        { name: "Men's Silk Wear", percent: 14 },
        { name: 'Accessories', percent: 6 },
      ]
    : [
        { name: 'Dress Materials', percent: 42 },
        { name: 'Running Fabrics', percent: 34 },
        { name: 'Summer Dresses', percent: 18 },
        { name: 'Accessories', percent: 6 },
      ];

  if (loading) {
    return (
      <div className="p-5 text-center">
        <div className="spinner-border text-primary" style={{ color: primaryColor }}></div>
        <p className="small text-muted mt-2">Loading {storeTitle} Dashboard...</p>
      </div>
    );
  }

  const kpis = data?.kpis || {
    totalSales: isSilks ? 1246320 : 982740,
    onlineOrders: isSilks ? 1248 : 986,
    lowStockProducts: isSilks ? 23 : 17,
    walletBalance: isSilks ? 328450 : 264820,
  };

  return (
    <div>
      {/* Header */}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-4">
        <div>
          <div className="d-flex align-items-center gap-2 mb-1">
            <h3 className="fw-bolder mb-0 text-dark">{storeTitle}</h3>
            <span
              className={isSilks ? 'badge badge-silks' : 'badge badge-fabrics'}
              style={{ fontSize: '0.8rem', padding: '0.35rem 0.65rem' }}
            >
              STORE {storeCodeLabel} • ID: {productPrefix}
            </span>
          </div>
          <p className="text-muted small mb-0">
            Dedicated store portal: Products, inventory, orders, wallet and offline counter billing.
          </p>
        </div>

        <div className="d-flex align-items-center gap-2 flex-wrap">
          {!isSuperAdmin ? (
            <>
              <Link
                to={`/pos?store=${storeCode}`}
                className="btn btn-sm btn-primary rounded-pill px-3 py-1.5 shadow-sm text-white"
                style={{ backgroundColor: primaryColor, borderColor: primaryColor }}
              >
                Launch {storeCodeLabel} POS Counter →
              </Link>
              <Link
                to={`/pos/barcodes?store=${storeCode}`}
                className="btn btn-sm btn-outline-secondary rounded-pill px-3 py-1.5 d-flex align-items-center gap-1"
              >
                <Barcode size={15} /> Barcode Stickers
              </Link>
            </>
          ) : (
            <div className="d-flex align-items-center gap-2">
              <span
                className="badge px-3 py-1.5 fw-semibold rounded-pill"
                style={{
                  backgroundColor: isSilks ? '#FFF0F5' : '#EBF5FF',
                  color: primaryColor,
                  border: `1px solid ${isSilks ? '#FFD6E5' : '#BFDBFE'}`,
                  fontSize: '0.74rem',
                }}
              >
                <ShieldCheck size={13} className="me-1 inline" /> Store Monitoring Mode
              </span>
              <Link
                to="/admin/store-analytics"
                className="btn btn-sm btn-outline-secondary rounded-pill px-3 py-1.5"
                style={{ fontSize: '0.74rem' }}
              >
                Comparative Analytics →
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* 4 Store-Specific KPI Cards matching Panel 2 & 3 in Reference Image */}
      <div className="row g-3 mb-4">
        {/* Total Sales */}
        <div className="col-12 col-sm-6 col-xl-3">
          <div className="admin-kpi-card" style={{ borderTop: `4px solid ${primaryColor}` }}>
            <div className="d-flex justify-content-between align-items-start mb-2">
              <span className="text-muted small fw-bold text-uppercase" style={{ fontSize: '0.7rem' }}>Total Store Sales</span>
              <div className="rounded-2 p-2 bg-success bg-opacity-10 text-success">
                <TrendingUp size={18} />
              </div>
            </div>
            <div className="fs-3 fw-bolder text-dark mb-1">₹{kpis.totalSales?.toLocaleString()}</div>
            <div className="text-success small fw-semibold d-flex align-items-center gap-1 mt-2">
              <ArrowUpRight size={14} /> {isSilks ? '+18.4%' : '+14.9%'} store growth
            </div>
          </div>
        </div>

        {/* Online Orders */}
        <div className="col-12 col-sm-6 col-xl-3">
          <div className="admin-kpi-card" style={{ borderTop: `4px solid ${primaryColor}` }}>
            <div className="d-flex justify-content-between align-items-start mb-2">
              <span className="text-muted small fw-bold text-uppercase" style={{ fontSize: '0.7rem' }}>Online Suborders</span>
              <div className="rounded-2 p-2 bg-primary bg-opacity-10 text-primary">
                <ShoppingCart size={18} />
              </div>
            </div>
            <div className="fs-3 fw-bolder text-dark mb-1">{kpis.onlineOrders?.toLocaleString()}</div>
            <div className="text-success small fw-semibold d-flex align-items-center gap-1 mt-2">
              <ArrowUpRight size={14} /> {isSilks ? '+12.6%' : '+11.8%'} order volume
            </div>
          </div>
        </div>

        {/* Low Stock Alerts */}
        <div className="col-12 col-sm-6 col-xl-3">
          <div className="admin-kpi-card" style={{ borderTop: `4px solid ${primaryColor}` }}>
            <div className="d-flex justify-content-between align-items-start mb-2">
              <span className="text-muted small fw-bold text-uppercase" style={{ fontSize: '0.7rem' }}>Low Stock Variants</span>
              <div className="rounded-2 p-2 bg-danger bg-opacity-10 text-danger">
                <AlertTriangle size={18} />
              </div>
            </div>
            <div className="fs-3 fw-bolder text-danger mb-1">{kpis.lowStockProducts}</div>
            <Link to="/vendor/inventory" className="small text-danger fw-semibold text-decoration-none mt-2 d-inline-block">
              View Inventory Alerts →
            </Link>
          </div>
        </div>

        {/* Store Wallet Balance */}
        <div className="col-12 col-sm-6 col-xl-3">
          <div className="admin-kpi-card" style={{ borderTop: `4px solid ${primaryColor}` }}>
            <div className="d-flex justify-content-between align-items-start mb-2">
              <span className="text-muted small fw-bold text-uppercase" style={{ fontSize: '0.7rem' }}>Wallet Balance</span>
              <div className="rounded-2 p-2 bg-primary bg-opacity-10" style={{ color: primaryColor }}>
                <Wallet size={18} />
              </div>
            </div>
            <div className="fs-3 fw-bolder mb-1" style={{ color: primaryColor }}>
              ₹{kpis.walletBalance?.toLocaleString()}
            </div>
            <div className="small text-muted fw-semibold mt-2">
              Pending Settlement: ₹{(data?.store?.pendingSettlement || (isSilks ? 45200 : 38100)).toLocaleString()}
            </div>
          </div>
        </div>
      </div>

      {/* Charts: Sales Trend & Top Categories */}
      <div className="row g-4 mb-4">
        {/* Sales Trend Line */}
        <div className="col-lg-8">
          <div className="admin-card h-100 mb-0">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <div>
                <h5 className="fw-bold mb-1 text-dark">Sales Trend (Store {storeCodeLabel})</h5>
                <small className="text-muted">Weekly revenue progression</small>
              </div>
            </div>

            <div style={{ width: '100%', height: 260 }}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={trendData}>
                  <defs>
                    <linearGradient id={`gradientStore${storeCodeLabel}`} x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={primaryColor} stopOpacity={0.4} />
                      <stop offset="95%" stopColor={primaryColor} stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
                  <XAxis dataKey="date" stroke="#94A3B8" fontSize={12} tickLine={false} />
                  <YAxis stroke="#94A3B8" fontSize={12} tickLine={false} tickFormatter={(val) => `₹${val / 1000}k`} />
                  <Tooltip formatter={(value) => [`₹${value.toLocaleString()}`, 'Sales']} />
                  <Area
                    type="monotone"
                    dataKey="sales"
                    stroke={primaryColor}
                    strokeWidth={3}
                    fillOpacity={1}
                    fill={`url(#gradientStore${storeCodeLabel})`}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Top Categories Progress Breakdown */}
        <div className="col-lg-4">
          <div className="admin-card h-100 mb-0">
            <h5 className="fw-bold mb-1 text-dark">Top Categories</h5>
            <small className="text-muted mb-4 d-block">Sales contribution within Store {storeCodeLabel}</small>

            <div className="d-flex flex-column gap-3">
              {(data?.topCategories?.length ? data.topCategories : defaultTopCategories).map((cat, idx) => (
                <div key={idx}>
                  <div className="d-flex justify-content-between small fw-semibold mb-1">
                    <span className="text-dark">{cat.name}</span>
                    <span style={{ color: primaryColor }}>{cat.percent || 30}%</span>
                  </div>
                  <div className="progress" style={{ height: '8px', backgroundColor: '#F1F5F9' }}>
                    <div
                      className="progress-bar rounded"
                      role="progressbar"
                      style={{
                        width: `${cat.percent || 30}%`,
                        backgroundColor: primaryColor,
                      }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Store Suborders Management Table */}
      <div className="admin-table-card shadow-2xs mb-4">
        <div className="admin-table-toolbar d-flex justify-content-between align-items-center">
          <div>
            <h5 className="fw-bold mb-1 text-dark">Store Suborders ({storeCodeLabel}-ORD-*)</h5>
            <small className="text-muted">Independent fulfillment and dispatch tracking for {storeTitle}</small>
          </div>
        </div>

        <div className="table-responsive">
          <table className="admin-table table-hover align-middle mb-0" style={{ minWidth: '950px' }}>
            <thead>
              <tr>
                <th className="order-id-cell">SUBORDER #</th>
                <th className="nowrap-cell">PARENT ORDER</th>
                <th>CUSTOMER</th>
                <th>ITEMS &amp; QUANTITY</th>
                <th className="amount-cell">AMOUNT</th>
                <th className="nowrap-cell">COURIER / TRACKING</th>
                <th className="text-center nowrap-cell">DISPATCH STATUS</th>
                <th className="actions-cell">ACTION</th>
              </tr>
            </thead>
            <tbody style={{ fontSize: '0.85rem' }}>
              {suborders.length === 0 ? (
                <tr>
                  <td colSpan="8" className="text-center py-4 text-muted">
                    No suborders currently pending for {storeTitle}.
                  </td>
                </tr>
              ) : (
                suborders.map((sub, idx) => (
                  <tr key={idx}>
                    <td>
                      <strong style={{ color: primaryColor }}>{sub.suborderNumber}</strong>
                    </td>
                    <td>
                      <span className="text-muted small">{sub.parentOrderNumber || 'ORD-2026-000001'}</span>
                    </td>
                    <td>
                      <div>
                        <strong>{sub.customerDetails?.name || 'Customer'}</strong>
                        <div className="text-muted small" style={{ fontSize: '0.72rem' }}>
                          {sub.shippingAddress?.city || 'Bengaluru'}
                        </div>
                      </div>
                    </td>
                    <td>
                      <div>
                        {(sub.items || []).map((it, i) => (
                          <div key={i} className="small text-truncate" style={{ maxWidth: '200px' }}>
                            • {it.name} (x{it.quantity})
                          </div>
                        ))}
                      </div>
                    </td>
                    <td>
                      <strong>₹{sub.totalAmount?.toLocaleString()}</strong>
                    </td>
                    <td>
                      <small className="d-block text-muted">{sub.courier || 'Blue Dart'}</small>
                      <span className="badge bg-light text-dark border font-monospace" style={{ fontSize: '0.7rem' }}>
                        {sub.trackingNumber || 'TRK-PENDING'}
                      </span>
                    </td>
                    <td>
                      <span
                        className={`badge ${
                          sub.status === 'delivered'
                            ? 'bg-success text-white'
                            : sub.status === 'shipped'
                            ? 'bg-primary text-white'
                            : sub.status === 'packed'
                            ? 'bg-info text-dark'
                            : 'bg-warning text-dark'
                        }`}
                      >
                        {sub.status?.toUpperCase() || 'PENDING'}
                      </span>
                    </td>
                    <td className="text-end">
                      {sub.status === 'pending' && (
                        <button
                          className="btn btn-sm btn-outline-info rounded-pill px-2.5 py-1"
                          disabled={updatingSuborder === sub.suborderNumber}
                          onClick={() => handleUpdateStatus(sub.suborderNumber, 'packed')}
                        >
                          Mark Packed
                        </button>
                      )}
                      {sub.status === 'packed' && (
                        <button
                          className="btn btn-sm btn-outline-primary rounded-pill px-2.5 py-1"
                          disabled={updatingSuborder === sub.suborderNumber}
                          onClick={() => handleUpdateStatus(sub.suborderNumber, 'shipped')}
                        >
                          Dispatch / Ship
                        </button>
                      )}
                      {sub.status === 'shipped' && (
                        <button
                          className="btn btn-sm btn-outline-success rounded-pill px-2.5 py-1"
                          disabled={updatingSuborder === sub.suborderNumber}
                          onClick={() => handleUpdateStatus(sub.suborderNumber, 'delivered')}
                        >
                          Mark Delivered
                        </button>
                      )}
                      {sub.status === 'delivered' && (
                        <span className="text-success small fw-bold d-flex align-items-center justify-content-end gap-1">
                          <CheckCircle2 size={14} /> Completed
                        </span>
                      )}
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

export default StoreAdminDashboard;
