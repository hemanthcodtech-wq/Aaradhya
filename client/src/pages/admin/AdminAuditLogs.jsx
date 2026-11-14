import React, { useState, useEffect, useMemo } from 'react';
import {
  ClipboardList,
  Search,
  ShieldCheck,
  Clock,
  User,
  Filter,
  Download,
  RefreshCw,
  Globe,
  Tag,
  Wallet,
  Settings,
  Lock,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import axiosClient from '../../api/axiosClient';

const AdminAuditLogs = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [search, setSearch] = useState('');

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const res = await axiosClient.get('/admin/audit-logs');
      if (res.success) {
        setLogs(res.data);
        setCurrentPage(1);
      }
    } catch (err) {
      console.error('Failed to load audit logs', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const handleExportCSV = () => {
    if (logs.length === 0) return;
    const headers = ['Timestamp', 'Action', 'Category', 'User Name', 'User Email', 'Role', 'IP Address', 'Details'];
    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [
        headers.join(','),
        ...logs.map((l) =>
          [
            `"${l.timestamp || ''}"`,
            `"${l.action || ''}"`,
            `"${l.category || ''}"`,
            `"${l.user?.name || ''}"`,
            `"${l.user?.email || ''}"`,
            `"${l.user?.role || ''}"`,
            `"${l.ipAddress || '127.0.0.1'}"`,
            `"${(l.details || '').replace(/"/g, '""')}"`,
          ].join(',')
        ),
      ].join('\n');

    const link = document.createElement('a');
    link.href = encodeURI(csvContent);
    link.download = `aaradhya_audit_logs_${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filtered = useMemo(() => {
    return logs.filter((l) => {
      const matchesCat = categoryFilter === 'all' || l.category === categoryFilter;
      const matchesSearch =
        !search.trim() ||
        (l.action || '').toLowerCase().includes(search.toLowerCase()) ||
        (l.details || '').toLowerCase().includes(search.toLowerCase()) ||
        (l.user?.name || '').toLowerCase().includes(search.toLowerCase()) ||
        (l.user?.email || '').toLowerCase().includes(search.toLowerCase());
      return matchesCat && matchesSearch;
    });
  }, [logs, categoryFilter, search]);

  const totalItems = filtered.length;
  const totalPages = Math.ceil(totalItems / pageSize) || 1;
  const paginatedLogs = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filtered.slice(start, start + pageSize);
  }, [filtered, currentPage, pageSize]);

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
              COMPLIANCE &amp; SECURITY
            </span>
            <span
              className="badge px-2 py-0.5 fw-semibold"
              style={{ backgroundColor: '#EBF5FF', color: '#087CE5', border: '1px solid #BFDBFE', fontSize: '0.7rem' }}
            >
              Immutable Ledger
            </span>
          </div>
          <h2 className="fw-bolder mb-0" style={{ color: '#17233B' }}>
            Administrative Audit Trail
          </h2>
          <p className="text-muted small mb-0">
            Immutable chronological record of all administrative events, payout approvals, taxonomy updates, and configuration changes.
          </p>
        </div>

        <div className="d-flex align-items-center gap-2">
          <button
            onClick={fetchLogs}
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
            <span>Export Audit Trail</span>
          </button>
        </div>
      </div>

      {/* 2. Filter Bar */}
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
                placeholder="Search audit trail by action, user, or details..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>

          <div className="col-12 col-md-4">
            <select
              className="form-select form-select-sm"
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
            >
              <option value="all">All Audit Categories</option>
              <option value="auth">Authentication &amp; Sessions</option>
              <option value="payout">Store Payout Approvals</option>
              <option value="promotion">Promotions &amp; Coupons</option>
              <option value="category">Taxonomy &amp; Categories</option>
              <option value="settings">Platform Settings</option>
            </select>
          </div>

          <div className="col-12 col-md-3 text-md-end text-muted small">
            Displaying <strong>{filtered.length}</strong> immutable records
          </div>
        </div>
      </div>

      {/* 3. Audit Logs Table */}
      <div className="admin-table-card shadow-2xs">
        <div className="table-responsive">
          <table className="admin-table table-hover align-middle mb-0" style={{ minWidth: '950px' }}>
            <thead>
              <tr>
                <th className="date-cell">Timestamp</th>
                <th>Administrator</th>
                <th className="nowrap-cell">Action Code</th>
                <th className="nowrap-cell">Category</th>
                <th>Activity Description</th>
                <th className="nowrap-cell text-end">Origin IP</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="6" className="text-center py-5 text-muted">
                    <div className="spinner-border spinner-border-sm text-primary me-2" role="status" />
                    Loading immutable audit trail...
                  </td>
                </tr>
              ) : paginatedLogs.length === 0 ? (
                <tr>
                  <td colSpan="6" className="text-center py-5 text-muted">
                    No audit records found matching your filters.
                  </td>
                </tr>
              ) : (
                paginatedLogs.map((l) => (
                  <tr key={l._id}>
                    {/* Timestamp */}
                    <td className="ps-3 font-monospace text-muted small">
                      {new Date(l.timestamp).toLocaleString('en-IN', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                        second: '2-digit',
                      })}
                    </td>

                    {/* Admin */}
                    <td>
                      <div className="fw-semibold text-dark">{l.user?.name || 'Aaradhya Super Admin'}</div>
                      <div className="text-muted small" style={{ fontSize: '0.72rem' }}>
                        {l.user?.email || 'admin@aaradhya.com'} &bull; <span className="badge bg-light text-muted border">{l.user?.role || 'super_admin'}</span>
                      </div>
                    </td>

                    {/* Action Code */}
                    <td>
                      <span className="badge font-monospace bg-light text-dark border px-2 py-1">
                        {l.action}
                      </span>
                    </td>

                    {/* Category */}
                    <td>
                      <span
                        className={`badge px-2 py-0.5 rounded-pill ${
                          l.category === 'payout'
                            ? 'bg-warning-subtle text-warning'
                            : l.category === 'auth'
                            ? 'bg-primary-subtle text-primary'
                            : l.category === 'promotion'
                            ? 'bg-success-subtle text-success'
                            : 'bg-secondary-subtle text-secondary'
                        }`}
                      >
                        {l.category || 'platform'}
                      </span>
                    </td>

                    {/* Description */}
                    <td>
                      <div className="text-dark" style={{ maxWidth: '420px' }}>
                        {l.details}
                      </div>
                    </td>

                    {/* IP */}
                    <td className="pe-3 text-end font-monospace text-muted small">
                      {l.ipAddress || '127.0.0.1'}
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
                of <strong>{totalItems}</strong> audit records
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
    </div>
  );
};

export default AdminAuditLogs;
