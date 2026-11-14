import React, { useState, useEffect } from 'react';
import {
  Boxes,
  Plus,
  ArrowDownRight,
  ArrowUpRight,
  History,
  AlertTriangle,
  Search,
  CheckCircle,
} from 'lucide-react';
import axiosClient from '../../api/axiosClient';

const PosInventory = () => {
  const [inventory, setInventory] = useState([]);
  const [movements, setMovements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Stock In Modal
  const [showAdjustModal, setShowAdjustModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [adjustQty, setAdjustQty] = useState('');
  const [adjustType, setAdjustType] = useState('purchase_in'); // 'purchase_in' | 'manual_adjustment' | 'damaged'
  const [adjustNotes, setAdjustNotes] = useState('');

  const fetchInventoryData = async () => {
    try {
      const [invRes, movRes] = await Promise.all([
        axiosClient.get(`/inventory?status=${statusFilter}&search=${encodeURIComponent(search)}`),
        axiosClient.get('/inventory/movements'),
      ]);
      if (invRes.success) setInventory(invRes.data);
      if (movRes.success) setMovements(invRes.data ? movRes.data : []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInventoryData();
  }, [statusFilter]);

  const handleOpenAdjust = (item, type = 'purchase_in') => {
    setSelectedProduct(item);
    setAdjustType(type);
    setAdjustQty('');
    setAdjustNotes('');
    setShowAdjustModal(true);
  };

  const handleSaveAdjustment = async (e) => {
    e.preventDefault();
    if (!adjustQty || isNaN(adjustQty)) return;

    try {
      const res = await axiosClient.post('/inventory/adjust', {
        productId: selectedProduct._id,
        sku: selectedProduct.sku,
        quantity: Number(adjustQty),
        type: adjustType,
        notes: adjustNotes,
      });

      if (res.success) {
        alert('Inventory stock updated successfully!');
        setShowAdjustModal(false);
        fetchInventoryData();
      }
    } catch (err) {
      alert(`Adjustment error: ${err.message}`);
    }
  };

  return (
    <div className="p-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h3 className="fw-bold mb-1">Centralized Retail Inventory & Stock Sync</h3>
          <p className="text-muted small mb-0">Single inventory ledger powering online storefront and offline counter POS.</p>
        </div>
      </div>

      {/* Real-time Inventory Table */}
      <div className="card card-modern p-4 mb-4">
        <div className="d-flex flex-wrap justify-content-between align-items-center gap-3 mb-3">
          <div className="input-group input-group-sm" style={{ maxWidth: '340px' }}>
            <span className="input-group-text bg-white"><Search size={14} /></span>
            <input
              type="text"
              className="form-control"
              placeholder="Search by product, SKU, barcode..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && fetchInventoryData()}
            />
          </div>

          <div className="d-flex align-items-center gap-2">
            <span className="small text-muted">Stock Status:</span>
            <select
              className="form-select form-select-sm"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              style={{ width: '150px' }}
            >
              <option value="all">All Items</option>
              <option value="in_stock">In Stock</option>
              <option value="low_stock">Low Stock (&lt;5)</option>
              <option value="out_of_stock">Out of Stock</option>
            </select>
          </div>
        </div>

        <div className="table-responsive">
          <table className="table table-modern">
            <thead>
              <tr>
                <th>Product Name</th>
                <th>SKU</th>
                <th>Barcode</th>
                <th>Price</th>
                <th>Current Stock</th>
                <th>Low Threshold</th>
                <th>Status</th>
                <th className="text-end">Stock In / Adjustment</th>
              </tr>
            </thead>
            <tbody>
              {inventory.map((item) => (
                <tr key={item._id}>
                  <td className="fw-bold text-dark">{item.name}</td>
                  <td><code>{item.sku}</code></td>
                  <td>{item.barcode || '—'}</td>
                  <td>₹{item.price?.toLocaleString()}</td>
                  <td>
                    <span className="fw-bold fs-6">{item.stock}</span> units
                  </td>
                  <td>{item.lowStockThreshold || 5} units</td>
                  <td>
                    {item.stockStatus === 'out_of_stock' ? (
                      <span className="badge bg-danger">Out of Stock</span>
                    ) : item.stockStatus === 'low_stock' ? (
                      <span className="badge bg-warning text-dark d-flex align-items-center gap-1" style={{ width: 'fit-content' }}>
                        <AlertTriangle size={12} /> Low Stock Alert
                      </span>
                    ) : (
                      <span className="badge bg-success">In Stock</span>
                    )}
                  </td>
                  <td className="text-end">
                    <button
                      className="btn btn-outline-success btn-sm me-1"
                      onClick={() => handleOpenAdjust(item, 'purchase_in')}
                      title="Stock In (Consignment Arrival)"
                    >
                      <Plus size={14} className="me-1" /> Stock In
                    </button>
                    <button
                      className="btn btn-light btn-sm border"
                      onClick={() => handleOpenAdjust(item, 'manual_adjustment')}
                      title="Audit Adjustment"
                    >
                      Adjust
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Recent Stock Movement Audit Trail */}
      <div className="card card-modern p-4">
        <h5 className="fw-bold mb-3 d-flex align-items-center gap-2">
          <History size={18} className="text-secondary" /> Stock Movement Audit Ledger
        </h5>

        <div className="table-responsive">
          <table className="table table-modern small">
            <thead>
              <tr>
                <th>Timestamp</th>
                <th>SKU</th>
                <th>Product</th>
                <th>Movement Type</th>
                <th>Quantity</th>
                <th>Prev & New Stock</th>
                <th>Reference ID</th>
                <th>Logged By</th>
              </tr>
            </thead>
            <tbody>
              {movements.map((m) => (
                <tr key={m._id}>
                  <td className="text-muted">{new Date(m.createdAt).toLocaleString()}</td>
                  <td><code>{m.sku}</code></td>
                  <td className="fw-semibold">{m.productName}</td>
                  <td>
                    <span className={`badge ${m.quantity > 0 ? 'bg-success' : 'bg-primary'}`}>
                      {m.movementType}
                    </span>
                  </td>
                  <td className={`fw-bold ${m.quantity > 0 ? 'text-success' : 'text-danger'}`}>
                    {m.quantity > 0 ? `+${m.quantity}` : m.quantity}
                  </td>
                  <td className="text-muted">
                    {m.previousStock} → <strong>{m.newStock}</strong>
                  </td>
                  <td>{m.referenceId || '—'}</td>
                  <td>{m.performedBy}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Stock Adjustment Modal */}
      {showAdjustModal && selectedProduct && (
        <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content rounded-4 p-4">
              <h5 className="fw-bold mb-1">Stock Adjustment & Purchase Intake</h5>
              <p className="text-muted small mb-3">
                Product: <strong>{selectedProduct.name}</strong> (SKU: {selectedProduct.sku})
              </p>

              <form onSubmit={handleSaveAdjustment}>
                <div className="mb-3">
                  <label className="form-label small fw-semibold">Intake Type</label>
                  <select
                    className="form-select form-select-sm"
                    value={adjustType}
                    onChange={(e) => setAdjustType(e.target.value)}
                  >
                    <option value="purchase_in">Purchase In (Supplier Delivery)</option>
                    <option value="manual_adjustment">Manual Audit Adjustment (+ / -)</option>
                    <option value="return_in">Customer Return Restock</option>
                    <option value="damaged">Damaged / Written Off (-)</option>
                  </select>
                </div>

                <div className="mb-3">
                  <label className="form-label small fw-semibold">
                    Quantity to Add/Deduct (Current: {selectedProduct.stock}) *
                  </label>
                  <input
                    type="number"
                    className="form-control form-control-sm"
                    placeholder="e.g. 20 or -5"
                    required
                    value={adjustQty}
                    onChange={(e) => setAdjustQty(e.target.value)}
                  />
                </div>

                <div className="mb-3">
                  <label className="form-label small fw-semibold">Notes / Invoice Ref</label>
                  <input
                    type="text"
                    className="form-control form-control-sm"
                    placeholder="e.g. Supplier PO #8892"
                    value={adjustNotes}
                    onChange={(e) => setAdjustNotes(e.target.value)}
                  />
                </div>

                <div className="d-flex justify-content-end gap-2">
                  <button type="button" className="btn btn-light btn-sm" onClick={() => setShowAdjustModal(false)}>
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-emerald btn-sm px-4">
                    Confirm Stock Update
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

export default PosInventory;

