import React, { useState, useEffect } from 'react';
import {
  Image as ImageIcon,
  Plus,
  Trash2,
  Edit2,
  Upload,
  CheckCircle2,
  Eye,
  Layers,
  ArrowRight,
  Sparkles,
} from 'lucide-react';
import axiosClient from '../../api/axiosClient';

const AdminBanners = () => {
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [editingBannerId, setEditingBannerId] = useState(null);

  const initialForm = {
    title: 'Trendy Fashion, Better You',
    subtitle: 'Discover the latest collection in clothing for every occasion.',
    scriptTagline: 'Style Your World',
    badgeText: 'Up to 50% OFF',
    imageUrl: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=1600',
    linkUrl: '/products',
    ctaText: 'Shop Now →',
    position: 'hero_main',
    order: 0,
    isActive: true,
  };

  const [form, setForm] = useState(initialForm);

  const fetchBanners = async () => {
    setLoading(true);
    try {
      const res = await axiosClient.get('/banners?all=true');
      if (res.success) {
        setBanners(res.data);
      }
    } catch (err) {
      console.error('Failed to fetch banners', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBanners();
  }, []);

  // Handle image upload to Cloudinary
  const handleImageFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);
    try {
      const formData = new FormData();
      formData.append('image', file);
      formData.append('folder', 'aaradhya_banners');

      const res = await axiosClient.post('/upload/cloudinary', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      if (res.success && (res.data?.secure_url || res.data?.url)) {
        setForm((prev) => ({
          ...prev,
          imageUrl: res.data.secure_url || res.data.url,
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
    if (!form.title.trim()) {
      alert('Banner title is required');
      return;
    }

    try {
      if (editingBannerId) {
        await axiosClient.put(`/banners/${editingBannerId}`, form);
      } else {
        await axiosClient.post('/banners', form);
      }
      setShowModal(false);
      setEditingBannerId(null);
      setForm(initialForm);
      fetchBanners();
    } catch (err) {
      alert(`Save error: ${err.message}`);
    }
  };

  const handleEdit = (banner) => {
    setEditingBannerId(banner._id);
    setForm({
      title: banner.title || '',
      subtitle: banner.subtitle || '',
      scriptTagline: banner.scriptTagline || 'Style Your World',
      badgeText: banner.badgeText || 'Up to 50% OFF',
      imageUrl: banner.imageUrl || banner.image || '',
      linkUrl: banner.linkUrl || '/products',
      ctaText: banner.ctaText || 'Shop Now →',
      position: banner.position || 'hero_main',
      order: banner.order || banner.displayOrder || 0,
      isActive: banner.isActive !== false,
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this banner?')) return;
    try {
      await axiosClient.delete(`/banners/${id}`);
      fetchBanners();
    } catch (err) {
      alert(`Delete error: ${err.message}`);
    }
  };

  return (
    <div className="container-fluid p-0">
      {/* Header */}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-4">
        <div>
          <div className="d-flex align-items-center gap-2 mb-1">
            <h3 className="fw-bolder mb-0 text-dark">Hero Banners & CMS</h3>
            <span className="badge bg-primary bg-opacity-10 text-primary border" style={{ fontSize: '0.75rem' }}>
              Cloudinary Storage
            </span>
          </div>
          <p className="text-muted small mb-0">
            Create and manage customer storefront hero banners and promotional marketing assets.
          </p>
        </div>

        <button
          className="btn btn-primary rounded-pill px-4 py-2 d-flex align-items-center gap-2 text-white shadow-sm fw-bold"
          style={{ backgroundColor: '#E90064', borderColor: '#E90064' }}
          onClick={() => {
            setEditingBannerId(null);
            setForm(initialForm);
            setShowModal(true);
          }}
        >
          <Plus size={18} /> Add New Banner
        </button>
      </div>

      {/* Banner Cards Grid */}
      <div className="row g-4 mb-4">
        {loading ? (
          <div className="p-5 text-center text-muted">
            <div className="spinner-border text-primary" style={{ color: '#E90064' }}></div>
            <p className="small mt-2">Loading banners...</p>
          </div>
        ) : banners.length === 0 ? (
          <div className="col-12">
            <div className="admin-card p-5 text-center border-dashed">
              <ImageIcon size={48} className="mx-auto mb-2 text-muted opacity-50" />
              <h5 className="fw-bold">No Hero Banners Found</h5>
              <p className="text-muted small mb-3">Create your first storefront hero banner now.</p>
              <div>
                <button
                  className="btn btn-primary btn-sm px-4 rounded-pill text-white"
                  style={{ backgroundColor: '#E90064', borderColor: '#E90064' }}
                  onClick={() => setShowModal(true)}
                >
                  Create Banner
                </button>
              </div>
            </div>
          </div>
        ) : (
          banners.map((b) => (
            <div key={b._id} className="col-md-6 col-xl-4">
              <div className="admin-card h-100 overflow-hidden p-0 mb-0 shadow-2xs">
                <div className="position-relative" style={{ height: '200px', backgroundColor: '#F8F6F8' }}>
                  <img
                    src={b.imageUrl || b.image}
                    alt={b.title}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                  <span
                    className={`badge position-absolute top-0 end-0 m-2 ${b.isActive ? 'bg-success' : 'bg-secondary'}`}
                  >
                    {b.isActive ? 'Active' : 'Draft'}
                  </span>
                  {b.badgeText && (
                    <span
                      className="badge position-absolute bottom-0 start-0 m-2 text-white fw-bold shadow-sm"
                      style={{ backgroundColor: '#E90064' }}
                    >
                      {b.badgeText}
                    </span>
                  )}
                </div>

                <div className="p-3 d-flex flex-column flex-grow-1">
                  <div className="small fw-semibold text-success mb-1 fst-italic">
                    {b.scriptTagline || 'Style Your World'}
                  </div>
                  <h5 className="fw-bold text-dark mb-1 text-truncate" title={b.title}>
                    {b.title}
                  </h5>
                  <p className="text-muted small mb-3 line-clamp-2" style={{ fontSize: '0.8rem' }}>
                    {b.subtitle || 'Discover latest fashion and fabrics.'}
                  </p>

                  <div className="d-flex align-items-center justify-content-between pt-2 border-top mt-auto small">
                    <span className="text-muted">Link: {b.linkUrl || '/products'}</span>
                    <div className="d-flex gap-2">
                      <button
                        className="btn btn-sm btn-outline-secondary p-1.5"
                        onClick={() => handleEdit(b)}
                        title="Edit Banner"
                      >
                        <Edit2 size={15} />
                      </button>
                      <button
                        className="btn btn-sm btn-outline-danger p-1.5"
                        onClick={() => handleDelete(b._id)}
                        title="Delete Banner"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal: Create / Edit Banner */}
      {showModal && (
        <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1050 }}>
          <div className="modal-dialog modal-dialog-centered modal-lg">
            <div className="modal-content rounded-4 border-0 shadow-lg">
              <div className="modal-header border-bottom">
                <h5 className="modal-title fw-bold text-dark">
                  {editingBannerId ? 'Edit Hero Banner' : 'Create New Hero Banner'}
                </h5>
                <button type="button" className="btn-close" onClick={() => setShowModal(false)}></button>
              </div>

              <form onSubmit={handleSubmit}>
                <div className="modal-body p-4">
                  <div className="row g-3">
                    {/* Script Tagline */}
                    <div className="col-md-6">
                      <label className="form-label small fw-semibold text-muted">
                        Script Subtitle (Green Cursive)
                      </label>
                      <input
                        type="text"
                        className="form-control form-control-sm"
                        placeholder="e.g. Style Your World"
                        value={form.scriptTagline}
                        onChange={(e) => setForm({ ...form, scriptTagline: e.target.value })}
                      />
                    </div>

                    {/* Badge Text */}
                    <div className="col-md-6">
                      <label className="form-label small fw-semibold text-muted">
                        Floating Promo Badge Text
                      </label>
                      <input
                        type="text"
                        className="form-control form-control-sm"
                        placeholder="e.g. Up to 50% OFF"
                        value={form.badgeText}
                        onChange={(e) => setForm({ ...form, badgeText: e.target.value })}
                      />
                    </div>

                    {/* Main Title */}
                    <div className="col-12">
                      <label className="form-label small fw-semibold text-muted">
                        Main Banner Headline *
                      </label>
                      <input
                        type="text"
                        className="form-control form-control-sm"
                        placeholder="e.g. Trendy Fashion, Better You"
                        value={form.title}
                        onChange={(e) => setForm({ ...form, title: e.target.value })}
                        required
                      />
                    </div>

                    {/* Subtitle */}
                    <div className="col-12">
                      <label className="form-label small fw-semibold text-muted">
                        Description / Subtitle
                      </label>
                      <textarea
                        className="form-control form-control-sm"
                        rows="2"
                        placeholder="e.g. Discover the latest collection in clothing for every occasion."
                        value={form.subtitle}
                        onChange={(e) => setForm({ ...form, subtitle: e.target.value })}
                      />
                    </div>

                    {/* Cloudinary Image Upload */}
                    <div className="col-12">
                      <label className="form-label small fw-semibold text-muted">
                        Banner Image (Upload to Cloudinary or Paste URL)
                      </label>
                      <div className="d-flex gap-2 mb-2">
                        <input
                          type="text"
                          className="form-control form-control-sm"
                          placeholder="https://res.cloudinary.com/... or image link"
                          value={form.imageUrl}
                          onChange={(e) => setForm({ ...form, imageUrl: e.target.value })}
                        />
                        <label
                          className="btn btn-sm btn-outline-primary d-flex align-items-center gap-1 text-nowrap cursor-pointer mb-0"
                          style={{ borderColor: '#E90064', color: '#E90064' }}
                        >
                          <Upload size={14} />
                          <span>{uploadingImage ? 'Uploading...' : 'Upload Cloudinary'}</span>
                          <input
                            type="file"
                            accept="image/*"
                            className="d-none"
                            onChange={handleImageFileChange}
                            disabled={uploadingImage}
                          />
                        </label>
                      </div>

                      {/* Image Preview */}
                      {form.imageUrl && (
                        <div
                          className="rounded-3 border overflow-hidden p-1 bg-light position-relative"
                          style={{ maxHeight: '180px' }}
                        >
                          <img
                            src={form.imageUrl}
                            alt="Banner Preview"
                            style={{ width: '100%', height: '170px', objectFit: 'cover', borderRadius: '6px' }}
                          />
                        </div>
                      )}
                    </div>

                    {/* CTA Button Text & Link */}
                    <div className="col-md-6">
                      <label className="form-label small fw-semibold text-muted">CTA Button Text</label>
                      <input
                        type="text"
                        className="form-control form-control-sm"
                        placeholder="e.g. Shop Now →"
                        value={form.ctaText}
                        onChange={(e) => setForm({ ...form, ctaText: e.target.value })}
                      />
                    </div>

                    <div className="col-md-6">
                      <label className="form-label small fw-semibold text-muted">CTA Destination URL</label>
                      <input
                        type="text"
                        className="form-control form-control-sm"
                        placeholder="e.g. /products or /category/sarees"
                        value={form.linkUrl}
                        onChange={(e) => setForm({ ...form, linkUrl: e.target.value })}
                      />
                    </div>

                    {/* Active toggle */}
                    <div className="col-md-6 d-flex align-items-center pt-2">
                      <div className="form-check form-switch">
                        <input
                          className="form-check-input"
                          type="checkbox"
                          id="bannerActiveSwitch"
                          checked={form.isActive}
                          onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
                        />
                        <label className="form-check-label small fw-semibold" htmlFor="bannerActiveSwitch">
                          Active & Visible on Storefront
                        </label>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="modal-footer border-top bg-light rounded-bottom-4">
                  <button
                    type="button"
                    className="btn btn-outline-secondary btn-sm rounded-pill px-4"
                    onClick={() => setShowModal(false)}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn btn-primary btn-sm rounded-pill px-4 text-white fw-bold"
                    style={{ backgroundColor: '#E90064', borderColor: '#E90064' }}
                  >
                    {editingBannerId ? 'Update Banner' : 'Create Banner'}
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

export default AdminBanners;