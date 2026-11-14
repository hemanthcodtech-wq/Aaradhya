import React, { useState, useEffect } from 'react';
import {
  FileSpreadsheet,
  Download,
  Calendar,
  Layers,
  ArrowUpRight,
  TrendingUp,
  RefreshCw,
  FileText,
  DollarSign,
  Package,
} from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import axiosClient from '../../api/axiosClient';

const StoreReports = () => {
  const store = useStore();
  const [loading, setLoading] = useState(false);

  const reportTypes = [
    {
      id: 'daily_sales',
      title: 'Daily Sales & Receipts Ledger',
      description: 'Day-by-day breakdown of online suborders and counter POS bills including taxes.',
      period: 'Current Month',
      icon: TrendingUp,
      downloadCount: 38,
    },
    {
      id: 'inventory_valuation',
      title: 'Inventory Stock Valuation Report',
      description: 'Complete SKU-level valuation at cost price vs retail MRP and stock health.',
      period: 'Live Snapshot',
      icon: Package,
      downloadCount: 15,
    },
    {
      id: 'channel_comparison',
      title: 'Online Storefront vs Counter POS Split',
      description: 'Comparative revenue, margin, and order volume analysis between sales channels.',
      period: 'Last 30 Days',
      icon: FileSpreadsheet,
      downloadCount: 22,
    },
    {
      id: 'tax_gst_summary',
      title: 'GST Tax Liability Summary (GSTR-1 Format)',
      description: 'HSN-wise tax collection across CGST (2.5%) and SGST (2.5%) for filing.',
      period: 'Q3 FY26',
      icon: DollarSign,
      downloadCount: 41,
    },
    {
      id: 'returns_audit',
      title: 'Returns & QC Restocking Ledger',
      description: 'Detailed analysis of customer returns, defects, reasons, and restocking.',
      period: 'Year-to-Date',
      icon: FileText,
      downloadCount: 12,
    },
  ];

  const handleDownload = (report) => {
    // Generate dummy CSV download
    const headers = ['Report Title', 'Store Code', 'Generated Date', 'Fiscal Year'];
    const row = [`"${report.title}"`, store.storeCode, new Date().toISOString(), '2026-2027'];
    const csv = 'data:text/csv;charset=utf-8,' + [headers.join(','), row.join(',')].join('\n');
    const link = document.createElement('a');
    link.href = encodeURI(csv);
    link.download = `${store.storeCode}_${report.id}_${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="store-reports-page pb-5">
      {/* Header */}
      <div className="d-flex flex-wrap align-items-center justify-content-between gap-3 mb-4">
        <div>
          <div className="d-flex align-items-center gap-2 mb-1">
            <span
              className="badge rounded-pill fw-bold text-uppercase px-2.5 py-1"
              style={{ backgroundColor: store.badgeBg, color: store.badgeText, border: `1px solid ${store.badgeBorder}`, fontSize: '0.72rem' }}
            >
              Store {store.storeCode} Intelligence
            </span>
            <span className="text-muted small">• Financial & Tax Audits</span>
          </div>
          <h4 className="fw-bold text-dark mb-0">{store.storeName} Reports & Exports</h4>
        </div>
      </div>

      {/* Reports Grid */}
      <div className="row g-3">
        {reportTypes.map((rep) => {
          const Icon = rep.icon;
          return (
            <div key={rep.id} className="col-12 col-md-6 col-lg-4">
              <div className="card border-0 shadow-sm rounded-3 p-4 bg-white h-100 d-flex flex-column justify-content-between">
                <div>
                  <div className="d-flex align-items-center justify-content-between mb-3">
                    <div
                      className="d-flex align-items-center justify-content-center rounded-3"
                      style={{ width: '42px', height: '42px', backgroundColor: `${store.primaryColor}15`, color: store.primaryColor }}
                    >
                      <Icon size={20} />
                    </div>
                    <span className="badge bg-light text-muted border font-monospace" style={{ fontSize: '0.7rem' }}>
                      {rep.period}
                    </span>
                  </div>

                  <h6 className="fw-bold text-dark mb-1">{rep.title}</h6>
                  <p className="text-muted small mb-3" style={{ fontSize: '0.78rem' }}>
                    {rep.description}
                  </p>
                </div>

                <div className="border-top pt-3 mt-auto d-flex align-items-center justify-content-between">
                  <span className="text-muted small" style={{ fontSize: '0.72rem' }}>
                    CSV / Excel Format
                  </span>
                  <button
                    onClick={() => handleDownload(rep)}
                    className="btn btn-sm btn-light border text-dark fw-semibold px-3 py-1.5 rounded-pill d-inline-flex align-items-center gap-1.5 shadow-sm"
                    style={{ fontSize: '0.74rem' }}
                  >
                    <Download size={13} />
                    Download CSV
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default StoreReports;
