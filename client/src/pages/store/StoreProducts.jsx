import React, { useState, useEffect } from 'react';
import {
  Package,
  Plus,
  Search,
  Filter,
  Edit2,
  Trash2,
  Barcode,
  Eye,
  AlertTriangle,
  CheckCircle2,
  Download,
  Upload,
  RefreshCw,
  X,
  ChevronLeft,
  ChevronRight,
  Sparkles,
} from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import axiosClient from '../../api/axiosClient';

const StoreProducts = () => {
  const store = useStore();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [page, setPage] = useState(1);
  const itemsPerPage = 8;

  // Add / Edit Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('add'); // 'add' or 'edit'
  const [currentProduct, setCurrentProduct] = useState(null);
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Form Fields
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: '',
    subcategory: '',
    brand: store.storeName,
    hsnCode: store.isSilks ? '5007' : '5208',
    costPrice: '',
    price: '', // MRP
    salePrice: '',
    gstRate: store.isSilks ? 5 : 5,
    discount: '',
    stock: '',
    lowStockThreshold: 5,
    sku: '',
    barcode: '',
    imageUrl: '',
    galleryUrls: '',
    isActive: true,
  });

  useEffect(() => {
    fetchProducts();
  }, [store.activeStore]);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const res = await axiosClient.get(`/stores/${store.activeStore}/products`);
      if (res.data?.success) {
        setProducts(res.data.data);
      }
    } catch (err) {
      console.warn('Fallback products:', err);
      // Fallback sample store products
      const dummyProducts = store.isSilks
        ? [
            {
              _id: 'prod_as_01',
              productId: 'AS-000001',
              name: 'Pure Kanjeevaram Bridal Silk Saree (Crimson Red)',
              category: 'Pure Silk Sarees',
              subcategory: 'Bridal Kanjeevaram',
              price: 24999,
              salePrice: 19999,
              stock: 14,
              lowStockThreshold: 5,
              barcode: '890123450001',
              sku: 'AS-KANJ-001',
              isActive: true,
              images: ['https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=600&q=80'],
            },
            {
              _id: 'prod_as_02',
              productId: 'AS-000108',
              name: 'Banarasi Katan Silk Royal Saree with Antique Zari',
              category: 'Pure Silk Sarees',
              subcategory: 'Banarasi Katan',
              price: 28500,
              salePrice: 24748,
              stock: 3,
              lowStockThreshold: 5,
              barcode: '890123450108',
              sku: 'AS-BANA-108',
              isActive: true,
              images: ['https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&w=600&q=80'],
            },
            {
              _id: 'prod_as_03',
              productId: 'AS-000142',
              name: 'Chanderi Silk Gold Floral Butta Saree',
              category: 'Silk Blend Sarees',
              subcategory: 'Chanderi',
              price: 11000,
              salePrice: 8800,
              stock: 22,
              lowStockThreshold: 5,
              barcode: '890123450142',
              sku: 'AS-CHAN-142',
              isActive: true,
              images: ['https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=600&q=80'],
            },
            {
              _id: 'prod_as_04',
              productId: 'AS-000199',
              name: 'Tussar Handwoven Temple Border Saree',
              category: 'Tussar Silks',
              subcategory: 'Temple Border',
              price: 14500,
              salePrice: 12900,
              stock: 2,
              lowStockThreshold: 5,
              barcode: '890123450199',
              sku: 'AS-TUSS-199',
              isActive: true,
              images: ['https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=600&q=80'],
            },
          ]
        : [
            {
              _id: 'prod_af_01',
              productId: 'AF-000001',
              name: 'Pure Mulmul 60s Organic Cotton Running Yardage',
              category: 'Running Fabrics',
              subcategory: 'Organic Cotton',
              price: 650,
              salePrice: 550,
              stock: 240,
              lowStockThreshold: 20,
              barcode: '890123460001',
              sku: 'AF-MUL-001',
              isActive: true,
              images: ['https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?auto=format&fit=crop&w=600&q=80'],
            },
            {
              _id: 'prod_af_02',
              productId: 'AF-000045',
              name: 'Hand-Block Natural Indigo Ajrakh Modal Silk Fabric',
              category: 'Block Print Yardage',
              subcategory: 'Ajrakh Silk',
              price: 1350,
              salePrice: 1150,
              stock: 65,
              lowStockThreshold: 15,
              barcode: '890123460045',
              sku: 'AF-AJR-045',
              isActive: true,
              images: ['https://images.unsplash.com/photo-1594938298603-c8148c4dae35?auto=format&fit=crop&w=600&q=80'],
            },
            {
              _id: 'prod_af_03',
              productId: 'AF-000088',
              name: 'European Organic Linen Slub Unstitched Fabric',
              category: 'Running Fabrics',
              subcategory: 'Pure Linen',
              price: 1400,
              salePrice: 1200,
              stock: 9,
              lowStockThreshold: 15,
              barcode: '890123460088',
              sku: 'AF-LIN-088',
              isActive: true,
              images: ['https://images.unsplash.com/photo-1574634534894-89d7576c8259?auto=format&fit=crop&w=600&q=80'],
            },
          ];
      setProducts(dummyProducts);
    } finally {
      setLoading(false);
    }
  };

  const openAddModal = async () => {
    setModalMode('add');
    setCurrentProduct(null);
    setErrorMsg('');
    try {
      const res = await axiosClient.get(`/stores/${store.activeStore}/next-product-id`);
      const nextId = res.data?.data?.nextProductId || `${store.productPrefix}-000001`;
      setFormData({
        name: '',
        description: '',
        category: store.isSilks ? 'Pure Silk Sarees' : 'Running Fabrics',
        subcategory: '',
        brand: store.storeName,
        hsnCode: store.isSilks ? '5007' : '5208',
        costPrice: '',
        price: '',
        salePrice: '',
        gstRate: 5,
        discount: '',
        stock: '',
        lowStockThreshold: store.isSilks ? 5 : 20,
        sku: `${store.productPrefix}-${Date.now().toString().slice(-4)}`,
        barcode: `890${store.isSilks ? '1' : '2'}${Date.now().toString().slice(-8)}`,
        imageUrl: '',
        galleryUrls: '',
        isActive: true,
        productId: nextId,
      });
    } catch {
      setFormData((prev) => ({
        ...prev,
        productId: `${store.productPrefix}-000${products.length + 1}`,
      }));
    }
    setIsModalOpen(true);
  };

  const openEditModal = (product) => {
    setModalMode('edit');
    setCurrentProduct(product);
    setErrorMsg('');
    setFormData({
      productId: product.productId,
      name: product.name || '',
      description: product.description || '',
      category: product.category || '',
      subcategory: product.subcategory || '',
      brand: product.brand || store.storeName,
      hsnCode: product.hsnCode || (store.isSilks ? '5007' : '5208'),
      costPrice: product.costPrice || '',
      price: product.price || '',
      salePrice: product.salePrice || '',
      gstRate: product.gstRate || 5,
      discount: product.discount || '',
      stock: product.stock ?? 0,
      lowStockThreshold: product.lowStockThreshold || (store.isSilks ? 5 : 20),
      sku: product.sku || '',
      barcode: product.barcode || '',
      imageUrl: (product.images && product.images[0]) || '',
      galleryUrls: (product.images && product.images.slice(1).join(', ')) || '',
      isActive: product.isActive !== false,
    });
    setIsModalOpen(true);
  };

  const handleSaveProduct = async (e) => {
    e.preventDefault();
    setSaving(true);
    setErrorMsg('');

    const payload = {
      ...formData,
      storeCode: store.activeStore,
      price: Number(formData.price),
      salePrice: formData.salePrice ? Number(formData.salePrice) : Number(formData.price),
      stock: Number(formData.stock || 0),
      costPrice: Number(formData.costPrice || 0),
      gstRate: Number(formData.gstRate || 5),
      lowStockThreshold: Number(formData.lowStockThreshold || 5),
      images: [formData.imageUrl, ...formData.galleryUrls.split(',').map((u) => u.trim())].filter(Boolean),
    };

    try {
      if (modalMode === 'add') {
        const res = await axiosClient.post('/products', payload);
        if (res.data?.success) {
          fetchProducts();
          setIsModalOpen(false);
        }
      } else {
        const res = await axiosClient.put(`/products/${currentProduct._id}`, payload);
        if (res.data?.success) {
          fetchProducts();
          setIsModalOpen(false);
        }
      }
    } catch (err) {
      setErrorMsg(err.response?.data?.message || err.message || 'Failed to save product');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteProduct = async (id, name) => {
    if (!window.confirm(`Are you sure you want to remove "${name}" from ${store.storeName} catalog?`)) {
      return;
    }
    try {
      await axiosClient.delete(`/products/${id}`);
      setProducts((prev) => prev.filter((p) => p._id !== id));
    } catch (err) {
      alert(err.response?.data?.message || 'Error deleting product');
    }
  };

  // Filter & Search logic
  const filteredProducts = products.filter((p) => {
    const matchesSearch =
      (p.name || '').toLowerCase().includes(search.toLowerCase()) ||
      (p.productId || '').toLowerCase().includes(search.toLowerCase()) ||
      (p.sku || '').toLowerCase().includes(search.toLowerCase()) ||
      (p.barcode || '').includes(search);

    const matchesCategory = categoryFilter === 'all' || p.category === categoryFilter;
    const matchesStatus =
      statusFilter === 'all'
        ? true
        : statusFilter === 'in_stock'
        ? p.stock > (p.lowStockThreshold || 5)
        : statusFilter === 'low_stock'
        ? p.stock > 0 && p.stock <= (p.lowStockThreshold || 5)
        : p.stock === 0;

    return matchesSearch && matchesCategory && matchesStatus;
  });

  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage) || 1;
  const paginatedProducts = filteredProducts.slice((page - 1) * itemsPerPage, page * itemsPerPage);

  const categories = [...new Set(products.map((p) => p.category).filter(Boolean))];

  return (
    <div className="store-products-page pb-5">
      {/* Header */}
      <div className="d-flex flex-wrap align-items-center justify-content-between gap-3 mb-4">
        <div>
          <div className="d-flex align-items-center gap-2 mb-1">
            <span
              className="badge rounded-pill fw-bold text-uppercase px-2.5 py-1"
              style={{ backgroundColor: store.badgeBg, color: store.badgeText, border: `1px solid ${store.badgeBorder}`, fontSize: '0.72rem' }}
            >
              Store {store.storeCode} Catalog
            </span>
            <span className="text-muted small">
              Prefix: <code className="fw-bold">{store.productPrefix}-*</code>
            </span>
          </div>
          <h4 className="fw-bold text-dark mb-0">{store.storeName} Products</h4>
        </div>

        <div className="d-flex align-items-center gap-2">
          <button
            onClick={openAddModal}
            className="btn btn-sm text-white fw-semibold rounded-pill px-3 py-2 d-inline-flex align-items-center gap-2 shadow-sm"
            style={{ backgroundColor: store.primaryColor }}
          >
            <Plus size={16} />
            Add New Product
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="card border-0 shadow-sm rounded-3 p-3 bg-white mb-4">
        <div className="row g-2 align-items-center">
          <div className="col-12 col-md-5">
            <div className="input-group input-group-sm">
              <span className="input-group-text bg-light border-end-0">
                <Search size={15} className="text-muted" />
              </span>
              <input
                type="text"
                className="form-control border-start-0 bg-light"
                placeholder="Search by ID (AS-000001), Title, SKU, or Barcode..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
              />
            </div>
          </div>

          <div className="col-6 col-md-3">
            <select
              className="form-select form-select-sm bg-light"
              value={categoryFilter}
              onChange={(e) => {
                setCategoryFilter(e.target.value);
                setPage(1);
              }}
            >
              <option value="all">All Categories</option>
              {categories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          <div className="col-6 col-md-3">
            <select
              className="form-select form-select-sm bg-light"
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPage(1);
              }}
            >
              <option value="all">All Stock Statuses</option>
              <option value="in_stock">In Stock</option>
              <option value="low_stock">Low Stock (≤ Threshold)</option>
              <option value="out_of_stock">Out of Stock (0)</option>
            </select>
          </div>

          <div className="col-12 col-md-1 text-md-end">
            <button
              onClick={fetchProducts}
              className="btn btn-sm btn-light border text-muted w-100"
              title="Refresh Catalog"
            >
              <RefreshCw size={14} className={loading ? 'spin' : ''} />
            </button>
          </div>
        </div>
      </div>

      {/* Products Table Card */}
      <div className="card border-0 shadow-sm rounded-3 bg-white overflow-hidden">
        <div className="table-responsive">
          <table className="table table-hover align-middle mb-0" style={{ fontSize: '0.82rem' }}>
            <thead className="table-light">
              <tr>
                <th className="border-0 text-muted fw-semibold ps-3">Product ID</th>
                <th className="border-0 text-muted fw-semibold">Item Details</th>
                <th className="border-0 text-muted fw-semibold">Category</th>
                <th className="border-0 text-muted fw-semibold text-end">Price</th>
                <th className="border-0 text-muted fw-semibold text-center">Stock</th>
                <th className="border-0 text-muted fw-semibold text-center">Barcode</th>
                <th className="border-0 text-muted fw-semibold text-center">Status</th>
                <th className="border-0 text-muted fw-semibold text-end pe-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="8" className="text-center py-5">
                    <div className="spinner-border spinner-border-sm text-primary mb-2" style={{ color: store.primaryColor }} />
                    <div className="text-muted small">Loading {store.storeName} catalog...</div>
                  </td>
                </tr>
              ) : paginatedProducts.length === 0 ? (
                <tr>
                  <td colSpan="8" className="text-center py-5 text-muted">
                    <Package size={36} className="text-muted opacity-50 mb-2" />
                    <div>No products found matching your search.</div>
                  </td>
                </tr>
              ) : (
                paginatedProducts.map((p) => {
                  const isLow = p.stock > 0 && p.stock <= (p.lowStockThreshold || 5);
                  const isOut = p.stock === 0;

                  return (
                    <tr key={p._id || p.productId}>
                      {/* Product ID */}
                      <td className="ps-3">
                        <span
                          className="badge font-monospace px-2 py-1 fw-bold"
                          style={{
                            backgroundColor: `${store.primaryColor}15`,
                            color: store.primaryColor,
                            fontSize: '0.74rem',
                          }}
                        >
                          {p.productId || `${store.productPrefix}-000000`}
                        </span>
                      </td>

                      {/* Item Details */}
                      <td>
                        <div className="d-flex align-items-center gap-2.5">
                          <img
                            src={
                              (p.images && p.images[0]) ||
                              'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=120&q=80'
                            }
                            alt={p.name}
                            className="rounded border object-fit-cover flex-shrink-0"
                            style={{ width: '42px', height: '42px' }}
                            onError={(e) => {
                              e.target.src = 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=120&q=80';
                            }}
                          />
                          <div>
                            <div className="fw-semibold text-dark text-truncate" style={{ maxWidth: '240px' }}>
                              {p.name}
                            </div>
                            <div className="text-muted font-monospace" style={{ fontSize: '0.7rem' }}>
                              SKU: {p.sku || 'N/A'}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Category */}
                      <td>
                        <span className="badge bg-light text-dark border fw-medium" style={{ fontSize: '0.72rem' }}>
                          {p.category || 'Standard'}
                        </span>
                      </td>

                      {/* Price */}
                      <td className="text-end">
                        <div className="fw-bold text-dark">₹{Number(p.salePrice || p.price).toLocaleString()}</div>
                        {p.salePrice && p.salePrice < p.price && (
                          <div className="text-decoration-line-through text-muted" style={{ fontSize: '0.7rem' }}>
                            ₹{Number(p.price).toLocaleString()}
                          </div>
                        )}
                      </td>

                      {/* Stock */}
                      <td className="text-center">
                        <span
                          className={`badge rounded-pill px-2.5 py-1 ${
                            isOut
                              ? 'bg-danger text-white'
                              : isLow
                              ? 'bg-warning text-dark'
                              : 'bg-success-subtle text-success border'
                          }`}
                          style={{ fontSize: '0.72rem' }}
                        >
                          {p.stock} {store.isSilks ? 'pcs' : 'm'}
                        </span>
                        {isLow && (
                          <div className="text-warning-emphasis fw-bold mt-0.5" style={{ fontSize: '0.66rem' }}>
                            Low Alert
                          </div>
                        )}
                      </td>

                      {/* Barcode status */}
                      <td className="text-center">
                        {p.barcode ? (
                          <span className="badge bg-light text-dark font-monospace border px-2 py-1" style={{ fontSize: '0.68rem' }}>
                            <Barcode size={12} className="me-1" />
                            {p.barcode}
                          </span>
                        ) : (
                          <span className="text-muted small">None</span>
                        )}
                      </td>

                      {/* Status */}
                      <td className="text-center">
                        <span
                          className={`badge rounded-pill ${
                            p.isActive !== false ? 'bg-success-subtle text-success' : 'bg-secondary text-white'
                          }`}
                          style={{ fontSize: '0.7rem' }}
                        >
                          {p.isActive !== false ? 'Active' : 'Inactive'}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="text-end pe-3">
                        <div className="d-inline-flex align-items-center gap-1">
                          <button
                            onClick={() => openEditModal(p)}
                            className="btn btn-sm btn-light border p-1.5 text-primary"
                            title="Edit Product"
                          >
                            <Edit2 size={14} />
                          </button>
                          <button
                            onClick={() => handleDeleteProduct(p._id, p.name)}
                            className="btn btn-sm btn-light border p-1.5 text-danger"
                            title="Delete Product"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        {filteredProducts.length > itemsPerPage && (
          <div className="d-flex align-items-center justify-content-between p-3 border-top bg-light">
            <span className="text-muted small">
              Showing {(page - 1) * itemsPerPage + 1} to {Math.min(page * itemsPerPage, filteredProducts.length)} of {filteredProducts.length} items
            </span>
            <div className="d-flex align-items-center gap-2">
              <button
                disabled={page === 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="btn btn-sm btn-outline-secondary px-2 py-1 rounded"
              >
                <ChevronLeft size={14} />
              </button>
              <span className="small fw-semibold text-dark">
                Page {page} of {totalPages}
              </span>
              <button
                disabled={page === totalPages}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                className="btn btn-sm btn-outline-secondary px-2 py-1 rounded"
              >
                <ChevronRight size={14} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Add / Edit Product Modal */}
      {isModalOpen && (
        <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1050 }}>
          <div className="modal-dialog modal-lg modal-dialog-centered modal-dialog-scrollable">
            <div className="modal-content border-0 shadow-lg rounded-3">
              <div className="modal-header border-0 pb-0 pt-3 px-4">
                <div className="d-flex align-items-center gap-2">
                  <div
                    className="p-2 rounded-circle"
                    style={{ backgroundColor: `${store.primaryColor}15`, color: store.primaryColor }}
                  >
                    <Package size={20} />
                  </div>
                  <div>
                    <h5 className="modal-title fw-bold text-dark">
                      {modalMode === 'add' ? 'Add New Product' : 'Edit Catalog Product'}
                    </h5>
                    <span className="text-muted small">
                      {store.storeName} ({store.storeCode}) • Product ID: <span className="fw-bold font-monospace text-dark">{formData.productId}</span>
                    </span>
                  </div>
                </div>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setIsModalOpen(false)}
                />
              </div>

              <form onSubmit={handleSaveProduct}>
                <div className="modal-body px-4 py-3">
                  {errorMsg && (
                    <div className="alert alert-danger py-2 small mb-3">
                      {errorMsg}
                    </div>
                  )}

                  <div className="row g-3">
                    {/* Basic Info */}
                    <div className="col-12 col-md-8">
                      <label className="form-label small fw-semibold text-dark">Product Title *</label>
                      <input
                        type="text"
                        required
                        className="form-control form-control-sm"
                        placeholder={store.isSilks ? 'e.g. Royal Mysore Crepe Silk Saree' : 'e.g. Pure Cotton Mulmul Running Yardage'}
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      />
                    </div>

                    <div className="col-12 col-md-4">
                      <label className="form-label small fw-semibold text-dark">Product ID</label>
                      <input
                        type="text"
                        readOnly
                        disabled
                        className="form-control form-control-sm bg-light font-monospace fw-bold"
                        value={formData.productId}
                      />
                    </div>

                    <div className="col-12 col-md-6">
                      <label className="form-label small fw-semibold text-dark">Category *</label>
                      <input
                        type="text"
                        required
                        className="form-control form-control-sm"
                        placeholder={store.isSilks ? 'Pure Silk Sarees' : 'Running Fabrics'}
                        value={formData.category}
                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      />
                    </div>

                    <div className="col-12 col-md-6">
                      <label className="form-label small fw-semibold text-dark">Subcategory / Weave</label>
                      <input
                        type="text"
                        className="form-control form-control-sm"
                        placeholder={store.isSilks ? 'Kanjeevaram / Banarasi' : 'Hand-Block / Indigo'}
                        value={formData.subcategory}
                        onChange={(e) => setFormData({ ...formData, subcategory: e.target.value })}
                      />
                    </div>

                    {/* Pricing */}
                    <div className="col-6 col-md-3">
                      <label className="form-label small fw-semibold text-dark">Cost Price (₹)</label>
                      <input
                        type="number"
                        className="form-control form-control-sm"
                        placeholder="Cost"
                        value={formData.costPrice}
                        onChange={(e) => setFormData({ ...formData, costPrice: e.target.value })}
                      />
                    </div>

                    <div className="col-6 col-md-3">
                      <label className="form-label small fw-semibold text-dark">Selling Price MRP (₹) *</label>
                      <input
                        type="number"
                        required
                        className="form-control form-control-sm"
                        placeholder="MRP"
                        value={formData.price}
                        onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                      />
                    </div>

                    <div className="col-6 col-md-3">
                      <label className="form-label small fw-semibold text-dark">Sale / Offer Price (₹)</label>
                      <input
                        type="number"
                        className="form-control form-control-sm"
                        placeholder="Offer price"
                        value={formData.salePrice}
                        onChange={(e) => setFormData({ ...formData, salePrice: e.target.value })}
                      />
                    </div>

                    <div className="col-6 col-md-3">
                      <label className="form-label small fw-semibold text-dark">GST Slab %</label>
                      <select
                        className="form-select form-select-sm"
                        value={formData.gstRate}
                        onChange={(e) => setFormData({ ...formData, gstRate: e.target.value })}
                      >
                        <option value="5">5% (Handloom/Fabrics)</option>
                        <option value="12">12% (Apparel &gt; ₹1000)</option>
                        <option value="18">18% (Luxury & Tailoring)</option>
                      </select>
                    </div>

                    {/* Inventory & Stock Codes */}
                    <div className="col-6 col-md-3">
                      <label className="form-label small fw-semibold text-dark">Initial Stock Level *</label>
                      <input
                        type="number"
                        required
                        className="form-control form-control-sm"
                        placeholder="Units / Meters"
                        value={formData.stock}
                        onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                      />
                    </div>

                    <div className="col-6 col-md-3">
                      <label className="form-label small fw-semibold text-dark">Low Stock Threshold</label>
                      <input
                        type="number"
                        className="form-control form-control-sm"
                        value={formData.lowStockThreshold}
                        onChange={(e) => setFormData({ ...formData, lowStockThreshold: e.target.value })}
                      />
                    </div>

                    <div className="col-6 col-md-3">
                      <label className="form-label small fw-semibold text-dark">SKU Code</label>
                      <input
                        type="text"
                        className="form-control form-control-sm font-monospace"
                        placeholder="SKU"
                        value={formData.sku}
                        onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                      />
                    </div>

                    <div className="col-6 col-md-3">
                      <label className="form-label small fw-semibold text-dark">Barcode (Code 128)</label>
                      <input
                        type="text"
                        className="form-control form-control-sm font-monospace"
                        placeholder="890123450000"
                        value={formData.barcode}
                        onChange={(e) => setFormData({ ...formData, barcode: e.target.value })}
                      />
                    </div>

                    {/* Media */}
                    <div className="col-12">
                      <label className="form-label small fw-semibold text-dark">Primary Image URL</label>
                      <input
                        type="url"
                        className="form-control form-control-sm"
                        placeholder="https://images.unsplash.com/..."
                        value={formData.imageUrl}
                        onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                      />
                    </div>

                    <div className="col-12">
                      <label className="form-label small fw-semibold text-dark">Description</label>
                      <textarea
                        rows="2"
                        className="form-control form-control-sm"
                        placeholder="Authentic handwoven silk saree certified by Silk Mark..."
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      />
                    </div>

                    <div className="col-12">
                      <div className="form-check form-switch">
                        <input
                          className="form-check-input"
                          type="checkbox"
                          id="activeSwitch"
                          checked={formData.isActive}
                          onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                        />
                        <label className="form-check-label small fw-medium text-dark" htmlFor="activeSwitch">
                          Display product on Customer Storefront & Counter POS
                        </label>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="modal-footer border-0 pt-0 px-4 pb-3">
                  <button
                    type="button"
                    className="btn btn-sm btn-light border px-3"
                    onClick={() => setIsModalOpen(false)}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="btn btn-sm text-white px-4 fw-semibold shadow-sm"
                    style={{ backgroundColor: store.primaryColor }}
                  >
                    {saving ? 'Saving...' : modalMode === 'add' ? 'Save to Catalog' : 'Update Product'}
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

export default StoreProducts;
