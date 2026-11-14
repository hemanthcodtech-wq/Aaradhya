import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  TrendingUp,
  ShoppingCart,
  Store,
  Users,
  CreditCard,
  ArrowUpRight,
  ShieldCheck,
  CheckCircle2,
  Clock,
  ChevronRight,
  Wallet,
  RefreshCw,
  Package,
  Layers,
  Terminal,
  Calendar,
  Filter,
  DollarSign,
  Receipt,
  Sparkles,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
  AreaChart,
  Area,
} from 'recharts';
import { FaGem, FaScroll } from 'react-icons/fa6';
import AnimatedFaIcon from '../../components/common/AnimatedFaIcon';
import axiosClient from '../../api/axiosClient';

const AdminDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState('30d');
  const [revenueView, setRevenueView] = useState('monthly'); // 'monthly' | 'weekly'

  const fetchAnalytics = async (range = dateRange) => {
    setLoading(true);
    try {
      const res = await axiosClient.get(`/admin/analytics?range=${range}`);
      if (res.success) {
        setData(res.data);
      }
    } catch (err) {
      console.error('Failed to load admin analytics', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics(dateRange);
  }, [dateRange]);

  const kpis = data?.kpi || {
    totalRevenue: { value: 2229060, change: '+14.2%', period: 'vs previous period' },
    totalOrders: { value: 2234, change: '+8.5%', period: 'vs previous period' },
    totalCustomers: { value: 1420, change: '+12.0%', period: 'vs previous period' },
    totalProducts: { value: 12, change: '+4.5%', period: 'active in catalog' },
    onlineSales: { value: 1348000, change: '+16.8%', period: 'online checkout' },
    offlineSales: { value: 881060, change: '+10.4%', period: 'POS counters' },
  };

  const storeA = data?.storeA || {
    name: 'Aaradhya Silks',
    code: 'AS',
    totalRevenue: 1246320,
    totalOrders: 1248,
    onlineSales: 760320,
    offlineSales: 486000,
    walletBalance: 328450,
    lowStock: 14,
    sharePercent: 56,
  };

  const storeB = data?.storeB || {
    name: 'Aaradhya Fabrics',
    code: 'AF',
    totalRevenue: 982740,
    totalOrders: 986,
    onlineSales: 588740,
    offlineSales: 394000,
    walletBalance: 264820,
    lowStock: 9,
    sharePercent: 44,
  };

  const revenueData = revenueView === 'monthly' ? (data?.revenueOverviewMonthly || []) : (data?.weeklyTrendData || []);
  const salesBreakdown = data?.salesBreakdown || [
    { name: 'Aaradhya Silks', value: 1246320, percentage: 56, color: '#E90064' },
    { name: 'Aaradhya Fabrics', value: 982740, percentage: 44, color: '#087CE5' },
  ];
  const orderStatusDonut = data?.orderStatusDonut || [];
  const salesChannelsData = data?.salesChannelsData || [];
  const topCategoriesData = data?.topCategoriesData || [];
  const recentOrders = data?.recentOrders || [];

  return (
    <div className="container-fluid p-0">
      {/* 1. Header Toolbar with Filters */}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center gap-3 mb-4">
        <div>
          <div className="d-flex align-items-center gap-2 mb-1">
            <h3 className="fw-bolder mb-0 text-dark" style={{ letterSpacing: '-0.4px', fontSize: '1.45rem' }}>
              Central Platform Intelligence
            </h3>
            <span className="badge rounded-pill bg-white text-dark border px-2.5 py-1 small fw-semibold shadow-2xs">
              Combined Super Admin
            </span>
          </div>
          <p className="text-secondary small mb-0" style={{ fontSize: '0.82rem' }}>
            Consolidated live telemetry across Aaradhya Silks, Aaradhya Fabrics, and Online Storefront.
          </p>
        </div>

        {/* Date Filter & Refresh */}
        <div className="d-flex align-items-center gap-2 flex-wrap">
          <div className="input-group input-group-sm rounded-pill shadow-2xs border bg-white overflow-hidden">
            <span className="input-group-text bg-white border-0 text-muted ps-3 pe-1">
              <Calendar size={14} />
            </span>
            <select
              className="form-select border-0 bg-white small py-1.5 pe-4 fw-semibold text-dark cursor-pointer"
              style={{ fontSize: '0.78rem' }}
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
            >
              <option value="today">Today (Live)</option>
              <option value="yesterday">Yesterday</option>
              <option value="7d">Last 7 Days</option>
              <option value="30d">Last 30 Days</option>
              <option value="90d">Last 90 Days</option>
              <option value="this_month">This Month</option>
              <option value="last_month">Previous Month</option>
              <option value="all">All-Time Cumulative</option>
            </select>
          </div>

          <button
            type="button"
            className="btn btn-sm btn-white border rounded-pill px-3 py-1.5 text-secondary shadow-2xs d-inline-flex align-items-center gap-1.5"
            style={{ fontSize: '0.78rem', backgroundColor: '#FFFFFF' }}
            onClick={() => fetchAnalytics(dateRange)}
            disabled={loading}
          >
            <RefreshCw size={13} className={loading ? 'spin' : ''} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* 2. Six Primary Executive KPI Cards */}
      <div className="row g-3 mb-4">
        {/* Total Revenue */}
        <div className="col-12 col-sm-6 col-xl-2">
          <div className="admin-kpi-card">
            <div>
              <div className="d-flex justify-content-between align-items-center mb-2">
                <span className="text-muted small fw-bold" style={{ fontSize: '0.7rem', letterSpacing: '0.04em' }}>TOTAL REVENUE</span>
                <div className="p-1.5 rounded-3" style={{ backgroundColor: '#FFF0F5', color: '#E90064' }}>
                  <TrendingUp size={16} />
                </div>
              </div>
              <div className="fw-bolder fs-5 text-dark mb-1">
                ₹{kpis.totalRevenue.value.toLocaleString()}
              </div>
            </div>
            <div className="small d-flex align-items-center gap-1 mt-2" style={{ fontSize: '0.72rem' }}>
              <span className="text-success fw-bold">{kpis.totalRevenue.change}</span>
              <span className="text-muted">{kpis.totalRevenue.period}</span>
            </div>
          </div>
        </div>

        {/* Total Orders */}
        <div className="col-12 col-sm-6 col-xl-2">
          <div className="admin-kpi-card">
            <div>
              <div className="d-flex justify-content-between align-items-center mb-2">
                <span className="text-muted small fw-bold" style={{ fontSize: '0.7rem', letterSpacing: '0.04em' }}>TOTAL ORDERS</span>
                <div className="p-1.5 rounded-3" style={{ backgroundColor: '#F0F7FF', color: '#087CE5' }}>
                  <ShoppingCart size={16} />
                </div>
              </div>
              <div className="fw-bolder fs-5 text-dark mb-1">
                {kpis.totalOrders.value.toLocaleString()}
              </div>
            </div>
            <div className="small d-flex align-items-center gap-1 mt-2" style={{ fontSize: '0.72rem' }}>
              <span className="text-success fw-bold">{kpis.totalOrders.change}</span>
              <span className="text-muted">{kpis.totalOrders.period}</span>
            </div>
          </div>
        </div>

        {/* Total Customers */}
        <div className="col-12 col-sm-6 col-xl-2">
          <div className="admin-kpi-card">
            <div>
              <div className="d-flex justify-content-between align-items-center mb-2">
                <span className="text-muted small fw-bold" style={{ fontSize: '0.7rem', letterSpacing: '0.04em' }}>CUSTOMERS</span>
                <div className="p-1.5 rounded-3" style={{ backgroundColor: '#F0FDF4', color: '#16A34A' }}>
                  <Users size={16} />
                </div>
              </div>
              <div className="fw-bolder fs-5 text-dark mb-1">
                {kpis.totalCustomers.value.toLocaleString()}
              </div>
            </div>
            <div className="small d-flex align-items-center gap-1 mt-2" style={{ fontSize: '0.72rem' }}>
              <span className="text-success fw-bold">{kpis.totalCustomers.change}</span>
              <span className="text-muted">{kpis.totalCustomers.period}</span>
            </div>
          </div>
        </div>

        {/* Total Products */}
        <div className="col-12 col-sm-6 col-xl-2">
          <div className="admin-kpi-card">
            <div>
              <div className="d-flex justify-content-between align-items-center mb-2">
                <span className="text-muted small fw-bold" style={{ fontSize: '0.7rem', letterSpacing: '0.04em' }}>CATALOG ITEMS</span>
                <div className="p-1.5 rounded-3" style={{ backgroundColor: '#FEF3C7', color: '#D97706' }}>
                  <Package size={16} />
                </div>
              </div>
              <div className="fw-bolder fs-5 text-dark mb-1">
                {kpis.totalProducts.value.toLocaleString()}
              </div>
            </div>
            <div className="small d-flex align-items-center gap-1 mt-2" style={{ fontSize: '0.72rem' }}>
              <span className="text-muted">{kpis.totalProducts.period}</span>
            </div>
          </div>
        </div>

        {/* Online Sales */}
        <div className="col-12 col-sm-6 col-xl-2">
          <div className="admin-kpi-card">
            <div>
              <div className="d-flex justify-content-between align-items-center mb-2">
                <span className="text-muted small fw-bold" style={{ fontSize: '0.7rem', letterSpacing: '0.04em' }}>ONLINE SALES</span>
                <div className="p-1.5 rounded-3" style={{ backgroundColor: '#FFF0F5', color: '#E90064' }}>
                  <CreditCard size={16} />
                </div>
              </div>
              <div className="fw-bolder fs-5 text-dark mb-1">
                ₹{kpis.onlineSales.value.toLocaleString()}
              </div>
            </div>
            <div className="small d-flex align-items-center gap-1 mt-2" style={{ fontSize: '0.72rem' }}>
              <span className="text-success fw-bold">{kpis.onlineSales.change}</span>
              <span className="text-muted">{kpis.onlineSales.period}</span>
            </div>
          </div>
        </div>

        {/* Offline POS Sales */}
        <div className="col-12 col-sm-6 col-xl-2">
          <div className="admin-kpi-card">
            <div>
              <div className="d-flex justify-content-between align-items-center mb-2">
                <span className="text-muted small fw-bold" style={{ fontSize: '0.7rem', letterSpacing: '0.04em' }}>OFFLINE POS</span>
                <div className="p-1.5 rounded-3" style={{ backgroundColor: '#F8FAFC', color: '#17233B' }}>
                  <Terminal size={16} />
                </div>
              </div>
              <div className="fw-bolder fs-5 text-dark mb-1">
                ₹{kpis.offlineSales.value.toLocaleString()}
              </div>
            </div>
            <div className="small d-flex align-items-center gap-1 mt-2" style={{ fontSize: '0.72rem' }}>
              <span className="text-success fw-bold">{kpis.offlineSales.change}</span>
              <span className="text-muted">{kpis.offlineSales.period}</span>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Charts Row A: Revenue Overview & Sales Contribution Donut */}
      <div className="row g-3 mb-4">
        {/* Chart A: Revenue Overview Area/Bar Chart */}
        <div className="col-12 col-xl-8">
          <div className="admin-card h-100 mb-0">
            <div className="d-flex flex-column flex-sm-row justify-content-between align-items-start align-items-sm-center gap-2 mb-3">
              <div>
                <h5 className="fw-bold mb-0 text-dark" style={{ fontSize: '1.05rem' }}>
                  Revenue Trajectory & Store Comparison
                </h5>
                <span className="text-muted small" style={{ fontSize: '0.76rem' }}>
                  Aaradhya Silks (AS) vs Aaradhya Fabrics (AF) vs Combined Revenue
                </span>
              </div>
              <div className="btn-group btn-group-sm rounded-pill border p-0.5 bg-light" role="group">
                <button
                  type="button"
                  className={`btn btn-sm rounded-pill px-3 py-1 small fw-semibold ${revenueView === 'monthly' ? 'btn-white shadow-2xs text-dark' : 'text-muted border-0 bg-transparent'}`}
                  style={{ fontSize: '0.74rem' }}
                  onClick={() => setRevenueView('monthly')}
                >
                  Monthly
                </button>
                <button
                  type="button"
                  className={`btn btn-sm rounded-pill px-3 py-1 small fw-semibold ${revenueView === 'weekly' ? 'btn-white shadow-2xs text-dark' : 'text-muted border-0 bg-transparent'}`}
                  style={{ fontSize: '0.74rem' }}
                  onClick={() => setRevenueView('weekly')}
                >
                  Daily / Weekly
                </button>
              </div>
            </div>

            <div style={{ height: '300px', width: '100%' }}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={revenueData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorSilks" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#E90064" stopOpacity={0.25} />
                      <stop offset="95%" stopColor="#E90064" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="colorFabrics" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#087CE5" stopOpacity={0.25} />
                      <stop offset="95%" stopColor="#087CE5" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
                  <XAxis dataKey={revenueView === 'monthly' ? 'month' : 'day'} stroke="#94A3B8" fontSize={12} tickLine={false} />
                  <YAxis stroke="#94A3B8" fontSize={12} tickLine={false} tickFormatter={(val) => `₹${val / 1000}k`} />
                  <Tooltip
                    formatter={(val) => [`₹${Number(val).toLocaleString()}`, '']}
                    contentStyle={{ backgroundColor: '#17233B', color: '#FFFFFF', borderRadius: '10px', border: 'none', fontSize: '0.8rem' }}
                  />
                  <Legend iconType="circle" wrapperStyle={{ fontSize: '0.78rem', paddingTop: '10px' }} />
                  <Area type="monotone" dataKey="silks" name="Aaradhya Silks" stroke="#E90064" strokeWidth={2.4} fillOpacity={1} fill="url(#colorSilks)" />
                  <Area type="monotone" dataKey="fabrics" name="Aaradhya Fabrics" stroke="#087CE5" strokeWidth={2.4} fillOpacity={1} fill="url(#colorFabrics)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Chart B: Store Contribution Donut */}
        <div className="col-12 col-xl-4">
          <div className="admin-card h-100 mb-0">
            <h5 className="fw-bold mb-0 text-dark" style={{ fontSize: '1.05rem' }}>
              Store Revenue Contribution
            </h5>
            <span className="text-muted small mb-3 d-block" style={{ fontSize: '0.76rem' }}>
              Percentage contribution to platform GMV
            </span>

            <div style={{ height: '220px', width: '100%' }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={salesBreakdown}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={85}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {salesBreakdown.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(val) => [`₹${Number(val).toLocaleString()}`, 'GMV']} />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="d-flex flex-column gap-2.5 pt-3 border-top" style={{ borderColor: '#EAECF0' }}>
              <div className="d-flex justify-content-between align-items-center">
                <div className="d-flex align-items-center gap-2">
                  <span className="rounded-circle" style={{ width: '10px', height: '10px', backgroundColor: '#E90064' }} />
                  <span className="small fw-semibold text-dark">Aaradhya Silks</span>
                </div>
                <div className="text-end">
                  <strong className="small text-dark">₹{storeA.totalRevenue.toLocaleString()}</strong>
                  <span className="badge rounded-pill bg-light text-danger ms-1.5" style={{ fontSize: '0.66rem' }}>{storeA.sharePercent}%</span>
                </div>
              </div>

              <div className="d-flex justify-content-between align-items-center">
                <div className="d-flex align-items-center gap-2">
                  <span className="rounded-circle" style={{ width: '10px', height: '10px', backgroundColor: '#087CE5' }} />
                  <span className="small fw-semibold text-dark">Aaradhya Fabrics</span>
                </div>
                <div className="text-end">
                  <strong className="small text-dark">₹{storeB.totalRevenue.toLocaleString()}</strong>
                  <span className="badge rounded-pill bg-light text-primary ms-1.5" style={{ fontSize: '0.66rem' }}>{storeB.sharePercent}%</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 4. Store Performance Comparison Cards (AS vs AF) */}
      <div className="row g-3 mb-4">
        {/* Store A Card */}
        <div className="col-12 col-lg-6">
          <div
            className="admin-card h-100 mb-0"
            style={{
              borderColor: '#FCE7F1',
              borderLeft: '4px solid #E90064',
            }}
          >
            <div className="d-flex justify-content-between align-items-center mb-3">
              <div className="d-flex align-items-center gap-2">
                <div className="p-2 rounded-3 text-white" style={{ backgroundColor: '#E90064' }}>
                  <AnimatedFaIcon icon={FaGem} size={15} color="#FFFFFF" animation="pulse" />
                </div>
                <div>
                  <h6 className="fw-bold mb-0 text-dark">Aaradhya Silks</h6>
                  <span className="text-muted small" style={{ fontSize: '0.72rem' }}>Store Code: AS • Pure Handloom Silks</span>
                </div>
              </div>
              <Link to="/silks/admin" className="btn btn-sm btn-outline-danger rounded-pill px-3 py-1 small fw-semibold" style={{ fontSize: '0.76rem' }}>
                Open Store Admin &rarr;
              </Link>
            </div>

            <div className="row g-2 text-center">
              <div className="col-3">
                <div className="admin-stat-box">
                  <span className="text-muted d-block small mb-1" style={{ fontSize: '0.68rem', fontWeight: 600 }}>REVENUE</span>
                  <strong className="text-dark small d-block" style={{ fontSize: '0.82rem' }}>₹{storeA.totalRevenue.toLocaleString()}</strong>
                </div>
              </div>
              <div className="col-3">
                <div className="admin-stat-box">
                  <span className="text-muted d-block small mb-1" style={{ fontSize: '0.68rem', fontWeight: 600 }}>ORDERS</span>
                  <strong className="text-dark small d-block" style={{ fontSize: '0.82rem' }}>{storeA.totalOrders}</strong>
                </div>
              </div>
              <div className="col-3">
                <div className="admin-stat-box">
                  <span className="text-muted d-block small mb-1" style={{ fontSize: '0.68rem', fontWeight: 600 }}>WALLET</span>
                  <strong className="text-success small d-block" style={{ fontSize: '0.82rem' }}>₹{storeA.walletBalance.toLocaleString()}</strong>
                </div>
              </div>
              <div className="col-3">
                <div className="admin-stat-box">
                  <span className="text-muted d-block small mb-1" style={{ fontSize: '0.68rem', fontWeight: 600 }}>LOW STOCK</span>
                  <strong className="text-warning small d-block" style={{ fontSize: '0.82rem' }}>{storeA.lowStock} items</strong>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Store B Card */}
        <div className="col-12 col-lg-6">
          <div
            className="admin-card h-100 mb-0"
            style={{
              borderColor: '#BFDBFE',
              borderLeft: '4px solid #087CE5',
            }}
          >
            <div className="d-flex justify-content-between align-items-center mb-3">
              <div className="d-flex align-items-center gap-2">
                <div className="p-2 rounded-3 text-white" style={{ backgroundColor: '#087CE5' }}>
                  <AnimatedFaIcon icon={FaScroll} size={15} color="#FFFFFF" animation="float" />
                </div>
                <div>
                  <h6 className="fw-bold mb-0 text-dark">Aaradhya Fabrics</h6>
                  <span className="text-muted small" style={{ fontSize: '0.72rem' }}>Store Code: AF • Running Yardage & Textiles</span>
                </div>
              </div>
              <Link to="/fabrics/admin" className="btn btn-sm btn-outline-primary rounded-pill px-3 py-1 small fw-semibold" style={{ fontSize: '0.76rem' }}>
                Open Store Admin &rarr;
              </Link>
            </div>

            <div className="row g-2 text-center">
              <div className="col-3">
                <div className="admin-stat-box">
                  <span className="text-muted d-block small mb-1" style={{ fontSize: '0.68rem', fontWeight: 600 }}>REVENUE</span>
                  <strong className="text-dark small d-block" style={{ fontSize: '0.82rem' }}>₹{storeB.totalRevenue.toLocaleString()}</strong>
                </div>
              </div>
              <div className="col-3">
                <div className="admin-stat-box">
                  <span className="text-muted d-block small mb-1" style={{ fontSize: '0.68rem', fontWeight: 600 }}>ORDERS</span>
                  <strong className="text-dark small d-block" style={{ fontSize: '0.82rem' }}>{storeB.totalOrders}</strong>
                </div>
              </div>
              <div className="col-3">
                <div className="admin-stat-box">
                  <span className="text-muted d-block small mb-1" style={{ fontSize: '0.68rem', fontWeight: 600 }}>WALLET</span>
                  <strong className="text-success small d-block" style={{ fontSize: '0.82rem' }}>₹{storeB.walletBalance.toLocaleString()}</strong>
                </div>
              </div>
              <div className="col-3">
                <div className="admin-stat-box">
                  <span className="text-muted d-block small mb-1" style={{ fontSize: '0.68rem', fontWeight: 600 }}>LOW STOCK</span>
                  <strong className="text-warning small d-block" style={{ fontSize: '0.82rem' }}>{storeB.lowStock} items</strong>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 5. Charts Row B: Order Status & Sales Channels & Top Categories */}
      <div className="row g-3 mb-4">
        {/* Order Status Donut */}
        <div className="col-12 col-md-4">
          <div className="admin-card h-100 mb-0">
            <h6 className="fw-bold text-dark mb-1" style={{ fontSize: '0.95rem' }}>Order Status Breakdown</h6>
            <span className="text-muted small mb-2 d-block" style={{ fontSize: '0.74rem' }}>Fulfillment and delivery states</span>

            <div style={{ height: '180px', width: '100%' }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={orderStatusDonut} cx="50%" cy="50%" innerRadius={42} outerRadius={68} dataKey="value">
                    {orderStatusDonut.map((entry, index) => (
                      <Cell key={`status-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* Order Status Legend Grid */}
            <div className="row g-2 pt-3 border-top" style={{ borderColor: '#EAECF0' }}>
              {orderStatusDonut.map((s, idx) => (
                <div key={idx} className="col-4">
                  <div
                    className="d-flex align-items-center justify-content-between px-2 py-1.5 rounded-2 border"
                    style={{
                      backgroundColor: '#F8FAFC',
                      borderColor: '#EAECF0',
                      fontSize: '0.72rem',
                    }}
                  >
                    <div className="d-flex align-items-center gap-1.5 overflow-hidden">
                      <span
                        className="rounded-circle flex-shrink-0"
                        style={{ width: '7px', height: '7px', backgroundColor: s.color }}
                      />
                      <span className="text-secondary text-truncate" style={{ fontSize: '0.7rem' }}>{s.name}</span>
                    </div>
                    <strong className="text-dark ms-1">{s.value}</strong>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Sales Channel Breakdown (Online vs POS) */}
        <div className="col-12 col-md-4">
          <div className="admin-card h-100 mb-0">
            <h6 className="fw-bold text-dark mb-1" style={{ fontSize: '0.95rem' }}>Sales Channel Distribution</h6>
            <span className="text-muted small mb-3 d-block" style={{ fontSize: '0.74rem' }}>Online web store vs Counter POS</span>

            <div className="d-flex flex-column gap-3 my-auto">
              {salesChannelsData.map((ch, idx) => (
                <div key={idx} className="p-3 rounded-3 border bg-light" style={{ borderColor: '#E2E8F0' }}>
                  <div className="d-flex justify-content-between align-items-center mb-1.5">
                    <span className="fw-bold small text-dark" style={{ fontSize: '0.8rem' }}>{ch.channel}</span>
                    <strong className="small" style={{ color: ch.color, fontSize: '0.82rem' }}>₹{ch.revenue.toLocaleString()}</strong>
                  </div>
                  <div className="progress" style={{ height: '6px' }}>
                    <div
                      className="progress-bar rounded-pill"
                      role="progressbar"
                      style={{ width: `${ch.percentage}%`, backgroundColor: ch.color }}
                    />
                  </div>
                  <div className="text-end text-muted mt-1" style={{ fontSize: '0.68rem' }}>
                    {ch.percentage}% of total GMV
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Top-Selling Categories */}
        <div className="col-12 col-md-4">
          <div className="admin-card h-100 mb-0">
            <h6 className="fw-bold text-dark mb-1" style={{ fontSize: '0.95rem' }}>Top Category Revenue</h6>
            <span className="text-muted small mb-2 d-block" style={{ fontSize: '0.74rem' }}>Contribution by product class</span>

            <div className="d-flex flex-column gap-2 my-auto">
              {topCategoriesData.map((cat, idx) => (
                <div key={idx} className="d-flex justify-content-between align-items-center py-1.5 border-bottom" style={{ borderColor: '#F2F4F7' }}>
                  <div className="d-flex align-items-center gap-2 overflow-hidden">
                    <span className="badge rounded-pill bg-light text-dark fw-bold" style={{ fontSize: '0.65rem' }}>#{idx + 1}</span>
                    <span className="small text-truncate fw-semibold text-dark" style={{ fontSize: '0.78rem' }}>{cat.name}</span>
                  </div>
                  <div className="text-end flex-shrink-0">
                    <strong className="small text-dark" style={{ fontSize: '0.78rem' }}>₹{cat.sales.toLocaleString()}</strong>
                    <span className="text-muted ms-1" style={{ fontSize: '0.66rem' }}>({cat.share}%)</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 6. Recent Consolidated Orders Table */}
      <div className="admin-table-card shadow-2xs mb-4">
        <div className="admin-table-toolbar d-flex justify-content-between align-items-center">
          <div>
            <h5 className="fw-bold mb-0 text-dark" style={{ fontSize: '1.05rem' }}>
              Recent Orders Across Both Stores
            </h5>
            <span className="text-muted small" style={{ fontSize: '0.76rem' }}>
              Consolidated real-time feed of online orders and suborders
            </span>
          </div>
          <Link to="/admin/orders" className="btn btn-sm btn-outline-secondary rounded-pill px-3 py-1.5 small fw-semibold" style={{ fontSize: '0.76rem' }}>
            View All Orders &rarr;
          </Link>
        </div>

        <div className="table-responsive">
          <table className="admin-table table-hover align-middle mb-0" style={{ minWidth: '850px' }}>
            <thead>
              <tr>
                <th className="order-id-cell">ORDER ID</th>
                <th>CUSTOMER</th>
                <th className="text-center nowrap-cell">STORE ASSIGNMENT</th>
                <th className="date-cell">DATE</th>
                <th className="amount-cell">AMOUNT</th>
                <th className="text-center nowrap-cell">STATUS</th>
                <th className="actions-cell">ACTION</th>
              </tr>
            </thead>
            <tbody>
              {recentOrders.length === 0 ? (
                <tr>
                  <td colSpan="7" className="text-center py-4 text-muted small">
                    No recent platform orders recorded yet.
                  </td>
                </tr>
              ) : (
                recentOrders.map((ord) => (
                  <tr key={ord._id}>
                    <td className="order-id-cell">#{ord.orderNumber}</td>
                    <td className="nowrap-cell">
                      <div className="fw-semibold text-dark" style={{ lineHeight: 1.3 }}>{ord.customerName}</div>
                      <div className="text-muted small" style={{ fontSize: '0.72rem' }}>{ord.customerEmail}</div>
                    </td>
                    <td className="text-center nowrap-cell">
                      <span
                        className="badge rounded-pill fw-semibold"
                        style={{
                          backgroundColor: ord.store.includes('Silks') ? '#FFF0F5' : ord.store.includes('Fabrics') ? '#F0F7FF' : '#F5F3FF',
                          color: ord.store.includes('Silks') ? '#E90064' : ord.store.includes('Fabrics') ? '#087CE5' : '#7C3AED',
                          border: `1px solid ${ord.store.includes('Silks') ? '#FCE7F1' : ord.store.includes('Fabrics') ? '#BFDBFE' : '#DDD6FE'}`,
                          fontSize: '0.7rem',
                          padding: '0.35rem 0.65rem',
                        }}
                      >
                        {ord.store}
                      </span>
                    </td>
                    <td className="date-cell">
                      {new Date(ord.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </td>
                    <td className="amount-cell">
                      ₹{ord.totalAmount?.toLocaleString()}
                    </td>
                    <td className="text-center nowrap-cell">
                      <span
                        className={`badge rounded-pill text-capitalize px-2.5 py-1.5 ${
                          ord.orderStatus === 'delivered'
                            ? 'bg-success text-white'
                            : ord.orderStatus === 'shipped'
                            ? 'bg-primary text-white'
                            : ord.orderStatus === 'confirmed'
                            ? 'bg-info-subtle text-info border'
                            : 'bg-warning text-dark'
                        }`}
                        style={{ fontSize: '0.7rem' }}
                      >
                        {ord.orderStatus}
                      </span>
                    </td>
                    <td className="actions-cell">
                      <Link
                        to="/admin/orders"
                        className="btn btn-sm btn-light border rounded-pill px-3 py-1 small fw-medium"
                        style={{ fontSize: '0.74rem' }}
                      >
                        Inspect
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

export default AdminDashboard;
