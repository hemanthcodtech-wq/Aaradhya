import React, { useState } from 'react';
import {
  Bell,
  ShoppingCart,
  AlertTriangle,
  ArrowUpRight,
  RotateCcw,
  CheckCircle2,
  Trash2,
} from 'lucide-react';
import { useStore } from '../../context/StoreContext';

const StoreNotifications = () => {
  const store = useStore();

  const [notifications, setNotifications] = useState([
    {
      id: 1,
      title: 'New Online Suborder Received',
      message: `Suborder #${store.storeCode}-ORD-488764 has been confirmed by customer. Ready for packing.`,
      time: '10 mins ago',
      type: 'order',
      unread: true,
    },
    {
      id: 2,
      title: 'Low Stock Alert',
      message: store.isSilks
        ? 'Banarasi Katan Silk Royal Saree (AS-BANA-108) has reached 3 pcs (threshold: 5).'
        : 'European Organic Linen Slub (AF-LIN-088) has reached 9 meters (threshold: 15).',
      time: '2 hours ago',
      type: 'inventory',
      unread: true,
    },
    {
      id: 3,
      title: 'Payout Disbursement Confirmed',
      message: 'Super Admin has approved and transferred payout request PAY-REQ-8491 (₹1,50,000) to your bank account.',
      time: 'Yesterday',
      type: 'finance',
      unread: false,
    },
    {
      id: 4,
      title: 'Return Request Logged',
      message: `Customer Pooja Venkatesh requested return for Suborder #${store.storeCode}-ORD-488764. Inspection required.`,
      time: 'Yesterday',
      type: 'return',
      unread: false,
    },
  ]);

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, unread: false })));
  };

  const clearAll = () => {
    setNotifications([]);
  };

  return (
    <div className="store-notifications-page pb-5">
      {/* Header */}
      <div className="d-flex flex-wrap align-items-center justify-content-between gap-3 mb-4">
        <div>
          <div className="d-flex align-items-center gap-2 mb-1">
            <span
              className="badge rounded-pill fw-bold text-uppercase px-2.5 py-1"
              style={{ backgroundColor: store.badgeBg, color: store.badgeText, border: `1px solid ${store.badgeBorder}`, fontSize: '0.72rem' }}
            >
              Store {store.storeCode} Operational Feed
            </span>
            <span className="text-muted small">• Real-Time Store Activity</span>
          </div>
          <h4 className="fw-bold text-dark mb-0">{store.storeName} Notifications</h4>
        </div>

        <div className="d-flex align-items-center gap-2">
          <button onClick={markAllAsRead} className="btn btn-sm btn-light border text-dark fw-semibold px-3 py-1.5 rounded-pill shadow-sm">
            Mark All as Read
          </button>
          <button onClick={clearAll} className="btn btn-sm btn-light border text-danger fw-semibold px-3 py-1.5 rounded-pill shadow-sm">
            Clear Feed
          </button>
        </div>
      </div>

      {/* Notifications List Card */}
      <div className="card border-0 shadow-sm rounded-3 bg-white p-3">
        {notifications.length === 0 ? (
          <div className="text-center py-5 text-muted">
            <Bell size={36} className="opacity-50 mb-2" />
            <div>No active notifications for {store.storeName}.</div>
          </div>
        ) : (
          <div className="d-flex flex-column gap-2.5">
            {notifications.map((n) => {
              const icon =
                n.type === 'order' ? (
                  <ShoppingCart size={16} />
                ) : n.type === 'inventory' ? (
                  <AlertTriangle size={16} />
                ) : n.type === 'finance' ? (
                  <ArrowUpRight size={16} />
                ) : (
                  <RotateCcw size={16} />
                );

              const color =
                n.type === 'order'
                  ? store.primaryColor
                  : n.type === 'inventory'
                  ? '#FA8C16'
                  : n.type === 'finance'
                  ? '#19B927'
                  : '#087CE5';

              return (
                <div
                  key={n.id}
                  className={`p-3 rounded-2 border d-flex align-items-start gap-3 transition-all ${
                    n.unread ? 'bg-light border-start border-3' : 'bg-white'
                  }`}
                  style={{
                    borderColor: n.unread ? store.primaryColor : '#EAECF0',
                  }}
                >
                  <div
                    className="p-2 rounded-circle flex-shrink-0 d-flex align-items-center justify-content-center"
                    style={{ backgroundColor: `${color}15`, color }}
                  >
                    {icon}
                  </div>

                  <div className="flex-grow-1">
                    <div className="d-flex align-items-center justify-content-between mb-1">
                      <h6 className="fw-bold text-dark mb-0 small">{n.title}</h6>
                      <span className="text-muted font-monospace" style={{ fontSize: '0.7rem' }}>
                        {n.time}
                      </span>
                    </div>
                    <p className="text-muted small mb-0" style={{ fontSize: '0.78rem' }}>
                      {n.message}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default StoreNotifications;
