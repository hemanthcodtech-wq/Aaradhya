import React, { useState } from 'react';
import {
  Bell,
  AlertTriangle,
  Wallet,
  ShoppingCart,
  ShieldCheck,
  CheckCircle2,
  Info,
  Clock,
  ArrowRight,
  Filter,
} from 'lucide-react';
import { Link } from 'react-router-dom';

const AdminNotifications = () => {
  const [filter, setFilter] = useState('all'); // all | stock | payout | orders | system

  const notifications = [
    {
      id: 'notif_1',
      type: 'payout',
      title: 'Bi-Weekly Payout Request Awaiting Approval',
      message: 'Aaradhya Silks submitted a payout request of ₹1,50,000 to State Bank of India A/C ***4892.',
      timestamp: '15 minutes ago',
      actionUrl: '/admin/wallets',
      actionText: 'Review Wallet Payout',
      unread: true,
      severity: 'warning',
    },
    {
      id: 'notif_2',
      type: 'stock',
      title: 'Low Stock Alert: Handloom Silk Sarees',
      message: 'Product "Pure Kanjeevaram Bridal Silk Saree (SKU: AS-SILK-001)" has reached 2 units (below threshold 5).',
      timestamp: '2 hours ago',
      actionUrl: '/admin/inventory',
      actionText: 'View Inventory',
      unread: true,
      severity: 'danger',
    },
    {
      id: 'notif_3',
      type: 'orders',
      title: 'Cross-Store Mixed Order Placed',
      message: 'Order #ORD-2026-904 contains items from both Aaradhya Silks (AS) and Aaradhya Fabrics (AF). Suborders routed automatically.',
      timestamp: '4 hours ago',
      actionUrl: '/admin/orders',
      actionText: 'Inspect Order Splitting',
      unread: false,
      severity: 'info',
    },
    {
      id: 'notif_4',
      type: 'stock',
      title: 'Low Stock Alert: Artisan Cotton Fabrics',
      message: 'Product "Indigo Hand Block Print Running Fabric (SKU: AF-FAB-002)" has 4 units remaining in stock.',
      timestamp: 'Yesterday',
      actionUrl: '/admin/inventory',
      actionText: 'View Inventory',
      unread: false,
      severity: 'warning',
    },
    {
      id: 'notif_5',
      type: 'system',
      title: 'Razorpay Webhook Cryptographic Verification Success',
      message: 'HMAC-SHA256 signature verification successful for payment batches. All webhook events synchronized.',
      timestamp: '2 days ago',
      actionUrl: '/admin/transactions',
      actionText: 'Audit Transactions',
      unread: false,
      severity: 'success',
    },
  ];

  const filtered = notifications.filter((n) => {
    if (filter === 'all') return true;
    return n.type === filter;
  });

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
              SYSTEM ALERTS &amp; EVENTS
            </span>
            <span
              className="badge px-2 py-0.5 fw-semibold"
              style={{ backgroundColor: '#FFF0F5', color: '#E90064', border: '1px solid #FFD6E5', fontSize: '0.7rem' }}
            >
              Live Telemetry
            </span>
          </div>
          <h2 className="fw-bolder mb-0" style={{ color: '#17233B' }}>
            Platform Notifications
          </h2>
          <p className="text-muted small mb-0">
            Real-time critical events: low-stock warnings, store payout requests, mixed cross-store orders, and security logs.
          </p>
        </div>

        {/* Filter Pills */}
        <div className="d-flex align-items-center gap-2">
          {['all', 'stock', 'payout', 'orders', 'system'].map((f) => (
            <button
              key={f}
              className={`btn btn-sm rounded-pill px-3 py-1.5 fw-semibold ${
                filter === f ? 'btn-primary' : 'btn-light text-muted'
              }`}
              style={filter === f ? { backgroundColor: '#17233B', borderColor: '#17233B' } : {}}
              onClick={() => setFilter(f)}
            >
              {f === 'all' && 'All Alerts'}
              {f === 'stock' && 'Stock Alerts'}
              {f === 'payout' && 'Payouts'}
              {f === 'orders' && 'Orders'}
              {f === 'system' && 'Security & System'}
            </button>
          ))}
        </div>
      </div>

      {/* 2. Notifications List */}
      <div className="row g-3">
        {filtered.map((n) => (
          <div className="col-12" key={n.id}>
            <div
              className="admin-card mb-0"
              style={{
                borderLeft: `4px solid ${
                  n.severity === 'danger'
                    ? '#DC2626'
                    : n.severity === 'warning'
                    ? '#F59E0B'
                    : n.severity === 'success'
                    ? '#16A34A'
                    : '#087CE5'
                }`,
              }}
            >
              <div className="d-flex flex-column flex-md-row align-items-md-center justify-content-between gap-3">
                <div className="d-flex align-items-start gap-3">
                  <div
                    className="p-2.5 rounded-circle flex-shrink-0 mt-1"
                    style={{
                      backgroundColor:
                        n.severity === 'danger'
                          ? '#FEE2E2'
                          : n.severity === 'warning'
                          ? '#FEF3C7'
                          : n.severity === 'success'
                          ? '#DCFCE7'
                          : '#E0F2FE',
                      color:
                        n.severity === 'danger'
                          ? '#DC2626'
                          : n.severity === 'warning'
                          ? '#D97706'
                          : n.severity === 'success'
                          ? '#16A34A'
                          : '#087CE5',
                    }}
                  >
                    {n.type === 'stock' && <AlertTriangle size={18} />}
                    {n.type === 'payout' && <Wallet size={18} />}
                    {n.type === 'orders' && <ShoppingCart size={18} />}
                    {n.type === 'system' && <ShieldCheck size={18} />}
                  </div>

                  <div>
                    <div className="d-flex align-items-center gap-2 mb-1">
                      <h6 className="fw-bold mb-0" style={{ color: '#17233B' }}>
                        {n.title}
                      </h6>
                      {n.unread && (
                        <span className="badge bg-danger rounded-pill px-2 py-0.5" style={{ fontSize: '0.65rem' }}>
                          NEW
                        </span>
                      )}
                    </div>
                    <p className="text-muted small mb-1">{n.message}</p>
                    <div className="d-flex align-items-center gap-1 text-muted" style={{ fontSize: '0.72rem' }}>
                      <Clock size={11} />
                      <span>{n.timestamp}</span>
                    </div>
                  </div>
                </div>

                <div className="text-md-end flex-shrink-0">
                  <Link
                    to={n.actionUrl}
                    className="btn btn-sm btn-outline-secondary d-inline-flex align-items-center gap-1.5 px-3 py-1.5 rounded-2"
                  >
                    <span>{n.actionText}</span>
                    <ArrowRight size={13} />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminNotifications;
