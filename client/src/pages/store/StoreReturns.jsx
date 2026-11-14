import React, { useState, useEffect } from 'react';
import {
  RotateCcw,
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  Eye,
  RefreshCw,
  AlertTriangle,
  PackageCheck,
  PackageX,
} from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import axiosClient from '../../api/axiosClient';

const StoreReturns = () => {
  const store = useStore();
  const [returns, setReturns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Inspection Modal
  const [selectedReturn, setSelectedReturn] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [restockToInventory, setRestockToInventory] = useState(true);
  const [inspectNotes, setInspectNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchReturns();
  }, [store.activeStore]);

  const fetchReturns = async () => {
    setLoading(true);
    try {
      const res = await axiosClient.get(`/stores/${store.activeStore}/returns`);
      if (res.data?.success && res.data.data?.length > 0) {
        setReturns(res.data.data);
      } else {
        setReturns(getFallbackReturns());
      }
    } catch {
      setReturns(getFallbackReturns());
    } finally {
      setLoading(false);
    }
  };

  const getFallbackReturns = () =>
    store.isSilks
      ? [
          {
            _id: 'ret_as_01',
            returnId: 'RET-AS-1092',
            suborderNumber: 'AS-ORD-488764',
            productId: 'AS-000001',
            productName: 'Pure Kanjeevaram Bridal Silk Saree',
            customerName: 'Pooja Venkatesh',
            customerPhone: '+91 98765 43210',
            reason: 'Color tone slightly darker than digital preview',
            amount: 19999,
            status: 'requested',
            createdAt: '2026-11-14T09:20:00Z',
          },
        ]
      : [
          {
            _id: 'ret_af_01',
            returnId: 'RET-AF-2041',
            suborderNumber: 'AF-ORD-488764',
            productId: 'AF-000001',
            productName: 'Pure Mulmul 60s Organic Cotton Yardage',
            customerName: 'Pooja Venkatesh',
            customerPhone: '+91 98765 43210',
            reason: 'Excess meterage ordered by customer',
            amount: 1100,
            status: 'requested',
            createdAt: '2026-11-14T10:15:00Z',
          },
        ];

  const handleInspectSubmit = async (decision) => {
    setSubmitting(true);
    try {
      await axiosClient.put(`/stores/${store.activeStore}/returns/${selectedReturn._id}/inspect`, {
        decision, // 'approved' or 'rejected'
        restock: restockToInventory,
        notes: inspectNotes,
      });
      // Local optimistic update
      setReturns((prev) =>
        prev.map((r) =>
          r._id === selectedReturn._id
            ? { ...r, status: decision === 'approved' ? (restockToInventory ? 'restocked' : 'approved') : 'rejected' }
            : r
        )
      );
    } catch {
      setReturns((prev) =>
        prev.map((r) =>
          r._id === selectedReturn._id
            ? { ...r, status: decision === 'approved' ? (restockToInventory ? 'restocked' : 'approved') : 'rejected' }
            : r
        )
      );
    } finally {
      setSubmitting(false);
      setIsModalOpen(false);
    }
  };

  const filtered = returns.filter((r) => {
    const matchesSearch =
      (r.returnId || '').toLowerCase().includes(search.toLowerCase()) ||
      (r.suborderNumber || '').toLowerCase().includes(search.toLowerCase()) ||
      (r.customerName || '').toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'all' || r.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="store-returns-page pb-5">
      {/* Header */}
      <div className="d-flex flex-wrap align-items-center justify-content-between gap-3 mb-4">
        <div>
          <div className="d-flex align-items-center gap-2 mb-1">
            <span
              className="badge rounded-pill fw-bold text-uppercase px-2.5 py-1"
              style={{ backgroundColor: store.badgeBg, color: store.badgeText, border: `1px solid ${store.badgeBorder}`, fontSize: '0.72rem' }}
            >
              Store {store.storeCode} Quality Control
            </span>
            <span className="text-muted small">• Returns & Restocking Audit</span>
          </div>
          <h4 className="fw-bold text-dark mb-0">{store.storeName} Returns & Exchanges</h4>
        </div>

        <button onClick={fetchReturns} className="btn btn-sm btn-light border text-muted shadow-sm">
          <RefreshCw size={14} className={loading ? 'spin' : ''} />
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="card border-0 shadow-sm rounded-3 p-3 bg-white mb-4">
        <div className="row g-2 align-items-center">
          <div className="col-12 col-md-6">
            <div className="input-group input-group-sm">
              <span className="input-group-text bg-light border-end-0">
                <Search size={15} className="text-muted" />
              </span>
              <input
                type="text"
                className="form-control border-start-0 bg-light"
                placeholder="Search Return ID, Suborder #, or Customer..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>

          <div className="col-12 col-md-6 d-flex justify-content-md-end gap-1 flex-wrap">
            {['all', 'requested', 'restocked', 'rejected'].map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`btn btn-sm rounded-pill px-3 py-1 text-capitalize ${
                  statusFilter === st ? 'btn-dark' : 'btn-light border text-muted'
                }`}
                style={{ fontSize: '0.74rem' }}
              >
                {st}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Returns Table */}
      <div className="card border-0 shadow-sm rounded-3 bg-white overflow-hidden">
        <div className="table-responsive">
          <table className="table table-hover align-middle mb-0" style={{ fontSize: '0.82rem' }}>
            <thead className="table-light">
              <tr>
                <th className="border-0 text-muted fw-semibold ps-3">Return ID</th>
                <th className="border-0 text-muted fw-semibold">Suborder #</th>
                <th className="border-0 text-muted fw-semibold">Customer</th>
                <th className="border-0 text-muted fw-semibold">Item & Reason</th>
                <th className="border-0 text-muted fw-semibold text-end">Amount</th>
                <th className="border-0 text-muted fw-semibold text-center">Status</th>
                <th className="border-0 text-muted fw-semibold text-end pe-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="7" className="text-center py-5">
                    <div className="spinner-border spinner-border-sm text-primary" style={{ color: store.primaryColor }} />
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan="7" className="text-center py-5 text-muted">
                    <RotateCcw size={32} className="opacity-50 mb-2" />
                    <div>No returns on record.</div>
                  </td>
                </tr>
              ) : (
                filtered.map((r) => (
                  <tr key={r._id}>
                    <td className="ps-3 font-monospace fw-bold" style={{ color: store.primaryColor }}>
                      {r.returnId}
                    </td>
                    <td className="font-monospace text-muted small">#{r.suborderNumber}</td>
                    <td>
                      <div className="fw-semibold text-dark">{r.customerName}</div>
                      <div className="text-muted small" style={{ fontSize: '0.7rem' }}>{r.customerPhone}</div>
                    </td>
                    <td>
                      <div className="fw-semibold text-dark text-truncate" style={{ maxWidth: '240px' }}>
                        {r.productName}
                      </div>
                      <div className="text-muted small" style={{ fontSize: '0.72rem' }}>
                        Reason: {r.reason}
                      </div>
                    </td>
                    <td className="text-end fw-bold text-dark">₹{Number(r.amount).toLocaleString()}</td>
                    <td className="text-center">
                      <span
                        className={`badge rounded-pill text-capitalize px-2.5 py-1 ${
                          r.status === 'restocked'
                            ? 'bg-success text-white'
                            : r.status === 'rejected'
                            ? 'bg-danger text-white'
                            : 'bg-warning text-dark'
                        }`}
                        style={{ fontSize: '0.72rem' }}
                      >
                        {r.status}
                      </span>
                    </td>
                    <td className="text-end pe-3">
                      {r.status === 'requested' ? (
                        <button
                          onClick={() => {
                            setSelectedReturn(r);
                            setRestockToInventory(true);
                            setInspectNotes('');
                            setIsModalOpen(true);
                          }}
                          className="btn btn-sm text-white px-3 py-1 rounded-pill fw-semibold shadow-sm"
                          style={{ backgroundColor: store.primaryColor, fontSize: '0.74rem' }}
                        >
                          Inspect & Decide &rarr;
                        </button>
                      ) : (
                        <span className="text-muted small">Completed</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Inspect Return Modal */}
      {isModalOpen && selectedReturn && (
        <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1050 }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-0 shadow-lg rounded-3">
              <div className="modal-header border-0 pb-0 pt-3 px-4">
                <h5 className="modal-title fw-bold text-dark">Inspect Return: {selectedReturn.returnId}</h5>
                <button type="button" className="btn-close" onClick={() => setIsModalOpen(false)} />
              </div>

              <div className="modal-body px-4 py-3">
                <div className="p-3 rounded-2 bg-light mb-3">
                  <div className="fw-bold text-dark small">{selectedReturn.productName}</div>
                  <div className="text-muted small mt-1">Customer: {selectedReturn.customerName}</div>
                  <div className="text-muted small">Return Reason: "{selectedReturn.reason}"</div>
                  <div className="fw-bold text-dark mt-1">Refund Amount: ₹{Number(selectedReturn.amount).toLocaleString()}</div>
                </div>

                <div className="mb-3">
                  <div className="form-check form-switch">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      id="restockCheck"
                      checked={restockToInventory}
                      onChange={(e) => setRestockToInventory(e.target.checked)}
                    />
                    <label className="form-check-label fw-semibold text-dark small" htmlFor="restockCheck">
                      Restock this item back into {store.storeName} live inventory (+1 stock count)
                    </label>
                  </div>
                  <span className="text-muted small d-block ms-4" style={{ fontSize: '0.72rem' }}>
                    Turn off if the garment is damaged and cannot be resold.
                  </span>
                </div>

                <div className="mb-3">
                  <label className="form-label small fw-semibold text-dark">Quality Inspector Remarks</label>
                  <textarea
                    rows="2"
                    className="form-control form-control-sm"
                    placeholder="Physical condition, original tags present..."
                    value={inspectNotes}
                    onChange={(e) => setInspectNotes(e.target.value)}
                  />
                </div>
              </div>

              <div className="modal-footer border-0 pt-0 px-4 pb-3 d-flex justify-content-between">
                <button
                  type="button"
                  disabled={submitting}
                  onClick={() => handleInspectSubmit('rejected')}
                  className="btn btn-sm btn-outline-danger px-3 d-inline-flex align-items-center gap-1"
                >
                  <XCircle size={14} />
                  Reject Return
                </button>

                <button
                  type="button"
                  disabled={submitting}
                  onClick={() => handleInspectSubmit('approved')}
                  className="btn btn-sm text-white px-4 fw-semibold shadow-sm d-inline-flex align-items-center gap-1"
                  style={{ backgroundColor: store.primaryColor }}
                >
                  <CheckCircle2 size={14} />
                  Approve & Refund
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StoreReturns;
