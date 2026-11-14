import React, { useState, useEffect, useMemo } from 'react';
import {
  Users,
  Search,
  Eye,
  Mail,
  Phone,
  Calendar,
  ShoppingBag,
  IndianRupee,
  ShieldCheck,
  Download,
  RefreshCw,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  Filter,
} from 'lucide-react';
import axiosClient from '../../api/axiosClient';

const AdminCustomers = () => {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedCustomer, setSelectedCustomer] = useState(null);

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const fetchCustomers = async () => {
    setLoading(true);
    try {
      const res = await axiosClient.get('/admin/customers');
      if (res.success) {
        setCustomers(res.data);
        setCurrentPage(1);
      }
    } catch (err) {
      console.error('Failed to fetch customers', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  const handleExportCSV = () => {
    if (customers.length === 0) return;
    const headers = ['Customer Name', 'Email', 'Phone', 'Registered Date', 'Total Orders', 'Total Spend (INR)', 'Status'];
    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [
        headers.join(','),
        ...customers.map((c) =>
          [
            `"${c.name || ''}"`,
            `"${c.email || ''}"`,
            `"${c.phone || ''}"`,
            `"${c.registrationDate ? c.registrationDate.slice(0, 10) : ''}"`,
            c.totalOrders || 0,
            c.totalSpending || 0,
            `"${c.accountStatus || 'Active'}"`,
          ].join(',')
        ),
      ].join('\n');

    const link = document.createElement('a');
    link.href = encodeURI(csvContent);
    link.download = `aaradhya_customers_${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filtered = useMemo(() => {
    return customers.filter((c) => {
      if (statusFilter !== 'all' && (c.accountStatus || 'Active').toLowerCase() !== statusFilter.toLowerCase()) {
        return false;
      }
      if (search.trim()) {
        const q = search.trim().toLowerCase();
        return (
          (c.name || '').toLowerCase().includes(q) ||
          (c.email || '').toLowerCase().includes(q) ||
          (c.phone || '').includes(q)
        );
      }
      return true;
    });
  }, [customers, statusFilter, search]);

  const totalItems = filtered.length;
  const totalPages = Math.ceil(totalItems / pageSize) || 1;
  const paginatedCustomers = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filtered.slice(start, start + pageSize);
  }, [filtered, currentPage, pageSize]);

  const totalRegistered = customers.length;
  const totalOrdersPlaced = customers.reduce((sum, c) => sum + (c.totalOrders || 0), 0);
  const totalCustomerSpend = customers.reduce((sum, c) => sum + (c.totalSpending || 0), 0);
  const avgOrderValue = totalOrdersPlaced > 0 ? Math.round(totalCustomerSpend / totalOrdersPlaced) : 0;

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
              CUSTOMER INTELLIGENCE
            </span>
            <span
              className="badge px-2 py-0.5 fw-semibold"
              style={{ backgroundColor: '#EBF5FF', color: '#087CE5', border: '1px solid #BFDBFE', fontSize: '0.7rem' }}
            >
              Unified Profile &amp; LTV
            </span>
          </div>
          <h2 className="fw-bolder mb-0" style={{ color: '#17233B' }}>
            Customer Directory &amp; Lifetime Value
          </h2>
          <p className="text-muted small mb-0">
            View cross-store buyer profiles, lifetime order history, and shopping telemetry across Silks and Fabrics.
          </p>
        </div>

        <div className="d-flex align-items-center gap-2">
          <button
            onClick={fetchCustomers}
            className="btn btn-sm btn-outline-secondary d-flex align-items-center gap-1.5 px-3 py-2 rounded-2"
          >
            <RefreshCw size={14} className={loading ? 'spin' : ''} />
            <span>Refresh</span>
          </button>
          <button
            onClick={handleExportCSV}
            className="btn btn-sm text-white d-flex align-items-center gap-1.5 px-3 py-2 rounded-2 shadow-sm"
            style={{ backgroundColor: '#17233B' }}
          >
            <Download size={14} />
            <span>Export Customers CSV</span>
          </button>
        </div>
      </div>

      {/* 2. KPI Cards */}
      <div className="row g-3 mb-4">
        <div className="col-6 col-md-3">
          <div className="admin-kpi-card">
            <div>
              <span className="text-muted small fw-bold" style={{ fontSize: '0.7rem' }}>REGISTERED SHOPPERS</span>
              <div className="fs-4 fw-bolder mt-1" style={{ color: '#17233B' }}>
                {totalRegistered}
              </div>
            </div>
            <span className="small text-muted mt-2 d-block" style={{ fontSize: '0.72rem' }}>Verified Accounts</span>
          </div>
        </div>
        <div className="col-6 col-md-3">
          <div className="admin-kpi-card">
            <div>
              <span className="text-muted small fw-bold" style={{ fontSize: '0.7rem' }}>CUMULATIVE ORDERS</span>
              <div className="fs-4 fw-bolder mt-1 text-primary">
                {totalOrdersPlaced}
              </div>
            </div>
            <span className="small text-muted mt-2 d-block" style={{ fontSize: '0.72rem' }}>Online &amp; POS Orders</span>
          </div>
        </div>
        <div className="col-6 col-md-3">
          <div className="admin-kpi-card">
            <div>
              <span className="text-muted small fw-bold" style={{ fontSize: '0.7rem' }}>GROSS CUSTOMER SPEND</span>
              <div className="fs-4 fw-bolder mt-1" style={{ color: '#E90064' }}>
                ₹{totalCustomerSpend.toLocaleString()}
              </div>
            </div>
            <span className="small text-muted mt-2 d-block" style={{ fontSize: '0.72rem' }}>Lifetime Platform GMV</span>
          </div>
        </div>
        <div className="col-6 col-md-3">
          <div className="admin-kpi-card">
            <div>
              <span className="text-muted small fw-bold" style={{ fontSize: '0.7rem' }}>AVG ORDER VALUE (AOV)</span>
              <div className="fs-4 fw-bolder mt-1 text-success">
                ₹{avgOrderValue.toLocaleString()}
              </div>
            </div>
            <span className="small text-muted mt-2 d-block" style={{ fontSize: '0.72rem' }}>Per Customer Checkout</span>
          </div>
        </div>
      </div>

      {/* 3. Search & Filter Bar */}
      <div className="admin-card-tight mb-3">
        <div className="row g-2 align-items-center">
          <div className="col-12 col-md-5">
            <div className="input-group input-group-sm">
              <span className="input-group-text bg-white text-muted">
                <Search size={14} />
              </span>
              <input
                type="text"
                className="form-control"
                placeholder="Search by customer name, email address, or mobile number..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setCurrentPage(1);
                }}
              />
              {search && (
                <button
                  className="btn btn-outline-secondary"
                  type="button"
                  onClick={() => {
                    setSearch('');
                    setCurrentPage(1);
                  }}
                >
                  Clear
                </button>
              )}
            </div>
          </div>

          <div className="col-12 col-md-3">
            <select
              className="form-select form-select-sm"
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setCurrentPage(1);
              }}
            >
              <option value="all">All Account Statuses</option>
              <option value="Active">Active Customers</option>
              <option value="Inactive">Inactive Customers</option>
            </select>
          </div>

          <div className="col-12 col-md-4 text-md-end text-muted small">
            Displaying <strong>{filtered.length}</strong> registered customer accounts
          </div>
        </div>
      </div>

      {/* 4. Customers Table */}
      <div className="admin-table-card shadow-2xs">
        <div className="table-responsive">
          <table className="admin-table table-hover align-middle mb-0" style={{ minWidth: '950px' }}>
            <thead>
              <tr>
                <th>Customer Profile</th>
                <th className="nowrap-cell">Contact Info</th>
                <th className="date-cell">Registered On</th>
                <th className="text-center nowrap-cell">Total Orders</th>
                <th className="amount-cell">Total Spending</th>
                <th className="date-cell">Last Order</th>
                <th className="text-center nowrap-cell">Status</th>
                <th className="actions-cell">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="8" className="text-center py-5 text-muted">
                    <div className="spinner-border spinner-border-sm text-primary me-2" role="status" />
                    Loading customer accounts...
                  </td>
                </tr>
              ) : paginatedCustomers.length === 0 ? (
                <tr>
                  <td colSpan="8" className="text-center py-5 text-muted">
                    No customers found matching search criteria.
                  </td>
                </tr>
              ) : (
                paginatedCustomers.map((c) => (
                  <tr key={c._id}>
                    {/* Name & Initials Avatar */}
                    <td className="ps-3">
                      <div className="d-flex align-items-center gap-2.5">
                        <div
                          className="rounded-circle d-flex align-items-center justify-content-center text-white fw-bold shadow-2xs flex-shrink-0"
                          style={{
                            width: '38px',
                            height: '38px',
                            backgroundColor: '#17233B',
                            fontSize: '0.85rem',
                          }}
                        >
                          {(c.name || 'C').charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div className="fw-bold" style={{ color: '#17233B' }}>{c.name || 'Valued Shopper'}</div>
                          <span className="badge bg-light text-muted border font-monospace" style={{ fontSize: '0.68rem' }}>
                            ID: {c._id.slice(-6)}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Contact */}
                    <td>
                      <div className="d-flex align-items-center gap-1.5 text-muted small">
                        <Mail size={12} className="text-secondary" />
                        <span>{c.email}</span>
                      </div>
                      <div className="d-flex align-items-center gap-1.5 text-muted small mt-0.5">
                        <Phone size={12} className="text-secondary" />
                        <span>{c.phone || '+91 98765 43210'}</span>
                      </div>
                    </td>

                    {/* Registered On */}
                    <td className="text-muted small font-monospace">
                      {c.registrationDate ? new Date(c.registrationDate).toLocaleDateString('en-IN') : 'N/A'}
                    </td>

                    {/* Total Orders */}
                    <td className="text-center">
                      <span className="badge rounded-pill bg-light text-dark border px-2.5 py-1 font-monospace fw-bold">
                        {c.totalOrders || 0} orders
                      </span>
                    </td>

                    {/* Total Spending */}
                    <td className="text-end fw-bold" style={{ color: '#17233B' }}>
                      ₹{(c.totalSpending || 0).toLocaleString()}
                    </td>

                    {/* Last Order */}
                    <td className="text-muted small font-monospace">
                      {c.lastPurchase ? new Date(c.lastPurchase).toLocaleDateString('en-IN') : 'None'}
                    </td>

                    {/* Status */}
                    <td className="text-center">
                      <span
                        className={`badge px-2 py-0.5 rounded-pill ${
                          c.accountStatus === 'Active' ? 'bg-success-subtle text-success' : 'bg-secondary-subtle text-secondary'
                        }`}
                      >
                        {c.accountStatus || 'Active'}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="pe-3 text-center">
                      <button
                        className="btn btn-sm btn-light p-1.5 rounded-2"
                        onClick={() => setSelectedCustomer(c)}
                        title="View Customer Order History"
                      >
                        <Eye size={14} className="text-muted" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Controls Footer */}
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
                of <strong>{totalItems}</strong> customers
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

      {/* 5. Customer Order History Modal */}
      {selectedCustomer && (
        <div
          className="modal fade show d-block"
          tabIndex="-1"
          style={{ backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1050 }}
        >
          <div className="modal-dialog modal-dialog-centered modal-lg">
            <div className="modal-content rounded-3 border-0 shadow-lg">
              <div className="modal-header border-bottom py-3">
                <div className="d-flex align-items-center gap-2">
                  <div
                    className="rounded-circle d-flex align-items-center justify-content-center text-white fw-bold"
                    style={{ width: '36px', height: '36px', backgroundColor: '#17233B' }}
                  >
                    {(selectedCustomer.name || 'C').charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h5 className="modal-title fw-bold mb-0" style={{ color: '#17233B' }}>
                      {selectedCustomer.name}
                    </h5>
                    <span className="small text-muted">{selectedCustomer.email} &bull; {selectedCustomer.phone}</span>
                  </div>
                </div>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setSelectedCustomer(null)}
                />
              </div>

              <div className="modal-body p-4">
                <div className="row g-3 mb-4">
                  <div className="col-4">
                    <div className="p-3 bg-light rounded-2 text-center">
                      <span className="text-muted small">Total Orders</span>
                      <div className="fs-5 fw-bold text-dark mt-1">{selectedCustomer.totalOrders || 0}</div>
                    </div>
                  </div>
                  <div className="col-4">
                    <div className="p-3 bg-light rounded-2 text-center">
                      <span className="text-muted small">Lifetime Spend</span>
                      <div className="fs-5 fw-bold text-primary mt-1">₹{(selectedCustomer.totalSpending || 0).toLocaleString()}</div>
                    </div>
                  </div>
                  <div className="col-4">
                    <div className="p-3 bg-light rounded-2 text-center">
                      <span className="text-muted small">Customer Status</span>
                      <div className="fs-6 fw-bold text-success mt-1">{selectedCustomer.accountStatus || 'Active'}</div>
                    </div>
                  </div>
                </div>

                <h6 className="fw-bold mb-2" style={{ color: '#17233B' }}>
                  Order History &amp; Store Purchases
                </h6>

                {(!selectedCustomer.orders || selectedCustomer.orders.length === 0) ? (
                  <div className="p-4 text-center text-muted border rounded-2">
                    No online orders placed yet by this customer.
                  </div>
                ) : (
                  <div className="table-responsive">
                    <table className="table table-sm table-hover align-middle mb-0" style={{ fontSize: '0.82rem' }}>
                      <thead style={{ backgroundColor: '#FAF8FA' }}>
                        <tr>
                          <th>Order #</th>
                          <th>Date</th>
                          <th>Items</th>
                          <th className="text-end">Amount</th>
                          <th className="text-center">Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {selectedCustomer.orders.map((o) => (
                          <tr key={o._id}>
                            <td className="fw-bold font-monospace text-primary">#{o.orderNumber || o._id.slice(-6)}</td>
                            <td className="text-muted font-monospace">{new Date(o.createdAt).toLocaleDateString('en-IN')}</td>
                            <td className="text-truncate" style={{ maxWidth: '240px' }}>
                              {(o.items || []).map((i) => i.name).join(', ') || 'Aaradhya Products'}
                            </td>
                            <td className="text-end fw-bold">₹{(o.totalAmount || 0).toLocaleString()}</td>
                            <td className="text-center">
                              <span className="badge bg-success-subtle text-success px-2 py-0.5 rounded-pill">
                                {o.orderStatus || 'Delivered'}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              <div className="modal-footer border-top bg-light py-2">
                <button
                  type="button"
                  className="btn btn-secondary btn-sm rounded-2 px-3"
                  onClick={() => setSelectedCustomer(null)}
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

export default AdminCustomers;
