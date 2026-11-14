import React, { useState, useEffect, useMemo } from 'react';
import {
  Package,
  Search,
  Filter,
  Eye,
  RefreshCw,
  Store,
  Layers,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Tag,
  DollarSign,
  Download,
  X,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import axiosClient from '../../api/axiosClient';

const AdminProducts = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [storeFilter, setStoreFilter] = useState('all'); // 'all' | 'AS' | 'AF'
  const [statusFilter, setStatusFilter] = useState('all');
  const [search, setSearch] = useState('');

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const [selectedProduct, setSelectedProduct] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const res = await axiosClient.get(
        `/admin/products?storeCode=${storeFilter}&status=${statusFilter}&search=${encodeURIComponent(search.trim())}`
      );
      if (res.success) {
        setProducts(res.data || []);
        setCurrentPage(1);
      }
    } catch (err) {
      console.error('Failed to load products', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [storeFilter, statusFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchProducts();
  };

  const handleResetFilters = () => {
    setStoreFilter('all');
    setStatusFilter('all');
    setSearch('');
  };

  // Client-side pagination
  const totalItems = products.length;
  const totalPages = Math.ceil(totalItems / pageSize) || 1;
  const paginatedProducts = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return products.slice(start, start + pageSize);
  }, [products, currentPage, pageSize]);

  // Export CSV
  const handleExportCSV = () => {
    if (products.length === 0) {
      alert('No products available to export.');
      return;
    }

    const headers = [
      'Product ID',
      'Name',
      'Store Code',
      'Store Name',
      'SKU',
      'Category',
      'Standard Price (INR)',
      'Sale Price (INR)',
      'Physical Stock',
      'Variants Count',
      'Status',
    ];

    const rows = products.map((p) => [
      `"${p.productId || ''}"`,
      `"${(p.name || '').replace(/"/g, '""')}"`,
      `"${p.storeCode || ''}"`,
      `"${p.storeName || ''}"`,
      `"${p.sku || ''}"`,
      `"${p.categoryName || ''}"`,
      p.price || 0,
      p.salePrice || p.price || 0,
      p.stock || 0,
      p.variantsCount || 1,
      `"${p.status || 'Active'}"`,
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const link = document.createElement('a');
    link.href = encodeURI(csvContent);
    link.download = `aaradhya_products_catalog_${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const openDetails = (prod) => {
    setSelectedProduct(prod);
    setShowModal(true);
  };

  return (
    <div className="container-fluid p-0">
      {/* 1. Page Header with Strict Read-Only Notice */}
      <div className="d-flex flex-column flex-sm-row justify-content-between align-items-start align-items-sm-center gap-3 mb-3">
        <div>
          <div className="d-flex align-items-center gap-2">
            <h3 className="fw-bolder mb-0 text-dark" style={{ letterSpacing: '-0.3px', fontSize: '1.4rem' }}>
              Centralized Product Catalog
            </h3>
            <span
              className="badge rounded-pill fw-bold border px-2.5 py-1"
              style={{ backgroundColor: '#F8FAFC', color: '#64748B', fontSize: '0.68rem', borderColor: '#EAECF0' }}
            >
              Strictly Read-Only
            </span>
          </div>
          <p className="text-secondary small mb-0 mt-0.5" style={{ fontSize: '0.82rem' }}>
            Consolidated catalog monitor for Aaradhya Silks and Fabrics. Catalog modifications reside exclusively with individual Store Admins.
          </p>
        </div>

        <div className="d-flex align-items-center gap-2 flex-wrap">
          <button
            type="button"
            className="btn btn-sm btn-white border rounded-2 px-3 py-1.5 text-secondary shadow-2xs d-inline-flex align-items-center gap-1.5"
            style={{ fontSize: '0.78rem', backgroundColor: '#FFFFFF', borderColor: '#EAECF0' }}
            onClick={fetchProducts}
            title="Refresh catalog list"
          >
            <RefreshCw size={13} className={loading ? 'spin' : ''} />
            <span>Refresh</span>
          </button>

          <button
            type="button"
            className="btn btn-sm text-white rounded-2 px-3 py-1.5 shadow-2xs d-inline-flex align-items-center gap-1.5 fw-semibold"
            style={{ fontSize: '0.78rem', backgroundColor: '#17233B' }}
            onClick={handleExportCSV}
            title="Download CSV of current catalog"
          >
            <Download size={13} />
            <span>Export Catalog CSV</span>
          </button>
        </div>
      </div>

      {/* 2. Filter Bar */}
      <div className="admin-card-tight mb-3">
        <form onSubmit={handleSearchSubmit} className="row g-2 align-items-center">
          <div className="col-12 col-md-5">
            <label className="form-label small fw-semibold text-muted mb-1" style={{ fontSize: '0.72rem' }}>
              Search Products
            </label>
            <div className="input-group input-group-sm">
              <span className="input-group-text bg-light border-end-0" style={{ borderColor: '#EAECF0' }}>
                <Search size={13} className="text-muted" />
              </span>
              <input
                type="text"
                className="form-control border-start-0 bg-light"
                style={{ borderColor: '#EAECF0', fontSize: '0.82rem' }}
                placeholder="Product name, Product ID, SKU, barcode..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              {search && (
                <button
                  className="btn btn-light border border-start-0"
                  type="button"
                  onClick={() => {
                    setSearch('');
                    fetchProducts();
                  }}
                >
                  <X size={12} className="text-muted" />
                </button>
              )}
            </div>
          </div>

          <div className="col-6 col-md-3">
            <label className="form-label small fw-semibold text-muted mb-1" style={{ fontSize: '0.72rem' }}>
              Store Scope
            </label>
            <select
              className="form-select form-select-sm bg-light"
              style={{ borderColor: '#EAECF0', fontSize: '0.82rem' }}
              value={storeFilter}
              onChange={(e) => setStoreFilter(e.target.value)}
            >
              <option value="all">All Stores (Silks &amp; Fabrics)</option>
              <option value="AS">Aaradhya Silks (AS)</option>
              <option value="AF">Aaradhya Fabrics (AF)</option>
            </select>
          </div>

          <div className="col-6 col-md-3">
            <label className="form-label small fw-semibold text-muted mb-1" style={{ fontSize: '0.72rem' }}>
              Listing Status
            </label>
            <select
              className="form-select form-select-sm bg-light"
              style={{ borderColor: '#EAECF0', fontSize: '0.82rem' }}
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">All Statuses</option>
              <option value="active">Active Listing</option>
              <option value="inactive">Inactive / Draft</option>
            </select>
          </div>

          <div className="col-12 col-md-1 d-flex gap-1 align-items-end pt-md-3">
            <button
              type="submit"
              className="btn btn-sm w-100 text-white fw-bold rounded-2"
              style={{ backgroundColor: '#E90064', fontSize: '0.78rem' }}
            >
              Search
            </button>
          </div>
        </form>
      </div>

      {/* 3. Products Table (Strictly Read-Only) */}
      <div className="admin-table-card shadow-2xs">
        <div className="table-responsive">
          <table className="admin-table table-hover align-middle mb-0" style={{ minWidth: '1050px' }}>
            <thead>
              <tr>
                <th>PRODUCT</th>
                <th className="order-id-cell">PRODUCT ID</th>
                <th className="text-center nowrap-cell">STORE</th>
                <th className="nowrap-cell">SKU</th>
                <th className="nowrap-cell">CATEGORY</th>
                <th className="amount-cell">PRICE / SALE</th>
                <th className="text-center nowrap-cell">VARIANTS</th>
                <th className="text-center nowrap-cell">STATUS</th>
                <th className="actions-cell">ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="9" className="text-center py-5 text-muted">
                    <div className="spinner-border spinner-border-sm text-primary me-2" role="status" style={{ color: '#E90064' }}></div>
                    <span className="small">Loading product catalog...</span>
                  </td>
                </tr>
              ) : paginatedProducts.length === 0 ? (
                <tr>
                  <td colSpan="9" className="text-center py-5 text-muted">
                    <div className="p-3">
                      <AlertCircle size={28} className="text-muted mb-2 d-inline-block" />
                      <div className="fw-semibold text-dark">No products found matching criteria.</div>
                      <div className="small text-muted mb-3">Adjust your search term or store filter.</div>
                      <button
                        type="button"
                        className="btn btn-sm btn-outline-secondary rounded-2 px-3 py-1"
                        onClick={handleResetFilters}
                      >
                        Reset Filters
                      </button>
                    </div>
                  </td>
                </tr>
              ) : (
                paginatedProducts.map((p) => {
                  const isSilks = p.storeCode === 'AS';
                  return (
                    <tr key={p._id}>
                      <td className="ps-3 text-start">
                        <div className="d-flex align-items-center gap-2.5">
                          <img
                            src={p.image}
                            alt={p.name}
                            className="rounded-2 border flex-shrink-0"
                            style={{ width: '42px', height: '42px', objectFit: 'cover' }}
                          />
                          <div>
                            <div className="fw-bold text-dark text-truncate" style={{ maxWidth: '240px' }}>
                              {p.name}
                            </div>
                            <span className="text-muted small" style={{ fontSize: '0.7rem' }}>
                              Added {new Date(p.createdAt).toLocaleDateString('en-IN')}
                            </span>
                          </div>
                        </div>
                      </td>

                      <td className="text-start">
                        <code className="text-dark small fw-bold font-monospace">{p.productId}</code>
                      </td>

                      <td className="text-center">
                        <span
                          className="badge rounded-pill fw-semibold"
                          style={{
                            backgroundColor: isSilks ? '#FFF0F5' : '#F0F7FF',
                            color: isSilks ? '#E90064' : '#087CE5',
                            border: `1px solid ${isSilks ? '#FCE7F1' : '#BFDBFE'}`,
                            fontSize: '0.68rem',
                          }}
                        >
                          {p.storeName}
                        </span>
                      </td>

                      <td className="text-start font-monospace text-muted small">
                        {p.sku}
                      </td>

                      <td className="text-start">
                        <span className="badge rounded-pill bg-light text-dark border" style={{ fontSize: '0.68rem', borderColor: '#EAECF0' }}>
                          {p.categoryName}
                        </span>
                      </td>

                      <td className="text-end">
                        <strong className="text-dark font-monospace">₹{p.price?.toLocaleString()}</strong>
                        {p.salePrice && p.salePrice < p.price && (
                          <div className="text-danger small font-monospace" style={{ fontSize: '0.68rem' }}>
                            Sale: ₹{p.salePrice?.toLocaleString()}
                          </div>
                        )}
                      </td>

                      <td className="text-center">
                        <span className="small text-muted">{p.variantsCount} variant(s)</span>
                      </td>

                      <td className="text-center">
                        <span
                          className={`badge rounded-pill ${
                            p.status === 'Active' ? 'bg-success text-white' : 'bg-secondary text-white'
                          }`}
                          style={{ fontSize: '0.68rem' }}
                        >
                          {p.status}
                        </span>
                      </td>

                      <td className="text-end pe-3">
                        <button
                          type="button"
                          className="btn btn-sm btn-white border rounded-2 px-2.5 py-1 text-dark small shadow-2xs d-inline-flex align-items-center gap-1"
                          style={{ fontSize: '0.74rem', borderColor: '#EAECF0' }}
                          onClick={() => openDetails(p)}
                          title="Inspect product specifications"
                        >
                          <Eye size={12} className="text-secondary" />
                          <span>Inspect</span>
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        {totalItems > 0 && (
          <div
            className="p-3 border-top d-flex flex-column flex-sm-row justify-content-between align-items-center gap-2"
            style={{ borderColor: '#EAECF0', backgroundColor: '#FFFFFF' }}
          >
            <div className="d-flex align-items-center gap-2">
              <span className="text-muted small" style={{ fontSize: '0.78rem' }}>
                Showing{' '}
                <strong>
                  {Math.min(totalItems, (currentPage - 1) * pageSize + 1)}-
                  {Math.min(totalItems, currentPage * pageSize)}
                </strong>{' '}
                of <strong>{totalItems}</strong> catalog items
              </span>

              <select
                className="form-select form-select-sm"
                style={{ width: '85px', fontSize: '0.75rem', borderColor: '#EAECF0' }}
                value={pageSize}
                onChange={(e) => {
                  setPageSize(Number(e.target.value));
                  setCurrentPage(1);
                }}
              >
                <option value={10}>10 / page</option>
                <option value={25}>25 / page</option>
                <option value={50}>50 / page</option>
              </select>
            </div>

            <div className="d-flex align-items-center gap-1">
              <button
                type="button"
                className="btn btn-sm btn-light border rounded-2 px-2 py-1"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              >
                <ChevronLeft size={14} />
              </button>

              {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                <button
                  key={pageNum}
                  type="button"
                  className={`btn btn-sm rounded-2 px-2.5 py-1 ${
                    currentPage === pageNum ? 'btn-primary text-white fw-bold' : 'btn-light border'
                  }`}
                  style={
                    currentPage === pageNum
                      ? { backgroundColor: '#E90064', borderColor: '#E90064', fontSize: '0.76rem' }
                      : { borderColor: '#EAECF0', fontSize: '0.76rem' }
                  }
                  onClick={() => setCurrentPage(pageNum)}
                >
                  {pageNum}
                </button>
              ))}

              <button
                type="button"
                className="btn btn-sm btn-light border rounded-2 px-2 py-1"
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              >
                <ChevronRight size={14} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* 4. Product Details Modal (Strictly Read-Only) */}
      {showModal && selectedProduct && (
        <div
          className="modal show d-block"
          style={{ backgroundColor: 'rgba(15, 23, 42, 0.65)', backdropFilter: 'blur(3px)', zIndex: 1060 }}
          onClick={() => setShowModal(false)}
        >
          <div className="modal-dialog modal-dialog-centered modal-lg" onClick={(e) => e.stopPropagation()}>
            <div className="modal-content rounded-3 border-0 shadow-lg">
              <div className="modal-header bg-white border-bottom p-3">
                <div>
                  <h5 className="modal-title fw-bold text-dark mb-0">{selectedProduct.name}</h5>
                  <span className="text-muted small" style={{ fontSize: '0.74rem' }}>
                    Product ID: <strong className="font-monospace">{selectedProduct.productId}</strong> &bull; Store: <strong>{selectedProduct.storeName}</strong>
                  </span>
                </div>
                <button type="button" className="btn-close" onClick={() => setShowModal(false)} />
              </div>

              <div className="modal-body p-4 bg-light">
                <div className="row g-3 mb-3">
                  <div className="col-12 col-md-5">
                    <img
                      src={selectedProduct.image}
                      alt={selectedProduct.name}
                      className="w-100 rounded-3 border shadow-sm"
                      style={{ maxHeight: '250px', objectFit: 'cover' }}
                    />
                  </div>
                  <div className="col-12 col-md-7">
                    <div className="p-3 bg-white rounded-3 border h-100">
                      <div className="text-muted small fw-bold mb-1" style={{ fontSize: '0.7rem' }}>SPECIFICATIONS</div>
                      <div className="small mb-1"><span className="text-muted">SKU:</span> <strong className="font-monospace">{selectedProduct.sku}</strong></div>
                      <div className="small mb-1"><span className="text-muted">Category:</span> <strong>{selectedProduct.categoryName}</strong></div>
                      <div className="small mb-1"><span className="text-muted">Standard Price:</span> <strong className="fs-6 text-dark font-monospace">₹{selectedProduct.price?.toLocaleString()}</strong></div>
                      <div className="small mb-1"><span className="text-muted">Physical Stock on Hand:</span> <strong className="text-success">{selectedProduct.stock} units</strong></div>
                      <div className="small mb-2"><span className="text-muted">Store Ownership:</span> <span className="badge rounded-pill bg-light text-dark border ms-1">{selectedProduct.storeName}</span></div>
                      <div className="border-top pt-2 mt-2">
                        <span className="text-muted small fw-bold d-block mb-1" style={{ fontSize: '0.7rem' }}>DESCRIPTION</span>
                        <p className="small text-secondary mb-0" style={{ fontSize: '0.78rem', lineHeight: 1.5 }}>
                          {selectedProduct.description || 'Mastercrafted traditional textile item cataloged under authorized multi-store inventory.'}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-2.5 rounded-2 bg-light border d-flex align-items-center gap-2 small text-dark" style={{ fontSize: '0.76rem' }}>
                  <ShieldCheck size={16} className="text-primary flex-shrink-0" />
                  <span>
                    <strong>Enterprise Compliance:</strong> Super Admin has monitor-only privileges for store inventory. Product modifications, pricing overrides, and stock adjustments are managed by Store Admins.
                  </span>
                </div>
              </div>

              <div className="modal-footer bg-white border-top p-2.5">
                <button type="button" className="btn btn-secondary btn-sm rounded-2 px-3" onClick={() => setShowModal(false)}>
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminProducts;
