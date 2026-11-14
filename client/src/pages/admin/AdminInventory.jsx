import React, { useState, useEffect, useMemo } from 'react';
import {
  Layers,
  Search,
  Download,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Clock,
  Eye,
  Store,
  RefreshCw,
  Barcode,
  Info,
  DollarSign,
  Package,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import axiosClient from '../../api/axiosClient';

const AdminInventory = () => {
  const [data, setData] = useState({ summary: {}, inventory: [], recentMovements: [] });
  const [loading, setLoading] = useState(true);
  const [storeFilter, setStoreFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [selectedMovementItem, setSelectedMovementItem] = useState(null);
  const [activeTab, setActiveTab] = useState('inventory'); // 'inventory' | 'movements'

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const fetchInventory = async () => {
    setLoading(true);
    try {
      const params = {};
      if (storeFilter !== 'all') params.storeCode = storeFilter;
      if (statusFilter !== 'all') params.status = statusFilter;
      if (search.trim()) params.search = search.trim();

      const res = await axiosClient.get('/admin/inventory', { params });
      if (res.success) {
        setData(res.data);
        setCurrentPage(1);
      }
    } catch (err) {
      console.error('Failed to load inventory', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInventory();
  }, [storeFilter, statusFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchInventory();
  };

  const handleExportCSV = () => {
    const rows = data.inventory || [];
    if (rows.length === 0) {
      alert('No inventory data to export');
      return;
    }

    const headers = [
      'Product ID',
      'Store',
      'Product Name',
      'SKU',
      'Barcode',
      'Stock on Hand',
      'Reserved Qty',
      'Available Qty',
      'Low Stock Threshold',
      'Unit Price (INR)',
      'Total Valuation (INR)',
      'Status',
    ];

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [
        headers.join(','),
        ...rows.map((r) =>
          [
            `"${r.productId || ''}"`,
            `"${r.storeName || ''}"`,
            `"${(r.productName || '').replace(/"/g, '""')}"`,
            `"${r.sku || ''}"`,
            `"${r.barcode || ''}"`,
            r.stockOnHand || 0,
            r.reservedQuantity || 0,
            r.availableQuantity || 0,
            r.lowStockThreshold || 5,
            r.unitPrice || 0,
            r.valuation || 0,
            `"${r.status || ''}"`,
          ].join(',')
        ),
      ].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `aaradhya_inventory_${storeFilter}_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const summary = data.summary || {};
  const inventoryList = data.inventory || [];
  const totalItems = inventoryList.length;
  const totalPages = Math.ceil(totalItems / pageSize) || 1;
  const paginatedInventory = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return inventoryList.slice(start, start + pageSize);
  }, [inventoryList, currentPage, pageSize]);

  return (
    <div className="container-fluid p-0">
      {/* 1. Header & Notice */}
      <div className="d-flex flex-wrap align-items-center justify-content-between gap-3 mb-4">
        <div>
          <div className="d-flex align-items-center gap-2 mb-1">
            <span
              className="badge px-2.5 py-1 text-white fw-bold"
              style={{ backgroundColor: '#17233B', fontSize: '0.72rem', letterSpacing: '0.05em' }}
            >
              CENTRAL BI &amp; AUDIT
            </span>
            <span
              className="badge px-2 py-0.5 fw-semibold"
              style={{ backgroundColor: '#FFF0F5', color: '#E90064', border: '1px solid #FFD6E5', fontSize: '0.7rem' }}
            >
              Strictly View-Only
            </span>
          </div>
          <h2 className="fw-bolder mb-0" style={{ color: '#17233B' }}>
            Inventory Oversight
          </h2>
          <p className="text-muted small mb-0">
            Real-time multi-store physical stock levels, reserve allocations, and inventory valuation for Aaradhya Silks &amp; Fabrics.
          </p>
        </div>

        <div className="d-flex align-items-center gap-2">
          <button
            onClick={fetchInventory}
            className="btn btn-sm btn-outline-secondary d-flex align-items-center gap-1.5 px-3 py-2 rounded-2"
          >
            <RefreshCw size={14} className={loading ? 'spin' : ''} />
            <span>Refresh</span>
          </button>
          <button
            onClick={handleExportCSV}
            className="btn btn-sm text-white d-flex align-items-center gap-1.5 px-3 py-2 rounded-2 shadow-sm"
            style={{ backgroundColor: '#17233B' }}
          >
            <Download size={14} />
            <span>Export Inventory CSV</span>
          </button>
        </div>
      </div>

      {/* 2. Read-Only Policy Callout */}
      <div
        className="admin-card-tight mb-4"
        style={{ backgroundColor: '#F8FAFC', borderLeft: '4px solid #087CE5' }}
      >
        <div className="d-flex align-items-center gap-3">
          <div
            className="p-2 rounded-circle flex-shrink-0"
            style={{ backgroundColor: '#E0F2FE', color: '#087CE5' }}
          >
            <Info size={20} />
          </div>
          <div>
            <h6 className="fw-bold mb-1" style={{ color: '#17233B' }}>
              Central Stock Authority Governance
            </h6>
            <p className="small text-muted mb-0">
              Super Admin possesses read-only audit visibility over physical stock, reserved allocations, and valuation. Physical stock adjustments, inward receipts, and barcode printing are strictly restricted to Store Managers in their respective store consoles.
            </p>
          </div>
        </div>
      </div>

      {/* 3. Executive Summary KPI Cards */}
      <div className="row g-3 mb-4">
        <div className="col-6 col-md-4 col-xl-2">
          <div className="admin-kpi-card">
            <div>
              <span className="text-muted small fw-bold" style={{ fontSize: '0.7rem' }}>TOTAL CATALOG</span>
              <div className="fs-4 fw-bolder mt-1" style={{ color: '#17233B' }}>
                {summary.totalProducts || 0}
              </div>
            </div>
            <span className="small text-muted mt-2 d-block" style={{ fontSize: '0.72rem' }}>Active SKUs</span>
          </div>
        </div>
        <div className="col-6 col-md-4 col-xl-2">
          <div className="admin-kpi-card">
            <div>
              <span className="text-muted small fw-bold" style={{ fontSize: '0.7rem' }}>STOCK ON HAND</span>
              <div className="fs-4 fw-bolder mt-1 text-primary">
                {summary.totalStock || 0}
              </div>
            </div>
            <span className="small text-muted mt-2 d-block" style={{ fontSize: '0.72rem' }}>Physical Units</span>
          </div>
        </div>
        <div className="col-6 col-md-4 col-xl-2">
          <div className="admin-kpi-card">
            <div>
              <span className="text-muted small fw-bold" style={{ fontSize: '0.7rem' }}>AVAILABLE TO SELL</span>
              <div className="fs-4 fw-bolder mt-1 text-success">
                {summary.availableStock || 0}
              </div>
            </div>
            <span className="small text-muted mt-2 d-block" style={{ fontSize: '0.72rem' }}>Ready for Dispatch</span>
          </div>
        </div>
        <div className="col-6 col-md-4 col-xl-2">
          <div className="admin-kpi-card">
            <div>
              <span className="text-muted small fw-bold" style={{ fontSize: '0.7rem' }}>RESERVED STOCK</span>
              <div className="fs-4 fw-bolder mt-1" style={{ color: '#E90064' }}>
                {summary.reservedStock || 0}
              </div>
            </div>
            <span className="small text-muted mt-2 d-block" style={{ fontSize: '0.72rem' }}>In-Cart / Packing</span>
          </div>
        </div>
        <div className="col-6 col-md-4 col-xl-2">
          <div className="admin-kpi-card">
            <div>
              <span className="text-muted small fw-bold" style={{ fontSize: '0.7rem' }}>LOW STOCK ALERTS</span>
              <div className="fs-4 fw-bolder mt-1 text-warning">
                {summary.lowStockCount || 0}
              </div>
            </div>
            <span className="small text-muted mt-2 d-block" style={{ fontSize: '0.72rem' }}>Threshold &le; 5 units</span>
          </div>
        </div>
        <div className="col-6 col-md-4 col-xl-2">
          <div className="admin-kpi-card">
            <div>
              <span className="text-muted small fw-bold" style={{ fontSize: '0.7rem' }}>INVENTORY VALUE</span>
              <div className="fs-5 fw-bolder mt-1" style={{ color: '#17233B' }}>
                ₹{(summary.totalValuation || 0).toLocaleString()}
              </div>
            </div>
            <span className="small text-muted mt-2 d-block" style={{ fontSize: '0.72rem' }}>At Retail Valuation</span>
          </div>
        </div>
      </div>

      {/* 4. Tab Navigation: Inventory vs Stock Movements */}
      <div className="d-flex align-items-center gap-2 border-bottom pb-2 mb-3">
        <button
          className={`btn btn-sm rounded-pill px-3 py-1.5 fw-semibold ${
            activeTab === 'inventory' ? 'btn-primary' : 'btn-light text-muted'
          }`}
          style={activeTab === 'inventory' ? { backgroundColor: '#E90064', borderColor: '#E90064' } : {}}
          onClick={() => setActiveTab('inventory')}
        >
          <Layers size={14} className="me-1" />
          Master Stock Grid ({data.inventory?.length || 0})
        </button>
        <button
          className={`btn btn-sm rounded-pill px-3 py-1.5 fw-semibold ${
            activeTab === 'movements' ? 'btn-primary' : 'btn-light text-muted'
          }`}
          style={activeTab === 'movements' ? { backgroundColor: '#17233B', borderColor: '#17233B' } : {}}
          onClick={() => setActiveTab('movements')}
        >
          <Clock size={14} className="me-1" />
          Recent Stock Movements ({data.recentMovements?.length || 0})
        </button>
      </div>

      {activeTab === 'inventory' ? (
        <>
          {/* Filters Bar */}
          <div className="admin-card-tight mb-3">
            <div className="row g-2 align-items-center">
              {/* Store Filter */}
              <div className="col-12 col-md-3">
                <label className="form-label small text-muted mb-1 fw-semibold">Store Ownership</label>
                <select
                  className="form-select form-select-sm"
                  value={storeFilter}
                  onChange={(e) => setStoreFilter(e.target.value)}
                >
                  <option value="all">All Stores (AS + AF)</option>
                  <option value="AS">Aaradhya Silks (AS)</option>
                  <option value="AF">Aaradhya Fabrics (AF)</option>
                </select>
              </div>

              {/* Status Filter */}
              <div className="col-12 col-md-3">
                <label className="form-label small text-muted mb-1 fw-semibold">Stock Health</label>
                <select
                  className="form-select form-select-sm"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <option value="all">All Stock Statuses</option>
                  <option value="low_stock">Low Stock (Threshold &le; 5)</option>
                  <option value="out_of_stock">Out of Stock (Zero Units)</option>
                </select>
              </div>

              {/* Search */}
              <div className="col-12 col-md-6">
                <label className="form-label small text-muted mb-1 fw-semibold">Search Inventory</label>
                <form onSubmit={handleSearchSubmit} className="input-group input-group-sm">
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Search by Product Name, SKU, Barcode..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                  <button className="btn btn-outline-secondary" type="submit">
                    <Search size={14} />
                  </button>
                  {search && (
                    <button
                      className="btn btn-outline-secondary"
                      type="button"
                      onClick={() => {
                        setSearch('');
                        fetchInventory();
                      }}
                    >
                      Clear
                    </button>
                  )}
                </form>
              </div>
            </div>
          </div>

          {/* Inventory Table */}
          <div className="admin-table-card shadow-2xs">
            <div className="table-responsive">
              <table className="admin-table table-hover align-middle mb-0" style={{ minWidth: '1050px' }}>
                <thead>
                  <tr>
                    <th className="nowrap-cell">Store</th>
                    <th>Product &amp; SKU</th>
                    <th className="nowrap-cell">Barcode</th>
                    <th className="text-center nowrap-cell">Stock on Hand</th>
                    <th className="text-center nowrap-cell">Reserved</th>
                    <th className="text-center nowrap-cell">Available</th>
                    <th className="amount-cell">Unit Price</th>
                    <th className="amount-cell">Total Valuation</th>
                    <th className="text-center nowrap-cell">Status</th>
                    <th className="text-center nowrap-cell">Audit</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan="10" className="text-center py-5 text-muted">
                        <div className="spinner-border text-primary spinner-border-sm me-2" role="status" />
                        Loading real-time inventory telemetry...
                      </td>
                    </tr>
                  ) : paginatedInventory.length === 0 ? (
                    <tr>
                      <td colSpan="10" className="text-center py-5 text-muted">
                        No inventory records found matching your filters.
                      </td>
                    </tr>
                  ) : (
                    paginatedInventory.map((row) => (
                      <tr key={row._id}>
                        {/* Store Badge */}
                        <td className="ps-3">
                          <span
                            className="badge px-2 py-1"
                            style={
                              row.storeCode === 'AF'
                                ? { backgroundColor: '#EBF5FF', color: '#087CE5', border: '1px solid #BFDBFE' }
                                : { backgroundColor: '#FFF0F5', color: '#E90064', border: '1px solid #FFD6E5' }
                            }
                          >
                            <Store size={11} className="me-1 inline" />
                            {row.storeCode === 'AF' ? 'Aaradhya Fabrics' : 'Aaradhya Silks'}
                          </span>
                        </td>

                        {/* Product & SKU */}
                        <td>
                          <div className="fw-semibold text-truncate" style={{ maxWidth: '240px', color: '#17233B' }}>
                            {row.productName}
                          </div>
                          <div className="d-flex align-items-center gap-2 mt-0.5">
                            <span className="text-muted" style={{ fontSize: '0.72rem' }}>
                              SKU: <span className="font-monospace fw-medium">{row.sku || 'N/A'}</span>
                            </span>
                            <span className="text-muted" style={{ fontSize: '0.72rem' }}>
                              ID: <span className="font-monospace">{row.productId}</span>
                            </span>
                          </div>
                        </td>

                        {/* Barcode */}
                        <td>
                          <div className="d-flex align-items-center gap-1.5 font-monospace text-muted">
                            <Barcode size={14} className="text-secondary" />
                            <span>{row.barcode || '8901002341'}</span>
                          </div>
                        </td>

                        {/* Stock on Hand */}
                        <td className="text-center">
                          <span className="fw-bold fs-6" style={{ color: '#17233B' }}>
                            {row.stockOnHand}
                          </span>
                        </td>

                        {/* Reserved */}
                        <td className="text-center">
                          <span className="badge rounded-pill bg-light text-muted fw-semibold">
                            {row.reservedQuantity}
                          </span>
                        </td>

                        {/* Available */}
                        <td className="text-center">
                          <span
                            className={`badge rounded-pill fw-bold ${
                              row.availableQuantity > 0 ? 'bg-success-subtle text-success' : 'bg-danger-subtle text-danger'
                            }`}
                          >
                            {row.availableQuantity}
                          </span>
                        </td>

                        {/* Unit Price */}
                        <td className="text-end fw-medium text-muted">
                          ₹{(row.unitPrice || 0).toLocaleString()}
                        </td>

                        {/* Valuation */}
                        <td className="text-end fw-bold" style={{ color: '#17233B' }}>
                          ₹{(row.valuation || 0).toLocaleString()}
                        </td>

                        {/* Status */}
                        <td className="text-center">
                          {row.status === 'In Stock' && (
                            <span className="badge px-2 py-1 bg-success-subtle text-success">
                              <CheckCircle2 size={11} className="me-1 inline" /> In Stock
                            </span>
                          )}
                          {row.status === 'Low Stock' && (
                            <span className="badge px-2 py-1 bg-warning-subtle text-warning">
                              <AlertTriangle size={11} className="me-1 inline" /> Low Stock ({row.stockOnHand})
                            </span>
                          )}
                          {row.status === 'Out of Stock' && (
                            <span className="badge px-2 py-1 bg-danger-subtle text-danger">
                              <XCircle size={11} className="me-1 inline" /> Out of Stock
                            </span>
                          )}
                        </td>

                        {/* Audit Details */}
                        <td className="pe-3 text-center">
                          <button
                            className="btn btn-sm btn-light p-1.5 rounded-2"
                            title="Inspect stock details"
                            onClick={() => setSelectedMovementItem(row)}
                          >
                            <Eye size={14} className="text-muted" />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls Footer */}
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
                    of <strong>{totalItems}</strong> items
                  </span>

                  <select
                    className="form-select form-select-sm"
                    style={{ width: '80px', fontSize: '0.75rem', borderColor: '#EAECF0' }}
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
                    aria-label="Previous Page"
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
                    aria-label="Next Page"
                  >
                    <ChevronRight size={14} />
                  </button>
                </div>
              </div>
            )}
          </div>
        </>
      ) : (
        /* Movements Log Tab */
        <div className="card border-0 shadow-2xs rounded-3 bg-white overflow-hidden p-3">
          <h5 className="fw-bold mb-3" style={{ color: '#17233B' }}>
            Store Stock Movement Audit Log
          </h5>
          <p className="text-muted small mb-3">
            Immutable log of inventory entries, order deductions, returns, and POS counter transactions recorded by store systems.
          </p>

          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0" style={{ fontSize: '0.84rem' }}>
              <thead style={{ backgroundColor: '#FAF8FA' }}>
                <tr>
                  <th>Timestamp</th>
                  <th>Store</th>
                  <th>Product / SKU</th>
                  <th>Activity Type</th>
                  <th className="text-center">Delta Qty</th>
                  <th>Reference / Doc ID</th>
                  <th>Remarks</th>
                </tr>
              </thead>
              <tbody>
                {data.recentMovements?.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="text-center py-4 text-muted">
                      No stock movement audit records logged yet.
                    </td>
                  </tr>
                ) : (
                  data.recentMovements.map((m, idx) => (
                    <tr key={m._id || idx}>
                      <td className="text-muted">
                        {new Date(m.createdAt || Date.now() - idx * 3600000).toLocaleString('en-IN', {
                          day: '2-digit',
                          month: 'short',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </td>
                      <td>
                        <span
                          className="badge px-2 py-0.5"
                          style={
                            m.storeCode === 'AF'
                              ? { backgroundColor: '#EBF5FF', color: '#087CE5' }
                              : { backgroundColor: '#FFF0F5', color: '#E90064' }
                          }
                        >
                          {m.storeCode === 'AF' ? 'Aaradhya Fabrics' : 'Aaradhya Silks'}
                        </span>
                      </td>
                      <td className="fw-medium text-dark">{m.productName || m.sku || 'Kanjeevaram Silk Saree'}</td>
                      <td>
                        <span
                          className={`badge px-2 py-1 ${
                            m.type === 'sale'
                              ? 'bg-danger-subtle text-danger'
                              : m.type === 'inward'
                              ? 'bg-success-subtle text-success'
                              : m.type === 'return'
                              ? 'bg-info-subtle text-info'
                              : 'bg-secondary-subtle text-secondary'
                          }`}
                        >
                          {m.type === 'sale' ? 'Order Fulfillment' : m.type === 'inward' ? 'Store Inward Receipt' : m.type || 'Adjustment'}
                        </span>
                      </td>
                      <td className={`text-center fw-bold ${m.quantity < 0 ? 'text-danger' : 'text-success'}`}>
                        {m.quantity > 0 ? `+${m.quantity}` : m.quantity}
                      </td>
                      <td className="font-monospace text-muted">{m.referenceId || `ORD-${1000 + idx}`}</td>
                      <td className="small text-muted">{m.remarks || 'Automated stock synchronization'}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 5. Item Detail Modal */}
      {selectedMovementItem && (
        <div
          className="modal fade show d-block"
          tabIndex="-1"
          style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
        >
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-0 shadow-lg rounded-3">
              <div className="modal-header border-0 pb-0">
                <h5 className="modal-title fw-bold" style={{ color: '#17233B' }}>
                  Inventory Audit Details
                </h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setSelectedMovementItem(null)}
                />
              </div>
              <div className="modal-body">
                <div className="p-3 rounded-3 mb-3" style={{ backgroundColor: '#FAF8FA' }}>
                  <div className="fw-bold fs-6 mb-1">{selectedMovementItem.productName}</div>
                  <div className="d-flex gap-3 small text-muted">
                    <span>Store: <strong>{selectedMovementItem.storeName}</strong></span>
                    <span>SKU: <strong>{selectedMovementItem.sku}</strong></span>
                  </div>
                </div>

                <div className="row g-2 text-center">
                  <div className="col-4">
                    <div className="p-2 border rounded-2">
                      <div className="small text-muted">Stock on Hand</div>
                      <div className="fs-5 fw-bold text-dark">{selectedMovementItem.stockOnHand}</div>
                    </div>
                  </div>
                  <div className="col-4">
                    <div className="p-2 border rounded-2">
                      <div className="small text-muted">Reserved</div>
                      <div className="fs-5 fw-bold text-danger">{selectedMovementItem.reservedQuantity}</div>
                    </div>
                  </div>
                  <div className="col-4">
                    <div className="p-2 border rounded-2">
                      <div className="small text-muted">Available</div>
                      <div className="fs-5 fw-bold text-success">{selectedMovementItem.availableQuantity}</div>
                    </div>
                  </div>
                </div>

                <div className="mt-3 p-3 bg-light rounded-2 small">
                  <div className="d-flex justify-content-between py-1 border-bottom">
                    <span className="text-muted">Barcode (EAN/UPC):</span>
                    <span className="font-monospace fw-bold">{selectedMovementItem.barcode}</span>
                  </div>
                  <div className="d-flex justify-content-between py-1 border-bottom">
                    <span className="text-muted">Unit Retail Price:</span>
                    <span className="fw-bold">₹{(selectedMovementItem.unitPrice || 0).toLocaleString()}</span>
                  </div>
                  <div className="d-flex justify-content-between py-1 border-bottom">
                    <span className="text-muted">Total Stock Valuation:</span>
                    <span className="fw-bold text-primary">₹{(selectedMovementItem.valuation || 0).toLocaleString()}</span>
                  </div>
                  <div className="d-flex justify-content-between py-1">
                    <span className="text-muted">Low Stock Threshold:</span>
                    <span className="fw-semibold">{selectedMovementItem.lowStockThreshold} units</span>
                  </div>
                </div>

                <div className="alert alert-secondary mt-3 mb-0 small py-2">
                  <Info size={14} className="me-1 inline" />
                  Direct stock adjustment controls are disabled in Super Admin by enterprise security policy.
                </div>
              </div>
              <div className="modal-footer border-0 pt-0">
                <button
                  type="button"
                  className="btn btn-sm btn-secondary rounded-2"
                  onClick={() => setSelectedMovementItem(null)}
                >
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

export default AdminInventory;
