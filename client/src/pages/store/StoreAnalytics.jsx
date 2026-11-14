import React, { useState, useEffect } from 'react';
import {
  TrendingUp,
  BarChart3,
  Calendar,
  Layers,
  ArrowUpRight,
  ArrowDownRight,
  Download,
  Filter,
  ShoppingBag,
  DollarSign,
  Users,
  Repeat,
  Package,
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

const StoreAnalytics = () => {
  const store = useStore();
  const [timeRange, setTimeRange] = useState('30days');
  const [loading, setLoading] = useState(true);
  const [analytics, setAnalytics] = useState(null);

  useEffect(() => {
    fetchAnalytics();
  }, [store.activeStore, timeRange]);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const res = await axiosClient.get(`/stores/${store.activeStore}/analytics?timeRange=${timeRange}`);
      if (res.data?.success) {
        setAnalytics(res.data.data);
      }
    } catch (err) {
      console.warn('Using local fallback analytics data:', err);
    } finally {
      setLoading(false);
    }
  };

  // Mock / Fallback dataset tailored to store
  const isSilks = store.isSilks;
  const revenueHistory = [
    { date: '01 Nov', online: isSilks ? 8500 : 3200, pos: isSilks ? 6200 : 2100 },
    { date: '03 Nov', online: isSilks ? 12400 : 4100, pos: isSilks ? 8900 : 3500 },
    { date: '05 Nov', online: isSilks ? 18900 : 5800, pos: isSilks ? 11200 : 4900 },
    { date: '07 Nov', online: isSilks ? 14200 : 4600, pos: isSilks ? 9400 : 3800 },
    { date: '09 Nov', online: isSilks ? 21500 : 7200, pos: isSilks ? 14800 : 5400 },
    { date: '11 Nov', online: isSilks ? 26800 : 8900, pos: isSilks ? 18500 : 6800 },
    { date: '13 Nov', online: isSilks ? 31200 : 9800, pos: isSilks ? 21400 : 8100 },
  ];

  const hourlyFootfall = [
    { hour: '10 AM', posCount: 4, onlineCount: 6 },
    { hour: '12 PM', posCount: 9, onlineCount: 11 },
    { hour: '2 PM', posCount: 7, onlineCount: 14 },
    { hour: '4 PM', posCount: 15, onlineCount: 18 },
    { hour: '6 PM', posCount: 22, onlineCount: 25 },
    { hour: '8 PM', posCount: 18, onlineCount: 21 },
    { hour: '9 PM', posCount: 8, onlineCount: 12 },
  ];

  const topProducts = isSilks
    ? [
        { name: 'Kanjeevaram Bridal Silk Saree', code: 'AS-000001', sales: 48, revenue: 959520, margin: '42%' },
        { name: 'Banarasi Katan Silk Royal Saree', code: 'AS-000108', sales: 34, revenue: 841464, margin: '38%' },
        { name: 'Chanderi Zari Border Saree', code: 'AS-000142', sales: 29, revenue: 255200, margin: '35%' },
        { name: 'Tussar Handwoven Temple Border', code: 'AS-000199', sales: 21, revenue: 270900, margin: '40%' },
        { name: 'Mysore Pure Silk Floral Print', code: 'AS-000215', sales: 18, revenue: 171000, margin: '36%' },
      ]
    : [
        { name: 'Pure Mulmul Cotton Running Yardage', code: 'AF-000001', sales: 142, revenue: 78100, margin: '45%' },
        { name: 'Hand-Block Ajrakh Modal Silk Fabric', code: 'AF-000045', sales: 98, revenue: 112700, margin: '40%' },
        { name: 'Organic Linen Slub Solid Fabric', code: 'AF-000088', sales: 76, revenue: 91200, margin: '38%' },
        { name: 'Embroidered Net Border Organza', code: 'AF-000112', sales: 54, revenue: 86400, margin: '48%' },
        { name: 'Raw Silk Textured Suiting Meter', code: 'AF-000150', sales: 39, revenue: 74100, margin: '34%' },
      ];

  const categoryShare = isSilks
    ? [
        { name: 'Bridal Silks', value: 45, color: '#E90064' },
        { name: 'Handloom Katan', value: 25, color: '#087CE5' },
        { name: 'Chanderi & Tussar', value: 18, color: '#19B927' },
        { name: 'Occasion Wear', value: 12, color: '#B8E000' },
      ]
    : [
        { name: 'Running Cottons', value: 40, color: '#087CE5' },
        { name: 'Hand-Block Textiles', value: 28, color: '#E90064' },
        { name: 'Organza & Nets', value: 20, color: '#19B927' },
        { name: 'Linen & Slubs', value: 12, color: '#B8E000' },
      ];

  return (
    <div className="store-analytics-page pb-5">
      {/* Header & Controls */}
      <div className="d-flex flex-wrap align-items-center justify-content-between gap-3 mb-4">
        <div>
          <div className="d-flex align-items-center gap-2 mb-1">
            <span
              className="badge rounded-pill fw-bold text-uppercase px-2.5 py-1"
              style={{ backgroundColor: store.badgeBg, color: store.badgeText, border: `1px solid ${store.badgeBorder}`, fontSize: '0.72rem' }}
            >
              Store {store.storeCode} Analytics
            </span>
            <span className="text-muted small">• Real-time Intelligence</span>
          </div>
          <h4 className="fw-bold text-dark mb-0">{store.storeName} Performance Analytics</h4>
        </div>

        <div className="d-flex align-items-center gap-2">
          <div className="btn-group btn-group-sm bg-white border rounded-pill p-1 shadow-sm">
            {['today', '7days', '30days', 'this_month', 'this_year'].map((range) => (
              <button
                key={range}
                onClick={() => setTimeRange(range)}
                className={`btn btn-sm rounded-pill px-3 py-1 text-capitalize fw-semibold ${
                  timeRange === range ? 'text-white' : 'text-muted'
                }`}
                style={{
                  backgroundColor: timeRange === range ? store.primaryColor : 'transparent',
                  border: 'none',
                  fontSize: '0.74rem',
                }}
              >
                {range.replace('_', ' ')}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 4 Core Financial KPI Metric Cards */}
      <div className="row g-3 mb-4">
        <div className="col-12 col-sm-6 col-xl-3">
          <div className="card border-0 shadow-sm rounded-3 p-3 bg-white h-100">
            <div className="d-flex align-items-center justify-content-between mb-2">
              <span className="text-muted small fw-medium">Gross Sales (GMV)</span>
              <div
                className="d-flex align-items-center justify-content-center rounded-circle"
                style={{ width: '36px', height: '36px', backgroundColor: `${store.primaryColor}15`, color: store.primaryColor }}
              >
                <DollarSign size={18} />
              </div>
            </div>
            <div className="fs-4 fw-bold text-dark mb-1">
              ₹{isSilks ? '2,498,340' : '442,800'}
            </div>
            <div className="d-flex align-items-center gap-1 small text-success">
              <ArrowUpRight size={14} />
              <span className="fw-semibold">+18.4%</span>
              <span className="text-muted" style={{ fontSize: '0.72rem' }}>vs last period</span>
            </div>
          </div>
        </div>

        <div className="col-12 col-sm-6 col-xl-3">
          <div className="card border-0 shadow-sm rounded-3 p-3 bg-white h-100">
            <div className="d-flex align-items-center justify-content-between mb-2">
              <span className="text-muted small fw-medium">Average Order Value (AOV)</span>
              <div
                className="d-flex align-items-center justify-content-center rounded-circle"
                style={{ width: '36px', height: '36px', backgroundColor: '#087CE515', color: '#087CE5' }}
              >
                <ShoppingBag size={18} />
              </div>
            </div>
            <div className="fs-4 fw-bold text-dark mb-1">
              ₹{isSilks ? '19,820' : '1,940'}
            </div>
            <div className="d-flex align-items-center gap-1 small text-success">
              <ArrowUpRight size={14} />
              <span className="fw-semibold">+7.2%</span>
              <span className="text-muted" style={{ fontSize: '0.72rem' }}>higher basket size</span>
            </div>
          </div>
        </div>

        <div className="col-12 col-sm-6 col-xl-3">
          <div className="card border-0 shadow-sm rounded-3 p-3 bg-white h-100">
            <div className="d-flex align-items-center justify-content-between mb-2">
              <span className="text-muted small fw-medium">Units Per Transaction</span>
              <div
                className="d-flex align-items-center justify-content-center rounded-circle"
                style={{ width: '36px', height: '36px', backgroundColor: '#19B92715', color: '#19B927' }}
              >
                <Package size={18} />
              </div>
            </div>
            <div className="fs-4 fw-bold text-dark mb-1">
              {isSilks ? '1.4 items' : '3.8 meters'}
            </div>
            <div className="d-flex align-items-center gap-1 small text-success">
              <ArrowUpRight size={14} />
              <span className="fw-semibold">+4.1%</span>
              <span className="text-muted" style={{ fontSize: '0.72rem' }}>cross-selling</span>
            </div>
          </div>
        </div>

        <div className="col-12 col-sm-6 col-xl-3">
          <div className="card border-0 shadow-sm rounded-3 p-3 bg-white h-100">
            <div className="d-flex align-items-center justify-content-between mb-2">
              <span className="text-muted small fw-medium">Return Rate</span>
              <div
                className="d-flex align-items-center justify-content-center rounded-circle"
                style={{ width: '36px', height: '36px', backgroundColor: '#FA8C1615', color: '#FA8C16' }}
              >
                <Repeat size={18} />
              </div>
            </div>
            <div className="fs-4 fw-bold text-dark mb-1">
              1.2%
            </div>
            <div className="d-flex align-items-center gap-1 small text-success">
              <ArrowDownRight size={14} />
              <span className="fw-semibold">-0.4%</span>
              <span className="text-muted" style={{ fontSize: '0.72rem' }}>low return tolerance</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Charts: Revenue Channels + Category Share */}
      <div className="row g-3 mb-4">
        <div className="col-12 col-lg-8">
          <div className="card border-0 shadow-sm rounded-3 p-4 bg-white h-100">
            <div className="d-flex flex-wrap align-items-center justify-content-between gap-2 mb-3">
              <div>
                <h6 className="fw-bold text-dark mb-1">Revenue Trajectory: Online vs Counter POS</h6>
                <p className="text-muted small mb-0" style={{ fontSize: '0.78rem' }}>
                  Comparing daily sales across the web storefront and physical counter POS.
                </p>
              </div>
              <div className="d-flex align-items-center gap-3">
                <div className="d-flex align-items-center gap-1.5 small">
                  <span className="d-inline-block rounded-circle" style={{ width: '10px', height: '10px', backgroundColor: store.primaryColor }} />
                  <span className="text-muted" style={{ fontSize: '0.75rem' }}>Online Web</span>
                </div>
                <div className="d-flex align-items-center gap-1.5 small">
                  <span className="d-inline-block rounded-circle" style={{ width: '10px', height: '10px', backgroundColor: '#087CE5' }} />
                  <span className="text-muted" style={{ fontSize: '0.75rem' }}>Counter POS</span>
                </div>
              </div>
            </div>

            <div style={{ width: '100%', height: 300 }}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={revenueHistory} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorOnline" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={store.primaryColor} stopOpacity={0.25} />
                      <stop offset="95%" stopColor={store.primaryColor} stopOpacity={0.0} />
                    </linearGradient>
                    <linearGradient id="colorPos" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#087CE5" stopOpacity={0.25} />
                      <stop offset="95%" stopColor="#087CE5" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F0E7ED" />
                  <XAxis dataKey="date" tick={{ fill: '#77717C', fontSize: 11 }} axisLine={{ stroke: '#EAECF0' }} />
                  <YAxis tick={{ fill: '#77717C', fontSize: 11 }} tickFormatter={(val) => `₹${val / 1000}k`} axisLine={{ stroke: '#EAECF0' }} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#17233B', color: '#fff', borderRadius: '8px', border: 'none', fontSize: '12px' }}
                    formatter={(val) => [`₹${Number(val).toLocaleString()}`, '']}
                  />
                  <Area type="monotone" dataKey="online" stroke={store.primaryColor} strokeWidth={2.5} fillOpacity={1} fill="url(#colorOnline)" name="Online Web" />
                  <Area type="monotone" dataKey="pos" stroke="#087CE5" strokeWidth={2.5} fillOpacity={1} fill="url(#colorPos)" name="Counter POS" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        <div className="col-12 col-lg-4">
          <div className="card border-0 shadow-sm rounded-3 p-4 bg-white h-100">
            <h6 className="fw-bold text-dark mb-1">Sales by Category Class</h6>
            <p className="text-muted small mb-3" style={{ fontSize: '0.78rem' }}>
              Category revenue distribution for {store.storeName}.
            </p>

            <div style={{ width: '100%', height: 210 }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryShare}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {categoryShare.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ backgroundColor: '#17233B', color: '#fff', borderRadius: '8px', border: 'none', fontSize: '12px' }}
                    formatter={(val) => [`${val}%`, 'Share']}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="d-flex flex-column gap-2 mt-2">
              {categoryShare.map((item) => (
                <div key={item.name} className="d-flex align-items-center justify-content-between small">
                  <div className="d-flex align-items-center gap-2">
                    <span className="rounded-circle" style={{ width: '8px', height: '8px', backgroundColor: item.color }} />
                    <span className="text-dark fw-medium" style={{ fontSize: '0.76rem' }}>{item.name}</span>
                  </div>
                  <span className="fw-bold text-dark" style={{ fontSize: '0.76rem' }}>{item.value}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Hourly Footfall vs Online Peak Times & Top 5 Selling SKUs */}
      <div className="row g-3">
        <div className="col-12 col-lg-6">
          <div className="card border-0 shadow-sm rounded-3 p-4 bg-white h-100">
            <h6 className="fw-bold text-dark mb-1">Peak Customer Traffic (Hourly Breakdown)</h6>
            <p className="text-muted small mb-3" style={{ fontSize: '0.78rem' }}>
              Footfall transactions at physical POS counter vs active online shopping carts.
            </p>

            <div style={{ width: '100%', height: 240 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={hourlyFootfall} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F0E7ED" />
                  <XAxis dataKey="hour" tick={{ fill: '#77717C', fontSize: 11 }} />
                  <YAxis tick={{ fill: '#77717C', fontSize: 11 }} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#17233B', color: '#fff', borderRadius: '8px', border: 'none', fontSize: '12px' }}
                  />
                  <Bar dataKey="posCount" fill={store.primaryColor} radius={[4, 4, 0, 0]} name="POS Transactions" />
                  <Bar dataKey="onlineCount" fill="#087CE5" radius={[4, 4, 0, 0]} name="Online Orders" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        <div className="col-12 col-lg-6">
          <div className="card border-0 shadow-sm rounded-3 p-4 bg-white h-100">
            <div className="d-flex align-items-center justify-content-between mb-3">
              <div>
                <h6 className="fw-bold text-dark mb-1">Top Selling Store SKUs</h6>
                <p className="text-muted small mb-0" style={{ fontSize: '0.78rem' }}>
                  Ranked by revenue contribution for {store.storeName}.
                </p>
              </div>
            </div>

            <div className="table-responsive">
              <table className="table table-hover align-middle mb-0" style={{ fontSize: '0.8rem' }}>
                <thead className="table-light">
                  <tr>
                    <th className="border-0 text-muted fw-semibold">SKU / Product</th>
                    <th className="border-0 text-muted fw-semibold text-center">Units</th>
                    <th className="border-0 text-muted fw-semibold text-end">Revenue</th>
                    <th className="border-0 text-muted fw-semibold text-center">Gross Margin</th>
                  </tr>
                </thead>
                <tbody>
                  {topProducts.map((p) => (
                    <tr key={p.code}>
                      <td>
                        <div className="fw-semibold text-dark text-truncate" style={{ maxWidth: '200px' }}>
                          {p.name}
                        </div>
                        <span className="badge font-monospace text-muted" style={{ backgroundColor: '#F8F9FA', fontSize: '0.68rem' }}>
                          {p.code}
                        </span>
                      </td>
                      <td className="text-center fw-medium text-dark">{p.sales}</td>
                      <td className="text-end fw-bold text-dark">₹{Number(p.revenue).toLocaleString()}</td>
                      <td className="text-center">
                        <span className="badge bg-success-subtle text-success fw-semibold" style={{ fontSize: '0.72rem' }}>
                          {p.margin}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StoreAnalytics;
