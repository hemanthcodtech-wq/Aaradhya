import React, { useState, useEffect } from 'react';
import {
  Settings,
  Store,
  CreditCard,
  Truck,
  ShieldCheck,
  Save,
  CheckCircle2,
  RefreshCw,
  Building,
  Mail,
  Phone,
  MapPin,
  Lock,
} from 'lucide-react';
import axiosClient from '../../api/axiosClient';

const AdminSettings = () => {
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const res = await axiosClient.get('/admin/settings');
      if (res.success) {
        setSettings(res.data);
      }
    } catch (err) {
      console.error('Failed to load settings', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setSaveSuccess(false);
    try {
      const res = await axiosClient.put('/admin/settings', settings);
      if (res.success) {
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 3000);
      }
    } catch (err) {
      alert(`Save failed: ${err.message}`);
    } finally {
      setSaving(false);
    }
  };

  if (loading || !settings) {
    return (
      <div className="container-fluid py-5 text-center text-muted">
        <div className="spinner-border spinner-border-sm text-primary me-2" role="status" />
        Loading platform configuration...
      </div>
    );
  }

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
              CENTRAL PLATFORM CONFIGURATION
            </span>
            <span
              className="badge px-2 py-0.5 fw-semibold"
              style={{ backgroundColor: '#FFF0F5', color: '#E90064', border: '1px solid #FFD6E5', fontSize: '0.7rem' }}
            >
              Multi-Store Core
            </span>
          </div>
          <h2 className="fw-bolder mb-0" style={{ color: '#17233B' }}>
            System Settings &amp; Store Configuration
          </h2>
          <p className="text-muted small mb-0">
            Configure central brand identity, branch parameters, Razorpay payment gateway credentials, and logistics rules.
          </p>
        </div>

        <button
          onClick={handleSave}
          disabled={saving}
          className="btn text-white rounded-2 px-4 py-2 d-flex align-items-center gap-2 shadow-sm fw-bold"
          style={{ backgroundColor: '#E90064' }}
        >
          {saving ? (
            <div className="spinner-border spinner-border-sm text-white" role="status" />
          ) : (
            <Save size={16} />
          )}
          <span>{saving ? 'Saving...' : 'Save Configuration'}</span>
        </button>
      </div>

      {saveSuccess && (
        <div className="alert alert-success d-flex align-items-center gap-2 py-2 mb-4">
          <CheckCircle2 size={16} />
          <span>Platform configuration updated and saved securely to MongoDB Atlas.</span>
        </div>
      )}

      <form onSubmit={handleSave}>
        <div className="row g-4">
          {/* Section A: Brand & Headquarters */}
          <div className="col-12 col-lg-6">
            <div className="admin-card h-100 mb-0">
              <h5 className="fw-bold mb-3 d-flex align-items-center gap-2" style={{ color: '#17233B' }}>
                <Building size={18} className="text-primary" /> Central Brand &amp; Headquarters
              </h5>

              <div className="mb-3">
                <label className="form-label small fw-semibold text-muted">Platform Name</label>
                <input
                  type="text"
                  className="form-control form-control-sm"
                  value={settings.platformName || ''}
                  onChange={(e) => setSettings({ ...settings, platformName: e.target.value })}
                />
              </div>

              <div className="mb-3">
                <label className="form-label small fw-semibold text-muted">Official Tagline</label>
                <input
                  type="text"
                  className="form-control form-control-sm"
                  value={settings.brandTagline || ''}
                  onChange={(e) => setSettings({ ...settings, brandTagline: e.target.value })}
                />
              </div>

              <div className="row g-2 mb-3">
                <div className="col-6">
                  <label className="form-label small fw-semibold text-muted">Official Email</label>
                  <input
                    type="email"
                    className="form-control form-control-sm"
                    value={settings.officialEmail || ''}
                    onChange={(e) => setSettings({ ...settings, officialEmail: e.target.value })}
                  />
                </div>
                <div className="col-6">
                  <label className="form-label small fw-semibold text-muted">Customer Support Phone</label>
                  <input
                    type="text"
                    className="form-control form-control-sm"
                    value={settings.phone || ''}
                    onChange={(e) => setSettings({ ...settings, phone: e.target.value })}
                  />
                </div>
              </div>

              <div className="mb-0">
                <label className="form-label small fw-semibold text-muted">Headquarters &amp; Central Hub Address</label>
                <textarea
                  className="form-control form-control-sm"
                  rows="2"
                  value={settings.headquarters || ''}
                  onChange={(e) => setSettings({ ...settings, headquarters: e.target.value })}
                />
              </div>
            </div>
          </div>

          {/* Section B: Razorpay Payment Gateway & Logistics */}
          <div className="col-12 col-lg-6">
            <div className="admin-card h-100 mb-0">
              <h5 className="fw-bold mb-3 d-flex align-items-center gap-2" style={{ color: '#17233B' }}>
                <CreditCard size={18} className="text-success" /> Razorpay &amp; Payment Gateway
              </h5>

              <div className="mb-3">
                <label className="form-label small fw-semibold text-muted">Gateway Status</label>
                <input
                  type="text"
                  className="form-control form-control-sm bg-light"
                  value={settings.razorpayStatus || 'Active (Sandbox Verified)'}
                  readOnly
                />
              </div>

              <div className="mb-3">
                <label className="form-label small fw-semibold text-muted">Razorpay Key ID</label>
                <input
                  type="text"
                  className="form-control form-control-sm font-monospace"
                  value={settings.razorpayKeyId || ''}
                  onChange={(e) => setSettings({ ...settings, razorpayKeyId: e.target.value })}
                />
              </div>

              <h6 className="fw-bold mt-4 mb-2 d-flex align-items-center gap-1.5" style={{ color: '#17233B' }}>
                <Truck size={16} className="text-secondary" /> Shipping &amp; Tax Parameters
              </h6>

              <div className="row g-2">
                <div className="col-4">
                  <label className="form-label small fw-semibold text-muted">GST Tax Rate (%)</label>
                  <input
                    type="number"
                    className="form-control form-control-sm"
                    value={settings.gstTaxRate || 5}
                    onChange={(e) => setSettings({ ...settings, gstTaxRate: Number(e.target.value) || 5 })}
                  />
                </div>
                <div className="col-4">
                  <label className="form-label small fw-semibold text-muted">Default Shipping (₹)</label>
                  <input
                    type="number"
                    className="form-control form-control-sm"
                    value={settings.defaultShippingFee || 99}
                    onChange={(e) => setSettings({ ...settings, defaultShippingFee: Number(e.target.value) || 99 })}
                  />
                </div>
                <div className="col-4">
                  <label className="form-label small fw-semibold text-muted">Free Shipping From (₹)</label>
                  <input
                    type="number"
                    className="form-control form-control-sm"
                    value={settings.freeShippingThreshold || 999}
                    onChange={(e) => setSettings({ ...settings, freeShippingThreshold: Number(e.target.value) || 999 })}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Section C: Independent Store Branches Configuration */}
          <div className="col-12">
            <div className="admin-card mb-4">
              <h5 className="fw-bold mb-3 d-flex align-items-center gap-2" style={{ color: '#17233B' }}>
                <Store size={18} className="text-info" /> Multi-Store Branches (Aaradhya Silks &amp; Fabrics)
              </h5>

              <div className="row g-3">
                {/* Store AS */}
                <div className="col-12 col-md-6">
                  <div className="p-3 rounded-3 border" style={{ backgroundColor: '#FFF9FB', borderColor: '#FFD6E5' }}>
                    <div className="d-flex align-items-center gap-2 mb-2">
                      <span className="badge px-2.5 py-1 text-white fw-bold" style={{ backgroundColor: '#E90064' }}>
                        STORE CODE: AS
                      </span>
                      <h6 className="fw-bold mb-0" style={{ color: '#17233B' }}>
                        Aaradhya Silks
                      </h6>
                    </div>
                    <p className="small text-muted mb-2">
                      Specialty: Pure Kanchipuram, Banarasi, and Pochampally Handloom Silk Sarees.
                    </p>
                    <div className="small text-muted">
                      <div>Default SKU Prefix: <strong className="font-monospace">AS-SILK-</strong></div>
                      <div>POS Counter Terminal: <strong className="text-success">Online &amp; Active</strong></div>
                      <div>GSTIN: <strong className="font-monospace">36AARAS8921B1Z4</strong></div>
                    </div>
                  </div>
                </div>

                {/* Store AF */}
                <div className="col-12 col-md-6">
                  <div className="p-3 rounded-3 border" style={{ backgroundColor: '#F7FAFF', borderColor: '#BFDBFE' }}>
                    <div className="d-flex align-items-center gap-2 mb-2">
                      <span className="badge px-2.5 py-1 text-white fw-bold" style={{ backgroundColor: '#087CE5' }}>
                        STORE CODE: AF
                      </span>
                      <h6 className="fw-bold mb-0" style={{ color: '#17233B' }}>
                        Aaradhya Fabrics
                      </h6>
                    </div>
                    <p className="small text-muted mb-2">
                      Specialty: Artisan Linen, Hand Block Print, and Running Yardage Fabrics.
                    </p>
                    <div className="small text-muted">
                      <div>Default SKU Prefix: <strong className="font-monospace">AF-FAB-</strong></div>
                      <div>POS Counter Terminal: <strong className="text-success">Online &amp; Active</strong></div>
                      <div>GSTIN: <strong className="font-monospace">36AARAF7293C2Z8</strong></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

export default AdminSettings;
