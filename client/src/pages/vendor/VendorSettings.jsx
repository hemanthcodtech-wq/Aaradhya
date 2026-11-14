import React, { useState, useEffect } from 'react';
import { Store, ShieldCheck, FileText, Upload, Save, Building, MapPin } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import axiosClient from '../../api/axiosClient';

const VendorSettings = () => {
  const { vendor } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [docType, setDocType] = useState('GST Certificate');
  const [docUrl, setDocUrl] = useState('');

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

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await axiosClient.put('/vendor/profile', profile);
      if (res.success) {
        alert('Vendor profile & settings updated successfully!');
        fetchProfile();
      }
    } catch (err) {
      alert(`Error updating settings: ${err.message}`);
    } finally {
      setSaving(false);
    }
  };

  const handleUploadKyc = async (e) => {
    e.preventDefault();
    if (!docUrl.trim()) return;
    try {
      const res = await axiosClient.post('/vendor/kyc', {
        docType,
        fileUrl: docUrl,
      });
      if (res.success) {
        alert('KYC document submitted for admin review!');
        setDocUrl('');
        fetchProfile();
      }
    } catch (err) {
      alert(`KYC upload error: ${err.message}`);
    }
  };

  if (loading) {
    return <div className="p-4 text-center"><div className="spinner-border text-success"></div></div>;
  }

  return (
    <div>
      <div className="mb-4">
        <h3 className="fw-bold mb-1">Store Settings & KYC Center</h3>
        <p className="text-muted small mb-0">Update your storefront branding, tax credentials, and warehouse pickup location.</p>
      </div>

      <div className="row g-4">
        {/* Store Profile Information */}
        <div className="col-lg-7">
          <div className="card card-modern p-4 mb-4">
            <h5 className="fw-bold mb-3 border-bottom pb-2">Storefront Identity</h5>

            <form onSubmit={handleSaveProfile}>
              <div className="mb-3">
                <label className="form-label small fw-semibold">Store Brand Name *</label>
                <input
                  type="text"
                  className="form-control form-control-sm"
                  required
                  value={profile?.storeName || ''}
                  onChange={(e) => setProfile({ ...profile, storeName: e.target.value })}
                />
              </div>

              <div className="row g-3 mb-3">
                <div className="col-md-6">
                  <label className="form-label small fw-semibold">Business Contact Phone *</label>
                  <input
                    type="text"
                    className="form-control form-control-sm"
                    value={profile?.phone || ''}
                    onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                  />
                </div>
                <div className="col-md-6">
                  <label className="form-label small fw-semibold">GSTIN Identification Number</label>
                  <input
                    type="text"
                    className="form-control form-control-sm text-uppercase"
                    value={profile?.gstin || ''}
                    onChange={(e) => setProfile({ ...profile, gstin: e.target.value })}
                  />
                </div>
              </div>

              <div className="mb-3">
                <label className="form-label small fw-semibold">Store Description & Bio</label>
                <textarea
                  className="form-control form-control-sm"
                  rows="3"
                  value={profile?.description || ''}
                  onChange={(e) => setProfile({ ...profile, description: e.target.value })}
                ></textarea>
              </div>

              <div className="row g-3 mb-4">
                <div className="col-md-6">
                  <label className="form-label small fw-semibold">Store Logo URL</label>
                  <input
                    type="text"
                    className="form-control form-control-sm"
                    value={profile?.logo || ''}
                    onChange={(e) => setProfile({ ...profile, logo: e.target.value })}
                  />
                </div>
                <div className="col-md-6">
                  <label className="form-label small fw-semibold">Store Banner Image URL</label>
                  <input
                    type="text"
                    className="form-control form-control-sm"
                    value={profile?.banner || ''}
                    onChange={(e) => setProfile({ ...profile, banner: e.target.value })}
                  />
                </div>
              </div>

              <h6 className="fw-bold mb-3 border-top pt-3 d-flex align-items-center gap-2">
                <MapPin size={18} className="text-danger" /> Shiprocket Pickup Warehouse Address
              </h6>

              <div className="mb-3">
                <label className="form-label small fw-semibold">Street Address *</label>
                <input
                  type="text"
                  className="form-control form-control-sm"
                  value={profile?.pickupAddress?.street || ''}
                  onChange={(e) =>
                    setProfile({
                      ...profile,
                      pickupAddress: { ...profile?.pickupAddress, street: e.target.value },
                    })
                  }
                />
              </div>

              <div className="row g-3 mb-4">
                <div className="col-md-4">
                  <label className="form-label small fw-semibold">City *</label>
                  <input
                    type="text"
                    className="form-control form-control-sm"
                    value={profile?.pickupAddress?.city || ''}
                    onChange={(e) =>
                      setProfile({
                        ...profile,
                        pickupAddress: { ...profile?.pickupAddress, city: e.target.value },
                      })
                    }
                  />
                </div>
                <div className="col-md-4">
                  <label className="form-label small fw-semibold">State *</label>
                  <input
                    type="text"
                    className="form-control form-control-sm"
                    value={profile?.pickupAddress?.state || ''}
                    onChange={(e) =>
                      setProfile({
                        ...profile,
                        pickupAddress: { ...profile?.pickupAddress, state: e.target.value },
                      })
                    }
                  />
                </div>
                <div className="col-md-4">
                  <label className="form-label small fw-semibold">Pincode *</label>
                  <input
                    type="text"
                    className="form-control form-control-sm"
                    value={profile?.pickupAddress?.pincode || ''}
                    onChange={(e) =>
                      setProfile({
                        ...profile,
                        pickupAddress: { ...profile?.pickupAddress, pincode: e.target.value },
                      })
                    }
                  />
                </div>
              </div>

              <button type="submit" className="btn btn-emerald btn-sm px-4 py-2" disabled={saving}>
                <Save size={16} className="me-1" /> {saving ? 'Saving...' : 'Save Settings'}
              </button>
            </form>
          </div>
        </div>

        {/* KYC Verification & Document Center */}
        <div className="col-lg-5">
          <div className="card card-modern p-4 mb-4">
            <h5 className="fw-bold mb-3 border-bottom pb-2 d-flex align-items-center gap-2">
              <ShieldCheck size={20} className="text-success" /> KYC Document Status
            </h5>

            <div className="d-flex flex-column gap-2 mb-4">
              {profile?.kycDocuments?.map((doc, idx) => (
                <div key={idx} className="p-3 rounded-3 bg-light border d-flex justify-content-between align-items-center">
                  <div>
                    <div className="fw-bold small">{doc.docType}</div>
                    <div className="text-muted" style={{ fontSize: '0.72rem' }}>
                      Status: <strong className={`text-${doc.status === 'verified' ? 'success' : 'warning'}`}>{doc.status?.toUpperCase()}</strong>
                    </div>
                  </div>
                  <span className={`badge ${doc.status === 'verified' ? 'bg-success' : 'bg-warning text-dark'}`}>
                    {doc.status}
                  </span>
                </div>
              ))}
            </div>

            <h6 className="fw-bold mb-2 small">Submit Additional KYC Proof</h6>
            <form onSubmit={handleUploadKyc} className="p-3 bg-light rounded-3 border">
              <div className="mb-2">
                <label className="form-label small fw-semibold">Document Type</label>
                <select
                  className="form-select form-select-sm"
                  value={docType}
                  onChange={(e) => setDocType(e.target.value)}
                >
                  <option value="GST Certificate">GST Certificate</option>
                  <option value="PAN Card">PAN Card</option>
                  <option value="Bank Cancelled Cheque">Bank Cancelled Cheque</option>
                  <option value="Business Registration Certificate">Business Registration Certificate</option>
                </select>
              </div>

              <div className="mb-3">
                <label className="form-label small fw-semibold">Document URL / Cloudinary Link</label>
                <input
                  type="text"
                  className="form-control form-control-sm"
                  placeholder="https://cdn.example.com/kyc/doc.pdf"
                  required
                  value={docUrl}
                  onChange={(e) => setDocUrl(e.target.value)}
                />
              </div>

              <button type="submit" className="btn btn-outline-emerald btn-sm w-100">
                <Upload size={14} className="me-1" /> Submit Document
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VendorSettings;

