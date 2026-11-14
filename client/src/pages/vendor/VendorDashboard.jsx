import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  TrendingUp,
  ShoppingCart,
  DollarSign,
  Clock,
  Package,
  Plus,
  ArrowUpRight,
  ChevronRight,
  Truck,
  AlertTriangle,
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
import { useAuth } from '../../context/AuthContext';
import axiosClient from '../../api/axiosClient';

const VendorDashboard = () => {
  const { vendor } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await axiosClient.get('/vendor/stats');
        if (res.success) {
          setStats(res.data);
        }
      } catch (err) {
        console.error('Failed to load vendor stats', err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  const chartData = stats?.salesChartData || [
    { name: '1 Jan', sales: 45000 },
    { name: '5 Jan', sales: 62000 },
    { name: '10 Jan', sales: 58000 },
    { name: '15 Jan', sales: 94000 },
    { name: '20 Jan', sales: 110000 },
    { name: '25 Jan', sales: 88000 },
    { name: '30 Jan', sales: 135000 },
  ];

  if (loading) {
    return (
      <div className="p-4 text-center">
        <div className="spinner-border text-success" role="status"></div>
        <p className="small text-muted mt-2">Loading merchant overview...</p>
      </div>
    );
  }

  return (
    <div>
      {/* Top Header */}
      <div className="d-flex flex-wrap justify-content-between align-items-center gap-3 mb-4">
        <div>
          <h3 className="fw-bold mb-1">Welcome back, {vendor?.storeName || 'TechNova Store'} 👋</h3>
          <p className="text-muted small mb-0">Here's your seller performance overview and order fulfillment updates.</p>
        </div>
        <div className="d-flex gap-2">
          <Link to="/vendor/products" className="btn btn-emerald btn-sm px-3 d-flex align-items-center gap-1">
            <Plus size={16} /> Add Product
          </Link>
          <Link to="/vendor/orders" className="btn btn-outline-secondary btn-sm px-3 d-flex align-items-center gap-1">
            <Truck size={16} /> Fulfill Orders
          </Link>
        </div>
      </div>

      {/* 4 Primary KPI Cards */}
      <div className="row g-3 mb-4">
        <div className="col-12 col-sm-6 col-xl-3">
          <div className="card card-modern p-3">
            <div className="d-flex justify-content-between align-items-start mb-2">
              <span className="text-muted small fw-semibold text-uppercase">Total Sales</span>
              <div className="rounded-2 p-2 bg-success bg-opacity-10 text-success">
                <TrendingUp size={18} />
              </div>
            </div>
            <div className="fs-4 fw-bold text-dark">₹{stats?.totalSales?.toLocaleString() || '12,56,430'}</div>
            <div className="text-success small fw-semibold d-flex align-items-center gap-1 mt-1">
              <ArrowUpRight size={14} /> +18.4% vs last month
            </div>
          </div>
        </div>

        <div className="col-12 col-sm-6 col-xl-3">
          <div className="card card-modern p-3">
            <div className="d-flex justify-content-between align-items-start mb-2">
              <span className="text-muted small fw-semibold text-uppercase">Total Orders</span>
              <div className="rounded-2 p-2 bg-primary bg-opacity-10 text-primary">
                <ShoppingCart size={18} />
              </div>
            </div>
            <div className="fs-4 fw-bold text-dark">{stats?.totalOrders?.toLocaleString() || '1,284'}</div>
            <div className="text-success small fw-semibold d-flex align-items-center gap-1 mt-1">
              <ArrowUpRight size={14} /> +12.8% fulfillment
            </div>
          </div>
        </div>

        <div className="col-12 col-sm-6 col-xl-3">
          <div className="card card-modern p-3">
            <div className="d-flex justify-content-between align-items-start mb-2">
              <span className="text-muted small fw-semibold text-uppercase">Net Earnings</span>
              <div className="rounded-2 p-2 bg-warning bg-opacity-10 text-warning">
                <DollarSign size={18} />
              </div>
            </div>
            <div className="fs-4 fw-bold text-dark">₹{stats?.totalEarnings?.toLocaleString() || '10,05,144'}</div>
            <div className="text-success small fw-semibold d-flex align-items-center gap-1 mt-1">
              <ArrowUpRight size={14} /> +17.6% after commission
            </div>
          </div>
        </div>

        <div className="col-12 col-sm-6 col-xl-3">
          <div className="card card-modern p-3">
            <div className="d-flex justify-content-between align-items-start mb-2">
              <span className="text-muted small fw-semibold text-uppercase">Pending Payout</span>
              <div className="rounded-2 p-2 bg-info bg-opacity-10 text-info">
                <Clock size={18} />
              </div>
            </div>
            <div className="fs-4 fw-bold text-dark">₹{stats?.pendingPayout?.toLocaleString() || '2,25,000'}</div>
            <div className="small mt-1">
              <Link to="/vendor/payouts" className="text-primary text-decoration-none fw-semibold">
                Request Settlement →
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Sales Overview Recharts Curve */}
      <div className="card card-modern p-4 mb-4">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <div>
            <h5 className="fw-bold mb-0">Sales Overview Trend</h5>
            <small className="text-muted">Daily gross revenue over current billing period</small>
          </div>
          <span className="badge bg-light text-dark border">Last 30 Days</span>
        </div>

        <div style={{ height: '300px', width: '100%' }}>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#1D4ED8" stopOpacity={0.35} />
                  <stop offset="95%" stopColor="#1D4ED8" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
              <XAxis dataKey="name" stroke="#64748B" fontSize={12} tickLine={false} />
              <YAxis
                stroke="#64748B"
                fontSize={12}
                tickLine={false}
                tickFormatter={(val) => `₹${val / 1000}k`}
              />
              <Tooltip
                formatter={(val) => [`₹${val.toLocaleString()}`, 'Gross Sales']}
                contentStyle={{ backgroundColor: '#ffffff', borderRadius: '8px', border: '1px solid #E2E8F0' }}
              />
              <Area type="monotone" dataKey="sales" stroke="#1D4ED8" strokeWidth={3} fillOpacity={1} fill="url(#colorSales)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Recent Orders & Low-stock Alerts Row */}
      <div className="row g-4">
        {/* Recent Orders Table */}
        <div className="col-lg-8">
          <div className="card card-modern p-4 h-100">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h5 className="fw-bold mb-0">Recent Store Orders</h5>
              <Link to="/vendor/orders" className="text-success small fw-semibold text-decoration-none">
                View All Orders →
              </Link>
            </div>

            <div className="table-responsive">
              <table className="table table-modern">
                <thead>
                  <tr>
                    <th>Order</th>
                    <th>Customer</th>
                    <th>Amount</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {stats?.recentOrders?.map((ord, i) => (
                    <tr key={i}>
                      <td className="fw-bold text-dark">{ord.orderNumber}</td>
                      <td>{ord.customerName}</td>
                      <td className="fw-semibold">₹{ord.totalAmount?.toLocaleString()}</td>
                      <td>
                        <span className={`badge ${ord.status === 'packed' ? 'bg-primary' : ord.status === 'shipped' ? 'bg-info' : ord.status === 'delivered' ? 'bg-success' : 'bg-warning text-dark'}`}>
                          {ord.status}
                        </span>
                      </td>
                      <td>
                        <Link to="/vendor/orders" className="btn btn-light btn-sm py-1 px-2 border">
                          Fulfill
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Inventory & Quick Actions */}
        <div className="col-lg-4">
          <div className="card card-modern p-4 h-100">
            <h5 className="fw-bold mb-3">Catalog Health</h5>

            <div className="p-3 rounded-3 bg-light border mb-3">
              <div className="d-flex justify-content-between align-items-center mb-1">
                <span className="small text-muted">Total Listed Products</span>
                <span className="fw-bold text-dark">{stats?.totalProducts || 8}</span>
              </div>
              <div className="d-flex justify-content-between align-items-center">
                <span className="small text-muted">Low Stock Threshold (&lt;5)</span>
                <span className="badge bg-warning text-dark">{stats?.lowStockCount || 2} Items</span>
              </div>
            </div>

            <div className="alert alert-info py-2 px-3 small d-flex align-items-center gap-2 mb-3">
              <Truck size={16} />
              <span>Shiprocket courier pickup active for all confirmed orders.</span>
            </div>

            <div className="d-flex flex-column gap-2 mt-auto">
              <Link to="/vendor/products" className="btn btn-emerald btn-sm py-2 text-center">
                Manage Product Catalog
              </Link>
              <Link to="/vendor/settings" className="btn btn-outline-secondary btn-sm py-2 text-center">
                Update Bank & KYC Documents
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VendorDashboard;

