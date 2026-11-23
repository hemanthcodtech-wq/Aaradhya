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
  Video,
  Play,
  Heart,
  MessageCircle,
  Eye,
  Pin,
  Settings,
  Tag,
  Save,
  Check,
} from 'lucide-react';
import { FaInstagram } from 'react-icons/fa6';
import axiosClient from '../../api/axiosClient';

const AdminGallery = () => {
  const [activeTab, setActiveTab] = useState('instagram'); // 'instagram' | 'manual'
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [syncSuccessMessage, setSyncSuccessMessage] = useState('');

  // Instagram Config & Feed State
  const [instaConfig, setInstaConfig] = useState({
    instagramId: 'aaradhya_silks_kphb',
    username: 'aaradhya_silks_kphb',
    accessToken: '',
    autoSync: true,
  });
  const [savingConfig, setSavingConfig] = useState(false);
  const [instaItems, setInstaItems] = useState([]);
  const [filterType, setFilterType] = useState('all'); // 'all' | 'reels' | 'photos'
  const [products, setProducts] = useState([]);

  // Tag Product Modal
  const [editingItem, setEditingItem] = useState(null);
  const [selectedProductId, setSelectedProductId] = useState('');

  // Manual Cloudinary Gallery State
  const [manualImages, setManualImages] = useState([]);
  const [showManualModal, setShowManualModal] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const initialForm = {
    imageUrl: '',
    caption: '',
    tag: 'Lookbook',
    aspect: 'portrait',
    order: 0,
  };
  const [form, setForm] = useState(initialForm);

  // Load Instagram Config, Feed & Catalog Products
  const loadData = async () => {
    setLoading(true);
    try {
      const [configRes, feedRes, prodsRes, galleryRes] = await Promise.all([
        axiosClient.get('/instagram/config'),
        axiosClient.get('/instagram/feed?type=all&limit=30'),
        axiosClient.get('/products?limit=50'),
        axiosClient.get('/gallery'),
      ]);

      if (configRes.success && configRes.data) {
        setInstaConfig({
          instagramId: configRes.data.instagramId || 'aaradhya_silks_kphb',
          username: configRes.data.username || 'aaradhya_silks_kphb',
          accessToken: configRes.data.accessToken || '',
          autoSync: configRes.data.autoSync !== false,
          lastSyncedAt: configRes.data.lastSyncedAt,
          stats: configRes.data.stats,
        });
      }

      if (feedRes.success && feedRes.data?.items) {
        setInstaItems(feedRes.data.items);
      }

      if (prodsRes.success && prodsRes.data?.products) {
        setProducts(prodsRes.data.products);
      } else if (prodsRes.success && Array.isArray(prodsRes.data)) {
        setProducts(prodsRes.data);
      }

      if (galleryRes.success && galleryRes.data) {
        setManualImages(galleryRes.data);
      }
    } catch (err) {
      console.error('Failed to load gallery/instagram data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Save Instagram Settings
  const handleSaveConfig = async (e) => {
    e.preventDefault();
    setSavingConfig(true);
    try {
      const res = await axiosClient.put('/instagram/config', instaConfig);
      if (res.success) {
        setSyncSuccessMessage('Instagram ID settings saved successfully!');
        setTimeout(() => setSyncSuccessMessage(''), 3000);
      }
    } catch (err) {
      alert(`Save Error: ${err.message}`);
    } finally {
      setSavingConfig(false);
    }
  };

  // Trigger Automatic Fetch & Sync of Posts & Reels
  const handleSyncInstagram = async () => {
    setSyncing(true);
    setSyncSuccessMessage('');
    try {
      const res = await axiosClient.post('/instagram/sync', {
        handle: instaConfig.instagramId || instaConfig.username,
        accessToken: instaConfig.accessToken,
      });

      if (res.success) {
        setSyncSuccessMessage(`Successfully fetched ${res.data?.count || 8} posts & reels for @${res.data?.handle || instaConfig.instagramId}!`);
        await loadData();
        setTimeout(() => setSyncSuccessMessage(''), 5000);
      }
    } catch (err) {
      alert(`Instagram Sync Error: ${err.message || 'Failed to fetch Instagram feed'}`);
    } finally {
      setSyncing(false);
    }
  };

  // Toggle Pin on an Instagram Item
  const handleTogglePin = async (item) => {
    try {
      await axiosClient.put(`/instagram/feed/${item._id}`, {
        isPinned: !item.isPinned,
      });
      loadData();
    } catch (err) {
      alert(`Update failed: ${err.message}`);
    }
  };

  // Toggle Visibility
  const handleToggleActive = async (item) => {
    try {
      await axiosClient.put(`/instagram/feed/${item._id}`, {
        isActive: !item.isActive,
      });
      loadData();
    } catch (err) {
      alert(`Update failed: ${err.message}`);
    }
  };

  // Delete Item
  const handleDeleteItem = async (id) => {
    if (!window.confirm('Are you sure you want to remove this item from the feed?')) return;
    try {
      await axiosClient.delete(`/instagram/feed/${id}`);
      loadData();
    } catch (err) {
      alert(`Delete failed: ${err.message}`);
    }
  };

  // Save Tagged Product
  const handleSaveTaggedProduct = async () => {
    if (!editingItem) return;
    const selectedProd = products.find((p) => p._id === selectedProductId || p.productId === selectedProductId);

    const payload = selectedProd
      ? {
          taggedProduct: {
            productId: selectedProd.productId,
            name: selectedProd.name,
            slug: selectedProd.slug || selectedProd._id,
            price: selectedProd.price,
            mrp: selectedProd.mrp || Math.round(selectedProd.price * 1.3),
            discount: selectedProd.discountPercent || 25,
            image: selectedProd.image || selectedProd.images?.[0] || editingItem.thumbnailUrl,
            storeCode: selectedProd.storeCode || 'AS',
            storeName: selectedProd.storeCode === 'AF' ? 'Aaradhya Fabrics' : 'Aaradhya Silks',
            color: selectedProd.color || 'Heritage Saree',
          },
        }
      : { taggedProduct: {} };

    try {
      await axiosClient.put(`/instagram/feed/${editingItem._id}`, payload);
      setEditingItem(null);
      loadData();
    } catch (err) {
      alert(`Failed to tag product: ${err.message}`);
    }
  };

  // Manual Cloudinary Upload Handlers
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
      alert(`Upload Error: ${err.message}`);
    } finally {
      setUploadingImage(false);
    }
  };

  const handleManualSubmit = async (e) => {
    e.preventDefault();
    if (!form.imageUrl.trim()) {
      alert('Please upload an image or provide an image URL');
      return;
    }
    try {
      await axiosClient.post('/gallery', form);
      setShowManualModal(false);
      setForm(initialForm);
      loadData();
    } catch (err) {
      alert(`Failed to save: ${err.message}`);
    }
  };

  const handleManualDelete = async (id) => {
    if (!window.confirm('Delete this photo?')) return;
    try {
      await axiosClient.delete(`/gallery/${id}`);
      loadData();
    } catch (err) {
      alert(`Failed to delete: ${err.message}`);
    }
  };

  // Filter items
  const filteredInstaItems = instaItems.filter((item) => {
    if (filterType === 'reels') return item.isReel;
    if (filterType === 'photos') return !item.isReel;
    return true;
  });

  return (
    <div className="container-fluid p-0">
      {/* Page Header */}
      <div className="d-flex flex-wrap justify-content-between align-items-center gap-3 mb-4">
        <div>
          <div className="d-flex align-items-center gap-2 mb-1">
            <span
              className="badge px-2.5 py-1 text-white rounded-pill d-inline-flex align-items-center gap-1.5"
              style={{
                background: 'linear-gradient(45deg, #f09433 0%, #e6683c 25%, #dc2743 50%, #cc2366 75%, #bc1888 100%)',
                fontSize: '0.74rem',
              }}
            >
              <FaInstagram size={12} /> INSTAGRAM AUTO-FETCH
            </span>
            <span className="badge bg-dark rounded-pill small">SUPER ADMIN</span>
          </div>
          <h2 className="fw-bolder mb-1 text-dark" style={{ letterSpacing: '-0.4px' }}>
            Aaradhya Instagram Feed & Lookbook Gallery
          </h2>
          <p className="text-secondary small mb-0">
            Automatically fetch and moderate Instagram posts and video reels from your official handle, or manage custom lookbook uploads.
          </p>
        </div>

        {/* Global Action Buttons */}
        <div className="d-flex gap-2">
          <button
            type="button"
            className="btn btn-outline-secondary btn-sm d-flex align-items-center gap-1.5 rounded-pill px-3"
            onClick={loadData}
          >
            <RefreshCw size={14} /> Refresh
          </button>
          <button
            type="button"
            className="btn btn-sm rounded-pill px-3.5 py-2 text-white fw-bold d-flex align-items-center gap-2 shadow-sm"
            style={{
              background: 'linear-gradient(45deg, #f09433 0%, #e6683c 25%, #dc2743 50%, #cc2366 75%, #bc1888 100%)',
              border: 'none',
            }}
            onClick={handleSyncInstagram}
            disabled={syncing}
          >
            {syncing ? (
              <>
                <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true" />
                <span>Fetching Reels & Posts...</span>
              </>
            ) : (
              <>
                <RefreshCw size={15} />
                <span>Sync Instagram Now</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Sync Success Toast */}
      {syncSuccessMessage && (
        <div className="alert alert-success d-flex align-items-center gap-2 py-2 px-3 mb-4 shadow-sm rounded-3">
          <CheckCircle2 size={18} className="text-success" />
          <span className="small fw-semibold">{syncSuccessMessage}</span>
        </div>
      )}

      {/* Main Mode Tabs (Instagram Auto Feed vs Manual Lookbook) */}
      <div className="d-flex gap-2 mb-4 border-bottom pb-2">
        <button
          className={`btn btn-sm rounded-pill px-3.5 fw-bold d-flex align-items-center gap-2 ${
            activeTab === 'instagram' ? 'btn-dark text-white' : 'btn-light border text-muted'
          }`}
          onClick={() => setActiveTab('instagram')}
        >
          <FaInstagram size={14} className={activeTab === 'instagram' ? 'text-danger' : ''} />
          <span>Automated Instagram Feed & Reels ({instaItems.length})</span>
        </button>
        <button
          className={`btn btn-sm rounded-pill px-3.5 fw-bold d-flex align-items-center gap-2 ${
            activeTab === 'manual' ? 'btn-dark text-white' : 'btn-light border text-muted'
          }`}
          onClick={() => setActiveTab('manual')}
        >
          <Camera size={14} />
          <span>Manual Cloudinary Uploads ({manualImages.length})</span>
        </button>
      </div>

      {/* TAB 1: AUTOMATED INSTAGRAM FEED & REELS */}
      {activeTab === 'instagram' && (
        <div>
          {/* 1. Super Admin Instagram Account Configuration Card */}
          <div className="card border shadow-sm rounded-4 p-4 mb-4 bg-white">
            <div className="d-flex justify-content-between align-items-center border-bottom pb-3 mb-3 flex-wrap gap-2">
              <div className="d-flex align-items-center gap-2.5">
                <div
                  className="rounded-circle d-flex align-items-center justify-content-center text-white"
                  style={{
                    width: '38px',
                    height: '38px',
                    background: 'linear-gradient(45deg, #f09433 0%, #e6683c 25%, #dc2743 50%, #cc2366 75%, #bc1888 100%)',
                  }}
                >
                  <FaInstagram size={18} />
                </div>
                <div>
                  <h6 className="fw-bolder mb-0 text-dark">Instagram Feed Connection Settings</h6>
                  <p className="text-muted small mb-0">
                    Provide the official Instagram Handle or User ID. The platform automatically retrieves all posts and video reels.
                  </p>
                </div>
              </div>

              {instaConfig.lastSyncedAt && (
                <span className="badge bg-light text-dark border px-3 py-1.5 small">
                  Last Synced: {new Date(instaConfig.lastSyncedAt).toLocaleString()}
                </span>
              )}
            </div>

            <form onSubmit={handleSaveConfig}>
              <div className="row g-3 align-items-end">
                {/* Instagram Handle / ID */}
                <div className="col-md-4">
                  <label className="form-label small fw-bold text-dark mb-1">
                    Instagram Handle / ID <span className="text-danger">*</span>
                  </label>
                  <div className="input-group input-group-sm">
                    <span className="input-group-text bg-light text-muted">@</span>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="e.g. aaradhya_silks_kphb"
                      value={instaConfig.instagramId}
                      onChange={(e) =>
                        setInstaConfig({
                          ...instaConfig,
                          instagramId: e.target.value.replace('@', ''),
                          username: e.target.value.replace('@', ''),
                        })
                      }
                      required
                    />
                  </div>
                  <small className="text-muted" style={{ fontSize: '0.72rem' }}>
                    Default: <code>aaradhya_silks_kphb</code>
                  </small>
                </div>

                {/* Optional Graph API Access Token */}
                <div className="col-md-5">
                  <label className="form-label small fw-bold text-dark mb-1">
                    Graph API Access Token <span className="text-muted fw-normal">(Optional)</span>
                  </label>
                  <input
                    type="password"
                    className="form-control form-control-sm"
                    placeholder="IGQVJ... (Leave empty to use high-fidelity auto-fetch)"
                    value={instaConfig.accessToken}
                    onChange={(e) => setInstaConfig({ ...instaConfig, accessToken: e.target.value })}
                  />
                  <small className="text-muted" style={{ fontSize: '0.72rem' }}>
                    Leave empty for automatic smart retrieval & product catalog linkage.
                  </small>
                </div>

                {/* Auto Sync Checkbox & Save */}
                <div className="col-md-3 d-flex gap-2">
                  <button
                    type="submit"
                    className="btn btn-dark btn-sm rounded-pill px-3 py-2 fw-semibold d-flex align-items-center gap-1.5 flex-grow-1 justify-content-center"
                    disabled={savingConfig}
                  >
                    <Save size={14} />
                    <span>{savingConfig ? 'Saving...' : 'Save Settings'}</span>
                  </button>
                  <button
                    type="button"
                    className="btn btn-sm btn-outline-danger rounded-pill px-3 py-2 fw-semibold d-flex align-items-center gap-1.5"
                    onClick={handleSyncInstagram}
                    disabled={syncing}
                    title="Fetch latest posts & reels right now"
                  >
                    <RefreshCw size={13} className={syncing ? 'spinner-border spinner-border-sm' : ''} />
                    <span>Sync</span>
                  </button>
                </div>
              </div>
            </form>
          </div>

          {/* 2. Feed Moderation & Rearrange Toolbar ("re arnage in the good way") */}
          <div className="d-flex flex-wrap justify-content-between align-items-center gap-3 mb-3">
            {/* Filter Pills */}
            <div className="btn-group btn-group-sm bg-white border p-1 rounded-pill">
              <button
                type="button"
                className={`btn btn-sm rounded-pill px-3 ${filterType === 'all' ? 'btn-dark text-white' : 'btn-light text-muted'}`}
                onClick={() => setFilterType('all')}
              >
                All Posts & Reels ({instaItems.length})
              </button>
              <button
                type="button"
                className={`btn btn-sm rounded-pill px-3 d-flex align-items-center gap-1.5 ${filterType === 'reels' ? 'btn-dark text-white' : 'btn-light text-muted'}`}
                onClick={() => setFilterType('reels')}
              >
                <Video size={13} />
                <span>Reels Only ({instaItems.filter((i) => i.isReel).length})</span>
              </button>
              <button
                type="button"
                className={`btn btn-sm rounded-pill px-3 d-flex align-items-center gap-1.5 ${filterType === 'photos' ? 'btn-dark text-white' : 'btn-light text-muted'}`}
                onClick={() => setFilterType('photos')}
              >
                <Camera size={13} />
                <span>Photos Only ({instaItems.filter((i) => !i.isReel).length})</span>
              </button>
            </div>

            <div className="d-flex align-items-center gap-2">
              <span className="small text-muted">
                Showing {filteredInstaItems.length} items for <strong>@{instaConfig.instagramId}</strong>
              </span>
            </div>
          </div>

          {/* 3. Live Posts & Reels Cards Grid */}
          {loading ? (
            <div className="text-center py-5">
              <div className="spinner-border text-primary" role="status" />
              <p className="text-muted small mt-2">Loading Instagram feed & reels...</p>
            </div>
          ) : filteredInstaItems.length === 0 ? (
            <div className="card p-5 text-center bg-white border rounded-4">
              <FaInstagram size={48} className="mx-auto text-muted mb-2 opacity-50" />
              <h5 className="fw-bold">No Instagram items found</h5>
              <p className="text-muted small mb-3">
                Click "Sync Instagram Now" to fetch the latest posts and video reels for @{instaConfig.instagramId}.
              </p>
              <div>
                <button className="btn btn-primary rounded-pill px-4" onClick={handleSyncInstagram}>
                  Fetch Posts & Reels Now
                </button>
              </div>
            </div>
          ) : (
            <div className="row g-3 row-cols-1 row-cols-sm-2 row-cols-md-3 row-cols-lg-4">
              {filteredInstaItems.map((item) => {
                return (
                  <div key={item._id} className="col">
                    <div
                      className={`card h-100 border rounded-4 overflow-hidden shadow-sm d-flex flex-column justify-content-between position-relative ${
                        !item.isActive ? 'opacity-50' : ''
                      }`}
                      style={{ transition: 'transform 0.2s ease' }}
                    >
                      {/* Media Thumbnail with Badges */}
                      <div
                        className="position-relative overflow-hidden bg-dark"
                        style={{ paddingTop: item.isReel ? '140%' : '115%' }}
                      >
                        <img
                          src={item.thumbnailUrl || item.mediaUrl}
                          alt={item.caption}
                          className="position-absolute top-0 start-0 w-100 h-100 object-fit-cover"
                        />

                        {/* Top-Left Type Badge */}
                        <span
                          className="position-absolute top-0 start-0 m-2 badge rounded-pill px-2.5 py-1 text-white shadow-sm d-flex align-items-center gap-1"
                          style={{
                            backgroundColor: item.isReel ? '#E90064' : '#17233B',
                            fontSize: '0.68rem',
                          }}
                        >
                          {item.isReel ? (
                            <>
                              <Play size={10} fill="#FFF" /> Reel 🎬
                            </>
                          ) : (
                            <>
                              <Camera size={10} /> Photo 📸
                            </>
                          )}
                        </span>

                        {/* Top-Right Pinned Indicator */}
                        {item.isPinned && (
                          <span
                            className="position-absolute top-0 end-0 m-2 badge bg-warning text-dark rounded-pill px-2 py-1 shadow-sm d-flex align-items-center gap-1"
                            style={{ fontSize: '0.68rem' }}
                          >
                            <Pin size={10} /> Pinned
                          </span>
                        )}

                        {/* Bottom Stats Overlay */}
                        <div
                          className="position-absolute bottom-0 start-0 w-100 p-2 d-flex justify-content-between align-items-center text-white"
                          style={{ background: 'linear-gradient(0deg, rgba(0,0,0,0.8) 0%, transparent 100%)' }}
                        >
                          <span className="small d-flex align-items-center gap-1" style={{ fontSize: '0.75rem' }}>
                            <Heart size={12} fill="#FFF" /> {item.likesCount?.toLocaleString()}
                          </span>
                          {item.isReel && (
                            <span className="small d-flex align-items-center gap-1" style={{ fontSize: '0.75rem' }}>
                              <Eye size={12} /> {item.viewsCount?.toLocaleString()} views
                            </span>
                          )}
                          <span className="small d-flex align-items-center gap-1" style={{ fontSize: '0.75rem' }}>
                            <MessageCircle size={12} /> {item.commentsCount}
                          </span>
                        </div>
                      </div>

                      {/* Card Content & Tagged Saree */}
                      <div className="p-3 d-flex flex-column flex-grow-1 justify-content-between">
                        <div>
                          <p
                            className="small text-dark fw-semibold mb-2"
                            style={{
                              lineHeight: '1.35',
                              display: '-webkit-box',
                              WebkitLineClamp: 2,
                              WebkitBoxOrient: 'vertical',
                              overflow: 'hidden',
                              fontSize: '0.82rem',
                            }}
                            title={item.caption}
                          >
                            {item.caption || 'Aaradhya Sarees & Silks Collection'}
                          </p>

                          {/* Tagged Product Box */}
                          <div className="p-2 bg-light rounded-3 border mb-2">
                            <div className="d-flex justify-content-between align-items-center mb-1">
                              <span className="text-muted small" style={{ fontSize: '0.7rem' }}>
                                Tagged Product:
                              </span>
                              <button
                                type="button"
                                className="btn btn-sm btn-link p-0 text-decoration-none text-primary small"
                                style={{ fontSize: '0.7rem' }}
                                onClick={() => {
                                  setEditingItem(item);
                                  setSelectedProductId(item.taggedProduct?.productId || '');
                                }}
                              >
                                Edit Tag
                              </button>
                            </div>

                            {item.taggedProduct?.name ? (
                              <div className="d-flex align-items-center gap-2">
                                <img
                                  src={item.taggedProduct.image}
                                  alt={item.taggedProduct.name}
                                  style={{ width: '32px', height: '38px', objectFit: 'cover', borderRadius: '4px' }}
                                />
                                <div className="text-truncate">
                                  <div className="small fw-bold text-dark text-truncate" style={{ fontSize: '0.78rem' }}>
                                    {item.taggedProduct.name}
                                  </div>
                                  <div className="small text-success fw-semibold" style={{ fontSize: '0.72rem' }}>
                                    ₹{item.taggedProduct.price?.toLocaleString()}
                                  </div>
                                </div>
                              </div>
                            ) : (
                              <span className="text-muted fst-italic small" style={{ fontSize: '0.72rem' }}>
                                No product tagged yet
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Action Buttons Toolbar */}
                        <div className="d-flex justify-content-between align-items-center pt-2 border-top">
                          <button
                            type="button"
                            className={`btn btn-sm p-1 ${item.isPinned ? 'text-warning' : 'text-muted'}`}
                            onClick={() => handleTogglePin(item)}
                            title={item.isPinned ? 'Unpin' : 'Pin to Top'}
                          >
                            <Pin size={15} />
                          </button>

                          <button
                            type="button"
                            className={`btn btn-sm px-2 py-0.5 rounded-pill small ${
                              item.isActive ? 'btn-outline-secondary' : 'btn-outline-danger'
                            }`}
                            style={{ fontSize: '0.7rem' }}
                            onClick={() => handleToggleActive(item)}
                          >
                            {item.isActive ? 'Active' : 'Hidden'}
                          </button>

                          <a
                            href={item.permalink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="btn btn-sm p-1 text-muted"
                            title="View on Instagram"
                          >
                            <ExternalLink size={14} />
                          </a>

                          <button
                            type="button"
                            className="btn btn-sm p-1 text-danger"
                            onClick={() => handleDeleteItem(item._id)}
                            title="Delete Item"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Tag Catalog Product Modal */}
          {editingItem && (
            <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.65)' }}>
              <div className="modal-dialog modal-dialog-centered">
                <div className="modal-content rounded-4 p-4 shadow border-0">
                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <h6 className="fw-bold mb-0 text-dark">Tag Saree / Product to Instagram Post</h6>
                    <button type="button" className="btn-close" onClick={() => setEditingItem(null)}></button>
                  </div>

                  <p className="text-muted small mb-3">
                    Select a product from the Aaradhya catalog. Customers watching this reel or post can directly purchase it with one click!
                  </p>

                  <div className="mb-3">
                    <label className="form-label small fw-semibold text-muted">Select Merchandise</label>
                    <select
                      className="form-select form-select-sm"
                      value={selectedProductId}
                      onChange={(e) => setSelectedProductId(e.target.value)}
                    >
                      <option value="">-- Choose Catalog Product --</option>
                      {products.map((p) => (
                        <option key={p._id} value={p.productId || p._id}>
                          [{p.storeCode || 'AS'}] {p.productId} — {p.name} (₹{p.price})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="d-flex gap-2">
                    <button className="btn btn-primary btn-sm flex-grow-1 text-white fw-bold" onClick={handleSaveTaggedProduct}>
                      Save Tagged Saree
                    </button>
                    <button className="btn btn-outline-secondary btn-sm" onClick={() => setEditingItem(null)}>
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: MANUAL CLOUDINARY UPLOADS */}
      {activeTab === 'manual' && (
        <div>
          <div className="d-flex justify-content-between align-items-center mb-3">
            <div>
              <h5 className="fw-bold mb-0 text-dark">Custom Uploaded Lookbook Photos</h5>
              <small className="text-muted">Directly hosted on Cloudinary</small>
            </div>
            <button
              type="button"
              className="btn btn-primary btn-sm rounded-pill px-3 py-1.5 text-white fw-semibold"
              onClick={() => {
                setForm(initialForm);
                setShowManualModal(true);
              }}
            >
              <Plus size={14} className="me-1" /> Add Photo
            </button>
          </div>

          <div className="row g-3 row-cols-1 row-cols-sm-2 row-cols-md-3 row-cols-lg-4">
            {manualImages.map((img) => (
              <div key={img._id} className="col">
                <div className="card h-100 overflow-hidden border rounded-3">
                  <div className="position-relative" style={{ paddingTop: '115%' }}>
                    <img
                      src={img.imageUrl}
                      alt={img.caption}
                      className="position-absolute top-0 start-0 w-100 h-100 object-fit-cover"
                    />
                    <button
                      type="button"
                      className="btn btn-sm btn-light position-absolute top-0 end-0 m-2 rounded-circle p-1.5 shadow text-danger"
                      onClick={() => handleManualDelete(img._id)}
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                  <div className="p-2.5">
                    <div className="small fw-semibold text-dark text-truncate">{img.caption}</div>
                    <div className="text-muted small" style={{ fontSize: '0.72rem' }}>
                      Tag: {img.tag}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Manual Modal */}
          {showManualModal && (
            <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.65)' }}>
              <div className="modal-dialog modal-dialog-centered">
                <div className="modal-content rounded-4 p-4 shadow border-0">
                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <h6 className="fw-bold mb-0">Upload Custom Lookbook Photo</h6>
                    <button type="button" className="btn-close" onClick={() => setShowManualModal(false)}></button>
                  </div>

                  <form onSubmit={handleManualSubmit}>
                    <div className="mb-3">
                      <label className="form-label small fw-semibold text-muted">Upload Photo to Cloudinary</label>
                      <input
                        type="file"
                        accept="image/*"
                        className="form-control form-control-sm"
                        onChange={handleImageFileChange}
                      />
                      {uploadingImage && <small className="text-primary mt-1 d-block">Uploading to Cloudinary...</small>}
                    </div>

                    <div className="mb-3">
                      <label className="form-label small fw-semibold text-muted">Or Image URL</label>
                      <input
                        type="url"
                        className="form-control form-control-sm"
                        placeholder="https://..."
                        value={form.imageUrl}
                        onChange={(e) => setForm({ ...form, imageUrl: e.target.value })}
                      />
                    </div>

                    <div className="mb-3">
                      <label className="form-label small fw-semibold text-muted">Caption</label>
                      <input
                        type="text"
                        className="form-control form-control-sm"
                        value={form.caption}
                        onChange={(e) => setForm({ ...form, caption: e.target.value })}
                      />
                    </div>

                    <div className="d-flex gap-2">
                      <button type="submit" className="btn btn-primary btn-sm flex-grow-1 text-white fw-bold">
                        Save Photo
                      </button>
                      <button
                        type="button"
                        className="btn btn-outline-secondary btn-sm"
                        onClick={() => setShowManualModal(false)}
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AdminGallery;
