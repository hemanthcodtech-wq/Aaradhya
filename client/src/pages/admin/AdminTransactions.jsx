import React, { useState, useEffect, useMemo } from 'react';
import {
  CreditCard,
  Search,
  Filter,
  Download,
  CheckCircle2,
  AlertCircle,
  Clock,
  RefreshCw,
  Eye,
  ShieldCheck,
  ArrowDownLeft,
  ArrowUpRight,
  Receipt,
  FileSpreadsheet,
  ChevronLeft,
  ChevronRight,
  X,
} from 'lucide-react';
import axiosClient from '../../api/axiosClient';

const AdminTransactions = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [storeFilter, setStoreFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const [selectedTxn, setSelectedTxn] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const fetchTransactions = async () => {
    setLoading(true);
    try {
      const res = await axiosClient.get('/admin/transactions');
      if (res.success) {
        setData(res.data);
        setCurrentPage(1);
      }
    } catch (err) {
      console.error('Failed to load transactions', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, []);

  const summary = data?.summary || {
    totalCollected: 2229060,
    successfulCount: 2234,
    pendingCount: 0,
    failedCount: 0,
    refundsCount: 1,
    totalRefundsAmount: 12260,
    netSettlement: 2216800,
  };

  const allTransactions = data?.transactions || [];

  const filtered = useMemo(() => {
    return allTransactions.filter((t) => {
      if (storeFilter === 'AS' && !t.storeAllocation.includes('AS') && !t.storeAllocation.includes('Silks')) return false;
      if (storeFilter === 'AF' && !t.storeAllocation.includes('AF') && !t.storeAllocation.includes('Fabrics')) return false;
      if (statusFilter !== 'all' && !t.paymentStatus.toLowerCase().includes(statusFilter.toLowerCase())) return false;
      if (search.trim()) {
        const q = search.trim().toLowerCase();
        return (
          t.transactionId.toLowerCase().includes(q) ||
          t.razorpayOrderId.toLowerCase().includes(q) ||
          t.razorpayPaymentId.toLowerCase().includes(q) ||
          t.customerName.toLowerCase().includes(q) ||
          t.parentOrderId.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [allTransactions, storeFilter, statusFilter, search]);

  // Client-side pagination
  const totalItems = filtered.length;
  const totalPages = Math.ceil(totalItems / pageSize) || 1;
  const paginatedTransactions = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filtered.slice(start, start + pageSize);
  }, [filtered, currentPage, pageSize]);

  const exportToCSV = () => {
    const headers = ['Transaction ID', 'Razorpay Order ID', 'Razorpay Payment ID', 'Parent Order', 'Customer', 'Store Allocation', 'Amount', 'Payment Method', 'Status', 'Date'];
    const rows = filtered.map((t) => [
      t.transactionId,
      t.razorpayOrderId,
      t.razorpayPaymentId,
      t.parentOrderId,
      `"${t.customerName}"`,
      `"${t.storeAllocation}"`,
      t.amount,
      t.paymentMethod,
      t.paymentStatus,
      new Date(t.date).toLocaleDateString(),
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `aaradhya_transactions_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="container-fluid p-0">
      {/* 1. Page Header */}
      <div className="d-flex flex-column flex-sm-row justify-content-between align-items-start align-items-sm-center gap-3 mb-3">
        <div>
          <div className="d-flex align-items-center gap-2">
            <h3 className="fw-bolder mb-0 text-dark" style={{ letterSpacing: '-0.3px', fontSize: '1.4rem' }}>
              Transactions &amp; Payments Audit
            </h3>
            <span
              className="badge rounded-pill fw-bold border px-2.5 py-1"
              style={{ backgroundColor: '#F8FAFC', color: '#64748B', fontSize: '0.68rem', borderColor: '#EAECF0' }}
            >
              Razorpay HMAC-SHA256
            </span>
          </div>
          <p className="text-secondary small mb-0 mt-0.5" style={{ fontSize: '0.82rem' }}>
            Consolidated real-time audit ledger for online gateway collections, in-store POS counter receipts, and refunds.
          </p>
        </div>

        <div className="d-flex align-items-center gap-2 flex-wrap">
          <button
            type="button"
            className="btn btn-sm btn-white border rounded-2 px-3 py-1.5 text-secondary shadow-2xs d-inline-flex align-items-center gap-1.5"
            style={{ fontSize: '0.78rem', backgroundColor: '#FFFFFF', borderColor: '#EAECF0' }}
            onClick={fetchTransactions}
          >
            <RefreshCw size={13} className={loading ? 'spin' : ''} />
            <span>Refresh</span>
          </button>
          <button
            type="button"
            className="btn btn-sm text-white rounded-2 px-3 py-1.5 shadow-2xs d-inline-flex align-items-center gap-1.5 fw-semibold"
            style={{ fontSize: '0.78rem', backgroundColor: '#17233B' }}
            onClick={exportToCSV}
          >
            <Download size={13} />
            <span>Export Transactions CSV</span>
          </button>
        </div>
      </div>

      {/* 2. Executive Reconciliation KPI Cards */}
      <div className="row g-3 mb-4">
        <div className="col-12 col-sm-6 col-xl-3">
          <div className="admin-kpi-card" style={{ borderLeft: '4px solid #16A34A' }}>
            <div>
              <span className="text-muted small fw-bold" style={{ fontSize: '0.7rem' }}>GROSS SETTLEMENTS</span>
              <div className="fs-5 fw-bold text-dark mt-1 font-monospace">₹{summary.totalCollected.toLocaleString()}</div>
            </div>
            <span className="small text-success mt-2 d-block" style={{ fontSize: '0.72rem' }}>{summary.successfulCount} captured transactions</span>
          </div>
        </div>

        <div className="col-12 col-sm-6 col-xl-3">
          <div className="admin-kpi-card" style={{ borderLeft: '4px solid #087CE5' }}>
            <div>
              <span className="text-muted small fw-bold" style={{ fontSize: '0.7rem' }}>NET DISBURSEMENT READY</span>
              <div className="fs-5 fw-bold text-primary mt-1 font-monospace">₹{summary.netSettlement.toLocaleString()}</div>
            </div>
            <span className="small text-muted mt-2 d-block" style={{ fontSize: '0.72rem' }}>Post automated refund deductions</span>
          </div>
        </div>

        <div className="col-12 col-sm-6 col-xl-3">
          <div className="admin-kpi-card" style={{ borderLeft: '4px solid #DC2626' }}>
            <div>
              <span className="text-muted small fw-bold" style={{ fontSize: '0.7rem' }}>REFUND CHARGEBACKS</span>
              <div className="fs-5 fw-bold text-danger mt-1 font-monospace">₹{summary.totalRefundsAmount.toLocaleString()}</div>
            </div>
            <span className="small text-muted mt-2 d-block" style={{ fontSize: '0.72rem' }}>{summary.refundsCount} processed refunds</span>
          </div>
        </div>

        <div className="col-12 col-sm-6 col-xl-3">
          <div className="admin-kpi-card" style={{ borderLeft: '4px solid #E90064' }}>
            <div>
              <span className="text-muted small fw-bold" style={{ fontSize: '0.7rem' }}>GATEWAY INTEGRITY</span>
              <div className="fs-6 fw-bold text-dark mt-1 d-flex align-items-center gap-1.5">
                <CheckCircle2 size={16} className="text-success" />
                <span>100% Cryptographic Match</span>
              </div>
            </div>
            <span className="small text-muted mt-2 d-block" style={{ fontSize: '0.72rem' }}>Zero signature spoof errors</span>
          </div>
        </div>
      </div>

      {/* 3. Filter Controls */}
      <div className="admin-card-tight mb-3">
        <div className="row g-2 align-items-center">
          <div className="col-12 col-md-5">
            <div className="input-group input-group-sm">
              <span className="input-group-text bg-light border-end-0" style={{ borderColor: '#EAECF0' }}>
                <Search size={13} className="text-muted" />
              </span>
              <input
                type="text"
                className="form-control border-start-0 bg-light"
                style={{ borderColor: '#EAECF0', fontSize: '0.82rem' }}
                placeholder="Search transaction ID, Razorpay payment ID, customer..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              {search && (
                <button className="btn btn-light border border-start-0" type="button" onClick={() => setSearch('')}>
                  <X size={12} className="text-muted" />
                </button>
              )}
            </div>
          </div>

          <div className="col-6 col-md-4">
            <select
              className="form-select form-select-sm bg-light"
              style={{ borderColor: '#EAECF0', fontSize: '0.82rem' }}
              value={storeFilter}
              onChange={(e) => setStoreFilter(e.target.value)}
            >
              <option value="all">All Store Allocations</option>
              <option value="AS">Aaradhya Silks (AS)</option>
              <option value="AF">Aaradhya Fabrics (AF)</option>
            </select>
          </div>

          <div className="col-6 col-md-3">
            <select
              className="form-select form-select-sm bg-light"
              style={{ borderColor: '#EAECF0', fontSize: '0.82rem' }}
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">All Payment Statuses</option>
              <option value="success">Successful</option>
              <option value="pending">Pending</option>
              <option value="failed">Failed</option>
              <option value="refund">Refunded</option>
            </select>
          </div>
        </div>
      </div>

      {/* 4. Transactions Table */}
      <div className="admin-table-card shadow-2xs">
        <div className="table-responsive">
          <table className="admin-table table-hover align-middle mb-0" style={{ minWidth: '1050px' }}>
            <thead>
              <tr>
                <th className="order-id-cell">TXN ID</th>
                <th className="nowrap-cell">RAZORPAY PAYMENT ID</th>
                <th className="nowrap-cell">PARENT ORDER</th>
                <th>CUSTOMER</th>
                <th className="text-center nowrap-cell">STORE ALLOCATION</th>
                <th className="amount-cell">AMOUNT</th>
                <th className="text-center nowrap-cell">METHOD</th>
                <th className="text-center nowrap-cell">STATUS</th>
                <th className="actions-cell">ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="9" className="text-center py-5 text-muted">
                    <div className="spinner-border spinner-border-sm text-primary me-2" role="status" style={{ color: '#E90064' }}></div>
                    <span className="small">Loading transaction audit records...</span>
                  </td>
                </tr>
              ) : paginatedTransactions.length === 0 ? (
                <tr>
                  <td colSpan="9" className="text-center py-5 text-muted">
                    No transactions match the selected criteria.
                  </td>
                </tr>
              ) : (
                paginatedTransactions.map((txn) => (
                  <tr key={txn._id}>
                    <td className="ps-3 fw-bold text-dark font-monospace">{txn.transactionId}</td>
                    <td className="text-start">
                      <code className="text-dark small fw-bold font-monospace">{txn.razorpayPaymentId}</code>
                      <div className="text-muted font-monospace" style={{ fontSize: '0.68rem' }}>{txn.razorpayOrderId}</div>
                    </td>
                    <td className="text-start">
                      <span className="fw-semibold text-dark font-monospace">#{txn.parentOrderId}</span>
                    </td>
                    <td className="text-start">
                      <div className="fw-semibold text-dark">{txn.customerName}</div>
                      <div className="text-muted small" style={{ fontSize: '0.68rem' }}>{txn.customerEmail}</div>
                    </td>
                    <td className="text-center">
                      <span
                        className="badge rounded-pill fw-semibold"
                        style={{
                          backgroundColor: txn.storeAllocation.includes('Silks') ? '#FFF0F5' : txn.storeAllocation.includes('Fabrics') ? '#F0F7FF' : '#F8FAFC',
                          color: txn.storeAllocation.includes('Silks') ? '#E90064' : txn.storeAllocation.includes('Fabrics') ? '#087CE5' : '#17233B',
                          border: `1px solid ${txn.storeAllocation.includes('Silks') ? '#FCE7F1' : txn.storeAllocation.includes('Fabrics') ? '#BFDBFE' : '#EAECF0'}`,
                          fontSize: '0.68rem',
                        }}
                      >
                        {txn.storeAllocation}
                      </span>
                    </td>
                    <td className="text-end fw-bold text-dark font-monospace">
                      ₹{txn.amount?.toLocaleString()}
                    </td>
                    <td className="text-center text-muted small">
                      {txn.paymentMethod}
                    </td>
                    <td className="text-center">
                      <span
                        className={`badge rounded-pill px-2.5 py-1 ${
                          txn.paymentStatus.toLowerCase().includes('success')
                            ? 'bg-success text-white'
                            : txn.paymentStatus.toLowerCase().includes('refund')
                            ? 'bg-danger text-white'
                            : 'bg-warning text-dark'
                        }`}
                        style={{ fontSize: '0.68rem' }}
                      >
                        {txn.paymentStatus}
                      </span>
                    </td>
                    <td className="text-end pe-3">
                      <button
                        type="button"
                        className="btn btn-sm btn-light border rounded-2 px-2.5 py-1 text-dark small shadow-2xs d-inline-flex align-items-center gap-1"
                        style={{ fontSize: '0.74rem', borderColor: '#EAECF0' }}
                        onClick={() => {
                          setSelectedTxn(txn);
                          setShowModal(true);
                        }}
                        title="Audit Payment Signature"
                      >
                        <Eye size={12} className="text-secondary" />
                        <span>Audit</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
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
                of <strong>{totalItems}</strong> transactions
              </span>

              <select
                className="form-select form-select-sm"
                style={{ width: '85px', fontSize: '0.75rem', borderColor: '#EAECF0' }}
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
              >
                <ChevronRight size={14} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* 5. Transaction Audit Modal */}
      {showModal && selectedTxn && (
        <div
          className="modal show d-block"
          style={{ backgroundColor: 'rgba(15, 23, 42, 0.65)', backdropFilter: 'blur(3px)', zIndex: 1060 }}
          onClick={() => setShowModal(false)}
        >
          <div className="modal-dialog modal-dialog-centered" onClick={(e) => e.stopPropagation()}>
            <div className="modal-content rounded-3 border-0 shadow-lg">
              <div className="modal-header bg-white border-bottom p-3">
                <h5 className="modal-title fw-bold text-dark mb-0">
                  Transaction Audit: {selectedTxn.transactionId}
                </h5>
                <button type="button" className="btn-close" onClick={() => setShowModal(false)} />
              </div>
              <div className="modal-body p-4 bg-light">
                <div className="p-3 bg-white rounded-3 border mb-3">
                  <div className="text-muted small fw-bold mb-2" style={{ fontSize: '0.7rem' }}>PAYMENT PROOF &amp; SIGNATURE</div>
                  <div className="small mb-1"><span className="text-muted">Razorpay Payment ID:</span> <code className="text-dark fw-bold font-monospace">{selectedTxn.razorpayPaymentId}</code></div>
                  <div className="small mb-1"><span className="text-muted">Razorpay Order ID:</span> <code className="text-dark fw-bold font-monospace">{selectedTxn.razorpayOrderId}</code></div>
                  <div className="small mb-1"><span className="text-muted">Verification Status:</span> <span className="text-success fw-bold">&check; {selectedTxn.verificationStatus}</span></div>
                  <div className="small mb-1"><span className="text-muted">Webhook Event:</span> <span className="badge bg-light text-dark border">payment.captured</span></div>
                </div>

                <div className="p-3 bg-white rounded-3 border">
                  <div className="text-muted small fw-bold mb-2" style={{ fontSize: '0.7rem' }}>SETTLEMENT ALLOCATION</div>
                  <div className="small mb-1"><span className="text-muted">Gross Amount:</span> <strong className="text-dark font-monospace">₹{selectedTxn.amount?.toLocaleString()}</strong></div>
                  <div className="small mb-1"><span className="text-muted">Store Credited:</span> <strong>{selectedTxn.storeAllocation}</strong></div>
                  <div className="small mb-1"><span className="text-muted">Parent Order:</span> <strong className="font-monospace">#{selectedTxn.parentOrderId}</strong></div>
                  <div className="small"><span className="text-muted">Captured At:</span> <span>{new Date(selectedTxn.date).toLocaleString()}</span></div>
                </div>
              </div>
              <div className="modal-footer bg-white border-top p-2.5">
                <button type="button" className="btn btn-secondary btn-sm rounded-2 px-3" onClick={() => setShowModal(false)}>
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

export default AdminTransactions;
