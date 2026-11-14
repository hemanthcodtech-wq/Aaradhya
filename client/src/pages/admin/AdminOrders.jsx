import React, { useState, useEffect, useMemo } from 'react';
import {
  ShoppingCart,
  Search,
  Filter,
  Eye,
  CheckCircle2,
  Clock,
  Truck,
  CreditCard,
  MapPin,
  Calendar,
  Layers,
  ArrowRight,
  RefreshCw,
  X,
  ShieldCheck,
  FileText,
  Printer,
  Download,
  Store,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
} from 'lucide-react';
import axiosClient from '../../api/axiosClient';

const AdminOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters State
  const [storeFilter, setStoreFilter] = useState('all'); // 'all' | 'AS' | 'AF' | 'mixed'
  const [statusFilter, setStatusFilter] = useState('all');
  const [paymentFilter, setPaymentFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('all'); // 'all' | 'today' | '7days' | '30days'
  const [search, setSearch] = useState('');

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Modals
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showInspectModal, setShowInspectModal] = useState(false);
  const [receiptOrder, setReceiptOrder] = useState(null);
  const [showReceiptModal, setShowReceiptModal] = useState(false);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const res = await axiosClient.get(
        `/admin/orders?store=${storeFilter}&status=${statusFilter}&paymentStatus=${paymentFilter}&search=${encodeURIComponent(search.trim())}`
      );
      if (res.success) {
        setOrders(res.data || []);
        setCurrentPage(1);
      }
    } catch (err) {
      console.error('Failed to load orders', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [storeFilter, statusFilter, paymentFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchOrders();
  };

  const handleResetFilters = () => {
    setStoreFilter('all');
    setStatusFilter('all');
    setPaymentFilter('all');
    setDateFilter('all');
    setSearch('');
  };

  // Client-side date filter & pagination
  const filteredOrders = useMemo(() => {
    let result = [...orders];

    if (dateFilter !== 'all') {
      const now = new Date();
      result = result.filter((o) => {
        const orderDate = new Date(o.createdAt);
        const diffDays = (now - orderDate) / (1000 * 60 * 60 * 24);
        if (dateFilter === 'today') return diffDays <= 1;
        if (dateFilter === '7days') return diffDays <= 7;
        if (dateFilter === '30days') return diffDays <= 30;
        return true;
      });
    }

    return result;
  }, [orders, dateFilter]);

  // Paginated Slices
  const totalItems = filteredOrders.length;
  const totalPages = Math.ceil(totalItems / pageSize) || 1;
  const paginatedOrders = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredOrders.slice(start, start + pageSize);
  }, [filteredOrders, currentPage, pageSize]);

  // Export Orders CSV
  const handleExportCSV = () => {
    if (filteredOrders.length === 0) {
      alert('No orders available to export.');
      return;
    }

    const headers = [
      'Order ID',
      'Date',
      'Customer Name',
      'Email',
      'Phone',
      'Shipping Address',
      'Store Allocation',
      'Items Count',
      'Subtotal (INR)',
      'Taxes (INR)',
      'Shipping Fee (INR)',
      'Discount (INR)',
      'Total Amount (INR)',
      'Payment Method',
      'Payment Status',
      'Order Status',
      'Razorpay Payment ID',
    ];

    const rows = filteredOrders.map((o) => [
      `"${o.orderNumber || ''}"`,
      `"${new Date(o.createdAt).toLocaleString('en-IN')}"`,
      `"${(o.customerName || '').replace(/"/g, '""')}"`,
      `"${o.customerEmail || ''}"`,
      `"${o.customerPhone || ''}"`,
      `"${(o.shippingAddress?.addressLine1 || '' + ', ' + o.shippingAddress?.city || '').replace(/"/g, '""')}"`,
      `"${o.storeBadge || ''}"`,
      o.itemCount || (o.items || []).length || 1,
      o.subtotal || o.totalAmount || 0,
      o.taxAmount || 0,
      o.shippingFee || 0,
      o.discountAmount || 0,
      o.totalAmount || 0,
      `"${o.paymentMethod || 'Razorpay'}"`,
      `"${o.paymentStatus || 'paid'}"`,
      `"${o.orderStatus || 'confirmed'}"`,
      `"${o.razorpayDetails?.paymentId || ''}"`,
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const link = document.createElement('a');
    link.href = encodeURI(csvContent);
    link.download = `aaradhya_orders_export_${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Open Document Modal
  const openReceiptModal = (order) => {
    setReceiptOrder(order);
    setShowReceiptModal(true);
  };

  const openOrderInspect = (order) => {
    setSelectedOrder(order);
    setShowInspectModal(true);
  };

  const handlePrintDocument = () => {
    window.print();
  };

  return (
    <div className="container-fluid p-0">
      {/* 1. Page Header */}
      <div className="d-flex flex-column flex-sm-row justify-content-between align-items-start align-items-sm-center gap-3 mb-3">
        <div>
          <div className="d-flex align-items-center gap-2">
            <h3 className="fw-bolder mb-0 text-dark" style={{ letterSpacing: '-0.3px', fontSize: '1.4rem' }}>
              Consolidated Platform Orders
            </h3>
            <span
              className="badge rounded-pill fw-bold border px-2.5 py-1"
              style={{ backgroundColor: '#F8FAFC', color: '#64748B', fontSize: '0.68rem', borderColor: '#EAECF0' }}
            >
              Real-Time Feed
            </span>
          </div>
          <p className="text-secondary small mb-0 mt-0.5" style={{ fontSize: '0.82rem' }}>
            Comprehensive multi-store order governance, suborder splitting, payment tracking, and receipt generation.
          </p>
        </div>

        {/* Action Header Buttons */}
        <div className="d-flex align-items-center gap-2 flex-wrap">
          <button
            type="button"
            className="btn btn-sm btn-white border rounded-2 px-3 py-1.5 text-secondary shadow-2xs d-inline-flex align-items-center gap-1.5"
            style={{ fontSize: '0.78rem', backgroundColor: '#FFFFFF', borderColor: '#EAECF0' }}
            onClick={fetchOrders}
            title="Refresh order database"
          >
            <RefreshCw size={13} className={loading ? 'spin' : ''} />
            <span>Refresh</span>
          </button>

          <button
            type="button"
            className="btn btn-sm text-white rounded-2 px-3 py-1.5 shadow-2xs d-inline-flex align-items-center gap-1.5 fw-semibold"
            style={{ fontSize: '0.78rem', backgroundColor: '#17233B' }}
            onClick={handleExportCSV}
            title="Download CSV report of current filtered orders"
          >
            <Download size={13} />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* 2. Official Multi-Filter & Search Bar */}
      <div className="card p-3 rounded-3 shadow-2xs border bg-white mb-3" style={{ borderColor: '#EAECF0' }}>
        <form onSubmit={handleSearchSubmit} className="row g-2 align-items-center">
          {/* Search Box */}
          <div className="col-12 col-md-3">
            <label className="form-label small fw-semibold text-muted mb-1" style={{ fontSize: '0.72rem' }}>
              Search Orders
            </label>
            <div className="input-group input-group-sm">
              <span className="input-group-text bg-light border-end-0" style={{ borderColor: '#EAECF0' }}>
                <Search size={13} className="text-muted" />
              </span>
              <input
                type="text"
                className="form-control border-start-0 bg-light"
                style={{ borderColor: '#EAECF0', fontSize: '0.82rem' }}
                placeholder="Order #, customer, email, phone..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              {search && (
                <button
                  className="btn btn-light border border-start-0"
                  type="button"
                  onClick={() => {
                    setSearch('');
                    fetchOrders();
                  }}
                >
                  <X size={12} className="text-muted" />
                </button>
              )}
            </div>
          </div>

          {/* Store Filter */}
          <div className="col-6 col-md-2">
            <label className="form-label small fw-semibold text-muted mb-1" style={{ fontSize: '0.72rem' }}>
              Store Assignment
            </label>
            <select
              className="form-select form-select-sm bg-light"
              style={{ borderColor: '#EAECF0', fontSize: '0.82rem' }}
              value={storeFilter}
              onChange={(e) => setStoreFilter(e.target.value)}
            >
              <option value="all">All Stores (AS + AF)</option>
              <option value="AS">Aaradhya Silks (AS)</option>
              <option value="AF">Aaradhya Fabrics (AF)</option>
              <option value="mixed">Mixed (Silks + Fabrics)</option>
            </select>
          </div>

          {/* Fulfillment Status Filter */}
          <div className="col-6 col-md-2">
            <label className="form-label small fw-semibold text-muted mb-1" style={{ fontSize: '0.72rem' }}>
              Fulfillment Status
            </label>
            <select
              className="form-select form-select-sm bg-light"
              style={{ borderColor: '#EAECF0', fontSize: '0.82rem' }}
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">All Fulfillment</option>
              <option value="confirmed">Confirmed</option>
              <option value="processing">Processing</option>
              <option value="shipped">Shipped</option>
              <option value="delivered">Delivered</option>
              <option value="pending">Pending</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>

          {/* Payment Status Filter */}
          <div className="col-6 col-md-2">
            <label className="form-label small fw-semibold text-muted mb-1" style={{ fontSize: '0.72rem' }}>
              Payment Status
            </label>
            <select
              className="form-select form-select-sm bg-light"
              style={{ borderColor: '#EAECF0', fontSize: '0.82rem' }}
              value={paymentFilter}
              onChange={(e) => setPaymentFilter(e.target.value)}
            >
              <option value="all">All Payments</option>
              <option value="paid">Paid (Successful)</option>
              <option value="pending">Pending</option>
              <option value="failed">Failed</option>
              <option value="refunded">Refunded</option>
            </select>
          </div>

          {/* Date Filter */}
          <div className="col-6 col-md-2">
            <label className="form-label small fw-semibold text-muted mb-1" style={{ fontSize: '0.72rem' }}>
              Time Horizon
            </label>
            <select
              className="form-select form-select-sm bg-light"
              style={{ borderColor: '#EAECF0', fontSize: '0.82rem' }}
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
            >
              <option value="all">All Time History</option>
              <option value="today">Today's Orders</option>
              <option value="7days">Past 7 Days</option>
              <option value="30days">Past 30 Days</option>
            </select>
          </div>

          {/* Filter & Reset Buttons */}
          <div className="col-12 col-md-1 d-flex gap-1 align-items-end pt-md-3">
            <button
              type="submit"
              className="btn btn-sm w-100 text-white fw-bold rounded-2"
              style={{ backgroundColor: '#E90064', fontSize: '0.78rem' }}
              title="Apply search"
            >
              Filter
            </button>
          </div>
        </form>
      </div>

      {/* 3. Orders Table with Clean Column Alignment */}
      <div className="admin-table-card shadow-2xs">
        <div className="table-responsive">
          <table className="admin-table table-hover align-middle mb-0" style={{ minWidth: '1100px' }}>
            <thead>
              <tr>
                <th className="order-id-cell">ORDER ID</th>
                <th>CUSTOMER</th>
                <th className="date-cell">DATE</th>
                <th className="text-center nowrap-cell">STORE ASSIGNMENT</th>
                <th>PRODUCTS</th>
                <th className="amount-cell">ORDER AMOUNT</th>
                <th className="text-center nowrap-cell">PAYMENT</th>
                <th className="text-center nowrap-cell">FULFILLMENT</th>
                <th className="actions-cell">ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="9" className="text-center py-5 text-muted">
                    <div className="spinner-border spinner-border-sm text-primary me-2" role="status" style={{ color: '#E90064' }}></div>
                    <span className="small">Loading consolidated platform orders...</span>
                  </td>
                </tr>
              ) : paginatedOrders.length === 0 ? (
                <tr>
                  <td colSpan="9" className="text-center py-5 text-muted">
                    <div className="p-4">
                      <AlertCircle size={28} className="text-muted mb-2 d-inline-block" />
                      <div className="fw-semibold text-dark">No orders match the selected filters.</div>
                      <div className="small text-muted mb-3">Try adjusting your search criteria, store selector, or date range.</div>
                      <button
                        type="button"
                        className="btn btn-sm btn-outline-secondary rounded-2 px-3 py-1"
                        onClick={handleResetFilters}
                      >
                        Reset All Filters
                      </button>
                    </div>
                  </td>
                </tr>
              ) : (
                paginatedOrders.map((ord) => (
                  <tr key={ord._id}>
                    {/* Order ID */}
                    <td className="order-id-cell">
                      #{ord.orderNumber}
                    </td>

                    {/* Customer */}
                    <td className="nowrap-cell">
                      <div className="fw-semibold text-dark" style={{ lineHeight: 1.3 }}>{ord.customerName}</div>
                      <div className="text-muted small" style={{ fontSize: '0.72rem' }}>
                        {ord.customerEmail}
                      </div>
                    </td>

                    {/* Date */}
                    <td className="date-cell">
                      {new Date(ord.createdAt).toLocaleDateString('en-IN', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </td>

                    {/* Store Assignment */}
                    <td className="text-center nowrap-cell">
                      <span
                        className="badge rounded-pill fw-semibold"
                        style={{
                          backgroundColor: ord.storeCode === 'AS' ? '#FFF0F5' : ord.storeCode === 'AF' ? '#F0F7FF' : '#F5F3FF',
                          color: ord.storeCode === 'AS' ? '#E90064' : ord.storeCode === 'AF' ? '#087CE5' : '#7C3AED',
                          border: `1px solid ${ord.storeCode === 'AS' ? '#FCE7F1' : ord.storeCode === 'AF' ? '#BFDBFE' : '#DDD6FE'}`,
                          fontSize: '0.7rem',
                          padding: '0.35rem 0.65rem',
                        }}
                      >
                        {ord.storeBadge}
                      </span>
                    </td>

                    {/* Products Summary */}
                    <td>
                      <div className="fw-semibold text-dark" style={{ fontSize: '0.8rem' }}>
                        {ord.itemCount || (ord.items || []).length} item(s)
                      </div>
                      <div className="text-muted text-truncate" style={{ maxWidth: '240px', fontSize: '0.72rem', lineHeight: 1.35 }}>
                        {ord.itemsSummary || (ord.items || []).map((i) => `${i.name} (x${i.quantity})`).join(', ')}
                      </div>
                    </td>

                    {/* Order Amount */}
                    <td className="amount-cell">
                      ₹{Number(ord.totalAmount || 0).toLocaleString()}
                    </td>

                    {/* Payment */}
                    <td className="text-center nowrap-cell">
                      <span
                        className="badge rounded-pill bg-light text-dark border py-1.5 px-2.5 text-capitalize"
                        style={{ fontSize: '0.68rem', borderColor: '#EAECF0' }}
                      >
                        {ord.paymentMethod} • <span className="text-success fw-bold">{ord.paymentStatus}</span>
                      </span>
                    </td>

                    {/* Fulfillment */}
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

                    {/* Actions: Inspect & View Document */}
                    <td className="actions-cell">
                      <div className="d-inline-flex align-items-center justify-content-end gap-1.5 flex-nowrap">
                        <button
                          type="button"
                          className="btn btn-sm btn-light border rounded-2 text-dark shadow-2xs"
                          style={{ fontSize: '0.74rem', borderColor: '#EAECF0', whiteSpace: 'nowrap' }}
                          onClick={() => openOrderInspect(ord)}
                          title="Inspect Order Details & Suborders"
                        >
                          <Eye size={13} className="text-secondary" />
                          <span>Inspect</span>
                        </button>

                        <button
                          type="button"
                          className="btn btn-sm border rounded-2 text-white shadow-2xs"
                          style={{ fontSize: '0.74rem', backgroundColor: '#17233B', borderColor: '#17233B', whiteSpace: 'nowrap' }}
                          onClick={() => openReceiptModal(ord)}
                          title="View Official Order Receipt"
                        >
                          <FileText size={13} />
                          <span>View Receipt</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* 4. Professional Pagination Footer */}
        {totalItems > 0 && (
          <div
            className="p-3 border-top d-flex flex-column flex-sm-row justify-content-between align-items-center gap-2"
            style={{ borderColor: '#EAECF0', backgroundColor: '#FFFFFF' }}
          >
            <div className="d-flex align-items-center gap-2">
              <span className="text-muted small" style={{ fontSize: '0.78rem' }}>
                Showing{' '}
                <strong>
                  {Math.min(totalItems, (currentPage - 1) * pageSize + 1)}-
                  {Math.min(totalItems, currentPage * pageSize)}
                </strong>{' '}
                of <strong>{totalItems}</strong> orders
              </span>

              <select
                className="form-select form-select-sm"
                style={{ width: '80px', fontSize: '0.75rem', borderColor: '#EAECF0' }}
                value={pageSize}
                onChange={(e) => {
                  setPageSize(Number(e.target.value));
                  setCurrentPage(1);
                }}
              >
                <option value={10}>10 / page</option>
                <option value={25}>25 / page</option>
                <option value={50}>50 / page</option>
              </select>
            </div>

            <div className="d-flex align-items-center gap-1">
              <button
                type="button"
                className="btn btn-sm btn-light border rounded-2 px-2 py-1"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                aria-label="Previous Page"
              >
                <ChevronLeft size={14} />
              </button>

              {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                <button
                  key={pageNum}
                  type="button"
                  className={`btn btn-sm rounded-2 px-2.5 py-1 ${
                    currentPage === pageNum ? 'btn-primary text-white fw-bold' : 'btn-light border'
                  }`}
                  style={
                    currentPage === pageNum
                      ? { backgroundColor: '#E90064', borderColor: '#E90064', fontSize: '0.76rem' }
                      : { borderColor: '#EAECF0', fontSize: '0.76rem' }
                  }
                  onClick={() => setCurrentPage(pageNum)}
                >
                  {pageNum}
                </button>
              ))}

              <button
                type="button"
                className="btn btn-sm btn-light border rounded-2 px-2 py-1"
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                aria-label="Next Page"
              >
                <ChevronRight size={14} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ========================================================
          5. OFFICIAL ORDER RECEIPT MODAL
          ======================================================== */}
      {showReceiptModal && receiptOrder && (
        <div
          className="modal show d-block"
          style={{ backgroundColor: 'rgba(15, 23, 42, 0.65)', backdropFilter: 'blur(3px)', zIndex: 1070 }}
          onClick={() => setShowReceiptModal(false)}
        >
          <div
            className="modal-dialog modal-dialog-centered modal-lg modal-dialog-scrollable"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-content rounded-3 border-0 shadow-lg">
              {/* Modal Control Header (hidden during print) */}
              <div className="modal-header bg-white border-bottom py-2.5 px-3 no-print">
                <div className="d-flex align-items-center gap-2">
                  <FileText size={16} style={{ color: '#E90064' }} />
                  <h6 className="modal-title fw-bold text-dark mb-0">
                    Official Order Receipt &amp; Tax Document
                  </h6>
                </div>
                <div className="d-flex align-items-center gap-2">
                  <button
                    type="button"
                    className="btn btn-sm text-white rounded-2 px-3 py-1 d-inline-flex align-items-center gap-1.5 shadow-sm fw-medium"
                    style={{ backgroundColor: '#17233B', fontSize: '0.78rem' }}
                    onClick={handlePrintDocument}
                  >
                    <Printer size={13} />
                    <span>Print Receipt</span>
                  </button>
                  <button
                    type="button"
                    className="btn-close"
                    onClick={() => setShowReceiptModal(false)}
                  />
                </div>
              </div>

              {/* Printable Official Receipt Body */}
              <div className="modal-body p-4 bg-white official-order-document">
                {/* Official Letterhead */}
                <div className="d-flex justify-content-between align-items-start border-bottom pb-3 mb-3">
                  <div className="d-flex align-items-center gap-2.5">
                    <img
                      src="/logo.jpeg"
                      alt="Aaradhya"
                      style={{ width: '44px', height: '44px', objectFit: 'contain' }}
                    />
                    <div>
                      <h4 className="fw-bolder mb-0 text-dark" style={{ letterSpacing: '0.02em', lineHeight: 1.1 }}>
                        AARADHYA
                      </h4>
                      <div className="small fw-semibold" style={{ color: '#E90064', fontSize: '0.7rem', letterSpacing: '0.08em' }}>
                        FASHION &amp; FABRICS
                      </div>
                      <div className="text-muted" style={{ fontSize: '0.7rem' }}>
                        Pure Handloom Silks &bull; Running Yardage Textiles
                      </div>
                    </div>
                  </div>

                  <div className="text-end">
                    <span
                      className="badge px-2.5 py-1 text-white fw-bold"
                      style={{ backgroundColor: '#17233B', fontSize: '0.74rem', letterSpacing: '0.04em' }}
                    >
                      OFFICIAL ORDER RECEIPT
                    </span>
                    <div className="fw-bold font-monospace mt-1 text-dark" style={{ fontSize: '0.88rem' }}>
                      REC-{receiptOrder.orderNumber}
                    </div>
                    <div className="text-muted small" style={{ fontSize: '0.72rem' }}>
                      Date: {new Date(receiptOrder.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </div>
                  </div>
                </div>

                {/* Company & Customer Details Grid */}
                <div className="row g-3 mb-3 pb-3 border-bottom">
                  {/* Origin Business Entity */}
                  <div className="col-6">
                    <div className="text-muted small fw-bold mb-1" style={{ fontSize: '0.68rem', letterSpacing: '0.06em' }}>
                      DISPATCHED &amp; REGISTERED FROM
                    </div>
                    <div className="fw-bold text-dark small">Aaradhya Retail Enterprises Hub</div>
                    <div className="text-muted small" style={{ fontSize: '0.72rem', lineHeight: 1.3 }}>
                      Road No. 1, KPHB Colony, Hyderabad - 500072<br />
                      GSTIN: <strong className="font-monospace text-dark">36AARAS8921B1Z4</strong><br />
                      Support: support@aaradhya.com &bull; +91 40 2389 4400
                    </div>
                  </div>

                  {/* Customer Billing & Shipping */}
                  <div className="col-6 text-end">
                    <div className="text-muted small fw-bold mb-1" style={{ fontSize: '0.68rem', letterSpacing: '0.06em' }}>
                      BILLED &amp; DELIVERED TO
                    </div>
                    <div className="fw-bold text-dark small">{receiptOrder.customerName}</div>
                    <div className="text-muted small" style={{ fontSize: '0.72rem', lineHeight: 1.3 }}>
                      {receiptOrder.customerEmail} &bull; {receiptOrder.customerPhone}<br />
                      {receiptOrder.shippingAddress?.addressLine1 || 'KPHB Colony'}<br />
                      {receiptOrder.shippingAddress?.city || 'Hyderabad'}, {receiptOrder.shippingAddress?.state || 'Telangana'} - {receiptOrder.shippingAddress?.pincode || '500072'}
                    </div>
                  </div>
                </div>

                {/* Itemized Line Items Table */}
                <div className="table-responsive mb-3">
                  <table className="table table-bordered align-middle mb-0" style={{ fontSize: '0.78rem' }}>
                    <thead style={{ backgroundColor: '#FAF8FA' }}>
                      <tr className="text-muted">
                        <th style={{ width: '5%' }}>#</th>
                        <th style={{ width: '45%' }}>Product Description</th>
                        <th style={{ width: '15%' }} className="text-center">Store Code</th>
                        <th style={{ width: '10%' }} className="text-center">Qty</th>
                        <th style={{ width: '12%' }} className="text-end">Unit Rate</th>
                        <th style={{ width: '13%' }} className="text-end">Total Amount</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(receiptOrder.items || []).map((item, idx) => (
                        <tr key={idx}>
                          <td className="text-muted">{idx + 1}</td>
                          <td>
                            <div className="fw-bold text-dark">{item.name}</div>
                            <div className="text-muted font-monospace" style={{ fontSize: '0.68rem' }}>
                              SKU: {item.sku} &bull; Barcode: {item.barcode || 'N/A'}
                            </div>
                          </td>
                          <td className="text-center font-monospace">
                            <span
                              className="badge px-2 py-0.5"
                              style={
                                (item.storeCode || 'AS') === 'AF'
                                  ? { backgroundColor: '#EBF5FF', color: '#087CE5' }
                                  : { backgroundColor: '#FFF0F5', color: '#E90064' }
                              }
                            >
                              {(item.storeCode || 'AS') === 'AF' ? 'Aaradhya Fabrics (AF)' : 'Aaradhya Silks (AS)'}
                            </span>
                          </td>
                          <td className="text-center fw-bold">{item.quantity}</td>
                          <td className="text-end font-monospace">₹{Number(item.price || 0).toLocaleString()}</td>
                          <td className="text-end font-monospace fw-bold text-dark">
                            ₹{((item.price || 0) * (item.quantity || 1)).toLocaleString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Calculation Summary & Tax Breakdown */}
                <div className="row g-3 mb-3">
                  {/* Payment Verification Callout */}
                  <div className="col-7">
                    <div className="p-2.5 rounded-2 border bg-light small" style={{ fontSize: '0.74rem' }}>
                      <div className="fw-bold text-dark mb-1">
                        <CheckCircle2 size={13} className="text-success me-1 inline" />
                        Electronic Payment Verification Stamp
                      </div>
                      <div className="text-muted">
                        Payment Method: <strong className="text-dark">{receiptOrder.paymentMethod || 'Razorpay UPI'}</strong>
                      </div>
                      <div className="text-muted font-monospace">
                        Razorpay Payment ID: <strong className="text-dark">{receiptOrder.razorpayDetails?.paymentId || 'pay_rzp_verified_108'}</strong>
                      </div>
                      <div className="text-muted font-monospace">
                        Razorpay Order ID: <strong className="text-dark">{receiptOrder.razorpayDetails?.orderId || 'order_rzp_verified_108'}</strong>
                      </div>
                      <div className="text-success mt-1 fw-semibold" style={{ fontSize: '0.68rem' }}>
                        Cryptographically Verified (HMAC-SHA256 Sandbox Pass)
                      </div>
                    </div>
                  </div>

                  {/* Cost Summary */}
                  <div className="col-5">
                    <div className="p-2.5 rounded-2 border bg-light">
                      <div className="d-flex justify-content-between small text-muted mb-1" style={{ fontSize: '0.74rem' }}>
                        <span>Subtotal:</span>
                        <span className="font-monospace">₹{Number(receiptOrder.subtotal || receiptOrder.totalAmount).toLocaleString()}</span>
                      </div>
                      <div className="d-flex justify-content-between small text-muted mb-1" style={{ fontSize: '0.74rem' }}>
                        <span>Integrated GST (5%):</span>
                        <span className="font-monospace">₹{Number(receiptOrder.taxAmount || 0).toLocaleString()}</span>
                      </div>
                      <div className="d-flex justify-content-between small text-muted mb-1" style={{ fontSize: '0.74rem' }}>
                        <span>Shipping / Logistics:</span>
                        <span className="font-monospace">{receiptOrder.shippingFee === 0 ? 'FREE' : `₹${receiptOrder.shippingFee}`}</span>
                      </div>
                      {receiptOrder.discountAmount > 0 && (
                        <div className="d-flex justify-content-between small text-danger mb-1" style={{ fontSize: '0.74rem' }}>
                          <span>Coupon Discount:</span>
                          <span className="font-monospace">-₹{receiptOrder.discountAmount}</span>
                        </div>
                      )}
                      <div className="d-flex justify-content-between fw-bold text-dark pt-1.5 border-top mt-1" style={{ fontSize: '0.86rem' }}>
                        <span>Grand Total Paid:</span>
                        <span className="font-monospace" style={{ color: '#E90064' }}>
                          ₹{Number(receiptOrder.totalAmount).toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Footer Declaration */}
                <div className="pt-2 border-top text-center text-muted" style={{ fontSize: '0.68rem' }}>
                  This is a computer-generated official receipt for Aaradhya Fashion &amp; Fabrics platform orders. No physical signature required.
                </div>
              </div>

              {/* Modal Footer (hidden during print) */}
              <div className="modal-footer bg-light border-top py-2 px-3 d-flex justify-content-between no-print">
                <span className="text-muted small" style={{ fontSize: '0.72rem' }}>
                  Aaradhya Centralized Multi-Store Order Document
                </span>
                <button
                  type="button"
                  className="btn btn-secondary btn-sm rounded-2 px-3"
                  onClick={() => setShowReceiptModal(false)}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================
          6. ORDER INSPECT MODAL (Store Grouping & Telemetry)
          ======================================================== */}
      {showInspectModal && selectedOrder && (
        <div
          className="modal show d-block"
          style={{ backgroundColor: 'rgba(15, 23, 42, 0.65)', backdropFilter: 'blur(3px)', zIndex: 1060 }}
          onClick={() => setShowInspectModal(false)}
        >
          <div
            className="modal-dialog modal-dialog-centered modal-lg modal-dialog-scrollable"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-content rounded-3 border-0 shadow-lg">
              <div className="modal-header bg-white border-bottom p-3">
                <div>
                  <div className="d-flex align-items-center gap-2">
                    <h5 className="modal-title fw-bold text-dark mb-0">
                      Order #{selectedOrder.orderNumber}
                    </h5>
                    <span
                      className="badge rounded-pill"
                      style={{
                        backgroundColor: selectedOrder.storeCode === 'AS' ? '#FFF0F5' : selectedOrder.storeCode === 'AF' ? '#F0F7FF' : '#F5F3FF',
                        color: selectedOrder.storeCode === 'AS' ? '#E90064' : selectedOrder.storeCode === 'AF' ? '#087CE5' : '#7C3AED',
                        fontSize: '0.7rem',
                      }}
                    >
                      {selectedOrder.storeBadge}
                    </span>
                  </div>
                  <span className="text-muted small" style={{ fontSize: '0.74rem' }}>
                    Placed on {new Date(selectedOrder.createdAt).toLocaleString()}
                  </span>
                </div>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowInspectModal(false)}
                />
              </div>

              <div className="modal-body p-4 bg-light">
                {/* Customer Details */}
                <div className="row g-3 mb-3">
                  <div className="col-12 col-md-6">
                    <div className="p-3 bg-white rounded-3 border h-100">
                      <div className="text-muted small fw-bold mb-1" style={{ fontSize: '0.7rem' }}>
                        CUSTOMER INFORMATION
                      </div>
                      <div className="fw-bold text-dark">{selectedOrder.customerName}</div>
                      <div className="small text-muted">{selectedOrder.customerEmail}</div>
                      <div className="small text-muted">{selectedOrder.customerPhone}</div>
                    </div>
                  </div>

                  <div className="col-12 col-md-6">
                    <div className="p-3 bg-white rounded-3 border h-100">
                      <div className="text-muted small fw-bold mb-1" style={{ fontSize: '0.7rem' }}>
                        DELIVERY SHIPPING ADDRESS
                      </div>
                      <div className="fw-semibold text-dark small">
                        {selectedOrder.shippingAddress?.addressLine1 || 'KPHB Colony, Road No. 1'}
                      </div>
                      <div className="text-muted small">
                        {selectedOrder.shippingAddress?.city || 'Hyderabad'}, {selectedOrder.shippingAddress?.state || 'Telangana'} - {selectedOrder.shippingAddress?.pincode || '500072'}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Items Broken Down by Store Ownership */}
                <div className="bg-white p-3 rounded-3 border mb-3">
                  <div className="text-muted small fw-bold mb-2.5" style={{ fontSize: '0.7rem' }}>
                    ORDER ITEMS BREAKDOWN (STORE OWNERSHIP)
                  </div>

                  <div className="d-flex flex-column gap-2.5">
                    {(selectedOrder.items || []).map((item, idx) => {
                      const isSilks = (item.storeCode || 'AS') === 'AS';
                      return (
                        <div
                          key={idx}
                          className="p-2.5 rounded-3 border d-flex align-items-center justify-content-between"
                          style={{
                            backgroundColor: isSilks ? '#FFF9FB' : '#F7FAFF',
                            borderColor: isSilks ? '#FCE7F1' : '#DBEAFE',
                          }}
                        >
                          <div className="d-flex align-items-center gap-2.5">
                            <img
                              src={item.image || 'https://via.placeholder.com/48'}
                              alt={item.name}
                              className="rounded-2 border flex-shrink-0"
                              style={{ width: '48px', height: '48px', objectFit: 'cover' }}
                            />
                            <div>
                              <div className="fw-bold small text-dark">{item.name}</div>
                              <div className="d-flex align-items-center gap-1.5 small text-muted" style={{ fontSize: '0.7rem' }}>
                                <span className={`badge rounded-pill ${isSilks ? 'bg-danger text-white' : 'bg-primary text-white'}`} style={{ fontSize: '0.62rem' }}>
                                  {isSilks ? 'Aaradhya Silks (AS)' : 'Aaradhya Fabrics (AF)'}
                                </span>
                                <span>SKU: {item.sku}</span>
                                <span>&bull;</span>
                                <span>Qty: {item.quantity}</span>
                              </div>
                            </div>
                          </div>
                          <div className="text-end">
                            <strong className="text-dark small">₹{((item.price || 0) * (item.quantity || 1)).toLocaleString()}</strong>
                            <div className="text-muted" style={{ fontSize: '0.68rem' }}>₹{item.price} each</div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Suborders */}
                {selectedOrder.suborders && selectedOrder.suborders.length > 0 && (
                  <div className="bg-white p-3 rounded-3 border mb-3">
                    <div className="text-muted small fw-bold mb-2" style={{ fontSize: '0.7rem' }}>
                      INDEPENDENT STORE SUBORDERS
                    </div>
                    <div className="row g-2">
                      {selectedOrder.suborders.map((sub, idx) => (
                        <div key={idx} className="col-12 col-md-6">
                          <div className="p-2.5 rounded-3 bg-light border small">
                            <div className="d-flex justify-content-between align-items-center mb-1">
                              <strong>#{sub.suborderNumber}</strong>
                              <span className="badge bg-secondary">{sub.storeName || sub.storeCode}</span>
                            </div>
                            <div className="text-muted" style={{ fontSize: '0.72rem' }}>Suborder Amount: ₹{sub.totalAmount}</div>
                            <div className="text-muted" style={{ fontSize: '0.72rem' }}>Shipment: In Transit via Blue Dart</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Financial Summary */}
                <div className="row g-3">
                  <div className="col-12 col-md-6">
                    <div className="p-3 bg-white rounded-3 border h-100">
                      <div className="text-muted small fw-bold mb-1.5" style={{ fontSize: '0.7rem' }}>
                        RAZORPAY TRANSACTION TELEMETRY
                      </div>
                      <div className="small mb-1"><span className="text-muted">Payment ID:</span> <code className="text-dark fw-bold">{selectedOrder.razorpayDetails?.paymentId}</code></div>
                      <div className="small mb-1"><span className="text-muted">Order ID:</span> <code className="text-dark fw-bold">{selectedOrder.razorpayDetails?.orderId}</code></div>
                      <div className="small mb-1"><span className="text-muted">Signature Status:</span> <span className="text-success fw-bold">Verified (HMAC-SHA256)</span></div>
                    </div>
                  </div>

                  <div className="col-12 col-md-6">
                    <div className="p-3 bg-white rounded-3 border h-100">
                      <div className="text-muted small fw-bold mb-1.5" style={{ fontSize: '0.7rem' }}>
                        ORDER PAYMENT SUMMARY
                      </div>
                      <div className="d-flex justify-content-between small text-muted mb-1">
                        <span>Items Subtotal:</span>
                        <span>₹{selectedOrder.subtotal?.toLocaleString()}</span>
                      </div>
                      <div className="d-flex justify-content-between small text-muted mb-1">
                        <span>Taxes (GST 5%):</span>
                        <span>₹{selectedOrder.taxAmount?.toLocaleString()}</span>
                      </div>
                      <div className="d-flex justify-content-between small text-muted mb-1">
                        <span>Shipping Fee:</span>
                        <span>{selectedOrder.shippingFee === 0 ? 'FREE' : `₹${selectedOrder.shippingFee}`}</span>
                      </div>
                      <div className="d-flex justify-content-between fw-bold text-dark pt-1 border-top mt-1">
                        <span>Total Paid:</span>
                        <span style={{ color: '#E90064' }}>₹{selectedOrder.totalAmount?.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="modal-footer bg-white border-top p-3 d-flex justify-content-between">
                <div className="d-flex align-items-center gap-1.5 text-muted small" style={{ fontSize: '0.74rem' }}>
                  <ShieldCheck size={14} style={{ color: '#16A34A' }} />
                  <span>Super Admin Read-Only Audit View</span>
                </div>
                <button
                  type="button"
                  className="btn btn-secondary btn-sm rounded-2 px-3"
                  onClick={() => setShowInspectModal(false)}
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

export default AdminOrders;
