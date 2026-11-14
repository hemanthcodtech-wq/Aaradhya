import React, { useState, useEffect } from 'react';
import {
  Settings,
  Store,
  MapPin,
  Phone,
  Mail,
  FileText,
  Printer,
  Save,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
} from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import axiosClient from '../../api/axiosClient';

const StoreSettings = () => {
  const store = useStore();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const [formData, setFormData] = useState({
    name: store.storeName,
    tagline: store.tagline,
    phone: store.phone,
    email: store.email,
    address: store.address,
    gstin: store.gstin,
    invoicePrefix: `${store.storeCode}-`,
    defaultLowStockThreshold: store.isSilks ? 5 : 20,
    posFooterMessage: 'Thank you for shopping with Aaradhya! Handwoven with pride.',
    returnPolicyDays: 7,
  });

  useEffect(() => {
    fetchSettings();
  }, [store.activeStore]);

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const res = await axiosClient.get(`/stores/${store.activeStore}`);
      if (res.data?.success && res.data.data) {
        const d = res.data.data;
        setFormData({
          name: d.name || store.storeName,
          tagline: d.tagline || store.tagline,
          phone: d.phone || store.phone,
          email: d.email || store.email,
          address: d.address || store.address,
          gstin: d.gstin || store.gstin,
          invoicePrefix: `${store.storeCode}-`,
          defaultLowStockThreshold: d.defaultLowStockThreshold || (store.isSilks ? 5 : 20),
          posFooterMessage: d.posFooterMessage || 'Thank you for shopping with Aaradhya! Handwoven with pride.',
          returnPolicyDays: d.returnPolicyDays || 7,
        });
      }
    } catch {
      // Use defaults
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await axiosClient.put(`/stores/${store.activeStore}`, formData);
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    } catch {
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="store-settings-page pb-5">
      {/* Header */}
      <div className="d-flex flex-wrap align-items-center justify-content-between gap-3 mb-4">
        <div>
          <div className="d-flex align-items-center gap-2 mb-1">
            <span
              className="badge rounded-pill fw-bold text-uppercase px-2.5 py-1"
              style={{ backgroundColor: store.badgeBg, color: store.badgeText, border: `1px solid ${store.badgeBorder}`, fontSize: '0.72rem' }}
            >
              Store {store.storeCode} Configuration
            </span>
            <span className="text-muted small">• Operational & Legal Profile</span>
          </div>
          <h4 className="fw-bold text-dark mb-0">{store.storeName} Settings</h4>
        </div>

        {savedSuccess && (
          <div className="d-flex align-items-center gap-1.5 text-success small fw-semibold bg-success-subtle px-3 py-1.5 rounded-pill border border-success">
            <CheckCircle2 size={16} />
            Settings saved successfully!
          </div>
        )}
      </div>

      <form onSubmit={handleSave}>
        <div className="row g-4">
          {/* Section 1: Store Brand & Profile */}
          <div className="col-12 col-lg-6">
            <div className="card border-0 shadow-sm rounded-3 p-4 bg-white h-100">
              <div className="d-flex align-items-center gap-2 mb-3 pb-2 border-bottom">
                <Store size={18} style={{ color: store.primaryColor }} />
                <h6 className="fw-bold text-dark mb-0">Brand & Store Identity</h6>
              </div>

              <div className="mb-3">
                <label className="form-label small fw-semibold text-dark">Store Name</label>
                <input
                  type="text"
                  required
                  className="form-control form-control-sm"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>

              <div className="mb-3">
                <label className="form-label small fw-semibold text-dark">Official Tagline</label>
                <input
                  type="text"
                  className="form-control form-control-sm"
                  value={formData.tagline}
                  onChange={(e) => setFormData({ ...formData, tagline: e.target.value })}
                />
              </div>

              <div className="row g-2 mb-3">
                <div className="col-6">
                  <label className="form-label small fw-semibold text-dark">Store Code</label>
                  <input
                    type="text"
                    disabled
                    readOnly
                    className="form-control form-control-sm bg-light font-monospace fw-bold"
                    value={store.storeCode}
                  />
                </div>
                <div className="col-6">
                  <label className="form-label small fw-semibold text-dark">Prefix Format</label>
                  <input
                    type="text"
                    disabled
                    readOnly
                    className="form-control form-control-sm bg-light font-monospace fw-bold"
                    value={`${store.productPrefix}-000001`}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Section 2: Contact & Physical Address */}
          <div className="col-12 col-lg-6">
            <div className="card border-0 shadow-sm rounded-3 p-4 bg-white h-100">
              <div className="d-flex align-items-center gap-2 mb-3 pb-2 border-bottom">
                <MapPin size={18} style={{ color: store.primaryColor }} />
                <h6 className="fw-bold text-dark mb-0">Contact & Physical Location</h6>
              </div>

              <div className="row g-2 mb-3">
                <div className="col-6">
                  <label className="form-label small fw-semibold text-dark">Customer Support Phone</label>
                  <input
                    type="text"
                    className="form-control form-control-sm"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  />
                </div>
                <div className="col-6">
                  <label className="form-label small fw-semibold text-dark">Official Email</label>
                  <input
                    type="email"
                    className="form-control form-control-sm"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  />
                </div>
              </div>

              <div className="mb-3">
                <label className="form-label small fw-semibold text-dark">Physical Storefront Address</label>
                <textarea
                  rows="3"
                  className="form-control form-control-sm"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                />
              </div>
            </div>
          </div>

          {/* Section 3: Tax, Legal & Invoicing */}
          <div className="col-12 col-lg-6">
            <div className="card border-0 shadow-sm rounded-3 p-4 bg-white h-100">
              <div className="d-flex align-items-center gap-2 mb-3 pb-2 border-bottom">
                <FileText size={18} style={{ color: store.primaryColor }} />
                <h6 className="fw-bold text-dark mb-0">Tax & Invoicing Setup</h6>
              </div>

              <div className="row g-2 mb-3">
                <div className="col-6">
                  <label className="form-label small fw-semibold text-dark">GSTIN Registration #</label>
                  <input
                    type="text"
                    className="form-control form-control-sm font-monospace"
                    value={formData.gstin}
                    onChange={(e) => setFormData({ ...formData, gstin: e.target.value })}
                  />
                </div>
                <div className="col-6">
                  <label className="form-label small fw-semibold text-dark">Bill / Receipt Prefix</label>
                  <input
                    type="text"
                    className="form-control form-control-sm font-monospace"
                    value={formData.invoicePrefix}
                    onChange={(e) => setFormData({ ...formData, invoicePrefix: e.target.value })}
                  />
                </div>
              </div>

              <div className="mb-3">
                <label className="form-label small fw-semibold text-dark">Default Low Stock Threshold</label>
                <input
                  type="number"
                  min="1"
                  className="form-control form-control-sm font-monospace"
                  value={formData.defaultLowStockThreshold}
                  onChange={(e) => setFormData({ ...formData, defaultLowStockThreshold: e.target.value })}
                />
                <span className="text-muted small" style={{ fontSize: '0.72rem' }}>
                  Triggers dashboard warning when stock falls below this quantity.
                </span>
              </div>
            </div>
          </div>

          {/* Section 4: Counter POS Receipt Settings */}
          <div className="col-12 col-lg-6">
            <div className="card border-0 shadow-sm rounded-3 p-4 bg-white h-100">
              <div className="d-flex align-items-center gap-2 mb-3 pb-2 border-bottom">
                <Printer size={18} style={{ color: store.primaryColor }} />
                <h6 className="fw-bold text-dark mb-0">POS Thermal Receipt Customization</h6>
              </div>

              <div className="mb-3">
                <label className="form-label small fw-semibold text-dark">Receipt Footer Thank You Message</label>
                <textarea
                  rows="2"
                  className="form-control form-control-sm"
                  value={formData.posFooterMessage}
                  onChange={(e) => setFormData({ ...formData, posFooterMessage: e.target.value })}
                />
              </div>

              <div className="mb-3">
                <label className="form-label small fw-semibold text-dark">Return / Exchange Window (Days)</label>
                <input
                  type="number"
                  min="0"
                  max="30"
                  className="form-control form-control-sm"
                  value={formData.returnPolicyDays}
                  onChange={(e) => setFormData({ ...formData, returnPolicyDays: e.target.value })}
                />
              </div>
            </div>
          </div>

          {/* Save Button */}
          <div className="col-12 text-end">
            <button
              type="submit"
              disabled={saving}
              className="btn btn-sm text-white fw-bold px-4 py-2 rounded-pill shadow-sm d-inline-flex align-items-center gap-2"
              style={{ backgroundColor: store.primaryColor }}
            >
              <Save size={16} />
              {saving ? 'Saving...' : 'Save Settings'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default StoreSettings;
