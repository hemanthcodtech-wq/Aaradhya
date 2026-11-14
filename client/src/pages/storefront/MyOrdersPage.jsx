import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Package,
  Truck,
  RotateCcw,
  CheckCircle,
  Clock,
  AlertTriangle,
  FileText,
  XCircle,
  Search,
  ChevronRight,
  Download,
  Star,
  RefreshCw,
  ShoppingBag,
  ExternalLink,
  MapPin,
  Check,
} from 'lucide-react';
import { useCart } from '../../context/CartContext';
import axiosClient from '../../api/axiosClient';

const MyOrdersPage = () => {
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [cancellingId, setCancellingId] = useState(null);
  const [activeTrackingOrder, setActiveTrackingOrder] = useState(null);

  const fetchOrders = async () => {
    try {
      const res = await axiosClient.get('/orders/my-orders');
      if (res.success) {
        setOrders(res.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleCancelOrder = async (orderId) => {
    if (!window.confirm('Are you sure you want to cancel this order? Items will be restocked to inventory.')) return;
    setCancellingId(orderId);
    try {
      const res = await axiosClient.put(`/orders/${orderId}/cancel`, { reason: 'Customer requested cancellation' });
      if (res.success) {
        alert('Order has been cancelled successfully. Any payments will be refunded to your source account.');
        fetchOrders();
      }
    } catch (err) {
      alert(`Failed to cancel: ${err.message}`);
    } finally {
      setCancellingId(null);
    }
  };

  const handleBuyAgain = (item) => {
    addToCart(
      {
        _id: item.product?._id || item.product || `prod_${Date.now()}`,
        name: item.name,
        price: item.price,
        images: [item.image || 'https://via.placeholder.com/200'],
      },
      1
    );
    navigate('/cart');
  };

  const handleDownloadInvoice = (order) => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;
    printWindow.document.write(`
      <html>
        <head>
          <title>Invoice #${order.orderNumber}</title>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; padding: 30px; color: #111; }
            .header { display: flex; justify-content: space-between; border-bottom: 2px solid #0A2540; padding-bottom: 20px; }
            .logo { font-size: 24px; font-weight: bold; color: #0A2540; }
            .table { width: 100%; border-collapse: collapse; margin-top: 25px; }
            .table th, .table td { border: 1px solid #ddd; padding: 10px; text-align: left; }
            .table th { background-color: #f8fafc; }
            .totals { margin-top: 20px; text-align: right; }
          </style>
        </head>
        <body>
          <div class="header">
            <div>
              <div class="logo">ShopMart India</div>
              <p>Official Tax Invoice / Cash Receipt</p>
            </div>
            <div style="text-align: right;">
              <h3>Invoice #${order.orderNumber}</h3>
              <p>Date: ${new Date(order.createdAt).toLocaleDateString()}</p>
              <p>Status: ${order.orderStatus.toUpperCase()}</p>
            </div>
          </div>
          <div style="margin-top: 20px;">
            <strong>Bill To:</strong>
            <p>${order.shippingAddress?.fullName || 'Customer'}<br/>
            ${order.shippingAddress?.addressLine1 || ''}, ${order.shippingAddress?.city || ''}<br/>
            Phone: ${order.shippingAddress?.phone || ''}</p>
          </div>
          <table class="table">
            <thead>
              <tr>
                <th>Item</th>
                <th>SKU</th>
                <th>Qty</th>
                <th>Unit Price</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              ${(order.items || [])
                .map(
                  (i) => `
                <tr>
                  <td>${i.name}</td>
                  <td>${i.sku || 'SKU-001'}</td>
                  <td>${i.quantity}</td>
                  <td>₹${i.price?.toLocaleString()}</td>
                  <td>₹${(i.price * i.quantity)?.toLocaleString()}</td>
                </tr>
              `
                )
                .join('')}
            </tbody>
          </table>
          <div class="totals">
            <h3>Total Paid: ₹${order.totalAmount?.toLocaleString()}</h3>
            <p>Payment: ${order.paymentMethod?.toUpperCase()} (${order.paymentStatus?.toUpperCase()})</p>
          </div>
          <script>window.print();</script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  const getStatusBadge = (status) => {
    switch (status?.toLowerCase()) {
      case 'delivered':
        return (
          <span className="badge bg-success bg-opacity-10 text-success border border-success border-opacity-25 px-2 py-1 small fw-bold">
            ● Delivered
          </span>
        );
      case 'shipped':
        return (
          <span className="badge bg-primary bg-opacity-10 text-primary border border-primary border-opacity-25 px-2 py-1 small fw-bold" style={{ color: '#1D4ED8' }}>
            ● Shipped
          </span>
        );
      case 'processing':
      case 'confirmed':
        return (
          <span className="badge bg-warning bg-opacity-10 text-warning border border-warning border-opacity-25 px-2 py-1 small fw-bold">
            ● Processing
          </span>
        );
      case 'cancelled':
        return (
          <span className="badge bg-danger bg-opacity-10 text-danger border border-danger border-opacity-25 px-2 py-1 small fw-bold">
            ● Cancelled
          </span>
        );
      default:
        return <span className="badge bg-secondary">{status}</span>;
    }
  };

  // Tracking steps calculation
  const getStepIndex = (status) => {
    switch (status?.toLowerCase()) {
      case 'confirmed':
        return 0;
      case 'processing':
      case 'packed':
        return 1;
      case 'shipped':
        return 2;
      case 'delivered':
        return 3;
      default:
        return 0;
    }
  };

  const filteredOrders = orders.filter((ord) => {
    const matchesQuery =
      searchQuery === '' ||
      ord.orderNumber?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ord.items?.some((i) => i.name?.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesStatus =
      statusFilter === 'all' ||
      (statusFilter === 'delivered' && ord.orderStatus === 'delivered') ||
      (statusFilter === 'shipped' && ord.orderStatus === 'shipped') ||
      (statusFilter === 'processing' && (ord.orderStatus === 'processing' || ord.orderStatus === 'confirmed')) ||
      (statusFilter === 'cancelled' && ord.orderStatus === 'cancelled');

    return matchesQuery && matchesStatus;
  });

  if (loading) {
    return (
      <div className="container py-5 text-center">
        <div className="spinner-border text-primary" role="status" style={{ color: '#1D4ED8' }}></div>
        <p className="small text-muted mt-2">Loading your orders & shipments...</p>
      </div>
    );
  }

  return (
    <div className="container py-3 py-md-4">
      {/* Header & Shopping action */}
      <div className="d-flex flex-wrap justify-content-between align-items-center gap-3 mb-4">
        <div>
          <h3 className="fw-bold mb-1 text-dark">My Orders & Purchases</h3>
          <p className="text-muted small mb-0">Track live shipments, download invoices, or initiate quick returns</p>
        </div>
        <Link
          to="/products"
          className="btn btn-outline-primary btn-sm px-3 fw-semibold rounded-2"
          style={{ borderColor: '#1D4ED8', color: '#1D4ED8' }}
        >
          Continue Shopping →
        </Link>
      </div>

      {/* Filter Tabs & Search Bar Row */}
      <div className="card card-modern p-3 mb-4">
        <div className="row g-3 align-items-center justify-content-between">
          <div className="col-md-7">
            <div className="d-flex gap-1 overflow-auto pb-1">
              {[
                { label: 'All Orders', value: 'all' },
                { label: 'Processing', value: 'processing' },
                { label: 'Shipped', value: 'shipped' },
                { label: 'Delivered', value: 'delivered' },
                { label: 'Cancelled', value: 'cancelled' },
              ].map((tab) => (
                <button
                  key={tab.value}
                  type="button"
                  className={`btn btn-sm px-3 rounded-pill fw-semibold text-nowrap ${
                    statusFilter === tab.value
                      ? 'btn-primary text-white shadow-sm'
                      : 'btn-light text-secondary'
                  }`}
                  style={
                    statusFilter === tab.value
                      ? { backgroundColor: '#1D4ED8', borderColor: '#1D4ED8' }
                      : {}
                  }
                  onClick={() => setStatusFilter(tab.value)}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          <div className="col-md-5">
            <div className="input-group input-group-sm">
              <span className="input-group-text bg-white text-muted border-end-0">
                <Search size={14} />
              </span>
              <input
                type="text"
                className="form-control border-start-0"
                placeholder="Search by Order ID (e.g. ORD-) or product..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Orders List */}
      {filteredOrders.length === 0 ? (
        <div className="card card-modern p-5 text-center">
          <Package size={48} className="mx-auto text-muted mb-3 opacity-50" />
          <h5 className="fw-bold mb-2">No Matching Orders Found</h5>
          <p className="text-muted small mb-4">
            {searchQuery
              ? `No orders matching "${searchQuery}". Try clearing search filters.`
              : 'You have not placed any orders under this filter yet.'}
          </p>
          <div>
            <Link
              to="/products"
              className="btn btn-primary px-4 py-2 fw-semibold"
              style={{ backgroundColor: '#1D4ED8', borderColor: '#1D4ED8' }}
            >
              Start Shopping
            </Link>
          </div>
        </div>
      ) : (
        <div className="d-flex flex-column gap-3">
          {filteredOrders.map((ord) => {
            const stepIdx = getStepIndex(ord.orderStatus);
            const isCancelled = ord.orderStatus?.toLowerCase() === 'cancelled';

            return (
              <div key={ord._id} className="card card-modern overflow-hidden">
                {/* Order Header */}
                <div className="p-3 bg-light border-bottom d-flex flex-wrap justify-content-between align-items-center gap-3">
                  <div className="d-flex align-items-center gap-3">
                    <div>
                      <div className="d-flex align-items-center gap-2">
                        <span className="fw-bold text-dark fs-6">Order #{ord.orderNumber}</span>
                        {getStatusBadge(ord.orderStatus)}
                      </div>
                      <div className="text-muted small" style={{ fontSize: '0.75rem' }}>
                        Placed on {new Date(ord.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })} at{' '}
                        {new Date(ord.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                  </div>

                  <div className="d-flex align-items-center gap-3">
                    <div className="text-end">
                      <div className="fs-5 fw-bold text-dark">₹{ord.totalAmount?.toLocaleString()}</div>
                      <div className="text-muted small" style={{ fontSize: '0.72rem' }}>
                        Method: <strong className="text-uppercase">{ord.paymentMethod}</strong> ({ord.paymentStatus})
                      </div>
                    </div>

                    <button
                      className="btn btn-outline-secondary btn-sm d-flex align-items-center gap-1 rounded-2"
                      onClick={() => handleDownloadInvoice(ord)}
                      title="Download Invoice"
                    >
                      <Download size={14} /> Invoice
                    </button>
                  </div>
                </div>

                {/* Tracking Progress Bar */}
                {!isCancelled && (
                  <div className="px-4 py-3 border-bottom bg-white">
                    <div className="d-flex justify-content-between align-items-center position-relative mb-1">
                      <div
                        className="position-absolute start-0 end-0 bg-light"
                        style={{ height: '4px', top: '14px', zIndex: 1 }}
                      ></div>
                      <div
                        className="position-absolute start-0 bg-primary transition-all"
                        style={{
                          height: '4px',
                          top: '14px',
                          zIndex: 2,
                          width: `${(stepIdx / 3) * 100}%`,
                          backgroundColor: '#1D4ED8',
                        }}
                      ></div>

                      {[
                        { title: 'Confirmed', icon: Check },
                        { title: 'Packed', icon: Package },
                        { title: 'Shipped', icon: Truck },
                        { title: 'Delivered', icon: CheckCircle },
                      ].map((step, idx) => {
                        const isDone = idx <= stepIdx;
                        const isCurrent = idx === stepIdx;
                        const Icon = step.icon;

                        return (
                          <div
                            key={idx}
                            className="d-flex flex-column align-items-center text-center position-relative"
                            style={{ zIndex: 3 }}
                          >
                            <div
                              className={`rounded-circle d-flex align-items-center justify-content-center ${
                                isDone ? 'text-white' : 'bg-light text-muted border'
                              }`}
                              style={{
                                width: '28px',
                                height: '28px',
                                backgroundColor: isDone ? '#1D4ED8' : '#F1F5F9',
                                boxShadow: isCurrent ? '0 0 0 4px rgba(29, 78, 216, 0.2)' : 'none',
                              }}
                            >
                              <Icon size={14} />
                            </div>
                            <span
                              className={`small mt-1 ${isDone ? 'fw-bold text-dark' : 'text-muted'}`}
                              style={{ fontSize: '0.72rem' }}
                            >
                              {step.title}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Items List */}
                <div className="p-3 d-flex flex-column gap-3">
                  {ord.items?.map((item, idx) => (
                    <div key={idx} className="d-flex flex-wrap align-items-center justify-content-between gap-3 p-2 rounded-2 bg-light">
                      <div className="d-flex align-items-center gap-3">
                        <img
                          src={
                            item.image ||
                            'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=300&auto=format&fit=crop&q=80'
                          }
                          alt={item.name}
                          style={{ width: '60px', height: '60px', objectFit: 'contain', backgroundColor: '#fff', borderRadius: '6px' }}
                        />
                        <div>
                          <div className="fw-semibold text-dark small">{item.name}</div>
                          <div className="text-muted small" style={{ fontSize: '0.75rem' }}>
                            Qty: <strong>{item.quantity}</strong> • Price: <strong>₹{item.price?.toLocaleString()}</strong>
                          </div>
                          <div className="text-muted small" style={{ fontSize: '0.7rem' }}>
                            Sold by {item.vendor?.storeName || 'TechNova Official Partner'}
                          </div>
                        </div>
                      </div>

                      <div className="d-flex align-items-center gap-2">
                        <button
                          className="btn btn-outline-primary btn-sm py-1 px-3 d-flex align-items-center gap-1 rounded-2"
                          style={{ borderColor: '#1D4ED8', color: '#1D4ED8', fontSize: '0.78rem' }}
                          onClick={() => handleBuyAgain(item)}
                        >
                          <RefreshCw size={12} /> Buy Again
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Order Footer Actions */}
                <div className="p-3 bg-white border-top d-flex flex-wrap justify-content-between align-items-center gap-2">
                  <div className="small text-muted d-flex align-items-center gap-1">
                    <MapPin size={14} className="text-secondary" />
                    <span>
                      Delivery Address: <strong>{ord.shippingAddress?.fullName}</strong>, {ord.shippingAddress?.addressLine1}, {ord.shippingAddress?.city}
                    </span>
                  </div>

                  <div className="d-flex gap-2">
                    {/* Live Tracking Modal trigger */}
                    <button
                      className="btn btn-primary btn-sm px-3 fw-semibold d-flex align-items-center gap-1 rounded-2"
                      style={{ backgroundColor: '#1D4ED8', borderColor: '#1D4ED8' }}
                      onClick={() => setActiveTrackingOrder(ord)}
                    >
                      <Truck size={14} /> Track Order
                    </button>

                    {/* Cancel Order if processing */}
                    {(ord.orderStatus === 'processing' || ord.orderStatus === 'confirmed') && (
                      <button
                        className="btn btn-outline-danger btn-sm px-3 rounded-2"
                        onClick={() => handleCancelOrder(ord._id)}
                        disabled={cancellingId === ord._id}
                      >
                        {cancellingId === ord._id ? 'Cancelling...' : 'Cancel Order'}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Live Shipment Tracking Modal */}
      {activeTrackingOrder && (
        <div
          className="modal fade show d-block"
          style={{ backgroundColor: 'rgba(15, 23, 42, 0.65)', backdropFilter: 'blur(3px)', zIndex: 1060 }}
        >
          <div className="modal-dialog modal-dialog-centered modal-lg">
            <div className="modal-content rounded-4 border-0 shadow-lg">
              <div className="modal-header border-bottom py-3 px-4 bg-light">
                <div>
                  <h5 className="modal-title fw-bold mb-0">Live Shipment Tracking</h5>
                  <small className="text-muted">Order #{activeTrackingOrder.orderNumber} • Courier: Shiprocket Express</small>
                </div>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setActiveTrackingOrder(null)}
                ></button>
              </div>
              <div className="modal-body p-4">
                <div className="p-3 rounded-3 bg-primary bg-opacity-10 mb-4 d-flex align-items-center justify-content-between">
                  <div>
                    <span className="small text-muted d-block">Estimated Delivery Date</span>
                    <strong className="fs-5 text-primary">Friday, 14 Nov by 8:00 PM</strong>
                  </div>
                  <div className="text-end">
                    <span className="small text-muted d-block">AWB Number</span>
                    <strong className="text-dark">SR78912345678IN</strong>
                  </div>
                </div>

                <h6 className="fw-bold mb-3">Courier Milestone Updates</h6>
                <div className="d-flex flex-column gap-3 ps-3 border-start border-2 border-primary ms-2">
                  <div className="position-relative">
                    <span
                      className="rounded-circle bg-primary position-absolute"
                      style={{ width: '10px', height: '10px', left: '-22px', top: '5px' }}
                    ></span>
                    <div className="fw-bold small text-dark">Out for Delivery</div>
                    <div className="text-muted small">Hub: Sector 62 Distribution Center • 08:30 AM</div>
                  </div>
                  <div className="position-relative">
                    <span
                      className="rounded-circle bg-secondary position-absolute"
                      style={{ width: '10px', height: '10px', left: '-22px', top: '5px' }}
                    ></span>
                    <div className="fw-bold small text-dark">Package Arrived at Local Facility</div>
                    <div className="text-muted small">Noida Sorting Hub • Yesterday, 09:15 PM</div>
                  </div>
                  <div className="position-relative">
                    <span
                      className="rounded-circle bg-secondary position-absolute"
                      style={{ width: '10px', height: '10px', left: '-22px', top: '5px' }}
                    ></span>
                    <div className="fw-bold small text-dark">Dispatched from Vendor Warehouse</div>
                    <div className="text-muted small">TechNova Hub, Gurgaon • 2 days ago</div>
                  </div>
                </div>
              </div>
              <div className="modal-footer border-top px-4 py-3">
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  onClick={() => setActiveTrackingOrder(null)}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyOrdersPage;
