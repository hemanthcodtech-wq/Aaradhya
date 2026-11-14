import React, { useState, useEffect } from 'react';
import { DollarSign, Clock, CheckCircle2, ArrowRight, Building, Plus } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import axiosClient from '../../api/axiosClient';

const VendorPayouts = () => {
  const { vendor } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [requestAmount, setRequestAmount] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchProfile = async () => {
    try {
      const res = await axiosClient.get('/vendor/profile');
      if (res.success) {
        setProfile(res.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleRequestPayout = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await axiosClient.post('/vendor/payouts/request', {
        amount: Number(requestAmount),
      });
      if (res.success) {
        alert('Payout request submitted successfully! Admin will process transfer.');
        setShowModal(false);
        setRequestAmount('');
        fetchProfile();
      }
    } catch (err) {
      alert(`Error submitting payout request: ${err.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="p-4 text-center">
        <div className="spinner-border text-success" role="status"></div>
      </div>
    );
  }

  const pending = profile?.pendingPayout || 225000;
  const earnings = profile?.totalEarnings || 1005144;
  const paid = profile?.paidPayout || 780144;

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h3 className="fw-bold mb-1">Financial Earnings & Payouts</h3>
          <p className="text-muted small mb-0">Track platform commission deductions, earnings, and request bank settlements.</p>
        </div>
        <button
          className="btn btn-emerald btn-sm px-3 d-flex align-items-center gap-1"
          onClick={() => setShowModal(true)}
          disabled={pending <= 0}
        >
          <Plus size={16} /> Request Payout
        </button>
      </div>

      {/* Financial Metrics */}
      <div className="row g-3 mb-4">
        <div className="col-md-4">
          <div className="card card-modern p-4">
            <span className="text-muted small text-uppercase fw-semibold">Available for Payout</span>
            <div className="fs-3 fw-bold text-success mt-1">₹{pending.toLocaleString()}</div>
            <small className="text-muted">Settled weekly to verified bank account</small>
          </div>
        </div>

        <div className="col-md-4">
          <div className="card card-modern p-4">
            <span className="text-muted small text-uppercase fw-semibold">Cumulative Net Earnings</span>
            <div className="fs-3 fw-bold text-dark mt-1">₹{earnings.toLocaleString()}</div>
            <small className="text-muted">After platform commission ({profile?.commissionRate || 8}%)</small>
          </div>
        </div>

        <div className="col-md-4">
          <div className="card card-modern p-4">
            <span className="text-muted small text-uppercase fw-semibold">Total Paid to Date</span>
            <div className="fs-3 fw-bold text-primary mt-1">₹{paid.toLocaleString()}</div>
            <small className="text-muted">Transferred via NEFT/RTGS</small>
          </div>
        </div>
      </div>

      {/* Bank Account Verification Status */}
      <div className="card card-modern p-4 mb-4">
        <h5 className="fw-bold mb-3 border-bottom pb-2 d-flex align-items-center gap-2">
          <Building size={20} className="text-secondary" /> Registered Settlement Bank Account
        </h5>

        <div className="row g-3 small">
          <div className="col-sm-3">
            <span className="text-muted d-block">Account Name</span>
            <strong>{profile?.bankDetails?.accountName || 'TechNova Retail Solutions Pvt Ltd'}</strong>
          </div>
          <div className="col-sm-3">
            <span className="text-muted d-block">Bank Name</span>
            <strong>{profile?.bankDetails?.bankName || 'HDFC Bank'}</strong>
          </div>
          <div className="col-sm-3">
            <span className="text-muted d-block">Account Number</span>
            <strong>{profile?.bankDetails?.accountNumber || '9182736450192'}</strong>
          </div>
          <div className="col-sm-3">
            <span className="text-muted d-block">IFSC Code</span>
            <strong>{profile?.bankDetails?.ifsc || 'HDFC0001234'}</strong>
          </div>
        </div>
      </div>

      {/* Payout Modal */}
      {showModal && (
        <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content rounded-4 p-4">
              <h5 className="fw-bold mb-2">Request Settlement Payout</h5>
              <p className="text-muted small mb-3">
                Max available balance: <strong>₹{pending.toLocaleString()}</strong>
              </p>

              <form onSubmit={handleRequestPayout}>
                <div className="mb-3">
                  <label className="form-label small fw-semibold">Payout Amount (₹) *</label>
                  <input
                    type="number"
                    className="form-control"
                    max={pending}
                    min={100}
                    required
                    placeholder="Enter amount"
                    value={requestAmount}
                    onChange={(e) => setRequestAmount(e.target.value)}
                  />
                </div>

                <div className="p-3 bg-light rounded-3 small mb-3 border">
                  <div>Transfer to: <strong>{profile?.bankDetails?.bankName}</strong> ({profile?.bankDetails?.accountNumber})</div>
                  <div className="text-muted" style={{ fontSize: '0.72rem' }}>Processing time: 1-2 banking working days</div>
                </div>

                <div className="d-flex justify-content-end gap-2">
                  <button type="button" className="btn btn-light btn-sm" onClick={() => setShowModal(false)}>
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-emerald btn-sm px-4" disabled={submitting}>
                    {submitting ? 'Submitting...' : 'Confirm Request'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VendorPayouts;

