import React, { useState, useEffect } from 'react';
import { Store, ShieldCheck, Check, X, Edit, ExternalLink, Search } from 'lucide-react';
import axiosClient from '../../api/axiosClient';

const AdminVendors = () => {
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [search, setSearch] = useState('');

  // Selected vendor for KYC verification modal
  const [selectedVendor, setSelectedVendor] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [commissionRate, setCommissionRate] = useState(10);

  const fetchVendors = async () => {
    try {
      const res = await axiosClient.get(`/admin/vendors?status=${statusFilter}`);
      if (res.success) {
        setVendors(res.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVendors();
  }, [statusFilter]);

  const handleOpenReview = (v) => {
    setSelectedVendor(v);
    setCommissionRate(v.commissionRate || 10);
    setShowModal(true);
  };

  const handleUpdateStatus = async (vendorId, nextStatus) => {
    try {
      const res = await axiosClient.put(`/admin/vendors/${vendorId}/status`, {
        status: nextStatus,
        commissionRate: Number(commissionRate),
      });
      if (res.success) {
        alert(`Vendor status updated to ${nextStatus}`);
        setShowModal(false);
        fetchVendors();
      }
    } catch (err) {
      alert(`Error updating vendor: ${err.message}`);
    }
  };

  const handleVerifyKycDoc = async (vendorId, docIndex, docStatus) => {
    try {
      const res = await axiosClient.put(`/admin/vendors/${vendorId}/kyc/${docIndex}`, {
        status: docStatus,
        notes: docStatus === 'verified' ? 'Verified by Super Administrator' : 'Document rejected - illegible',
      });
      if (res.success) {
        setSelectedVendor(res.data);
        fetchVendors();
      }
    } catch (err) {
      alert(`KYC error: ${err.message}`);
    }
  };

  const filtered = vendors.filter(
    (v) =>
      v.storeName.toLowerCase().includes(search.toLowerCase()) ||
      v.email.toLowerCase().includes(search.toLowerCase()) ||
      v.gstin?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h3 className="fw-bold mb-1">Vendor & Store Management</h3>
          <p className="text-muted small mb-0">Review merchant registrations, verify KYC compliance, and set commission percentages.</p>
        </div>
      </div>

      <div className="card card-modern p-4">
        <div className="d-flex flex-wrap justify-content-between align-items-center gap-3 mb-3">
          <div className="input-group input-group-sm" style={{ maxWidth: '320px' }}>
            <span className="input-group-text bg-white"><Search size={14} /></span>
            <input
              type="text"
              className="form-control"
              placeholder="Search by store name, email or GSTIN..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className="d-flex align-items-center gap-2">
            <span className="small text-muted">Status:</span>
            <select
              className="form-select form-select-sm"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              style={{ width: '140px' }}
            >
              <option value="all">All Vendors</option>
              <option value="approved">Approved</option>
              <option value="pending">Pending KYC</option>
              <option value="suspended">Suspended</option>
            </select>
          </div>
        </div>

        <div className="table-responsive">
          <table className="table table-modern">
            <thead>
              <tr>
                <th>Store & Owner</th>
                <th>GSTIN / PAN</th>
                <th>Commission %</th>
                <th>Total Sales</th>
                <th>KYC Documents</th>
                <th>Status</th>
                <th className="text-end">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((v) => (
                <tr key={v._id}>
                  <td>
                    <div className="d-flex align-items-center gap-2">
                      <img
                        src={v.logo || 'https://via.placeholder.com/40'}
                        alt={v.storeName}
                        style={{ width: '40px', height: '40px', objectFit: 'cover', borderRadius: '6px' }}
                      />
                      <div>
                        <div className="fw-bold small text-dark">{v.storeName}</div>
                        <div className="text-muted" style={{ fontSize: '0.72rem' }}>{v.email}</div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <div className="small fw-semibold">{v.gstin || 'Pending'}</div>
                    <div className="text-muted" style={{ fontSize: '0.7rem' }}>PAN: {v.pan || '—'}</div>
                  </td>
                  <td>
                    <span className="badge bg-light text-dark border fw-bold">{v.commissionRate || 10}%</span>
                  </td>
                  <td className="fw-bold">₹{v.totalSales?.toLocaleString() || '0'}</td>
                  <td>
                    <span className="badge bg-light text-secondary border">
                      {v.kycDocuments?.filter((d) => d.status === 'verified').length || 0} / {v.kycDocuments?.length || 0} Verified
                    </span>
                  </td>
                  <td>
                    <span className={`badge ${v.status === 'approved' ? 'bg-success' : v.status === 'pending' ? 'bg-warning text-dark' : 'bg-danger'}`}>
                      {v.status}
                    </span>
                  </td>
                  <td className="text-end">
                    <button
                      className="btn btn-outline-emerald btn-sm px-3"
                      onClick={() => handleOpenReview(v)}
                    >
                      Review & Approve
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* KYC & Commission Review Modal */}
      {showModal && selectedVendor && (
        <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered modal-lg">
            <div className="modal-content rounded-4 p-4">
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h5 className="fw-bold mb-0">Vendor Verification & Settings: {selectedVendor.storeName}</h5>
                <button type="button" className="btn-close" onClick={() => setShowModal(false)}></button>
              </div>

              <div className="row g-3 mb-4 small">
                <div className="col-md-6">
                  <div className="p-3 rounded bg-light border">
                    <div className="fw-bold mb-1">Business Registration Details</div>
                    <div>Store: <strong>{selectedVendor.storeName}</strong></div>
                    <div>GSTIN: <strong>{selectedVendor.gstin || 'Not provided'}</strong></div>
                    <div>PAN: <strong>{selectedVendor.pan || 'Not provided'}</strong></div>
                    <div>Phone: {selectedVendor.phone}</div>
                    <div>City: {selectedVendor.pickupAddress?.city || 'Delhi'}</div>
                  </div>
                </div>

                <div className="col-md-6">
                  <div className="p-3 rounded bg-light border">
                    <div className="fw-bold mb-1">Bank Settlement Account</div>
                    <div>Bank: <strong>{selectedVendor.bankDetails?.bankName}</strong></div>
                    <div>A/C Name: {selectedVendor.bankDetails?.accountName}</div>
                    <div>A/C Number: <code>{selectedVendor.bankDetails?.accountNumber}</code></div>
                    <div>IFSC: <code>{selectedVendor.bankDetails?.ifsc}</code></div>
                  </div>
                </div>
              </div>

              {/* KYC Documents List */}
              <h6 className="fw-bold mb-2">Submitted KYC Documents</h6>
              <div className="d-flex flex-column gap-2 mb-4">
                {selectedVendor.kycDocuments?.map((doc, idx) => (
                  <div key={idx} className="p-3 rounded-3 border d-flex justify-content-between align-items-center bg-white shadow-sm">
                    <div>
                      <strong className="d-block small">{doc.docType}</strong>
                      <a href={doc.fileUrl} target="_blank" rel="noreferrer" className="small text-primary text-decoration-none">
                        View Uploaded Document Link <ExternalLink size={12} />
                      </a>
                      <div className="text-muted" style={{ fontSize: '0.7rem' }}>Status: {doc.status}</div>
                    </div>

                    <div className="d-flex gap-2">
                      <button
                        className="btn btn-sm btn-success px-3"
                        onClick={() => handleVerifyKycDoc(selectedVendor._id, idx, 'verified')}
                      >
                        <Check size={14} className="me-1" /> Verify
                      </button>
                      <button
                        className="btn btn-sm btn-outline-danger"
                        onClick={() => handleVerifyKycDoc(selectedVendor._id, idx, 'rejected')}
                      >
                        <X size={14} /> Reject
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Commission Setting */}
              <div className="p-3 rounded bg-light border mb-4">
                <label className="form-label small fw-semibold">Platform Commission Rate (%):</label>
                <div className="input-group input-group-sm" style={{ maxWidth: '180px' }}>
                  <input
                    type="number"
                    className="form-control"
                    value={commissionRate}
                    onChange={(e) => setCommissionRate(e.target.value)}
                  />
                  <span className="input-group-text">%</span>
                </div>
                <small className="text-muted" style={{ fontSize: '0.72rem' }}>
                  Deducted automatically from item subtotal when customer orders are fulfilled.
                </small>
              </div>

              {/* Approval Actions */}
              <div className="d-flex justify-content-end gap-2 border-top pt-3">
                <button
                  className="btn btn-danger btn-sm"
                  onClick={() => handleUpdateStatus(selectedVendor._id, 'suspended')}
                >
                  Suspend Vendor
                </button>
                <button
                  className="btn btn-emerald btn-sm px-4"
                  onClick={() => handleUpdateStatus(selectedVendor._id, 'approved')}
                >
                  Approve Vendor & Activate Storefront
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminVendors;

