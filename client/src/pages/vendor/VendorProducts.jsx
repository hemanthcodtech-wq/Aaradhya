import React, { useState, useEffect } from 'react';
import {
  Package,
  Plus,
  Edit,
  Trash2,
  Upload,
  Search,
  CheckCircle,
  AlertTriangle,
  FileSpreadsheet,
} from 'lucide-react';
import axiosClient from '../../api/axiosClient';

const VendorProducts = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  // Modals
  const [showAddModal, setShowAddModal] = useState(false);
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);

  const [form, setForm] = useState({
    name: '',
    price: '',
    mrp: '',
    category: '',
    sku: '',
    barcode: '',
    stock: '',
    images: '',
    description: '',
  });

  const fetchProducts = async () => {
    try {
      const [prodRes, catRes] = await Promise.all([
        axiosClient.get('/vendor/products'),
        axiosClient.get('/categories'),
      ]);
      if (prodRes.success) setProducts(prodRes.data);
      if (catRes.success) setCategories(catRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleOpenAdd = () => {
    setEditingProduct(null);
    setForm({
      name: '',
      price: '',
      mrp: '',
      category: categories[0]?._id || 'cat_electronics',
      sku: `SKU-${Date.now().toString().slice(-5)}`,
      barcode: `890${Math.floor(100000000 + Math.random() * 900000000)}`,
      stock: '25',
      images: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=80',
      description: 'High-quality verified marketplace product.',
    });
    setShowAddModal(true);
  };

  const handleOpenEdit = (p) => {
    setEditingProduct(p);
    setForm({
      name: p.name,
      price: p.price,
      mrp: p.mrp,
      category: p.category?._id || p.category,
      sku: p.sku,
      barcode: p.barcode,
      stock: p.stock,
      images: p.images?.join(', ') || '',
      description: p.description || '',
    });
    setShowAddModal(true);
  };

  const handleSaveProduct = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        name: form.name,
        price: Number(form.price),
        mrp: Number(form.mrp || form.price),
        category: form.category,
        sku: form.sku,
        barcode: form.barcode,
        stock: Number(form.stock),
        description: form.description,
        images: form.images.split(',').map((s) => s.trim()).filter(Boolean),
      };

      if (editingProduct) {
        await axiosClient.put(`/products/${editingProduct._id}`, payload);
      } else {
        await axiosClient.post('/products', payload);
      }

      setShowAddModal(false);
      fetchProducts();
    } catch (err) {
      alert(`Error saving product: ${err.message}`);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return;
    try {
      await axiosClient.delete(`/products/${id}`);
      fetchProducts();
    } catch (err) {
      alert(`Failed to delete: ${err.message}`);
    }
  };

  // Bulk CSV sample simulation
  const handleBulkUploadSubmit = async () => {
    const sampleBatch = [
      {
        name: 'Wireless Bluetooth Ergonomic Mouse',
        price: 1299,
        mrp: 1999,
        sku: `MOU-${Date.now().toString().slice(-4)}`,
        barcode: `890${Math.floor(100000000 + Math.random() * 900000000)}`,
        stock: 50,
        category: 'cat_electronics',
        image: 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=800&auto=format&fit=crop&q=80',
      },
      {
        name: 'Mechanical Gaming Keyboard RGB',
        price: 3499,
        mrp: 4999,
        sku: `KEY-${Date.now().toString().slice(-4)}`,
        barcode: `890${Math.floor(100000000 + Math.random() * 900000000)}`,
        stock: 30,
        category: 'cat_electronics',
        image: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=800&auto=format&fit=crop&q=80',
      },
    ];

    try {
      const res = await axiosClient.post('/products/bulk-upload', { products: sampleBatch });
      if (res.success) {
        alert(`Successfully imported ${res.data.count} products from CSV batch!`);
        setShowBulkModal(false);
        fetchProducts();
      }
    } catch (err) {
      alert(`Bulk upload error: ${err.message}`);
    }
  };

  const filteredProducts = products.filter(
    (p) =>
      p.name?.toLowerCase().includes(search.toLowerCase()) ||
      p.sku?.toLowerCase().includes(search.toLowerCase()) ||
      p.barcode?.includes(search)
  );

  return (
    <div>
      {/* Top Controls */}
      <div className="d-flex flex-wrap justify-content-between align-items-center gap-3 mb-4">
        <div>
          <h3 className="fw-bold mb-1">Products Catalog Management</h3>
          <p className="text-muted small mb-0">Manage listed items, variants, stock, and barcode assignments.</p>
        </div>
        <div className="d-flex gap-2">
          <button className="btn btn-outline-secondary btn-sm d-flex align-items-center gap-1" onClick={() => setShowBulkModal(true)}>
            <FileSpreadsheet size={16} /> Bulk CSV Import
          </button>
          <button className="btn btn-emerald btn-sm d-flex align-items-center gap-1" onClick={handleOpenAdd}>
            <Plus size={16} /> Add New Product
          </button>
        </div>
      </div>

      {/* Search and Table */}
      <div className="card card-modern p-4">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <div className="input-group input-group-sm" style={{ maxWidth: '320px' }}>
            <span className="input-group-text bg-white"><Search size={14} /></span>
            <input
              type="text"
              className="form-control"
              placeholder="Search by name, SKU or barcode..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <span className="small text-muted">Showing {filteredProducts.length} items</span>
        </div>

        <div className="table-responsive">
          <table className="table table-modern">
            <thead>
              <tr>
                <th>Product</th>
                <th>SKU & Barcode</th>
                <th>Category</th>
                <th>Selling Price</th>
                <th>Store Stock</th>
                <th>Status</th>
                <th className="text-end">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.map((p) => (
                <tr key={p._id}>
                  <td>
                    <div className="d-flex align-items-center gap-2">
                      <img
                        src={p.images?.[0] || 'https://via.placeholder.com/40'}
                        alt={p.name}
                        style={{ width: '42px', height: '42px', objectFit: 'cover', borderRadius: '6px' }}
                      />
                      <div className="overflow-hidden">
                        <div className="fw-bold small text-truncate" style={{ maxWidth: '240px' }}>
                          {p.name}
                        </div>
                        <div className="text-muted" style={{ fontSize: '0.72rem' }}>
                          {p.brand?.name || 'Verified Brand'}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <div className="fw-bold small text-dark">{p.sku}</div>
                    <div className="text-muted" style={{ fontSize: '0.72rem' }}>{p.barcode || '—'}</div>
                  </td>
                  <td>
                    <span className="badge bg-light text-dark border small">
                      {p.category?.name || 'General'}
                    </span>
                  </td>
                  <td>
                    <span className="fw-bold text-dark">₹{p.price?.toLocaleString()}</span>
                    {p.mrp > p.price && (
                      <span className="text-muted small text-decoration-line-through ms-1">
                        ₹{p.mrp?.toLocaleString()}
                      </span>
                    )}
                  </td>
                  <td>
                    {p.stock <= 5 ? (
                      <span className="badge bg-warning text-dark d-flex align-items-center gap-1" style={{ width: 'fit-content' }}>
                        <AlertTriangle size={12} /> {p.stock} units
                      </span>
                    ) : (
                      <span className="fw-semibold text-success">{p.stock} in stock</span>
                    )}
                  </td>
                  <td>
                    <span className={`badge ${p.approvalStatus === 'approved' ? 'bg-success' : p.approvalStatus === 'pending' ? 'bg-warning text-dark' : 'bg-danger'}`}>
                      {p.approvalStatus}
                    </span>
                  </td>
                  <td className="text-end">
                    <button
                      className="btn btn-light btn-sm text-primary border me-1"
                      onClick={() => handleOpenEdit(p)}
                      title="Edit"
                    >
                      <Edit size={14} />
                    </button>
                    <button
                      className="btn btn-light btn-sm text-danger border"
                      onClick={() => handleDelete(p._id)}
                      title="Delete"
                    >
                      <Trash2 size={14} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Product Modal */}
      {showAddModal && (
        <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered modal-lg">
            <div className="modal-content rounded-4 p-3">
              <div className="modal-header border-0 pb-0">
                <h5 className="modal-title fw-bold">
                  {editingProduct ? 'Edit Product Details' : 'Add New Marketplace Product'}
                </h5>
                <button type="button" className="btn-close" onClick={() => setShowAddModal(false)}></button>
              </div>

              <form onSubmit={handleSaveProduct} className="p-3">
                <div className="row g-3 mb-3">
                  <div className="col-md-8">
                    <label className="form-label small fw-semibold">Product Name *</label>
                    <input
                      type="text"
                      className="form-control form-control-sm"
                      required
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                    />
                  </div>
                  <div className="col-md-4">
                    <label className="form-label small fw-semibold">Category *</label>
                    <select
                      className="form-select form-select-sm"
                      value={form.category}
                      onChange={(e) => setForm({ ...form, category: e.target.value })}
                    >
                      {categories.map((c) => (
                        <option key={c._id} value={c._id}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="row g-3 mb-3">
                  <div className="col-md-3">
                    <label className="form-label small fw-semibold">Selling Price (₹) *</label>
                    <input
                      type="number"
                      className="form-control form-control-sm"
                      required
                      value={form.price}
                      onChange={(e) => setForm({ ...form, price: e.target.value })}
                    />
                  </div>
                  <div className="col-md-3">
                    <label className="form-label small fw-semibold">MRP Base Price (₹) *</label>
                    <input
                      type="number"
                      className="form-control form-control-sm"
                      required
                      value={form.mrp}
                      onChange={(e) => setForm({ ...form, mrp: e.target.value })}
                    />
                  </div>
                  <div className="col-md-3">
                    <label className="form-label small fw-semibold">SKU Code *</label>
                    <input
                      type="text"
                      className="form-control form-control-sm text-uppercase"
                      required
                      value={form.sku}
                      onChange={(e) => setForm({ ...form, sku: e.target.value })}
                    />
                  </div>
                  <div className="col-md-3">
                    <label className="form-label small fw-semibold">Barcode (EAN-13)</label>
                    <input
                      type="text"
                      className="form-control form-control-sm"
                      value={form.barcode}
                      onChange={(e) => setForm({ ...form, barcode: e.target.value })}
                    />
                  </div>
                </div>

                <div className="row g-3 mb-3">
                  <div className="col-md-4">
                    <label className="form-label small fw-semibold">Opening Stock Units *</label>
                    <input
                      type="number"
                      className="form-control form-control-sm"
                      required
                      value={form.stock}
                      onChange={(e) => setForm({ ...form, stock: e.target.value })}
                    />
                  </div>
                  <div className="col-md-8">
                    <label className="form-label small fw-semibold">Image URLs (comma-separated)</label>
                    <input
                      type="text"
                      className="form-control form-control-sm"
                      placeholder="https://images.unsplash.com/..."
                      value={form.images}
                      onChange={(e) => setForm({ ...form, images: e.target.value })}
                    />
                  </div>
                </div>

                <div className="mb-4">
                  <label className="form-label small fw-semibold">Product Description</label>
                  <textarea
                    className="form-control form-control-sm"
                    rows="3"
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                  ></textarea>
                </div>

                <div className="d-flex justify-content-end gap-2 border-top pt-3">
                  <button type="button" className="btn btn-light btn-sm" onClick={() => setShowAddModal(false)}>
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-emerald btn-sm px-4">
                    {editingProduct ? 'Save Updates' : 'Publish Product'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Bulk CSV Modal */}
      {showBulkModal && (
        <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content rounded-4 p-4">
              <h5 className="fw-bold mb-2 d-flex align-items-center gap-2">
                <FileSpreadsheet size={20} className="text-success" /> Bulk CSV/Excel Product Upload
              </h5>
              <p className="text-muted small mb-3">
                Upload your CSV catalog spreadsheet containing columns: <code>Name, SKU, Barcode, Price, MRP, Stock, Category</code>.
              </p>

              <div className="p-4 border border-dashed rounded-3 text-center bg-light mb-3">
                <Upload size={32} className="text-muted mb-2" />
                <div className="fw-semibold small">Ready to process sample verified batch</div>
                <div className="text-muted" style={{ fontSize: '0.75rem' }}>
                  Click below to ingest simulated batch of 2 accessories into MongoDB
                </div>
              </div>

              <div className="d-flex justify-content-end gap-2">
                <button className="btn btn-light btn-sm" onClick={() => setShowBulkModal(false)}>
                  Cancel
                </button>
                <button className="btn btn-emerald btn-sm px-3" onClick={handleBulkUploadSubmit}>
                  Import CSV Batch
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VendorProducts;

