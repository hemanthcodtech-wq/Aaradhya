import React, { useState, useEffect } from 'react';
import {
  TrendingUp,
  ShoppingCart,
  Package,
  Users,
  Layers,
  Store,
  DollarSign,
  AlertCircle,
  RefreshCw,
  ArrowUpRight,
  ShieldCheck,
  Building,
} from 'lucide-react';
import { FaGem, FaScroll } from 'react-icons/fa6';
import AnimatedFaIcon from '../../components/common/AnimatedFaIcon';
import axiosClient from '../../api/axiosClient';

const AdminStoreAnalytics = () => {
  const [data, setData] = useState(null);
  const [activeTab, setActiveTab] = useState('combined'); // 'combined' | 'AS' | 'AF'
  const [loading, setLoading] = useState(true);

  const fetchStoreAnalytics = async () => {
    setLoading(true);
    try {
      const res = await axiosClient.get('/admin/store-analytics');
      if (res.success) {
        setData(res.data);
      }
    } catch (err) {
      console.error('Failed to load store analytics', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStoreAnalytics();
  }, []);

  const currentStore =
    activeTab === 'AS'
      ? data?.silks
      : activeTab === 'AF'
      ? data?.fabrics
      : data?.combined;

  const storeColor =
    activeTab === 'AS'
      ? '#E90064'
      : activeTab === 'AF'
      ? '#087CE5'
      : '#17233B';

  if (loading) {
    return (
      <div className="p-5 text-center">
        <div className="spinner-border text-danger" style={{ color: '#E90064' }}></div>
        <p className="small text-muted mt-2">Aggregating store telemetry...</p>
      </div>
    );
  }

  return (
    <div className="container-fluid p-0">
      {/* 1. Page Header */}
      <div className="d-flex flex-column flex-sm-row justify-content-between align-items-start align-items-sm-center gap-2 mb-3">
        <div>
          <h3 className="fw-bolder mb-1 text-dark" style={{ letterSpacing: '-0.4px', fontSize: '1.45rem' }}>
            Store-Specific Business Analytics
          </h3>
          <p className="text-secondary small mb-0" style={{ fontSize: '0.82rem' }}>
            Independent operational diagnostics for Aaradhya Silks, Aaradhya Fabrics, and Combined Performance.
          </p>
        </div>

        <button
          type="button"
          className="btn btn-sm btn-white border rounded-pill px-3 py-1.5 text-secondary shadow-2xs d-inline-flex align-items-center gap-1.5"
          style={{ fontSize: '0.78rem', backgroundColor: '#FFFFFF' }}
          onClick={fetchStoreAnalytics}
        >
          <RefreshCw size={13} />
          <span>Refresh Data</span>
        </button>
      </div>

      {/* 2. Three Store Selector Tabs */}
      <div className="d-flex gap-2 p-1.5 bg-white border rounded-4 shadow-2xs mb-4" style={{ borderColor: '#F0E7ED' }}>
        <button
          type="button"
          className={`btn btn-sm flex-grow-1 rounded-3 py-2 fw-bold transition-all d-flex align-items-center justify-content-center gap-2 ${
            activeTab === 'combined' ? 'shadow-sm text-white' : 'btn-light border-0 text-secondary'
          }`}
          style={{
            backgroundColor: activeTab === 'combined' ? '#17233B' : 'transparent',
            fontSize: '0.82rem',
          }}
          onClick={() => setActiveTab('combined')}
        >
          <Building size={16} />
          <span>Combined Overview</span>
        </button>

        <button
          type="button"
          className={`btn btn-sm flex-grow-1 rounded-3 py-2 fw-bold transition-all d-flex align-items-center justify-content-center gap-2 ${
            activeTab === 'AS' ? 'shadow-sm text-white' : 'btn-light border-0 text-secondary'
          }`}
          style={{
            backgroundColor: activeTab === 'AS' ? '#E90064' : 'transparent',
            fontSize: '0.82rem',
          }}
          onClick={() => setActiveTab('AS')}
        >
          <AnimatedFaIcon icon={FaGem} size={14} color={activeTab === 'AS' ? '#FFFFFF' : '#E90064'} animation="pulse" />
          <span>Aaradhya Silks (AS)</span>
        </button>

        <button
          type="button"
          className={`btn btn-sm flex-grow-1 rounded-3 py-2 fw-bold transition-all d-flex align-items-center justify-content-center gap-2 ${
            activeTab === 'AF' ? 'shadow-sm text-white' : 'btn-light border-0 text-secondary'
          }`}
          style={{
            backgroundColor: activeTab === 'AF' ? '#087CE5' : 'transparent',
            fontSize: '0.82rem',
          }}
          onClick={() => setActiveTab('AF')}
        >
          <AnimatedFaIcon icon={FaScroll} size={14} color={activeTab === 'AF' ? '#FFFFFF' : '#087CE5'} animation="float" />
          <span>Aaradhya Fabrics (AF)</span>
        </button>
      </div>

      {/* 3. Section 1: Revenue Metrics */}
      <div className="admin-card mb-4">
        <div className="d-flex align-items-center gap-2 mb-3">
          <div className="p-1.5 rounded-3 text-white" style={{ backgroundColor: storeColor }}>
            <TrendingUp size={16} />
          </div>
          <div>
            <h5 className="fw-bold mb-0 text-dark" style={{ fontSize: '1rem' }}>
              Revenue & Financial Performance
            </h5>
            <span className="text-muted small" style={{ fontSize: '0.72rem' }}>
              Online checkout + offline POS counter takings
            </span>
          </div>
        </div>

        <div className="row g-3">
          <div className="col-12 col-sm-6 col-xl-2">
            <div className="admin-stat-box">
              <span className="text-muted small fw-bold d-block mb-1" style={{ fontSize: '0.68rem' }}>TOTAL REVENUE</span>
              <strong className="fs-5 text-dark">₹{currentStore?.revenue.total.toLocaleString()}</strong>
              <div className="text-success small fw-bold mt-1" style={{ fontSize: '0.7rem' }}>{currentStore?.revenue.growthPercentage} YoY</div>
            </div>
          </div>
          <div className="col-12 col-sm-6 col-xl-2">
            <div className="admin-stat-box">
              <span className="text-muted small fw-bold d-block mb-1" style={{ fontSize: '0.68rem' }}>ONLINE STORE</span>
              <strong className="fs-5 text-dark">₹{currentStore?.revenue.online.toLocaleString()}</strong>
              <div className="text-muted small mt-1" style={{ fontSize: '0.7rem' }}>Web / Mobile Cart</div>
            </div>
          </div>
          <div className="col-12 col-sm-6 col-xl-2">
            <div className="admin-stat-box">
              <span className="text-muted small fw-bold d-block mb-1" style={{ fontSize: '0.68rem' }}>OFFLINE POS</span>
              <strong className="fs-5 text-dark">₹{currentStore?.revenue.offline.toLocaleString()}</strong>
              <div className="text-muted small mt-1" style={{ fontSize: '0.7rem' }}>Counter Terminal</div>
            </div>
          </div>
          <div className="col-12 col-sm-6 col-xl-2">
            <div className="admin-stat-box">
              <span className="text-muted small fw-bold d-block mb-1" style={{ fontSize: '0.68rem' }}>DAILY AVERAGE</span>
              <strong className="fs-5 text-dark">₹{currentStore?.revenue.dailyAverage.toLocaleString()}</strong>
              <div className="text-muted small mt-1" style={{ fontSize: '0.7rem' }}>Per 24h cycle</div>
            </div>
          </div>
          <div className="col-12 col-sm-6 col-xl-2">
            <div className="admin-stat-box">
              <span className="text-muted small fw-bold d-block mb-1" style={{ fontSize: '0.68rem' }}>WALLET BALANCE</span>
              <strong className="fs-5 text-success">₹{currentStore?.inventory.walletBalance?.toLocaleString()}</strong>
              <div className="text-muted small mt-1" style={{ fontSize: '0.7rem' }}>Accrued earnings</div>
            </div>
          </div>
          <div className="col-12 col-sm-6 col-xl-2">
            <div className="admin-stat-box">
              <span className="text-muted small fw-bold d-block mb-1" style={{ fontSize: '0.68rem' }}>PENDING SETTLEMENT</span>
              <strong className="fs-5 text-warning">₹{currentStore?.inventory.pendingSettlement?.toLocaleString()}</strong>
              <div className="text-muted small mt-1" style={{ fontSize: '0.7rem' }}>Next payout run</div>
            </div>
          </div>
        </div>
      </div>

      {/* 4. Section 2: Orders & Customers Row */}
      <div className="row g-3 mb-4">
        {/* Orders Breakdown */}
        <div className="col-12 col-lg-6">
          <div className="admin-card h-100 mb-0">
            <div className="d-flex align-items-center gap-2 mb-3">
              <div className="p-1.5 rounded-3 text-white" style={{ backgroundColor: storeColor }}>
                <ShoppingCart size={16} />
              </div>
              <h5 className="fw-bold mb-0 text-dark" style={{ fontSize: '1rem' }}>
                Orders & Fulfillment Velocity
              </h5>
            </div>

            <div className="row g-2 text-center">
              <div className="col-4">
                <div className="admin-stat-box">
                  <span className="text-muted small d-block mb-1" style={{ fontSize: '0.68rem' }}>TOTAL ORDERS</span>
                  <strong className="text-dark fs-6">{currentStore?.orders.total}</strong>
                </div>
              </div>
              <div className="col-4">
                <div className="admin-stat-box">
                  <span className="text-warning small d-block mb-1" style={{ fontSize: '0.68rem' }}>PENDING DISPATCH</span>
                  <strong className="text-warning fs-6">{currentStore?.orders.pending}</strong>
                </div>
              </div>
              <div className="col-4">
                <div className="admin-stat-box">
                  <span className="text-primary small d-block mb-1" style={{ fontSize: '0.68rem' }}>PROCESSING</span>
                  <strong className="text-primary fs-6">{currentStore?.orders.processing}</strong>
                </div>
              </div>
              <div className="col-4">
                <div className="admin-stat-box">
                  <span className="text-info small d-block mb-1" style={{ fontSize: '0.68rem' }}>SHIPPED / IN TRANSIT</span>
                  <strong className="text-info fs-6">{currentStore?.orders.shipped}</strong>
                </div>
              </div>
              <div className="col-4">
                <div className="admin-stat-box">
                  <span className="text-success small d-block mb-1" style={{ fontSize: '0.68rem' }}>DELIVERED</span>
                  <strong className="text-success fs-6">{currentStore?.orders.delivered}</strong>
                </div>
              </div>
              <div className="col-4">
                <div className="admin-stat-box">
                  <span className="text-danger small d-block mb-1" style={{ fontSize: '0.68rem' }}>CANCELLED / RETURN</span>
                  <strong className="text-danger fs-6">{currentStore?.orders.cancelled + currentStore?.orders.returns}</strong>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Customers Breakdown */}
        <div className="col-12 col-lg-6">
          <div className="admin-card h-100 mb-0">
            <div className="d-flex align-items-center gap-2 mb-3">
              <div className="p-1.5 rounded-3 text-white" style={{ backgroundColor: storeColor }}>
                <Users size={16} />
              </div>
              <h5 className="fw-bold mb-0 text-dark" style={{ fontSize: '1rem' }}>
                Customer Base & Loyalty
              </h5>
            </div>

            <div className="row g-2 text-center mb-3">
              <div className="col-6 col-sm-3">
                <div className="admin-stat-box">
                  <span className="text-muted small d-block mb-1" style={{ fontSize: '0.68rem' }}>TOTAL BUYERS</span>
                  <strong className="text-dark fs-6">{currentStore?.customers.total}</strong>
                </div>
              </div>
              <div className="col-6 col-sm-3">
                <div className="admin-stat-box">
                  <span className="text-muted small d-block mb-1" style={{ fontSize: '0.68rem' }}>NEW CUSTOMERS</span>
                  <strong className="text-success fs-6">{currentStore?.customers.newCustomers}</strong>
                </div>
              </div>
              <div className="col-6 col-sm-3">
                <div className="admin-stat-box">
                  <span className="text-muted small d-block mb-1" style={{ fontSize: '0.68rem' }}>REPEAT BUYERS</span>
                  <strong className="text-primary fs-6">{currentStore?.customers.repeatCustomers}</strong>
                </div>
              </div>
              <div className="col-6 col-sm-3">
                <div className="admin-stat-box">
                  <span className="text-muted small d-block mb-1" style={{ fontSize: '0.68rem' }}>AVG ORDER VALUE</span>
                  <strong className="text-dark fs-6">₹{currentStore?.customers.averageOrderValue?.toLocaleString()}</strong>
                </div>
              </div>
            </div>

            <div className="p-2.5 rounded-3 bg-light border small" style={{ fontSize: '0.76rem' }}>
              <span className="fw-bold text-dark d-block mb-1">Top Selling Categories for {currentStore?.storeName}:</span>
              <div className="d-flex flex-wrap gap-1.5">
                {currentStore?.products.topCategories.map((c, i) => (
                  <span key={i} className="badge bg-white text-dark border px-2 py-1">
                    {c}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 5. Section 3: Inventory Valuation & Stock Diagnostics (Read-Only) */}
      <div className="admin-card mb-4">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <div className="d-flex align-items-center gap-2">
            <div className="p-1.5 rounded-3 text-white" style={{ backgroundColor: storeColor }}>
              <Layers size={16} />
            </div>
            <div>
              <h5 className="fw-bold mb-0 text-dark" style={{ fontSize: '1rem' }}>
                Inventory Valuation & Physical Stock
              </h5>
              <span className="text-muted small" style={{ fontSize: '0.72rem' }}>
                Read-only platform oversight (Stock edits restricted to Store Admins)
              </span>
            </div>
          </div>
          <span className="badge rounded-pill bg-light text-muted border px-2.5 py-1 small">
            Super Admin (Read-Only)
          </span>
        </div>

        <div className="row g-3">
          <div className="col-12 col-sm-6 col-xl-2">
            <div className="admin-stat-box">
              <span className="text-muted small fw-bold d-block mb-1" style={{ fontSize: '0.68rem' }}>TOTAL INVENTORY</span>
              <strong className="fs-5 text-dark">{currentStore?.inventory.totalStock.toLocaleString()} units</strong>
            </div>
          </div>
          <div className="col-12 col-sm-6 col-xl-2">
            <div className="admin-stat-box">
              <span className="text-muted small fw-bold d-block mb-1" style={{ fontSize: '0.68rem' }}>AVAILABLE TO SHIP</span>
              <strong className="fs-5 text-success">{currentStore?.inventory.availableStock.toLocaleString()} units</strong>
            </div>
          </div>
          <div className="col-12 col-sm-6 col-xl-2">
            <div className="admin-stat-box">
              <span className="text-muted small fw-bold d-block mb-1" style={{ fontSize: '0.68rem' }}>RESERVED (IN CARTS)</span>
              <strong className="fs-5 text-primary">{currentStore?.inventory.reservedStock} units</strong>
            </div>
          </div>
          <div className="col-12 col-sm-6 col-xl-2">
            <div className="admin-stat-box">
              <span className="text-muted small fw-bold d-block mb-1" style={{ fontSize: '0.68rem' }}>LOW-STOCK ALERTS</span>
              <strong className="fs-5 text-warning">{currentStore?.inventory.lowStockCount} items</strong>
            </div>
          </div>
          <div className="col-12 col-sm-6 col-xl-2">
            <div className="admin-stat-box">
              <span className="text-muted small fw-bold d-block mb-1" style={{ fontSize: '0.68rem' }}>OUT OF STOCK</span>
              <strong className="fs-5 text-danger">{currentStore?.inventory.outOfStockCount} items</strong>
            </div>
          </div>
          <div className="col-12 col-sm-6 col-xl-2">
            <div className="admin-stat-box">
              <span className="text-muted small fw-bold d-block mb-1" style={{ fontSize: '0.68rem' }}>STOCK VALUATION</span>
              <strong className="fs-5 text-dark">₹{currentStore?.inventory.inventoryValuation.toLocaleString()}</strong>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminStoreAnalytics;
