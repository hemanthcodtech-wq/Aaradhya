import React, { useState, useEffect } from 'react';
import {
  Camera,
  Plus,
  Trash2,
  Upload,
  CheckCircle2,
  Sparkles,
  RefreshCw,
  ExternalLink,
  Layers,
} from 'lucide-react';
import axiosClient from '../../api/axiosClient';

const AdminGallery = () => {
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);

  const initialForm = {
    imageUrl: '',
    caption: '',
    tag: 'Lookbook',
    aspect: 'portrait',
    order: 0,
  };

  const [form, setForm] = useState(initialForm);

  const fetchGallery = async () => {
    setLoading(true);
    try {
      const res = await axiosClient.get('/gallery');
      if (res.success) {
        setImages(res.data);
      }
    } catch (err) {
      console.error('Failed to fetch gallery images', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGallery();
  }, []);

  // Upload photo to Cloudinary
  const handleImageFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);
    try {
      const formData = new FormData();
      formData.append('image', file);
      formData.append('folder', 'aaradhya_gallery');

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
    if (!form.imageUrl.trim()) {
      alert('Please upload an image or provide an image URL');
      return;
    }

    try {
      await axiosClient.post('/gallery', form);
      setShowModal(false);
      setForm(initialForm);
      fetchGallery();
    } catch (err) {
      alert(`Failed to save gallery photo: ${err.message}`);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to remove this lookbook photo?')) return;
    try {
      await axiosClient.delete(`/gallery/${id}`);
      fetchGallery();
    } catch (err) {
      alert(`Failed to delete: ${err.message}`);
    }
  };

  return (
    <div className="container-fluid p-0">
      {/* Page Header */}
      <div className="d-flex flex-wrap justify-content-between align-items-center gap-3 mb-4">
        <div>
          <div className="d-flex align-items-center gap-2 mb-1">
            <span className="badge px-2.5 py-1 text-white rounded-pill" style={{ backgroundColor: '#E90064', fontSize: '0.72rem' }}>
              CLOUDINARY POWERED
            </span>
            <span className="badge bg-dark rounded-pill small">SUPER ADMIN</span>
          </div>
          <h2 className="fw-bolder mb-1 text-dark" style={{ letterSpacing: '-0.4px' }}>
            Aaradhya Lookbook & Lifestyle Gallery
          </h2>
          <p className="text-secondary small mb-0">
            Manage high-fashion lifestyle imagery, customer lookbook moments, and Instagram social feeds stored in Cloudinary.
          </p>
        </div>

        <div className="d-flex gap-2">
          <button
            type="button"
            className="btn btn-outline-secondary btn-sm d-flex align-items-center gap-1.5 rounded-pill px-3"
            onClick={fetchGallery}
          >
            <RefreshCw size={14} /> Refresh
          </button>
          <button
            type="button"
            className="btn rounded-pill px-4 py-2 text-white fw-bold d-flex align-items-center gap-2 shadow-sm"
            style={{ backgroundColor: '#E90064', borderColor: '#E90064' }}
            onClick={() => {
              setForm(initialForm);
              setShowModal(true);
            }}
          >
            <Plus size={16} /> Add Lookbook Photo
          </button>
        </div>
      </div>

      {/* Info Card */}
      <div
        className="admin-card-tight mb-4"
        style={{ backgroundColor: '#FFF5F9', border: '1px solid #FBCFE8' }}
      >
        <div className="d-flex align-items-center gap-3">
          <div
            className="rounded-circle d-flex align-items-center justify-content-center text-white flex-shrink-0"
            style={{ width: '42px', height: '42px', backgroundColor: '#E90064' }}
          >
            <Camera size={20} />
          </div>
          <div className="flex-grow-1">
            <h6 className="fw-bold mb-0 text-dark">Live Lookbook Scroller Integration</h6>
            <p className="text-muted small mb-0">
              Photos uploaded here appear seamlessly on the customer storefront homepage under the Aaradhya Moments Lookbook scroller.
            </p>
          </div>
          <span className="badge bg-white text-dark border px-3 py-2 rounded-pill fw-bold">
            Total Photos: {images.length}
          </span>
        </div>
      </div>

      {/* Photos Grid */}
      {loading ? (
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status" />
          <p className="text-muted small mt-2">Loading gallery photos from Cloudinary...</p>
        </div>
      ) : images.length === 0 ? (
        <div className="admin-card p-5 text-center bg-white">
          <Camera size={44} className="mx-auto text-muted mb-2" />
          <h5 className="fw-bold">No gallery photos yet</h5>
          <p className="text-muted small">Upload your first high-fashion photo to start the lookbook.</p>
        </div>
      ) : (
        <div className="row g-3 row-cols-1 row-cols-sm-2 row-cols-md-3 row-cols-lg-4">
          {images.map((img) => (
            <div key={img._id} className="col">
              <div
                className="admin-card h-100 overflow-hidden p-0 mb-0"
                style={{ border: '1px solid #EAECF0' }}
              >
                <div
                  className="position-relative overflow-hidden bg-light"
                  style={{ paddingTop: '115%' }}
                >
                  <img
                    src={img.imageUrl}
                    alt={img.caption}
                    className="position-absolute top-0 start-0 w-100 h-100"
                    style={{ objectFit: 'cover' }}
                  />
                  <span
                    className="position-absolute top-0 start-0 m-2 badge rounded-pill px-2.5 py-1 text-white shadow-sm"
                    style={{ backgroundColor: '#17233B', fontSize: '0.68rem' }}
                  >
                    {img.tag || 'Lookbook'}
                  </span>

                  <button
                    type="button"
                    className="btn btn-sm btn-light position-absolute top-0 end-0 m-2 rounded-circle p-1.5 shadow text-danger"
                    onClick={() => handleDelete(img._id)}
                    title="Delete photo"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>

                <div className="p-3 d-flex flex-column flex-grow-1">
                  <h6 className="fw-bold text-dark text-truncate mb-1" title={img.caption}>
                    {img.caption || 'Aaradhya Sarees & Silks Moment'}
                  </h6>
                  <div className="d-flex align-items-center justify-content-between mt-auto pt-2 border-top">
                    <span className="small text-muted" style={{ fontSize: '0.72rem' }}>
                      Aspect: <strong className="text-dark">{img.aspect}</strong>
                    </span>
                    <a
                      href={img.imageUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="small text-decoration-none d-flex align-items-center gap-1"
                      style={{ color: '#087CE5', fontSize: '0.72rem' }}
                    >
                      <span>View</span>
                      <ExternalLink size={11} />
                    </a>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Upload Modal */}
      {showModal && (
        <div
          className="modal fade show d-block"
          tabIndex="-1"
          style={{ backgroundColor: 'rgba(15, 23, 42, 0.65)', backdropFilter: 'blur(4px)', zIndex: 1060 }}
          onClick={() => setShowModal(false)}
        >
          <div
            className="modal-dialog modal-dialog-centered"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-content border-0 rounded-4 shadow-lg overflow-hidden">
              <div className="modal-header border-bottom py-3 px-4 bg-light">
                <h5 className="modal-title fw-bold text-dark d-flex align-items-center gap-2">
                  <Camera size={20} style={{ color: '#E90064' }} />
                  <span>Upload Lookbook Photo (Cloudinary)</span>
                </h5>
                <button type="button" className="btn-close" onClick={() => setShowModal(false)} />
              </div>

              <form onSubmit={handleSubmit}>
                <div className="modal-body p-4">
                  {/* Cloudinary File Upload Dropzone */}
                  <div className="mb-3">
                    <label className="form-label small fw-bold">Select Photo *</label>
                    <div
                      className="p-3 text-center rounded-3 border-2 border-dashed bg-light mb-2"
                      style={{ borderColor: '#CBD5E1', cursor: 'pointer' }}
                      onClick={() => document.getElementById('galleryFileInput').click()}
                    >
                      <Upload size={28} className="text-secondary mb-1" />
                      <p className="small mb-1 fw-semibold text-dark">
                        {uploadingImage ? 'Uploading to Cloudinary...' : 'Click to Browse & Upload Photo'}
                      </p>
                      <small className="text-muted d-block" style={{ fontSize: '0.7rem' }}>
                        Supports JPG, PNG, WEBP (Max 10MB)
                      </small>
                      <input
                        id="galleryFileInput"
                        type="file"
                        accept="image/*"
                        className="d-none"
                        onChange={handleImageFileChange}
                        disabled={uploadingImage}
                      />
                    </div>

                    {uploadingImage && (
                      <div className="text-center py-2">
                        <span className="spinner-border spinner-border-sm text-primary me-2" />
                        <span className="small text-muted">Optimizing and storing on Cloudinary...</span>
                      </div>
                    )}
                  </div>

                  {/* Or Direct Image URL */}
                  <div className="mb-3">
                    <label className="form-label small fw-bold">Image URL</label>
                    <input
                      type="url"
                      className="form-control form-control-sm"
                      placeholder="https://..."
                      value={form.imageUrl}
                      onChange={(e) => setForm({ ...form, imageUrl: e.target.value })}
                      required
                    />
                  </div>

                  {/* Preview */}
                  {form.imageUrl && (
                    <div className="mb-3 text-center">
                      <img
                        src={form.imageUrl}
                        alt="Preview"
                        className="rounded-3 shadow-sm"
                        style={{ maxHeight: '180px', maxWidth: '100%', objectFit: 'cover' }}
                      />
                    </div>
                  )}

                  {/* Caption */}
                  <div className="mb-3">
                    <label className="form-label small fw-bold">Caption / Title</label>
                    <input
                      type="text"
                      className="form-control form-control-sm"
                      placeholder="e.g. Pure Kanjeevaram Festive Glow"
                      value={form.caption}
                      onChange={(e) => setForm({ ...form, caption: e.target.value })}
                    />
                  </div>

                  <div className="row g-2 mb-3">
                    <div className="col-6">
                      <label className="form-label small fw-bold">Collection Tag</label>
                      <select
                        className="form-select form-select-sm"
                        value={form.tag}
                        onChange={(e) => setForm({ ...form, tag: e.target.value })}
                      >
                        <option value="Lookbook">Lookbook</option>
                        <option value="Silks">Aaradhya Silks</option>
                        <option value="Fabrics">Aaradhya Fabrics</option>
                        <option value="Celebrations">Celebrations</option>
                        <option value="Festive">Festive Glamour</option>
                      </select>
                    </div>

                    <div className="col-6">
                      <label className="form-label small fw-bold">Collage Layout / Aspect</label>
                      <select
                        className="form-select form-select-sm"
                        value={form.aspect}
                        onChange={(e) => setForm({ ...form, aspect: e.target.value })}
                      >
                        <option value="hero">Wide Hero Centerpiece (Full Height)</option>
                        <option value="portrait">Single Portrait (Full Height)</option>
                        <option value="stacked">Stacked Grid (Half Height)</option>
                        <option value="square">Square</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div className="modal-footer bg-light px-4 py-3">
                  <button
                    type="button"
                    className="btn btn-outline-secondary btn-sm rounded-pill px-3"
                    onClick={() => setShowModal(false)}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn btn-sm rounded-pill px-4 text-white fw-bold shadow-sm"
                    style={{ backgroundColor: '#E90064', borderColor: '#E90064' }}
                    disabled={uploadingImage || !form.imageUrl}
                  >
                    Save Photo
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

export default AdminGallery;
