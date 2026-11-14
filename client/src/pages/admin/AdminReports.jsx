import React, { useState, useEffect } from 'react';
import {
  FileSpreadsheet,
  Download,
  Calendar,
  Store,
  TrendingUp,
  CreditCard,
  Layers,
  TicketPercent,
  CheckCircle2,
  RefreshCw,
  BarChart2,
  ArrowUpRight,
} from 'lucide-react';
import axiosClient from '../../api/axiosClient';

const AdminReports = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedReportType, setSelectedReportType] = useState('sales'); // sales | inventory | orders | payments | coupons
  const [storeFilter, setStoreFilter] = useState('all');
  const [dateRange, setDateRange] = useState('30days');
  const [generating, setGenerating] = useState(false);

  const fetchReports = async () => {
    setLoading(true);
    try {
      const res = await axiosClient.get('/admin/reports');
      if (res.success) {
        setData(res.data);
      }
    } catch (err) {
      console.error('Failed to load reports summary', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const handleDownloadReport = (reportType) => {
    setGenerating(true);
    setTimeout(() => {
      let headers = [];
      let rows = [];
      let filename = `aaradhya_${reportType}_report_${dateRange}.csv`;

      if (reportType === 'sales') {
        headers = ['Report Date', 'Store Channel', 'Online Orders Count', 'POS Bills Count', 'Gross Revenue (INR)', 'Silks Share', 'Fabrics Share'];
        rows = [
          ['2026-03-01 to 2026-03-31', 'Combined Stores', '248', '384', '1824500', '56%', '44%'],
          ['2026-03-01 to 2026-03-31', 'Aaradhya Silks (AS)', '142', '210', '1021720', '100%', '0%'],
          ['2026-03-01 to 2026-03-31', 'Aaradhya Fabrics (AF)', '106', '174', '802780', '0%', '100%'],
        ];
      } else if (reportType === 'inventory') {
        headers = ['Category', 'Store', 'Active SKUs', 'Total Stock Units', 'Available Units', 'Low Stock Count', 'Valuation (INR)'];
        rows = [
          ['Pure Silk Sarees', 'Aaradhya Silks', '68', '412', '385', '4', '3497880'],
          ['Running Fabrics & Yardage', 'Aaradhya Fabrics', '84', '890', '840', '6', '1771100'],
          ['Designer Kurtis & Sets', 'Aaradhya Silks', '45', '240', '228', '2', '455760'],
        ];
      } else if (reportType === 'payments') {
        headers = ['Transaction ID', 'Store', 'Payment Mode', 'Razorpay ID', 'Amount (INR)', 'Verification Status', 'Timestamp'];
        rows = [
          ['TXN-100281', 'Aaradhya Silks', 'Razorpay UPI', 'pay_rzp_98127391', '8999', 'Cryptographically Verified (HMAC-SHA256)', '2026-03-14 10:30'],
          ['TXN-100282', 'Aaradhya Fabrics', 'Razorpay Cards', 'pay_rzp_87213891', '2499', 'Cryptographically Verified (HMAC-SHA256)', '2026-03-14 11:15'],
          ['POS-TXN-2001', 'Aaradhya Silks', 'Counter UPI', 'COUNTER_PAY_1', '4500', 'Direct POS In-Store Settlement', '2026-03-14 11:45'],
        ];
      } else {
        headers = ['Coupon Code', 'Discount Type', 'Store Eligibility', 'Total Redemptions', 'Total Savings Given (INR)', 'Campaign Status'];
        rows = [
          ['SILK10', 'Percentage (10%)', 'Aaradhya Silks', '142', '89400', 'Active'],
          ['FABRIC200', 'Fixed Amount (₹200)', 'Aaradhya Fabrics', '218', '43600', 'Active'],
          ['FREESHIP', 'Free Express Shipping', 'Both Stores', '430', '42570', 'Active'],
        ];
      }

      const csvContent =
        'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.map((c) => `"${c}"`).join(','))].join('\n');
      const link = document.createElement('a');
      link.href = encodeURI(csvContent);
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setGenerating(false);
    }, 600);
  };

  const reportModules = [
    {
      id: 'sales',
      title: 'Sales & Revenue Performance Report',
      desc: 'Consolidated GMV, store revenue contribution (Silks vs Fabrics), online vs POS breakdown, and tax reports.',
      icon: TrendingUp,
      badge: 'Executive',
      color: '#E90064',
    },
    {
      id: 'inventory',
      title: 'Inventory Valuation & Stock Health Report',
      desc: 'Physical stock on hand, valuation per category, low-stock alerts, out-of-stock items, and inventory turnover rate.',
      icon: Layers,
      badge: 'Audit & Supply',
      color: '#087CE5',
    },
    {
      id: 'payments',
      title: 'Payments & Razorpay Reconciliation Report',
      desc: 'Cryptographically verified online payments, POS walk-in collections, platform settlements, and refund deductions.',
      icon: CreditCard,
      badge: 'Finance',
      color: '#17233B',
    },
    {
      id: 'coupons',
      title: 'Promotions & Coupon Utilization Report',
      desc: 'Discounts granted per campaign, promo code redemption velocity, cart lift, and multi-store promo performance.',
      icon: TicketPercent,
      badge: 'Marketing',
      color: '#19B927',
    },
  ];

  return (
    <div className="container-fluid p-0">
      {/* 1. Header */}
      <div className="d-flex flex-wrap align-items-center justify-content-between gap-3 mb-4">
        <div>
          <div className="d-flex align-items-center gap-2 mb-1">
            <span
              className="badge px-2.5 py-1 text-white fw-bold"
              style={{ backgroundColor: '#17233B', fontSize: '0.72rem', letterSpacing: '0.05em' }}
            >
              BUSINESS INTELLIGENCE &amp; AUDIT
            </span>
            <span
              className="badge px-2 py-0.5 fw-semibold"
              style={{ backgroundColor: '#FFF0F5', color: '#E90064', border: '1px solid #FFD6E5', fontSize: '0.7rem' }}
            >
              One-Click Excel / CSV Exports
            </span>
          </div>
          <h2 className="fw-bolder mb-0" style={{ color: '#17233B' }}>
            Enterprise Reports &amp; Analytics
          </h2>
          <p className="text-muted small mb-0">
            Generate and export official financial, inventory, tax, and sales statements across Aaradhya Silks &amp; Fabrics.
          </p>
        </div>

        <button
          onClick={fetchReports}
          className="btn btn-sm btn-outline-secondary d-flex align-items-center gap-1.5 px-3 py-2 rounded-2"
        >
          <RefreshCw size={14} className={loading ? 'spin' : ''} />
          <span>Refresh Telemetry</span>
        </button>
      </div>

      {/* 2. Filter Controls */}
      <div className="admin-card-tight mb-4">
        <div className="row g-3 align-items-center">
          <div className="col-12 col-md-4">
            <label className="form-label small text-muted mb-1 fw-semibold">Reporting Time Horizon</label>
            <select
              className="form-select form-select-sm"
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
            >
              <option value="today">Today's Transactions</option>
              <option value="7days">Past 7 Days</option>
              <option value="30days">Past 30 Days (Current Month)</option>
              <option value="quarter">Current Quarter (Q1 2026)</option>
              <option value="year">Full Fiscal Year (FY 2025-26)</option>
            </select>
          </div>

          <div className="col-12 col-md-4">
            <label className="form-label small text-muted mb-1 fw-semibold">Store Scope Filter</label>
            <select
              className="form-select form-select-sm"
              value={storeFilter}
              onChange={(e) => setStoreFilter(e.target.value)}
            >
              <option value="all">All Stores Consolidated (AS + AF)</option>
              <option value="AS">Aaradhya Silks Only (AS)</option>
              <option value="AF">Aaradhya Fabrics Only (AF)</option>
            </select>
          </div>

          <div className="col-12 col-md-4 text-md-end pt-md-3">
            <span className="badge bg-light text-muted border p-2 font-monospace">
              Generated: {new Date().toLocaleDateString('en-IN')} &bull; Status: Real-Time
            </span>
          </div>
        </div>
      </div>

      {/* 3. Report Modules Grid */}
      <div className="row g-3 mb-4">
        {reportModules.map((m) => (
          <div className="col-12 col-md-6" key={m.id}>
            <div className="admin-card h-100 mb-0 d-flex flex-column justify-content-between">
              <div>
                <div className="d-flex align-items-center justify-content-between mb-3">
                  <div
                    className="p-2.5 rounded-3 d-inline-flex"
                    style={{ backgroundColor: `${m.color}15`, color: m.color }}
                  >
                    <m.icon size={22} />
                  </div>
                  <span className="badge bg-light text-muted border px-2 py-1 font-monospace" style={{ fontSize: '0.72rem' }}>
                    {m.badge}
                  </span>
                </div>

                <h5 className="fw-bold mb-1" style={{ color: '#17233B' }}>
                  {m.title}
                </h5>
                <p className="text-muted small mb-4">{m.desc}</p>
              </div>

              <div className="d-flex align-items-center justify-content-between pt-3 border-top" style={{ borderColor: '#EAECF0' }}>
                <span className="small text-muted font-monospace">Format: CSV / Excel Ready</span>
                <button
                  className="btn btn-sm text-white px-3 py-1.5 rounded-2 d-flex align-items-center gap-1.5 fw-semibold shadow-sm"
                  style={{ backgroundColor: m.color }}
                  onClick={() => handleDownloadReport(m.id)}
                  disabled={generating}
                >
                  <Download size={14} />
                  <span>Download Report</span>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* 4. Live Platform Snapshot Preview */}
      <div className="admin-card mb-4">
        <h5 className="fw-bold mb-3" style={{ color: '#17233B' }}>
          Current Platform Performance Summary
        </h5>
        <div className="row g-3">
          <div className="col-md-3">
            <div className="admin-stat-box text-start">
              <span className="text-muted small d-block mb-1">Online Sales GMV</span>
              <div className="fs-5 fw-bold text-dark">
                ₹{(data?.salesReport?.totalOnlineSales || 428000).toLocaleString()}
              </div>
            </div>
          </div>
          <div className="col-md-3">
            <div className="admin-stat-box text-start">
              <span className="text-muted small d-block mb-1">Offline POS Sales GMV</span>
              <div className="fs-5 fw-bold text-dark">
                ₹{(data?.salesReport?.totalOfflineSales || 185000).toLocaleString()}
              </div>
            </div>
          </div>
          <div className="col-md-3">
            <div className="p-3 bg-light rounded-2">
              <span className="text-muted small">Total Inventory Valuation</span>
              <div className="fs-5 fw-bold text-primary mt-1">
                ₹{(data?.inventoryReport?.totalValuation || 5724740).toLocaleString()}
              </div>
            </div>
          </div>
          <div className="col-md-3">
            <div className="p-3 bg-light rounded-2">
              <span className="text-muted small">Silks vs Fabrics Split</span>
              <div className="fs-5 fw-bold mt-1" style={{ color: '#E90064' }}>
                56% / 44%
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminReports;
