import React, { useState, useEffect } from 'react';
import { Tag, Plus, Search, Edit2, Trash2, Layers, CheckCircle2, RefreshCw } from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import axiosClient from '../../api/axiosClient';

const StoreCategories = () => {
  const store = useStore();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    hsnCode: store.isSilks ? '5007' : '5208',
    gstRate: 5,
    subcategories: '',
  });

  useEffect(() => {
    fetchCategories();
  }, [store.activeStore]);

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const res = await axiosClient.get('/categories');
      if (res.data?.success) {
        // Filter categories relevant to store
        const storeCats = (res.data.data || []).filter(
          (c) =>
            !c.storeCode ||
            c.storeCode === store.activeStore ||
            (store.isSilks && c.name.toLowerCase().includes('silk')) ||
            (!store.isSilks && c.name.toLowerCase().includes('fabric'))
        );
        setCategories(storeCats.length > 0 ? storeCats : getFallbackCategories());
      }
    } catch {
      setCategories(getFallbackCategories());
    } finally {
      setLoading(false);
    }
  };

  const getFallbackCategories = () => {
    return store.isSilks
      ? [
          {
            _id: 'cat_as_01',
            name: 'Pure Silk Sarees',
            slug: 'pure-silk-sarees',
            hsnCode: '5007',
            gstRate: 5,
            subcategories: ['Kanjeevaram Bridal', 'Banarasi Katan', 'Mysore Silk', 'Dharmavaram'],
            productCount: 42,
            isActive: true,
          },
          {
            _id: 'cat_as_02',
            name: 'Silk Blend Sarees',
            slug: 'silk-blend-sarees',
            hsnCode: '5007',
            gstRate: 5,
            subcategories: ['Chanderi Silk', 'Tussar Handwoven', 'Art Silk'],
            productCount: 28,
            isActive: true,
          },
          {
            _id: 'cat_as_03',
            name: 'Occasion & Bridal Wear',
            slug: 'occasion-bridal-wear',
            hsnCode: '6204',
            gstRate: 12,
            subcategories: ['Bridal Lehengas', 'Silk Dupattas', 'Handcrafted Blouses'],
            productCount: 16,
            isActive: true,
          },
        ]
      : [
          {
            _id: 'cat_af_01',
            name: 'Running Cotton Fabrics',
            slug: 'running-cotton-fabrics',
            hsnCode: '5208',
            gstRate: 5,
            subcategories: ['60s Mulmul', 'South Cotton', 'Slub Cotton', 'Cambric'],
            productCount: 85,
            isActive: true,
          },
          {
            _id: 'cat_af_02',
            name: 'Block Print Yardage',
            slug: 'block-print-yardage',
            hsnCode: '5208',
            gstRate: 5,
            subcategories: ['Ajrakh Indigo', 'Bagru Block', 'Dabu Print', 'Kalamkari'],
            productCount: 54,
            isActive: true,
          },
          {
            _id: 'cat_af_03',
            name: 'Linen & Organza Textiles',
            slug: 'linen-organza-textiles',
            hsnCode: '5309',
            gstRate: 5,
            subcategories: ['Pure Linen', 'Tissue Organza', 'Embroidered Net'],
            productCount: 39,
            isActive: true,
          },
        ];
  };

  const handleSaveCategory = (e) => {
    e.preventDefault();
    const newCat = {
      _id: `cat_${Date.now()}`,
      name: formData.name,
      slug: formData.name.toLowerCase().replace(/\s+/g, '-'),
      hsnCode: formData.hsnCode,
      gstRate: Number(formData.gstRate),
      subcategories: formData.subcategories.split(',').map((s) => s.trim()).filter(Boolean),
      productCount: 0,
      isActive: true,
      storeCode: store.activeStore,
    };
    setCategories([newCat, ...categories]);
    setIsModalOpen(false);
  };

  const filtered = categories.filter((c) =>
    (c.name || '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="store-categories-page pb-5">
      {/* Header */}
      <div className="d-flex flex-wrap align-items-center justify-content-between gap-3 mb-4">
        <div>
          <div className="d-flex align-items-center gap-2 mb-1">
            <span
              className="badge rounded-pill fw-bold text-uppercase px-2.5 py-1"
              style={{ backgroundColor: store.badgeBg, color: store.badgeText, border: `1px solid ${store.badgeBorder}`, fontSize: '0.72rem' }}
            >
              Store {store.storeCode} Classification
            </span>
            <span className="text-muted small">• Tax & Hierarchy Structure</span>
          </div>
          <h4 className="fw-bold text-dark mb-0">{store.storeName} Categories</h4>
        </div>

        <button
          onClick={() => {
            setFormData({
              name: '',
              description: '',
              hsnCode: store.isSilks ? '5007' : '5208',
              gstRate: 5,
              subcategories: '',
            });
            setIsModalOpen(true);
          }}
          className="btn btn-sm text-white fw-semibold rounded-pill px-3 py-2 d-inline-flex align-items-center gap-2 shadow-sm"
          style={{ backgroundColor: store.primaryColor }}
        >
          <Plus size={16} />
          Add Store Category
        </button>
      </div>

      {/* Search Bar */}
      <div className="card border-0 shadow-sm rounded-3 p-3 bg-white mb-4">
        <div className="row g-2 align-items-center">
          <div className="col-12 col-md-6">
            <div className="input-group input-group-sm">
              <span className="input-group-text bg-light border-end-0">
                <Search size={15} className="text-muted" />
              </span>
              <input
                type="text"
                className="form-control border-start-0 bg-light"
                placeholder="Search category title..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>
          <div className="col-12 col-md-6 text-md-end">
            <button onClick={fetchCategories} className="btn btn-sm btn-light border text-muted">
              <RefreshCw size={14} className={loading ? 'spin' : ''} />
            </button>
          </div>
        </div>
      </div>

      {/* Categories Cards Grid */}
      <div className="row g-3">
        {loading ? (
          <div className="col-12 text-center py-5">
            <div className="spinner-border spinner-border-sm text-primary" style={{ color: store.primaryColor }} />
          </div>
        ) : filtered.length === 0 ? (
          <div className="col-12 text-center py-5 text-muted">No categories found.</div>
        ) : (
          filtered.map((cat) => (
            <div key={cat._id} className="col-12 col-md-6 col-lg-4">
              <div className="card border-0 shadow-sm rounded-3 p-3 bg-white h-100 position-relative">
                <div className="d-flex align-items-start justify-content-between mb-2">
                  <div className="d-flex align-items-center gap-2">
                    <div
                      className="d-flex align-items-center justify-content-center rounded-3"
                      style={{ width: '38px', height: '38px', backgroundColor: `${store.primaryColor}15`, color: store.primaryColor }}
                    >
                      <Tag size={18} />
                    </div>
                    <div>
                      <h6 className="fw-bold text-dark mb-0">{cat.name}</h6>
                      <span className="text-muted font-monospace" style={{ fontSize: '0.72rem' }}>
                        HSN: {cat.hsnCode || 'N/A'} • GST: {cat.gstRate || 5}%
                      </span>
                    </div>
                  </div>
                  <span className="badge bg-success-subtle text-success small" style={{ fontSize: '0.7rem' }}>
                    {cat.productCount || 0} Products
                  </span>
                </div>

                <div className="mt-3">
                  <div className="text-muted small fw-semibold mb-1" style={{ fontSize: '0.72rem' }}>
                    Subcategories & Weaves:
                  </div>
                  <div className="d-flex flex-wrap gap-1">
                    {(cat.subcategories || []).map((sub, idx) => (
                      <span key={idx} className="badge bg-light text-dark border fw-normal" style={{ fontSize: '0.7rem' }}>
                        {sub}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Add Category Modal */}
      {isModalOpen && (
        <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1050 }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-0 shadow-lg rounded-3">
              <div className="modal-header border-0 pb-0 pt-3 px-4">
                <h5 className="modal-title fw-bold text-dark">Add Store Category</h5>
                <button type="button" className="btn-close" onClick={() => setIsModalOpen(false)} />
              </div>
              <form onSubmit={handleSaveCategory}>
                <div className="modal-body px-4 py-3">
                  <div className="mb-3">
                    <label className="form-label small fw-semibold text-dark">Category Name *</label>
                    <input
                      type="text"
                      required
                      className="form-control form-control-sm"
                      placeholder={store.isSilks ? 'e.g. Traditional Temple Silks' : 'e.g. Natural Dye Handloom Cottons'}
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    />
                  </div>
                  <div className="row g-2 mb-3">
                    <div className="col-6">
                      <label className="form-label small fw-semibold text-dark">HSN Code</label>
                      <input
                        type="text"
                        className="form-control form-control-sm"
                        value={formData.hsnCode}
                        onChange={(e) => setFormData({ ...formData, hsnCode: e.target.value })}
                      />
                    </div>
                    <div className="col-6">
                      <label className="form-label small fw-semibold text-dark">Default GST Slab</label>
                      <select
                        className="form-select form-select-sm"
                        value={formData.gstRate}
                        onChange={(e) => setFormData({ ...formData, gstRate: e.target.value })}
                      >
                        <option value="5">5% (Fabrics & Handloom)</option>
                        <option value="12">12% (Ready Apparel)</option>
                        <option value="18">18% (Luxury)</option>
                      </select>
                    </div>
                  </div>
                  <div className="mb-3">
                    <label className="form-label small fw-semibold text-dark">Subcategories (comma separated)</label>
                    <input
                      type="text"
                      className="form-control form-control-sm"
                      placeholder="e.g. Kanjeevaram, Banarasi, Mysore"
                      value={formData.subcategories}
                      onChange={(e) => setFormData({ ...formData, subcategories: e.target.value })}
                    />
                  </div>
                </div>
                <div className="modal-footer border-0 pt-0 px-4 pb-3">
                  <button type="button" className="btn btn-sm btn-light border px-3" onClick={() => setIsModalOpen(false)}>
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn btn-sm text-white px-4 fw-semibold shadow-sm"
                    style={{ backgroundColor: store.primaryColor }}
                  >
                    Save Category
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

export default StoreCategories;
