import React, { useState, useEffect } from 'react';
import {
  Tag,
  Plus,
  Trash2,
  Edit2,
  Upload,
  CheckCircle2,
  Image as ImageIcon,
  Sparkles,
  Search,
  Store,
  Globe,
  Layers,
  ArrowUpDown,
  AlertTriangle,
} from 'lucide-react';
import axiosClient from '../../api/axiosClient';

const AdminCategories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [editingCatId, setEditingCatId] = useState(null);
  const [search, setSearch] = useState('');
  const [storeFilter, setStoreFilter] = useState('all');

  const initialForm = {
    name: '',
    slug: '',
    description: '',
    image: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=500',
    assignedStores: 'both', // 'AS' | 'AF' | 'both'
    displayOrder: 1,
    seoTitle: '',
    seoDescription: '',
    gstRate: 5,
    isActive: true,
  };

  const [form, setForm] = useState(initialForm);

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const res = await axiosClient.get('/categories?all=true');
      if (res.success) {
        setCategories(res.data);
      }
    } catch (err) {
      console.error('Failed to fetch categories', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleImageFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);
    try {
      const formData = new FormData();
      formData.append('image', file);
      formData.append('folder', 'aaradhya_categories');

      const res = await axiosClient.post('/upload/cloudinary', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      if (res.success && (res.data?.secure_url || res.data?.url)) {
        setForm((prev) => ({
          ...prev,
          image: res.data.secure_url || res.data.url,
        }));
      }
    } catch (err) {
      alert(`Cloudinary Upload Error: ${err.message || 'Upload failed'}`);
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) {
      alert('Category name is required');
      return;
    }

    try {
      if (editingCatId) {
        await axiosClient.put(`/categories/${editingCatId}`, form);
      } else {
        await axiosClient.post('/categories', form);
      }
      setShowModal(false);
      setEditingCatId(null);
      setForm(initialForm);
      fetchCategories();
    } catch (err) {
      alert(`Save error: ${err.message}`);
    }
  };

  const handleEdit = (cat) => {
    setEditingCatId(cat._id);
    setForm({
      name: cat.name || '',
      slug: cat.slug || '',
      description: cat.description || '',
      image: cat.image || '',
      assignedStores: cat.assignedStores || 'both',
      displayOrder: cat.displayOrder || 1,
      seoTitle: cat.seoTitle || '',
      seoDescription: cat.seoDescription || '',
      gstRate: cat.gstRate || 5,
      isActive: cat.isActive !== false,
    });
    setShowModal(true);
  };

  const handleDelete = async (id, productCount) => {
    if (productCount > 0) {
      alert(`Safety Guard Active: Cannot delete category because it has ${productCount} active products assigned. Reassign products first.`);
      return;
    }

    if (!window.confirm('Are you sure you want to delete this category?')) return;
    try {
      await axiosClient.delete(`/categories/${id}`);
      fetchCategories();
    } catch (err) {
      alert(`Delete error: ${err.message}`);
    }
  };

  const filtered = categories.filter((c) => {
    const matchesSearch =
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      (c.slug || '').toLowerCase().includes(search.toLowerCase());
    const matchesStore =
      storeFilter === 'all' ||
      (c.assignedStores || 'both') === storeFilter ||
      (c.assignedStores || 'both') === 'both';
    return matchesSearch && matchesStore;
  });

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
              CENTRAL TAXONOMY
            </span>
            <span
              className="badge px-2 py-0.5 fw-semibold"
              style={{ backgroundColor: '#EBF5FF', color: '#087CE5', border: '1px solid #BFDBFE', fontSize: '0.7rem' }}
            >
              Cross-Store Architecture
            </span>
          </div>
          <h2 className="fw-bolder mb-0" style={{ color: '#17233B' }}>
            Category &amp; Taxonomy Management
          </h2>
          <p className="text-muted small mb-0">
            Define master collections, assign store visibility (Silks, Fabrics, or Both), and control SEO metadata.
          </p>
        </div>

        <button
          className="btn text-white rounded-2 px-3.5 py-2 d-flex align-items-center gap-2 shadow-sm fw-bold"
          style={{ backgroundColor: '#E90064' }}
          onClick={() => {
            setEditingCatId(null);
            setForm(initialForm);
            setShowModal(true);
          }}
        >
          <Plus size={16} /> Add New Category
        </button>
      </div>

      {/* 2. Search & Filter Bar */}
      <div className="admin-card-tight mb-3">
        <div className="row g-2 align-items-center">
          <div className="col-12 col-md-4">
            <div className="input-group input-group-sm">
              <span className="input-group-text bg-white text-muted">
                <Search size={14} />
              </span>
              <input
                type="text"
                className="form-control"
                placeholder="Search categories by name or slug..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>

          <div className="col-12 col-md-3">
            <select
              className="form-select form-select-sm"
              value={storeFilter}
              onChange={(e) => setStoreFilter(e.target.value)}
            >
              <option value="all">All Stores Visibility</option>
              <option value="AS">Aaradhya Silks (AS)</option>
              <option value="AF">Aaradhya Fabrics (AF)</option>
              <option value="both">Both Stores</option>
            </select>
          </div>

          <div className="col-12 col-md-5 text-md-end text-muted small">
            Displaying <strong>{filtered.length}</strong> of {categories.length} categories
          </div>
        </div>
      </div>

      {/* 3. Categories Table */}
      <div className="admin-table-card shadow-2xs">
        <div className="table-responsive">
          <table className="admin-table table-hover align-middle mb-0" style={{ minWidth: '950px' }}>
            <thead>
              <tr>
                <th className="order-id-cell">Order</th>
                <th>Category Details</th>
                <th className="nowrap-cell">Slug</th>
                <th className="text-center nowrap-cell">Assigned Store</th>
                <th className="text-center nowrap-cell">Products</th>
                <th className="text-center nowrap-cell">GST Rate</th>
                <th className="text-center nowrap-cell">Status</th>
                <th className="actions-cell">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="8" className="text-center py-5 text-muted">
                    <div className="spinner-border spinner-border-sm text-primary me-2" role="status" />
                    Loading taxonomy...
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan="8" className="text-center py-5 text-muted">
                    No categories found. Click "Add New Category" above to create one.
                  </td>
                </tr>
              ) : (
                filtered.map((cat, idx) => (
                  <tr key={cat._id || idx}>
                    {/* Display Order */}
                    <td className="ps-3 fw-bold text-muted font-monospace">
                      #{cat.displayOrder || idx + 1}
                    </td>

                    {/* Category Details */}
                    <td>
                      <div className="d-flex align-items-center gap-2.5">
                        <img
                          src={cat.image || 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=100'}
                          alt={cat.name}
                          className="rounded-2 border flex-shrink-0"
                          style={{ width: '42px', height: '42px', objectFit: 'cover' }}
                        />
                        <div>
                          <div className="fw-bold" style={{ color: '#17233B' }}>{cat.name}</div>
                          <div className="text-muted small text-truncate" style={{ maxWidth: '220px' }}>
                            {cat.description || 'Authentic Indian ethnic handloom collection'}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Slug */}
                    <td>
                      <code className="text-primary small">/category/{cat.slug}</code>
                    </td>

                    {/* Assigned Store */}
                    <td>
                      {cat.assignedStores === 'AS' && (
                        <span className="badge px-2 py-1" style={{ backgroundColor: '#FFF0F5', color: '#E90064', border: '1px solid #FFD6E5' }}>
                          <Store size={11} className="me-1 inline" /> Aaradhya Silks
                        </span>
                      )}
                      {cat.assignedStores === 'AF' && (
                        <span className="badge px-2 py-1" style={{ backgroundColor: '#EBF5FF', color: '#087CE5', border: '1px solid #BFDBFE' }}>
                          <Store size={11} className="me-1 inline" /> Aaradhya Fabrics
                        </span>
                      )}
                      {(!cat.assignedStores || cat.assignedStores === 'both') && (
                        <span className="badge px-2 py-1 bg-secondary-subtle text-secondary border">
                          <Store size={11} className="me-1 inline" /> Both Stores
                        </span>
                      )}
                    </td>

                    {/* Product Count */}
                    <td className="text-center">
                      <span className="badge rounded-pill bg-light text-dark border px-2.5 py-1 font-monospace">
                        {cat.productCount || 0} SKUs
                      </span>
                    </td>

                    {/* GST Rate */}
                    <td className="text-center text-muted fw-semibold">
                      {cat.gstRate || 5}%
                    </td>

                    {/* Status */}
                    <td className="text-center">
                      <span
                        className={`badge px-2 py-0.5 rounded-pill ${
                          cat.isActive !== false ? 'bg-success-subtle text-success' : 'bg-secondary-subtle text-secondary'
                        }`}
                      >
                        {cat.isActive !== false ? 'Active' : 'Inactive'}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="pe-3 text-end">
                      <div className="d-flex justify-content-end gap-1.5">
                        <button
                          className="btn btn-sm btn-light p-1.5 rounded-2"
                          onClick={() => handleEdit(cat)}
                          title="Edit Category &amp; SEO"
                        >
                          <Edit2 size={13} className="text-secondary" />
                        </button>
                        <button
                          className="btn btn-sm btn-light p-1.5 rounded-2 text-danger"
                          onClick={() => handleDelete(cat._id, cat.productCount || 0)}
                          title="Delete Category"
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

      {/* 4. Modal: Create / Edit Category with Store Assignment & SEO */}
      {showModal && (
        <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1050 }}>
          <div className="modal-dialog modal-dialog-centered modal-lg">
            <div className="modal-content rounded-3 border-0 shadow-lg">
              <div className="modal-header border-bottom py-3">
                <h5 className="modal-title fw-bold" style={{ color: '#17233B' }}>
                  {editingCatId ? 'Edit Category & SEO Configuration' : 'Create Master Taxonomy Category'}
                </h5>
                <button type="button" className="btn-close" onClick={() => setShowModal(false)}></button>
              </div>

              <form onSubmit={handleSubmit}>
                <div className="modal-body p-4">
                  <div className="row g-3">
                    {/* Basic Info */}
                    <div className="col-md-6">
                      <label className="form-label small fw-semibold text-muted">Category Name *</label>
                      <input
                        type="text"
                        className="form-control form-control-sm"
                        placeholder="e.g. Pure Silk Sarees, Linen Yardage"
                        value={form.name}
                        onChange={(e) => setForm({ ...form, name: e.target.value })}
                        required
                      />
                    </div>

                    <div className="col-md-3">
                      <label className="form-label small fw-semibold text-muted">Assigned Store *</label>
                      <select
                        className="form-select form-select-sm"
                        value={form.assignedStores}
                        onChange={(e) => setForm({ ...form, assignedStores: e.target.value })}
                      >
                        <option value="both">Both Stores (AS + AF)</option>
                        <option value="AS">Aaradhya Silks (AS)</option>
                        <option value="AF">Aaradhya Fabrics (AF)</option>
                      </select>
                    </div>

                    <div className="col-md-3">
                      <label className="form-label small fw-semibold text-muted">Display Priority Order</label>
                      <input
                        type="number"
                        className="form-control form-control-sm"
                        value={form.displayOrder}
                        onChange={(e) => setForm({ ...form, displayOrder: Number(e.target.value) || 1 })}
                      />
                    </div>

                    <div className="col-12">
                      <label className="form-label small fw-semibold text-muted">Category Description</label>
                      <textarea
                        className="form-control form-control-sm"
                        rows="2"
                        placeholder="Handwoven pure silk sarees from South Indian master weavers with authentic Silk Mark certification."
                        value={form.description}
                        onChange={(e) => setForm({ ...form, description: e.target.value })}
                      />
                    </div>

                    {/* Image URL & Upload */}
                    <div className="col-12">
                      <label className="form-label small fw-semibold text-muted">
                        Category Cover Image (Cloudinary or Direct URL)
                      </label>
                      <div className="d-flex gap-2 mb-2">
                        <input
                          type="text"
                          className="form-control form-control-sm"
                          placeholder="https://res.cloudinary.com/... or image link"
                          value={form.image}
                          onChange={(e) => setForm({ ...form, image: e.target.value })}
                        />
                        <label
                          className="btn btn-sm btn-outline-secondary d-flex align-items-center gap-1 text-nowrap cursor-pointer mb-0"
                        >
                          <Upload size={14} />
                          <span>{uploadingImage ? 'Uploading...' : 'Cloudinary'}</span>
                          <input
                            type="file"
                            accept="image/*"
                            className="d-none"
                            onChange={handleImageFileChange}
                            disabled={uploadingImage}
                          />
                        </label>
                      </div>

                      {form.image && (
                        <div className="d-flex align-items-center gap-2 p-2 rounded bg-light border">
                          <img
                            src={form.image}
                            alt="Category Preview"
                            className="rounded-2 border"
                            style={{ width: '48px', height: '48px', objectFit: 'cover' }}
                          />
                          <span className="small text-muted text-truncate" style={{ maxWidth: '400px' }}>
                            {form.image}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* SEO Settings */}
                    <div className="col-12 border-top pt-3">
                      <h6 className="fw-bold mb-2 d-flex align-items-center gap-1.5" style={{ color: '#17233B' }}>
                        <Globe size={15} className="text-primary" /> Search Engine Optimization (SEO)
                      </h6>
                    </div>

                    <div className="col-md-6">
                      <label className="form-label small fw-semibold text-muted">Meta SEO Title</label>
                      <input
                        type="text"
                        className="form-control form-control-sm"
                        placeholder="e.g. Buy Handwoven Silk Sarees Online | Aaradhya"
                        value={form.seoTitle}
                        onChange={(e) => setForm({ ...form, seoTitle: e.target.value })}
                      />
                    </div>

                    <div className="col-md-6">
                      <label className="form-label small fw-semibold text-muted">GST Rate (%)</label>
                      <input
                        type="number"
                        className="form-control form-control-sm"
                        value={form.gstRate}
                        onChange={(e) => setForm({ ...form, gstRate: Number(e.target.value) || 5 })}
                      />
                    </div>

                    <div className="col-12">
                      <label className="form-label small fw-semibold text-muted">Meta SEO Description</label>
                      <textarea
                        className="form-control form-control-sm"
                        rows="2"
                        placeholder="Shop authentic Kanjeevaram and Banarasi handloom sarees at best prices with Silk Mark guarantee."
                        value={form.seoDescription}
                        onChange={(e) => setForm({ ...form, seoDescription: e.target.value })}
                      />
                    </div>

                    <div className="col-12">
                      <div className="form-check form-switch">
                        <input
                          className="form-check-input"
                          type="checkbox"
                          id="catActiveSwitch"
                          checked={form.isActive}
                          onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
                        />
                        <label className="form-check-label small fw-semibold" htmlFor="catActiveSwitch">
                          Category Active and Visible on Storefront
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
                    {editingCatId ? 'Save Changes' : 'Create Category'}
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

export default AdminCategories;
