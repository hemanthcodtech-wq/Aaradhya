import React, { useState, useEffect, useMemo } from 'react';
import {
  Wallet,
  CheckCircle2,
  Clock,
  ArrowUpRight,
  ArrowDownLeft,
  DollarSign,
  RefreshCw,
  Building,
  Store,
  ShieldCheck,
  Check,
  X,
  CreditCard,
  FileText,
  Search,
  Download,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { FaGem, FaScroll } from 'react-icons/fa6';
import AnimatedFaIcon from '../../components/common/AnimatedFaIcon';
import axiosClient from '../../api/axiosClient';

const AdminWallets = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [payoutLoading, setPayoutLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('wallets'); // 'wallets' | 'ledger' | 'payouts'
  const [ledgerStoreFilter, setLedgerStoreFilter] = useState('all');

  const fetchWallets = async () => {
    setLoading(true);
    try {
      const res = await axiosClient.get('/admin/wallets');
      if (res.success) {
        setData(res.data);
      }
    } catch (err) {
      console.error('Failed to load wallets data', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWallets();
  }, []);

  const handlePayoutAction = async (payoutId, action) => {
    const ref = prompt('Enter Bank Reference / NEFT UTR Number for this disbursement:', `NEFT-SBI-${Date.now().toString().slice(-6)}`);
    if (ref === null) return;

    setPayoutLoading(true);
    try {
      const res = await axiosClient.put(`/admin/wallets/payouts/${payoutId}/action`, {
        action,
        paymentReference: ref,
      });
      if (res.success) {
        alert(`Payout ${action === 'approve' ? 'Approved & Ledger Recorded' : 'Rejected'}`);
        fetchWallets();
      }
    } catch (err) {
      alert(`Action failed: ${err.message}`);
    } finally {
      setPayoutLoading(false);
    }
  };

  const walletAS = data?.walletAS || { balance: 328450, pendingSettlement: 48200, totalCredits: 1246320, totalDebits: 917870 };
  const walletAF = data?.walletAF || { balance: 264820, pendingSettlement: 35100, totalCredits: 982740, totalDebits: 717920 };
  const combined = data?.combinedOverview || {
    totalBalance: 593270,
    totalPendingSettlement: 83300,
    totalPayoutsApproved: 270000,
    totalRefundsDeducted: 12260,
  };
  const ledger = data?.ledger || [];
  const payouts = data?.payouts || [];

  // Ledger Filter & Pagination State
  const [ledgerSearch, setLedgerSearch] = useState('');
  const [ledgerPage, setLedgerPage] = useState(1);
  const [ledgerPageSize, setLedgerPageSize] = useState(10);

  const filteredLedger = useMemo(() => {
    return ledger.filter((item) => {
      if (ledgerStoreFilter === 'AS' && item.storeCode !== 'AS') return false;
      if (ledgerStoreFilter === 'AF' && item.storeCode !== 'AF') return false;
      if (ledgerSearch.trim()) {
        const q = ledgerSearch.trim().toLowerCase();
        return (
          (item._id || '').toLowerCase().includes(q) ||
          (item.description || '').toLowerCase().includes(q) ||
          (item.referenceId || '').toLowerCase().includes(q) ||
          (item.type || '').toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [ledger, ledgerStoreFilter, ledgerSearch]);

  const totalLedgerItems = filteredLedger.length;
  const totalLedgerPages = Math.ceil(totalLedgerItems / ledgerPageSize) || 1;
  const paginatedLedger = useMemo(() => {
    const start = (ledgerPage - 1) * ledgerPageSize;
    return filteredLedger.slice(start, start + ledgerPageSize);
  }, [filteredLedger, ledgerPage, ledgerPageSize]);

  const handleExportLedgerCSV = () => {
    if (filteredLedger.length === 0) {
      alert('No ledger records to export');
      return;
    }
    const headers = ['Entry ID', 'Store Code', 'Type', 'Description', 'Reference ID', 'Amount (INR)', 'Balance After (INR)', 'Timestamp'];
    const rows = filteredLedger.map((r) => [
      `"${r._id || ''}"`,
      `"${r.storeCode || ''}"`,
      `"${r.type || ''}"`,
      `"${(r.description || '').replace(/"/g, '""')}"`,
      `"${r.referenceId || ''}"`,
      r.amount || 0,
      r.newBalance || 0,
      `"${new Date(r.createdAt).toISOString()}"`,
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((row) => row.join(','))].join('\n');
    const link = document.createElement('a');
    link.href = encodeURI(csvContent);
    link.download = `aaradhya_wallet_ledger_${ledgerStoreFilter}_${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="container-fluid p-0">
      {/* 1. Page Header */}
      <div className="d-flex flex-column flex-sm-row justify-content-between align-items-start align-items-sm-center gap-2 mb-3">
        <div>
          <h3 className="fw-bolder mb-1 text-dark" style={{ letterSpacing: '-0.4px', fontSize: '1.45rem' }}>
            Store Finance, Wallets & Disbursements
          </h3>
          <p className="text-secondary small mb-0" style={{ fontSize: '0.82rem' }}>
            Multi-store internal wallet accounts, immutable financial ledgers, and bank payout authorization.
          </p>
        </div>

        <button
          type="button"
          className="btn btn-sm btn-white border rounded-pill px-3 py-1.5 text-secondary shadow-2xs d-inline-flex align-items-center gap-1.5"
          style={{ fontSize: '0.78rem', backgroundColor: '#FFFFFF' }}
          onClick={fetchWallets}
        >
          <RefreshCw size={13} className={loading ? 'spin' : ''} />
          <span>Refresh</span>
        </button>
      </div>

      {/* 2. Combined Overview Summary */}
      <div className="admin-card mb-4">
        <div className="d-flex align-items-center gap-2 mb-3">
          <div className="p-1.5 rounded-3 bg-dark text-white">
            <Building size={16} />
          </div>
          <h6 className="fw-bold mb-0 text-dark">Combined Multi-Store Financial Position</h6>
        </div>

        <div className="row g-3 text-center">
          <div className="col-12 col-sm-6 col-xl-3">
            <div className="admin-stat-box">
              <span className="text-muted small fw-bold d-block mb-1" style={{ fontSize: '0.68rem' }}>COMBINED STORE BALANCES</span>
              <strong className="fs-5 text-success">₹{combined.totalBalance.toLocaleString()}</strong>
              <div className="text-muted small mt-1" style={{ fontSize: '0.7rem' }}>Current accrued merchant liability</div>
            </div>
          </div>
          <div className="col-12 col-sm-6 col-xl-3">
            <div className="admin-stat-box">
              <span className="text-muted small fw-bold d-block mb-1" style={{ fontSize: '0.68rem' }}>PENDING DISPATCH SETTLEMENTS</span>
              <strong className="fs-5 text-warning">₹{combined.totalPendingSettlement.toLocaleString()}</strong>
              <div className="text-muted small mt-1" style={{ fontSize: '0.7rem' }}>Awaiting order delivery confirmation</div>
            </div>
          </div>
          <div className="col-12 col-sm-6 col-xl-3">
            <div className="admin-stat-box">
              <span className="text-muted small fw-bold d-block mb-1" style={{ fontSize: '0.68rem' }}>DISBURSED BANK PAYOUTS</span>
              <strong className="fs-5 text-primary">₹{combined.totalPayoutsApproved.toLocaleString()}</strong>
              <div className="text-muted small mt-1" style={{ fontSize: '0.7rem' }}>Authorized and settled via NEFT/RTGS</div>
            </div>
          </div>
          <div className="col-12 col-sm-6 col-xl-3">
            <div className="admin-stat-box">
              <span className="text-muted small fw-bold d-block mb-1" style={{ fontSize: '0.68rem' }}>REFUND ADJUSTMENTS</span>
              <strong className="fs-5 text-danger">₹{combined.totalRefundsDeducted.toLocaleString()}</strong>
              <div className="text-muted small mt-1" style={{ fontSize: '0.7rem' }}>Deducted from store wallets</div>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Independent Store Wallet Cards (AS & AF) */}
      <div className="row g-3 mb-4">
        {/* Aaradhya Silks Wallet Card */}
        <div className="col-12 col-lg-6">
          <div
            className="admin-card h-100 mb-0"
            style={{ borderColor: '#FCE7F1', borderTop: '4px solid #E90064' }}
          >
            <div className="d-flex justify-content-between align-items-center mb-3">
              <div className="d-flex align-items-center gap-2">
                <div className="p-2 rounded-3 text-white" style={{ backgroundColor: '#E90064' }}>
                  <AnimatedFaIcon icon={FaGem} size={15} color="#FFFFFF" animation="pulse" />
                </div>
                <div>
                  <h6 className="fw-bold mb-0 text-dark">Aaradhya Silks Wallet</h6>
                  <span className="text-muted small" style={{ fontSize: '0.72rem' }}>Store AS • Pure Handloom Handcraft</span>
                </div>
              </div>
              <span className="badge rounded-pill bg-light text-danger border" style={{ fontSize: '0.68rem' }}>Store AS</span>
            </div>

            <div className="row g-2 mb-3">
              <div className="col-6">
                <div className="admin-stat-box text-center">
                  <span className="text-muted small d-block mb-1" style={{ fontSize: '0.68rem' }}>CURRENT BALANCE</span>
                  <strong className="fs-5 text-success">₹{walletAS.balance.toLocaleString()}</strong>
                </div>
              </div>
              <div className="col-6">
                <div className="admin-stat-box text-center">
                  <span className="text-muted small d-block mb-1" style={{ fontSize: '0.68rem' }}>PENDING SETTLEMENT</span>
                  <strong className="fs-5 text-warning">₹{walletAS.pendingSettlement.toLocaleString()}</strong>
                </div>
              </div>
            </div>

            <div className="d-flex justify-content-between small text-muted border-top pt-2" style={{ fontSize: '0.74rem' }}>
              <span>Total Credits: <strong>₹{walletAS.totalCredits?.toLocaleString()}</strong></span>
              <span>Total Debits: <strong>₹{walletAS.totalDebits?.toLocaleString()}</strong></span>
            </div>
          </div>
        </div>

        {/* Aaradhya Fabrics Wallet Card */}
        <div className="col-12 col-lg-6">
          <div
            className="admin-card h-100 mb-0"
            style={{ borderColor: '#BFDBFE', borderTop: '4px solid #087CE5' }}
          >
            <div className="d-flex justify-content-between align-items-center mb-3">
              <div className="d-flex align-items-center gap-2">
                <div className="p-2 rounded-3 text-white" style={{ backgroundColor: '#087CE5' }}>
                  <AnimatedFaIcon icon={FaScroll} size={15} color="#FFFFFF" animation="float" />
                </div>
                <div>
                  <h6 className="fw-bold mb-0 text-dark">Aaradhya Fabrics Wallet</h6>
                  <span className="text-muted small" style={{ fontSize: '0.72rem' }}>Store AF • Running Yardage Textiles</span>
                </div>
              </div>
              <span className="badge rounded-pill bg-light text-primary border" style={{ fontSize: '0.68rem' }}>Store AF</span>
            </div>

            <div className="row g-2 mb-3">
              <div className="col-6 p-2.5 rounded-3 bg-light border text-center">
                <span className="text-muted small d-block" style={{ fontSize: '0.68rem' }}>CURRENT BALANCE</span>
                <strong className="fs-5 text-success">₹{walletAF.balance.toLocaleString()}</strong>
              </div>
              <div className="col-6 p-2.5 rounded-3 bg-light border text-center">
                <span className="text-muted small d-block" style={{ fontSize: '0.68rem' }}>PENDING SETTLEMENT</span>
                <strong className="fs-5 text-warning">₹{walletAF.pendingSettlement.toLocaleString()}</strong>
              </div>
            </div>

            <div className="d-flex justify-content-between small text-muted border-top pt-2" style={{ fontSize: '0.74rem' }}>
              <span>Total Credits: <strong>₹{walletAF.totalCredits?.toLocaleString()}</strong></span>
              <span>Total Debits: <strong>₹{walletAF.totalDebits?.toLocaleString()}</strong></span>
            </div>
          </div>
        </div>
      </div>

      {/* 4. Sub-Tabs: Payout Requests vs Immutable Ledger */}
      <div className="d-flex justify-content-between align-items-center mb-3">
        <div className="btn-group btn-group-sm rounded-pill border p-0.5 bg-white shadow-2xs">
          <button
            type="button"
            className={`btn btn-sm rounded-pill px-3 py-1.5 fw-bold ${activeTab === 'payouts' ? 'text-white' : 'text-muted border-0 bg-transparent'}`}
            style={{ backgroundColor: activeTab === 'payouts' ? '#E90064' : 'transparent', fontSize: '0.78rem' }}
            onClick={() => setActiveTab('payouts')}
          >
            Bank Payout Requests ({payouts.filter((p) => p.status === 'pending_approval').length} Pending)
          </button>
          <button
            type="button"
            className={`btn btn-sm rounded-pill px-3 py-1.5 fw-bold ${activeTab === 'ledger' ? 'text-white' : 'text-muted border-0 bg-transparent'}`}
            style={{ backgroundColor: activeTab === 'ledger' ? '#17233B' : 'transparent', fontSize: '0.78rem' }}
            onClick={() => setActiveTab('ledger')}
          >
            Immutable Wallet Ledger ({ledger.length} Records)
          </button>
        </div>
      </div>

      {/* 5. View: Payout Management Table */}
      {activeTab === 'payouts' && (
        <div className="admin-table-card shadow-2xs">
          <div className="table-responsive">
            <table className="admin-table table-hover align-middle mb-0" style={{ minWidth: '950px' }}>
              <thead>
                <tr>
                  <th className="order-id-cell">PAYOUT NUMBER</th>
                  <th className="text-center nowrap-cell">STORE</th>
                  <th className="amount-cell">REQUESTED AMOUNT</th>
                  <th>BANK ACCOUNT</th>
                  <th className="date-cell">REQUEST DATE</th>
                  <th className="nowrap-cell">PAYMENT REF</th>
                  <th className="text-center nowrap-cell">STATUS</th>
                  <th className="actions-cell">SUPER ADMIN ACTION</th>
                </tr>
              </thead>
              <tbody>
                {payouts.map((p) => {
                  const isPending = p.status === 'pending_approval';
                  return (
                    <tr key={p._id}>
                      <td className="px-3 fw-bold text-dark">{p.payoutNumber}</td>
                      <td>
                        <span
                          className="badge rounded-pill fw-semibold"
                          style={{
                            backgroundColor: p.storeCode === 'AS' ? '#FFF0F5' : '#F0F7FF',
                            color: p.storeCode === 'AS' ? '#E90064' : '#087CE5',
                            fontSize: '0.68rem',
                          }}
                        >
                          {p.storeName}
                        </span>
                      </td>
                      <td className="fw-bolder fs-6 text-dark">
                        ₹{p.requestedAmount?.toLocaleString()}
                      </td>
                      <td className="small text-muted">{p.bankDetails}</td>
                      <td className="small text-muted">{new Date(p.requestedAt).toLocaleDateString()}</td>
                      <td>
                        <code className="small fw-semibold">{p.paymentReference || '—'}</code>
                      </td>
                      <td>
                        <span
                          className={`badge rounded-pill ${
                            p.status === 'approved' ? 'bg-success text-white' : p.status === 'rejected' ? 'bg-danger text-white' : 'bg-warning text-dark'
                          }`}
                          style={{ fontSize: '0.68rem' }}
                        >
                          {p.status === 'approved' ? 'Disbursed' : p.status === 'pending_approval' ? 'Pending Approval' : 'Rejected'}
                        </span>
                      </td>
                      <td className="text-end px-3">
                        {isPending ? (
                          <div className="d-inline-flex gap-1.5">
                            <button
                              type="button"
                              className="btn btn-sm btn-success rounded-pill px-3 py-1 small fw-bold d-inline-flex align-items-center gap-1"
                              style={{ fontSize: '0.74rem' }}
                              onClick={() => handlePayoutAction(p._id, 'approve')}
                              disabled={payoutLoading}
                            >
                              <Check size={12} />
                              <span>Approve</span>
                            </button>
                            <button
                              type="button"
                              className="btn btn-sm btn-outline-danger rounded-pill px-2.5 py-1 small"
                              style={{ fontSize: '0.74rem' }}
                              onClick={() => handlePayoutAction(p._id, 'reject')}
                              disabled={payoutLoading}
                            >
                              <X size={12} />
                            </button>
                          </div>
                        ) : (
                          <span className="text-muted small">Completed</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 6. View: Immutable Ledger */}
      {activeTab === 'ledger' && (
        <div className="admin-table-card shadow-2xs">
          {/* Ledger Toolbar */}
          <div className="admin-table-toolbar d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-2">
            <div className="d-flex align-items-center gap-2 flex-grow-1" style={{ maxWidth: '420px' }}>
              <div className="input-group input-group-sm">
                <span className="input-group-text bg-white text-muted">
                  <Search size={14} />
                </span>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Search ledger by entry ID, ref, or desc..."
                  value={ledgerSearch}
                  onChange={(e) => {
                    setLedgerSearch(e.target.value);
                    setLedgerPage(1);
                  }}
                />
                {ledgerSearch && (
                  <button
                    className="btn btn-outline-secondary"
                    type="button"
                    onClick={() => {
                      setLedgerSearch('');
                      setLedgerPage(1);
                    }}
                  >
                    Clear
                  </button>
                )}
              </div>
            </div>

            <div className="d-flex align-items-center gap-2">
              <select
                className="form-select form-select-sm"
                style={{ width: '180px', fontSize: '0.78rem', borderColor: '#EAECF0' }}
                value={ledgerStoreFilter}
                onChange={(e) => {
                  setLedgerStoreFilter(e.target.value);
                  setLedgerPage(1);
                }}
              >
                <option value="all">All Stores (AS + AF)</option>
                <option value="AS">Aaradhya Silks (AS)</option>
                <option value="AF">Aaradhya Fabrics (AF)</option>
              </select>

              <button
                type="button"
                className="btn btn-sm text-white rounded-2 px-3 py-1.5 d-inline-flex align-items-center gap-1.5 shadow-2xs"
                style={{ backgroundColor: '#17233B', fontSize: '0.78rem' }}
                onClick={handleExportLedgerCSV}
              >
                <Download size={13} />
                <span>Export CSV</span>
              </button>
            </div>
          </div>

          <div className="table-responsive">
            <table className="admin-table table-hover align-middle mb-0" style={{ minWidth: '1050px' }}>
              <thead>
                <tr>
                  <th className="order-id-cell">ENTRY ID</th>
                  <th className="text-center nowrap-cell">STORE</th>
                  <th className="nowrap-cell">TRANSACTION TYPE</th>
                  <th>DESCRIPTION &amp; REFERENCE</th>
                  <th className="amount-cell">AMOUNT</th>
                  <th className="amount-cell">BALANCE AFTER</th>
                  <th className="date-cell text-end">TIMESTAMP</th>
                </tr>
              </thead>
              <tbody>
                {paginatedLedger.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="text-center py-4 text-muted small">
                      No ledger records match the selected store or search query.
                    </td>
                  </tr>
                ) : (
                  paginatedLedger.map((row) => {
                    const isCredit = row.type === 'order_credit' || row.type === 'pos_sale';
                    return (
                      <tr key={row._id}>
                        <td className="px-3 fw-bold text-dark font-monospace">{row._id}</td>
                        <td>
                          <span
                            className="badge rounded-pill fw-semibold"
                            style={{
                              backgroundColor: row.storeCode === 'AS' ? '#FFF0F5' : '#F0F7FF',
                              color: row.storeCode === 'AS' ? '#E90064' : '#087CE5',
                              border: `1px solid ${row.storeCode === 'AS' ? '#FFD6E5' : '#BFDBFE'}`,
                              fontSize: '0.68rem',
                            }}
                          >
                            {row.storeCode === 'AS' ? 'Aaradhya Silks' : 'Aaradhya Fabrics'}
                          </span>
                        </td>
                        <td>
                          <span className="badge rounded-pill bg-light text-dark border text-capitalize" style={{ fontSize: '0.68rem' }}>
                            {row.type?.replace('_', ' ')}
                          </span>
                        </td>
                        <td>
                          <div className="fw-semibold text-dark">{row.description}</div>
                          {row.referenceId && <div className="text-muted small font-monospace" style={{ fontSize: '0.7rem' }}>Ref: {row.referenceId}</div>}
                        </td>
                        <td className="fw-bold text-end">
                          <span className={isCredit ? 'text-success' : 'text-danger'}>
                            {isCredit ? `+₹${row.amount?.toLocaleString()}` : `-₹${row.amount?.toLocaleString()}`}
                          </span>
                        </td>
                        <td className="fw-bold text-dark text-end">
                          ₹{row.newBalance?.toLocaleString()}
                        </td>
                        <td className="small text-muted text-end pe-3">
                          {new Date(row.createdAt).toLocaleString('en-IN', {
                            day: '2-digit',
                            month: 'short',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination Controls Footer */}
          {totalLedgerItems > 0 && (
            <div
              className="p-3 border-top d-flex flex-column flex-sm-row justify-content-between align-items-center gap-2"
              style={{ borderColor: '#EAECF0', backgroundColor: '#FFFFFF' }}
            >
              <div className="d-flex align-items-center gap-2">
                <span className="text-muted small" style={{ fontSize: '0.78rem' }}>
                  Showing{' '}
                  <strong>
                    {Math.min(totalLedgerItems, (ledgerPage - 1) * ledgerPageSize + 1)}-
                    {Math.min(totalLedgerItems, ledgerPage * ledgerPageSize)}
                  </strong>{' '}
                  of <strong>{totalLedgerItems}</strong> records
                </span>

                <select
                  className="form-select form-select-sm"
                  style={{ width: '80px', fontSize: '0.75rem', borderColor: '#EAECF0' }}
                  value={ledgerPageSize}
                  onChange={(e) => {
                    setLedgerPageSize(Number(e.target.value));
                    setLedgerPage(1);
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
                  disabled={ledgerPage === 1}
                  onClick={() => setLedgerPage((p) => Math.max(1, p - 1))}
                  aria-label="Previous Page"
                >
                  <ChevronLeft size={14} />
                </button>

                {Array.from({ length: totalLedgerPages }, (_, i) => i + 1).map((pageNum) => (
                  <button
                    key={pageNum}
                    type="button"
                    className={`btn btn-sm rounded-2 px-2.5 py-1 ${
                      ledgerPage === pageNum ? 'btn-primary text-white fw-bold' : 'btn-light border'
                    }`}
                    style={
                      ledgerPage === pageNum
                        ? { backgroundColor: '#E90064', borderColor: '#E90064', fontSize: '0.76rem' }
                        : { borderColor: '#EAECF0', fontSize: '0.76rem' }
                    }
                    onClick={() => setLedgerPage(pageNum)}
                  >
                    {pageNum}
                  </button>
                ))}

                <button
                  type="button"
                  className="btn btn-sm btn-light border rounded-2 px-2 py-1"
                  disabled={ledgerPage === totalLedgerPages}
                  onClick={() => setLedgerPage((p) => Math.min(totalLedgerPages, p + 1))}
                  aria-label="Next Page"
                >
                  <ChevronRight size={14} />
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AdminWallets;
