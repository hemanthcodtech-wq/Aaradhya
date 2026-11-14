import React, { useState } from 'react';
import { User, Mail, Phone, MapPin, Plus, ShieldCheck, Check } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import axiosClient from '../../api/axiosClient';

const CustomerProfilePage = () => {
  const { user, setUser } = useAuth();
  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  const [addresses, setAddresses] = useState(user?.addresses || []);
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [newAddr, setNewAddr] = useState({
    fullName: user?.name || '',
    phone: user?.phone || '',
    addressLine1: '',
    addressLine2: '',
    city: '',
    state: '',
    pincode: '',
    isDefault: false,
  });

  const handleProfileSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await axiosClient.put('/auth/profile', { name, phone });
      if (res.success) {
        setUser(res.data.user);
        setMessage('Profile details updated successfully');
        setTimeout(() => setMessage(''), 3000);
      }
    } catch (err) {
      alert(`Error updating profile: ${err.message}`);
    } finally {
      setSaving(false);
    }
  };

  const handleAddAddress = async (e) => {
    e.preventDefault();
    try {
      const res = await axiosClient.post('/auth/address', newAddr);
      if (res.success) {
        setAddresses(res.data.addresses);
        setShowAddressModal(false);
        setNewAddr({
          fullName: user?.name || '',
          phone: user?.phone || '',
          addressLine1: '',
          addressLine2: '',
          city: '',
          state: '',
          pincode: '',
          isDefault: false,
        });
      }
    } catch (err) {
      alert(`Failed to add address: ${err.message}`);
    }
  };

  return (
    <div className="container py-4">
      <h3 className="fw-bold mb-4">My Account Profile</h3>

      <div className="row g-4">
        {/* Left Column: Personal details */}
        <div className="col-lg-5">
          <div className="card card-modern p-4">
            <h5 className="fw-bold mb-3 border-bottom pb-2">Personal Information</h5>
            {message && <div className="alert alert-success py-2 small">{message}</div>}

            <form onSubmit={handleProfileSave}>
              <div className="mb-3">
                <label className="form-label small fw-semibold">Full Name</label>
                <div className="input-group">
                  <span className="input-group-text bg-light"><User size={16} /></span>
                  <input
                    type="text"
                    className="form-control"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="mb-3">
                <label className="form-label small fw-semibold">Email Address</label>
                <div className="input-group">
                  <span className="input-group-text bg-light"><Mail size={16} /></span>
                  <input
                    type="email"
                    className="form-control bg-light"
                    value={user?.email || ''}
                    disabled
                  />
                </div>
                <small className="text-muted" style={{ fontSize: '0.72rem' }}>Email cannot be altered.</small>
              </div>

              <div className="mb-4">
                <label className="form-label small fw-semibold">Phone Number</label>
                <div className="input-group">
                  <span className="input-group-text bg-light"><Phone size={16} /></span>
                  <input
                    type="text"
                    className="form-control"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                  />
                </div>
              </div>

              <button type="submit" className="btn btn-emerald w-100 py-2 fw-semibold" disabled={saving}>
                {saving ? 'Saving...' : 'Save Profile Changes'}
              </button>
            </form>
          </div>
        </div>

        {/* Right Column: Saved Delivery Addresses */}
        <div className="col-lg-7">
          <div className="card card-modern p-4">
            <div className="d-flex justify-content-between align-items-center border-bottom pb-2 mb-3">
              <h5 className="fw-bold mb-0">Delivery Addresses</h5>
              <button
                className="btn btn-outline-emerald btn-sm d-flex align-items-center gap-1"
                onClick={() => setShowAddressModal(true)}
              >
                <Plus size={16} /> Add Address
              </button>
            </div>

            {addresses.length === 0 ? (
              <p className="text-muted small">No delivery addresses saved yet.</p>
            ) : (
              <div className="d-flex flex-column gap-3">
                {addresses.map((addr, idx) => (
                  <div key={idx} className="p-3 rounded-3 border bg-light">
                    <div className="d-flex justify-content-between align-items-center mb-1">
                      <span className="fw-bold small">{addr.fullName}</span>
                      {addr.isDefault && <span className="badge bg-success">Default</span>}
                    </div>
                    <div className="text-muted small mb-1">{addr.phone}</div>
                    <div className="text-muted small">
                      {addr.addressLine1}, {addr.addressLine2 && `${addr.addressLine2}, `}
                      {addr.city}, {addr.state} - {addr.pincode}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Add Address Modal */}
      {showAddressModal && (
        <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content rounded-4 p-3">
              <div className="modal-header border-0 pb-0">
                <h5 className="modal-title fw-bold">Add Delivery Address</h5>
                <button type="button" className="btn-close" onClick={() => setShowAddressModal(false)}></button>
              </div>
              <form onSubmit={handleAddAddress} className="p-2">
                <div className="mb-2">
                  <label className="form-label small fw-semibold">Recipient Full Name *</label>
                  <input
                    type="text"
                    className="form-control form-control-sm"
                    required
                    value={newAddr.fullName}
                    onChange={(e) => setNewAddr({ ...newAddr, fullName: e.target.value })}
                  />
                </div>
                <div className="mb-2">
                  <label className="form-label small fw-semibold">Phone Number *</label>
                  <input
                    type="text"
                    className="form-control form-control-sm"
                    required
                    value={newAddr.phone}
                    onChange={(e) => setNewAddr({ ...newAddr, phone: e.target.value })}
                  />
                </div>
                <div className="mb-2">
                  <label className="form-label small fw-semibold">Flat / House no. / Street *</label>
                  <input
                    type="text"
                    className="form-control form-control-sm"
                    required
                    value={newAddr.addressLine1}
                    onChange={(e) => setNewAddr({ ...newAddr, addressLine1: e.target.value })}
                  />
                </div>
                <div className="row g-2 mb-3">
                  <div className="col-4">
                    <label className="form-label small fw-semibold">City *</label>
                    <input
                      type="text"
                      className="form-control form-control-sm"
                      required
                      value={newAddr.city}
                      onChange={(e) => setNewAddr({ ...newAddr, city: e.target.value })}
                    />
                  </div>
                  <div className="col-4">
                    <label className="form-label small fw-semibold">State *</label>
                    <input
                      type="text"
                      className="form-control form-control-sm"
                      required
                      value={newAddr.state}
                      onChange={(e) => setNewAddr({ ...newAddr, state: e.target.value })}
                    />
                  </div>
                  <div className="col-4">
                    <label className="form-label small fw-semibold">Pincode *</label>
                    <input
                      type="text"
                      className="form-control form-control-sm"
                      required
                      value={newAddr.pincode}
                      onChange={(e) => setNewAddr({ ...newAddr, pincode: e.target.value })}
                    />
                  </div>
                </div>
                <div className="d-flex justify-content-end gap-2">
                  <button type="button" className="btn btn-light btn-sm" onClick={() => setShowAddressModal(false)}>
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-emerald btn-sm px-3">
                    Save Address
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

export default CustomerProfilePage;

