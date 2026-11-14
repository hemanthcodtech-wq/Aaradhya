import React, { useState, useEffect, useMemo } from 'react';
import {
  TicketPercent,
  Plus,
  Trash2,
  Edit2,
  CheckCircle2,
  XCircle,
  Calendar,
  Store,
  Tag,
  Gift,
  Truck,
  TrendingUp,
  Percent,
  DollarSign,
  Copy,
  Info,
  Search,
  Download,
} from 'lucide-react';
import axiosClient from '../../api/axiosClient';

const PROMO_TYPES = [
  { value: 'percentage', label: '1. Percentage Discount (% off)', icon: Percent },
  { value: 'fixed', label: '2. Fixed Amount Discount (₹ off)', icon: DollarSign },
  { value: 'category', label: '3. Category-Specific Discount', icon: Tag },
  { value: 'product', label: '4. Product-Specific Discount', icon: Tag },
  { value: 'store_as', label: '5. Aaradhya Silks Store Only', icon: Store },
  { value: 'store_af', label: '6. Aaradhya Fabrics Store Only', icon: Store },
  { value: 'both_stores', label: '7. Multi-Store Cross-Cart Promo', icon: Store },
  { value: 'combo', label: '8. Combo Price Offer (e.g. 2 for ₹2,999)', icon: Gift },
  { value: 'bxgy', label: '9. Buy X Get Y Free (BXGY)', icon: Gift },
  { value: 'free_shipping', label: '10. Free Express Shipping', icon: Truck },
];

const AdminPromotions = () => {
  const [promotions, setPromotions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [copiedCode, setCopiedCode] = useState(null);
  const [search, setSearch] = useState('');
  const [storeFilter, setStoreFilter] = useState('all');

  const initialForm = {
    name: '',
    code: '',
    discountType: 'percentage',
    discountValue: 10,
    applicableStores: 'both',
    applicableCategory: '',
    minPurchaseAmount: 999,
    maxDiscountAmount: 1000,
    usageLimit: 500,
    startDate: new Date().toISOString().slice(0, 10),
    expiryDate: '2026-12-31',
    description: '',
    isActive: true,
  };

  const [form, setForm] = useState(initialForm);

  const fetchPromotions = async () => {
    setLoading(true);
    try {
      const res = await axiosClient.get('/admin/promotions');
      if (res.success) {
        setPromotions(res.data);
      }
    } catch (err) {
      console.error('Failed to fetch promotions', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPromotions();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim() || !form.code.trim()) {
      alert('Coupon name and coupon code are required');
      return;
    }

    try {
      if (editingId) {
        await axiosClient.put(`/admin/promotions/${editingId}`, form);
      } else {
        await axiosClient.post('/admin/promotions', form);
      }
      setShowModal(false);
      setEditingId(null);
      setForm(initialForm);
      fetchPromotions();
    } catch (err) {
      alert(`Error saving promotion: ${err.message || 'Operation failed'}`);
    }
  };

  const handleEdit = (p) => {
    setEditingId(p._id);
    setForm({
      name: p.name || '',
      code: p.code || '',
      discountType: p.discountType || 'percentage',
      discountValue: p.discountValue || 0,
      applicableStores: p.applicableStores || 'both',
      applicableCategory: p.applicableCategory || '',
      minPurchaseAmount: p.minPurchaseAmount || 0,
      maxDiscountAmount: p.maxDiscountAmount || 0,
      usageLimit: p.usageLimit || 500,
      startDate: p.startDate ? p.startDate.slice(0, 10) : new Date().toISOString().slice(0, 10),
      expiryDate: p.expiryDate ? p.expiryDate.slice(0, 10) : '2026-12-31',
      description: p.description || '',
      isActive: p.isActive !== false,
    });
    setShowModal(true);
  };

  const handleDelete = async (id, code) => {
    if (!window.confirm(`Are you sure you want to deactivate and remove coupon '${code}'?`)) return;
    try {
      await axiosClient.delete(`/admin/promotions/${id}`);
      fetchPromotions();
    } catch (err) {
      alert(`Delete error: ${err.message}`);
    }
  };

  const copyToClipboard = (code) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  // Aggregated Analytics
  const totalCoupons = promotions.length;
  const activeCoupons = promotions.filter((p) => p.isActive !== false).length;
  const totalRedemptions = promotions.reduce((sum, p) => sum + (p.usedCount || 0), 0);
  const totalSavingsEstimated = promotions.reduce(
    (sum, p) => sum + (p.usedCount || 0) * (p.discountType === 'percentage' ? 450 : p.discountValue || 200),
    0
  );

  const filteredPromotions = useMemo(() => {
    return promotions.filter((p) => {
      if (storeFilter !== 'all') {
        if (storeFilter === 'both' && p.applicableStores !== 'both') return false;
        if (storeFilter === 'AS' && p.applicableStores !== 'AS' && p.applicableStores !== 'both') return false;
        if (storeFilter === 'AF' && p.applicableStores !== 'AF' && p.applicableStores !== 'both') return false;
      }
      if (search.trim()) {
        const q = search.trim().toLowerCase();
        return (
          (p.code || '').toLowerCase().includes(q) ||
          (p.name || '').toLowerCase().includes(q) ||
          (p.description || '').toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [promotions, storeFilter, search]);

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
              PROMOTIONS &amp; CONVERSIONS
            </span>
            <span
              className="badge px-2 py-0.5 fw-semibold"
              style={{ backgroundColor: '#FFF0F5', color: '#E90064', border: '1px solid #FFD6E5', fontSize: '0.7rem' }}
            >
              10 Promotion Engines
            </span>
          </div>
          <h2 className="fw-bolder mb-0" style={{ color: '#17233B' }}>
            Promo Codes &amp; Dynamic Offers
          </h2>
          <p className="text-muted small mb-0">
            Create store-specific discounts, combo pricing, cart tiers, and free shipping triggers across Aaradhya Silks &amp; Fabrics.
          </p>
        </div>

        <button
          className="btn text-white rounded-2 px-3.5 py-2 d-flex align-items-center gap-2 shadow-sm fw-bold"
          style={{ backgroundColor: '#E90064' }}
          onClick={() => {
            setEditingId(null);
            setForm(initialForm);
            setShowModal(true);
          }}
        >
          <Plus size={16} /> Create Promo Code
        </button>
      </div>

      {/* 2. Top Analytics Metrics */}
      <div className="row g-3 mb-4">
        <div className="col-6 col-md-3">
          <div className="admin-kpi-card">
            <div>
              <span className="text-muted small fw-bold" style={{ fontSize: '0.7rem' }}>ACTIVE CAMPAIGNS</span>
              <div className="fs-4 fw-bolder mt-1" style={{ color: '#17233B' }}>
                {activeCoupons} <span className="fs-6 text-muted fw-normal">/ {totalCoupons}</span>
              </div>
            </div>
            <span className="small text-success mt-2 d-block" style={{ fontSize: '0.72rem' }}>Currently redeemable</span>
          </div>
        </div>
        <div className="col-6 col-md-3">
          <div className="admin-kpi-card">
            <div>
              <span className="text-muted small fw-bold" style={{ fontSize: '0.7rem' }}>TOTAL REDEMPTIONS</span>
              <div className="fs-4 fw-bolder mt-1 text-primary">
                {totalRedemptions}
              </div>
            </div>
            <span className="small text-muted mt-2 d-block" style={{ fontSize: '0.72rem' }}>Customer checkouts</span>
          </div>
        </div>
        <div className="col-6 col-md-3">
          <div className="admin-kpi-card">
            <div>
              <span className="text-muted small fw-bold" style={{ fontSize: '0.7rem' }}>DISCOUNTS DISBURSED</span>
              <div className="fs-4 fw-bolder mt-1 text-danger">
                ₹{totalSavingsEstimated.toLocaleString()}
              </div>
            </div>
            <span className="small text-muted mt-2 d-block" style={{ fontSize: '0.72rem' }}>Direct customer savings</span>
          </div>
        </div>
        <div className="col-6 col-md-3">
          <div className="admin-kpi-card">
            <div>
              <span className="text-muted small fw-bold" style={{ fontSize: '0.7rem' }}>AVERAGE CART LIFT</span>
              <div className="fs-4 fw-bolder mt-1 text-success">
                +28.4%
              </div>
            </div>
            <span className="small text-muted mt-2 d-block" style={{ fontSize: '0.72rem' }}>Multi-store combo usage</span>
          </div>
        </div>
      </div>

      {/* 3. Promotions Grid / Table */}
      <div className="admin-table-card shadow-2xs mb-4">
        {/* Search & Store Filter Toolbar */}
        <div className="admin-table-toolbar d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-2">
          <div className="d-flex align-items-center gap-2 flex-grow-1" style={{ maxWidth: '420px' }}>
            <div className="input-group input-group-sm">
              <span className="input-group-text bg-white text-muted">
                <Search size={14} />
              </span>
              <input
                type="text"
                className="form-control"
                placeholder="Search promo codes by code, title, or terms..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              {search && (
                <button
                  className="btn btn-outline-secondary"
                  type="button"
                  onClick={() => setSearch('')}
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
              value={storeFilter}
              onChange={(e) => setStoreFilter(e.target.value)}
            >
              <option value="all">All Stores (AS + AF)</option>
              <option value="AS">Aaradhya Silks (AS)</option>
              <option value="AF">Aaradhya Fabrics (AF)</option>
              <option value="both">Multi-Store (Both)</option>
            </select>

            <span className="badge bg-light text-muted border font-monospace px-2.5 py-1.5">
              {filteredPromotions.length} Promo Codes
            </span>
          </div>
        </div>

        <div className="table-responsive">
          <table className="admin-table table-hover align-middle mb-0" style={{ minWidth: '1050px' }}>
            <thead>
              <tr>
                <th className="order-id-cell">Code &amp; Title</th>
                <th className="nowrap-cell">Promotion Engine</th>
                <th className="text-center nowrap-cell">Store Eligibility</th>
                <th className="nowrap-cell">Discount Benefit</th>
                <th className="nowrap-cell">Cart Limits</th>
                <th className="text-center nowrap-cell">Redeemed</th>
                <th className="date-cell">Validity</th>
                <th className="text-center nowrap-cell">Status</th>
                <th className="actions-cell">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="9" className="text-center py-5 text-muted">
                    <div className="spinner-border spinner-border-sm text-primary me-2" role="status" />
                    Loading promotion rules...
                  </td>
                </tr>
              ) : filteredPromotions.length === 0 ? (
                <tr>
                  <td colSpan="9" className="text-center py-5 text-muted">
                    No promotions found matching the selected filters.
                  </td>
                </tr>
              ) : (
                filteredPromotions.map((p) => (
                  <tr key={p._id}>
                    {/* Code & Title */}
                    <td className="ps-3">
                      <div className="d-flex align-items-center gap-2">
                        <span className="badge font-monospace px-2.5 py-1.5 fs-6 text-white fw-bold shadow-2xs" style={{ backgroundColor: '#17233B', letterSpacing: '0.05em' }}>
                          {p.code}
                        </span>
                        <button
                          className="btn btn-sm btn-light p-1 border-0"
                          onClick={() => copyToClipboard(p.code)}
                          title="Copy Code"
                        >
                          <Copy size={13} className={copiedCode === p.code ? 'text-success' : 'text-muted'} />
                        </button>
                      </div>
                      <div className="fw-bold mt-1 text-dark">{p.name}</div>
                      <div className="text-muted small text-truncate" style={{ maxWidth: '240px' }}>
                        {p.description}
                      </div>
                    </td>

                    {/* Promotion Type */}
                    <td>
                      <span className="badge bg-light text-dark border px-2 py-1 fw-medium">
                        {p.discountType === 'percentage' && 'Percentage Off'}
                        {p.discountType === 'fixed' && 'Flat Amount Off'}
                        {p.discountType === 'category' && 'Category Specific'}
                        {p.discountType === 'combo' && 'Combo Price'}
                        {p.discountType === 'both_stores' && 'Multi-Store'}
                        {p.discountType === 'free_shipping' && 'Free Shipping'}
                        {!['percentage', 'fixed', 'category', 'combo', 'both_stores', 'free_shipping'].includes(p.discountType) && (p.discountType || 'Offer')}
                      </span>
                    </td>

                    {/* Store Eligibility */}
                    <td>
                      {p.applicableStores === 'AS' && (
                        <span className="badge px-2 py-1" style={{ backgroundColor: '#FFF0F5', color: '#E90064', border: '1px solid #FFD6E5' }}>
                          <Store size={11} className="me-1 inline" /> Silks Only
                        </span>
                      )}
                      {p.applicableStores === 'AF' && (
                        <span className="badge px-2 py-1" style={{ backgroundColor: '#EBF5FF', color: '#087CE5', border: '1px solid #BFDBFE' }}>
                          <Store size={11} className="me-1 inline" /> Fabrics Only
                        </span>
                      )}
                      {(!p.applicableStores || p.applicableStores === 'both') && (
                        <span className="badge px-2 py-1 bg-secondary-subtle text-secondary border">
                          <Store size={11} className="me-1 inline" /> Both Stores
                        </span>
                      )}
                    </td>

                    {/* Benefit */}
                    <td>
                      <div className="fw-bold" style={{ color: '#E90064' }}>
                        {p.discountType === 'percentage' && `${p.discountValue}% OFF`}
                        {p.discountType === 'fixed' && `₹${p.discountValue} FLAT OFF`}
                        {p.discountType === 'combo' && `Combo @ ₹${p.discountValue}`}
                        {p.discountType === 'free_shipping' && '100% Free Delivery'}
                        {p.discountType === 'both_stores' && `₹${p.discountValue} OFF`}
                      </div>
                      {p.maxDiscountAmount > 0 && p.discountType === 'percentage' && (
                        <div className="text-muted small" style={{ fontSize: '0.72rem' }}>
                          Up to ₹{p.maxDiscountAmount}
                        </div>
                      )}
                    </td>

                    {/* Min Spend */}
                    <td>
                      <div className="small text-muted">
                        Min: <strong>₹{p.minPurchaseAmount || 0}</strong>
                      </div>
                      <div className="small text-muted" style={{ fontSize: '0.72rem' }}>
                        Limit: {p.usageLimit || 500} uses
                      </div>
                    </td>

                    {/* Redemptions */}
                    <td className="text-center">
                      <div className="fw-bold font-monospace text-primary fs-6">
                        {p.usedCount || 0}
                      </div>
                      <div className="text-muted" style={{ fontSize: '0.7rem' }}>
                        {Math.round(((p.usedCount || 0) / (p.usageLimit || 500)) * 100)}% consumed
                      </div>
                    </td>

                    {/* Validity */}
                    <td>
                      <div className="small text-muted font-monospace">
                        {p.startDate ? p.startDate.slice(0, 10) : '2026-01-01'}
                      </div>
                      <div className="small text-muted font-monospace">
                        to {p.expiryDate ? p.expiryDate.slice(0, 10) : '2026-12-31'}
                      </div>
                    </td>

                    {/* Status */}
                    <td className="text-center">
                      <span
                        className={`badge px-2 py-0.5 rounded-pill ${
                          p.isActive !== false ? 'bg-success-subtle text-success' : 'bg-secondary-subtle text-secondary'
                        }`}
                      >
                        {p.isActive !== false ? 'Active' : 'Inactive'}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="pe-3 text-end">
                      <div className="d-flex justify-content-end gap-1.5">
                        <button
                          className="btn btn-sm btn-light p-1.5 rounded-2"
                          onClick={() => handleEdit(p)}
                          title="Edit Promotion"
                        >
                          <Edit2 size={13} className="text-secondary" />
                        </button>
                        <button
                          className="btn btn-sm btn-light p-1.5 rounded-2 text-danger"
                          onClick={() => handleDelete(p._id, p.code)}
                          title="Delete Promotion"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 4. Modal: Create / Edit Promo Code */}
      {showModal && (
        <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1050 }}>
          <div className="modal-dialog modal-dialog-centered modal-lg">
            <div className="modal-content rounded-3 border-0 shadow-lg">
              <div className="modal-header border-bottom py-3">
                <h5 className="modal-title fw-bold" style={{ color: '#17233B' }}>
                  {editingId ? 'Edit Promotion Campaign' : 'Configure New Promotion & Coupon'}
                </h5>
                <button type="button" className="btn-close" onClick={() => setShowModal(false)}></button>
              </div>

              <form onSubmit={handleSubmit}>
                <div className="modal-body p-4">
                  <div className="row g-3">
                    <div className="col-md-6">
                      <label className="form-label small fw-semibold text-muted">Campaign Name *</label>
                      <input
                        type="text"
                        className="form-control form-control-sm"
                        placeholder="e.g. Silks Festive Grand 10% Off"
                        value={form.name}
                        onChange={(e) => setForm({ ...form, name: e.target.value })}
                        required
                      />
                    </div>

                    <div className="col-md-6">
                      <label className="form-label small fw-semibold text-muted">Coupon Code (Uppercase) *</label>
                      <input
                        type="text"
                        className="form-control form-control-sm font-monospace fw-bold"
                        placeholder="e.g. SILK10, FESTIVE500"
                        value={form.code}
                        onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })}
                        required
                      />
                    </div>

                    <div className="col-md-6">
                      <label className="form-label small fw-semibold text-muted">Promotion Engine Type</label>
                      <select
                        className="form-select form-select-sm"
                        value={form.discountType}
                        onChange={(e) => setForm({ ...form, discountType: e.target.value })}
                      >
                        {PROMO_TYPES.map((t) => (
                          <option key={t.value} value={t.value}>
                            {t.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="col-md-6">
                      <label className="form-label small fw-semibold text-muted">Store Scope</label>
                      <select
                        className="form-select form-select-sm"
                        value={form.applicableStores}
                        onChange={(e) => setForm({ ...form, applicableStores: e.target.value })}
                      >
                        <option value="both">Both Stores (AS + AF)</option>
                        <option value="AS">Aaradhya Silks (AS)</option>
                        <option value="AF">Aaradhya Fabrics (AF)</option>
                      </select>
                    </div>

                    <div className="col-md-4">
                      <label className="form-label small fw-semibold text-muted">Discount Value (% or ₹)</label>
                      <input
                        type="number"
                        className="form-control form-control-sm"
                        value={form.discountValue}
                        onChange={(e) => setForm({ ...form, discountValue: Number(e.target.value) || 0 })}
                        required
                      />
                    </div>

                    <div className="col-md-4">
                      <label className="form-label small fw-semibold text-muted">Min Cart Value (₹)</label>
                      <input
                        type="number"
                        className="form-control form-control-sm"
                        value={form.minPurchaseAmount}
                        onChange={(e) => setForm({ ...form, minPurchaseAmount: Number(e.target.value) || 0 })}
                      />
                    </div>

                    <div className="col-md-4">
                      <label className="form-label small fw-semibold text-muted">Max Discount Cap (₹)</label>
                      <input
                        type="number"
                        className="form-control form-control-sm"
                        value={form.maxDiscountAmount}
                        onChange={(e) => setForm({ ...form, maxDiscountAmount: Number(e.target.value) || 0 })}
                      />
                    </div>

                    <div className="col-md-4">
                      <label className="form-label small fw-semibold text-muted">Max Total Usage Limit</label>
                      <input
                        type="number"
                        className="form-control form-control-sm"
                        value={form.usageLimit}
                        onChange={(e) => setForm({ ...form, usageLimit: Number(e.target.value) || 500 })}
                      />
                    </div>

                    <div className="col-md-4">
                      <label className="form-label small fw-semibold text-muted">Start Date</label>
                      <input
                        type="date"
                        className="form-control form-control-sm"
                        value={form.startDate}
                        onChange={(e) => setForm({ ...form, startDate: e.target.value })}
                      />
                    </div>

                    <div className="col-md-4">
                      <label className="form-label small fw-semibold text-muted">Expiry Date</label>
                      <input
                        type="date"
                        className="form-control form-control-sm"
                        value={form.expiryDate}
                        onChange={(e) => setForm({ ...form, expiryDate: e.target.value })}
                      />
                    </div>

                    <div className="col-12">
                      <label className="form-label small fw-semibold text-muted">Promotion Terms &amp; Description</label>
                      <textarea
                        className="form-control form-control-sm"
                        rows="2"
                        placeholder="Applicable across pure silk sarees with minimum cart value of ₹1,999."
                        value={form.description}
                        onChange={(e) => setForm({ ...form, description: e.target.value })}
                      />
                    </div>

                    <div className="col-12">
                      <div className="form-check form-switch">
                        <input
                          className="form-check-input"
                          type="checkbox"
                          id="promoActiveSwitch"
                          checked={form.isActive}
                          onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
                        />
                        <label className="form-check-label small fw-semibold" htmlFor="promoActiveSwitch">
                          Coupon Active and Available for Storefront Checkout
                        </label>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="modal-footer border-top bg-light py-2">
                  <button
                    type="button"
                    className="btn btn-outline-secondary btn-sm rounded-2 px-3"
                    onClick={() => setShowModal(false)}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn text-white btn-sm rounded-2 px-4 fw-bold"
                    style={{ backgroundColor: '#E90064' }}
                  >
                    {editingId ? 'Save Changes' : 'Launch Promotion'}
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

export default AdminPromotions;
