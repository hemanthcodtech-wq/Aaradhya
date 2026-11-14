import React, { useState, useEffect } from 'react';
import {
  Layers,
  ArrowDownLeft,
  ArrowUpRight,
  AlertTriangle,
  CheckCircle2,
  Package,
  Plus,
  Search,
  Filter,
  RefreshCw,
  History,
  FileSpreadsheet,
} from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import axiosClient from '../../api/axiosClient';

const StoreInventory = () => {
  const store = useStore();
  const [inventory, setInventory] = useState([]);
  const [movements, setMovements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterTab, setFilterTab] = useState('all'); // all, low_stock, out_of_stock
  const [activeView, setActiveView] = useState('stock'); // 'stock' or 'movements'

  // Adjustment Modal
  const [isAdjustModalOpen, setIsAdjustModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [adjustType, setAdjustType] = useState('stock_in'); // stock_in, stock_out, manual_audit
  const [adjustQuantity, setAdjustQuantity] = useState('');
  const [adjustReason, setAdjustReason] = useState('');
  const [adjustReference, setAdjustReference] = useState('');
  const [adjusting, setAdjusting] = useState(false);

  useEffect(() => {
    fetchInventoryData();
  }, [store.activeStore]);

  const fetchInventoryData = async () => {
    setLoading(true);
    try {
      const res = await axiosClient.get(`/stores/${store.activeStore}/inventory`);
      if (res.data?.success) {
        setInventory(res.data.data?.items || []);
        setMovements(res.data.data?.movements || []);
      }
    } catch {
      // Fallback inventory
      setInventory(getFallbackInventory());
      setMovements(getFallbackMovements());
    } finally {
      setLoading(false);
    }
  };

  const getFallbackInventory = () => {
    return store.isSilks
      ? [
          {
            _id: 'inv_as_01',
            productId: 'AS-000001',
            sku: 'AS-KANJ-001',
            name: 'Pure Kanjeevaram Bridal Silk Saree (Crimson Red)',
            stock: 14,
            lowStockThreshold: 5,
            price: 19999,
            costPrice: 13500,
            status: 'in_stock',
            barcode: '890123450001',
          },
          {
            _id: 'inv_as_02',
            productId: 'AS-000108',
            sku: 'AS-BANA-108',
            name: 'Banarasi Katan Silk Royal Saree with Antique Zari',
            stock: 3,
            lowStockThreshold: 5,
            price: 24748,
            costPrice: 17200,
            status: 'low_stock',
            barcode: '890123450108',
          },
          {
            _id: 'inv_as_03',
            productId: 'AS-000142',
            sku: 'AS-CHAN-142',
            name: 'Chanderi Silk Gold Floral Butta Saree',
            stock: 22,
            lowStockThreshold: 5,
            price: 8800,
            costPrice: 5800,
            status: 'in_stock',
            barcode: '890123450142',
          },
          {
            _id: 'inv_as_04',
            productId: 'AS-000199',
            sku: 'AS-TUSS-199',
            name: 'Tussar Handwoven Temple Border Saree',
            stock: 2,
            lowStockThreshold: 5,
            price: 12900,
            costPrice: 8500,
            status: 'low_stock',
            barcode: '890123450199',
          },
          {
            _id: 'inv_as_05',
            productId: 'AS-000215',
            sku: 'AS-MYSO-215',
            name: 'Mysore Pure Silk Floral Print Saree',
            stock: 0,
            lowStockThreshold: 5,
            price: 9500,
            costPrice: 6200,
            status: 'out_of_stock',
            barcode: '890123450215',
          },
        ]
      : [
          {
            _id: 'inv_af_01',
            productId: 'AF-000001',
            sku: 'AF-MUL-001',
            name: 'Pure Mulmul 60s Organic Cotton Running Yardage',
            stock: 240,
            lowStockThreshold: 20,
            price: 550,
            costPrice: 320,
            status: 'in_stock',
            barcode: '890123460001',
          },
          {
            _id: 'inv_af_02',
            productId: 'AF-000045',
            sku: 'AF-AJR-045',
            name: 'Hand-Block Natural Indigo Ajrakh Modal Silk Fabric',
            stock: 65,
            lowStockThreshold: 15,
            price: 1150,
            costPrice: 720,
            status: 'in_stock',
            barcode: '890123460045',
          },
          {
            _id: 'inv_af_03',
            productId: 'AF-000088',
            sku: 'AF-LIN-088',
            name: 'European Organic Linen Slub Unstitched Fabric',
            stock: 9,
            lowStockThreshold: 15,
            price: 1200,
            costPrice: 790,
            status: 'low_stock',
            barcode: '890123460088',
          },
          {
            _id: 'inv_af_04',
            productId: 'AF-000112',
            sku: 'AF-ORG-112',
            name: 'Embroidered Net Border Organza Yardage',
            stock: 0,
            lowStockThreshold: 10,
            price: 1600,
            costPrice: 1050,
            status: 'out_of_stock',
            barcode: '890123460112',
          },
        ];
  };

  const getFallbackMovements = () => [
    {
      _id: 'mov_01',
      date: '14 Nov 2026, 14:22',
      sku: store.isSilks ? 'AS-KANJ-001' : 'AF-MUL-001',
      productName: store.isSilks ? 'Kanjeevaram Bridal Silk' : 'Pure Mulmul Cotton',
      type: 'pos_sale',
      delta: -1,
      resultingStock: store.isSilks ? 14 : 240,
      reference: `${store.storeCode}-POS-1044`,
      staff: 'Cashier Terminal 1',
    },
    {
      _id: 'mov_02',
      date: '14 Nov 2026, 11:05',
      sku: store.isSilks ? 'AS-BANA-108' : 'AF-AJR-045',
      productName: store.isSilks ? 'Banarasi Katan Silk' : 'Ajrakh Modal Silk',
      type: 'online_order',
      delta: -1,
      resultingStock: store.isSilks ? 3 : 65,
      reference: `${store.storeCode}-ORD-9921`,
      staff: 'Store Web Engine',
    },
    {
      _id: 'mov_03',
      date: '13 Nov 2026, 16:45',
      sku: store.isSilks ? 'AS-CHAN-142' : 'AF-LIN-088',
      productName: store.isSilks ? 'Chanderi Silk Gold Floral' : 'Linen Slub Fabric',
      type: 'stock_in',
      delta: 10,
      resultingStock: store.isSilks ? 22 : 9,
      reference: 'PO-WEAVER-782',
      staff: 'Store Manager',
    },
  ];

  const handleAdjustSubmit = async (e) => {
    e.preventDefault();
    setAdjusting(true);
    const qty = Number(adjustQuantity);
    const finalDelta = adjustType === 'stock_out' ? -Math.abs(qty) : Math.abs(qty);

    try {
      const res = await axiosClient.post(`/stores/${store.activeStore}/inventory/adjust`, {
        sku: selectedItem.sku,
        productId: selectedItem.productId,
        type: adjustType,
        quantity: finalDelta,
        reference: adjustReference || 'Manual Adjustment',
        reason: adjustReason,
      });

      if (res.data?.success) {
        fetchInventoryData();
        setIsAdjustModalOpen(false);
      }
    } catch {
      // Optimistic update
      setInventory((prev) =>
        prev.map((item) => {
          if (item.sku === selectedItem.sku) {
            const newStock = Math.max(0, item.stock + finalDelta);
            return {
              ...item,
              stock: newStock,
              status: newStock === 0 ? 'out_of_stock' : newStock <= item.lowStockThreshold ? 'low_stock' : 'in_stock',
            };
          }
          return item;
        })
      );
      setMovements([
        {
          _id: `mov_${Date.now()}`,
          date: 'Just now',
          sku: selectedItem.sku,
          productName: selectedItem.name,
          type: adjustType,
          delta: finalDelta,
          resultingStock: Math.max(0, selectedItem.stock + finalDelta),
          reference: adjustReference || 'Manual Adjustment',
          staff: 'Store Admin',
        },
        ...movements,
      ]);
      setIsAdjustModalOpen(false);
    } finally {
      setAdjusting(false);
    }
  };

  // Filter items
  const filteredItems = inventory.filter((item) => {
    const matchesSearch =
      (item.name || '').toLowerCase().includes(search.toLowerCase()) ||
      (item.sku || '').toLowerCase().includes(search.toLowerCase()) ||
      (item.productId || '').toLowerCase().includes(search.toLowerCase());

    const isLow = item.stock > 0 && item.stock <= (item.lowStockThreshold || 5);
    const isOut = item.stock === 0;

    if (filterTab === 'low_stock') return matchesSearch && isLow;
    if (filterTab === 'out_of_stock') return matchesSearch && isOut;
    return matchesSearch;
  });

  const totalSKUs = inventory.length;
  const inStockCount = inventory.filter((i) => i.stock > (i.lowStockThreshold || 5)).length;
  const lowStockCount = inventory.filter((i) => i.stock > 0 && i.stock <= (i.lowStockThreshold || 5)).length;
  const outOfStockCount = inventory.filter((i) => i.stock === 0).length;
  const totalStockValuation = inventory.reduce((acc, curr) => acc + (curr.stock || 0) * (curr.costPrice || curr.price || 0), 0);

  return (
    <div className="store-inventory-page pb-5">
      {/* Header */}
      <div className="d-flex flex-wrap align-items-center justify-content-between gap-3 mb-4">
        <div>
          <div className="d-flex align-items-center gap-2 mb-1">
            <span
              className="badge rounded-pill fw-bold text-uppercase px-2.5 py-1"
              style={{ backgroundColor: store.badgeBg, color: store.badgeText, border: `1px solid ${store.badgeBorder}`, fontSize: '0.72rem' }}
            >
              Store {store.storeCode} Inventory Core
            </span>
            <span className="text-muted small">• Unified Online & POS Ledger</span>
          </div>
          <h4 className="fw-bold text-dark mb-0">{store.storeName} Stock Management</h4>
        </div>

        <div className="d-flex align-items-center gap-2">
          <div className="btn-group btn-group-sm bg-white border rounded-pill p-1 shadow-sm">
            <button
              onClick={() => setActiveView('stock')}
              className={`btn btn-sm rounded-pill px-3 py-1 fw-semibold ${
                activeView === 'stock' ? 'text-white' : 'text-muted'
              }`}
              style={{
                backgroundColor: activeView === 'stock' ? store.primaryColor : 'transparent',
                border: 'none',
                fontSize: '0.74rem',
              }}
            >
              Stock Items ({inventory.length})
            </button>
            <button
              onClick={() => setActiveView('movements')}
              className={`btn btn-sm rounded-pill px-3 py-1 fw-semibold ${
                activeView === 'movements' ? 'text-white' : 'text-muted'
              }`}
              style={{
                backgroundColor: activeView === 'movements' ? store.primaryColor : 'transparent',
                border: 'none',
                fontSize: '0.74rem',
              }}
            >
              Movement Ledger
            </button>
          </div>
        </div>
      </div>

      {/* 4 Inventory Health KPI Cards */}
      <div className="row g-3 mb-4">
        <div className="col-6 col-md-3">
          <div className="card border-0 shadow-sm rounded-3 p-3 bg-white h-100">
            <span className="text-muted small fw-medium">Active SKUs</span>
            <div className="fs-4 fw-bold text-dark mt-1">{totalSKUs}</div>
            <span className="text-muted" style={{ fontSize: '0.72rem' }}>Catalog items</span>
          </div>
        </div>
        <div className="col-6 col-md-3">
          <div className="card border-0 shadow-sm rounded-3 p-3 bg-white h-100">
            <span className="text-muted small fw-medium">Healthy In-Stock</span>
            <div className="fs-4 fw-bold text-success mt-1">{inStockCount}</div>
            <span className="text-success small" style={{ fontSize: '0.72rem' }}>Ready for fulfillment</span>
          </div>
        </div>
        <div className="col-6 col-md-3">
          <div className="card border-0 shadow-sm rounded-3 p-3 bg-white h-100">
            <span className="text-muted small fw-medium">Low Stock Alerts</span>
            <div className="fs-4 fw-bold text-warning mt-1">{lowStockCount}</div>
            <span className="text-warning-emphasis small" style={{ fontSize: '0.72rem' }}>Needs weaver restock</span>
          </div>
        </div>
        <div className="col-6 col-md-3">
          <div className="card border-0 shadow-sm rounded-3 p-3 bg-white h-100">
            <span className="text-muted small fw-medium">Inventory Asset Value</span>
            <div className="fs-4 fw-bold text-dark mt-1">₹{Number(totalStockValuation).toLocaleString()}</div>
            <span className="text-muted small" style={{ fontSize: '0.72rem' }}>At procurement cost</span>
          </div>
        </div>
      </div>

      {activeView === 'stock' ? (
        <>
          {/* Filter Bar */}
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
                    placeholder="Search by Product Name, SKU, ID..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                </div>
              </div>

              <div className="col-12 col-md-6 d-flex justify-content-md-end gap-2">
                <button
                  onClick={() => setFilterTab('all')}
                  className={`btn btn-sm rounded-pill px-3 py-1 ${
                    filterTab === 'all' ? 'btn-dark' : 'btn-light border text-muted'
                  }`}
                  style={{ fontSize: '0.76rem' }}
                >
                  All Items
                </button>
                <button
                  onClick={() => setFilterTab('low_stock')}
                  className={`btn btn-sm rounded-pill px-3 py-1 ${
                    filterTab === 'low_stock' ? 'btn-warning text-dark fw-bold' : 'btn-light border text-muted'
                  }`}
                  style={{ fontSize: '0.76rem' }}
                >
                  Low Stock ({lowStockCount})
                </button>
                <button
                  onClick={() => setFilterTab('out_of_stock')}
                  className={`btn btn-sm rounded-pill px-3 py-1 ${
                    filterTab === 'out_of_stock' ? 'btn-danger text-white' : 'btn-light border text-muted'
                  }`}
                  style={{ fontSize: '0.76rem' }}
                >
                  Out of Stock ({outOfStockCount})
                </button>
              </div>
            </div>
          </div>

          {/* Stock Table */}
          <div className="card border-0 shadow-sm rounded-3 bg-white overflow-hidden">
            <div className="table-responsive">
              <table className="table table-hover align-middle mb-0" style={{ fontSize: '0.82rem' }}>
                <thead className="table-light">
                  <tr>
                    <th className="border-0 text-muted fw-semibold ps-3">Product ID / SKU</th>
                    <th className="border-0 text-muted fw-semibold">Item Name</th>
                    <th className="border-0 text-muted fw-semibold text-center">Available Stock</th>
                    <th className="border-0 text-muted fw-semibold text-center">Min Threshold</th>
                    <th className="border-0 text-muted fw-semibold text-end">Cost Valuation</th>
                    <th className="border-0 text-muted fw-semibold text-center">Health Status</th>
                    <th className="border-0 text-muted fw-semibold text-end pe-3">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredItems.map((item) => {
                    const isLow = item.stock > 0 && item.stock <= (item.lowStockThreshold || 5);
                    const isOut = item.stock === 0;

                    return (
                      <tr key={item.sku}>
                        <td className="ps-3">
                          <div className="fw-bold font-monospace text-dark" style={{ fontSize: '0.78rem' }}>
                            {item.productId}
                          </div>
                          <span className="badge bg-light text-muted border font-monospace" style={{ fontSize: '0.68rem' }}>
                            {item.sku}
                          </span>
                        </td>
                        <td>
                          <div className="fw-semibold text-dark text-truncate" style={{ maxWidth: '280px' }}>
                            {item.name}
                          </div>
                        </td>
                        <td className="text-center">
                          <span
                            className={`fs-6 fw-bold ${
                              isOut ? 'text-danger' : isLow ? 'text-warning-emphasis' : 'text-dark'
                            }`}
                          >
                            {item.stock}
                          </span>{' '}
                          <span className="text-muted small">{store.isSilks ? 'pcs' : 'm'}</span>
                        </td>
                        <td className="text-center text-muted font-monospace">{item.lowStockThreshold || 5}</td>
                        <td className="text-end fw-semibold text-dark">
                          ₹{Number((item.stock || 0) * (item.costPrice || item.price || 0)).toLocaleString()}
                        </td>
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
                            {isOut ? 'Depleted' : isLow ? 'Low Stock' : 'Optimal'}
                          </span>
                        </td>
                        <td className="text-end pe-3">
                          <button
                            onClick={() => {
                              setSelectedItem(item);
                              setAdjustType('stock_in');
                              setAdjustQuantity('');
                              setAdjustReason('');
                              setAdjustReference('');
                              setIsAdjustModalOpen(true);
                            }}
                            className="btn btn-sm btn-light border rounded-pill px-2.5 py-1 small fw-semibold text-dark"
                            style={{ fontSize: '0.74rem' }}
                          >
                            Adjust Stock &rarr;
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </>
      ) : (
        /* Stock Movement History Ledger */
        <div className="card border-0 shadow-sm rounded-3 bg-white overflow-hidden">
          <div className="p-3 border-bottom d-flex align-items-center justify-content-between">
            <div>
              <h6 className="fw-bold text-dark mb-0">Stock Movement Audit Trail</h6>
              <span className="text-muted small" style={{ fontSize: '0.72rem' }}>
                Every sale, restock, damage, and manual audit recorded with timestamp
              </span>
            </div>
            <button onClick={fetchInventoryData} className="btn btn-sm btn-light border text-muted">
              <RefreshCw size={14} />
            </button>
          </div>

          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0" style={{ fontSize: '0.82rem' }}>
              <thead className="table-light">
                <tr>
                  <th className="border-0 text-muted fw-semibold ps-3">Timestamp</th>
                  <th className="border-0 text-muted fw-semibold">SKU / Product</th>
                  <th className="border-0 text-muted fw-semibold text-center">Movement Type</th>
                  <th className="border-0 text-muted fw-semibold text-center">Qty Delta</th>
                  <th className="border-0 text-muted fw-semibold text-center">Resulting Stock</th>
                  <th className="border-0 text-muted fw-semibold">Reference</th>
                  <th className="border-0 text-muted fw-semibold pe-3 text-end">Staff / Channel</th>
                </tr>
              </thead>
              <tbody>
                {movements.map((mov) => {
                  const isPositive = mov.delta > 0;
                  return (
                    <tr key={mov._id}>
                      <td className="ps-3 text-muted font-monospace" style={{ fontSize: '0.74rem' }}>
                        {mov.date}
                      </td>
                      <td>
                        <div className="fw-semibold text-dark text-truncate" style={{ maxWidth: '220px' }}>
                          {mov.productName}
                        </div>
                        <span className="badge bg-light text-muted border font-monospace" style={{ fontSize: '0.68rem' }}>
                          {mov.sku}
                        </span>
                      </td>
                      <td className="text-center">
                        <span
                          className={`badge rounded-pill text-capitalize px-2 py-1 ${
                            mov.type === 'pos_sale'
                              ? 'bg-info-subtle text-info border'
                              : mov.type === 'online_order'
                              ? 'bg-primary-subtle text-primary border'
                              : mov.type === 'stock_in'
                              ? 'bg-success-subtle text-success border'
                              : 'bg-danger-subtle text-danger border'
                          }`}
                          style={{ fontSize: '0.7rem' }}
                        >
                          {mov.type.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="text-center font-monospace fw-bold">
                        <span className={isPositive ? 'text-success' : 'text-danger'}>
                          {isPositive ? `+${mov.delta}` : mov.delta}
                        </span>
                      </td>
                      <td className="text-center font-monospace fw-semibold text-dark">{mov.resultingStock}</td>
                      <td className="font-monospace text-muted small">{mov.reference}</td>
                      <td className="text-end pe-3 text-muted small">{mov.staff}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Stock Adjustment Modal */}
      {isAdjustModalOpen && selectedItem && (
        <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1050 }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-0 shadow-lg rounded-3">
              <div className="modal-header border-0 pb-0 pt-3 px-4">
                <div>
                  <h5 className="modal-title fw-bold text-dark">Adjust Stock Level</h5>
                  <span className="text-muted small">
                    {selectedItem.productId} • {selectedItem.name}
                  </span>
                </div>
                <button type="button" className="btn-close" onClick={() => setIsAdjustModalOpen(false)} />
              </div>

              <form onSubmit={handleAdjustSubmit}>
                <div className="modal-body px-4 py-3">
                  <div className="p-3 rounded-2 bg-light mb-3 d-flex align-items-center justify-content-between">
                    <span className="text-muted small">Current Available Stock:</span>
                    <span className="fs-5 fw-bold text-dark">
                      {selectedItem.stock} {store.isSilks ? 'pcs' : 'meters'}
                    </span>
                  </div>

                  <div className="mb-3">
                    <label className="form-label small fw-semibold text-dark">Adjustment Action *</label>
                    <select
                      className="form-select form-select-sm"
                      value={adjustType}
                      onChange={(e) => setAdjustType(e.target.value)}
                    >
                      <option value="stock_in">Stock In (Procurement / Weaver Restock)</option>
                      <option value="stock_out">Stock Out (Damaged / Return to Weaver / Shrinkage)</option>
                      <option value="manual_audit">Manual Physical Audit Count</option>
                    </select>
                  </div>

                  <div className="mb-3">
                    <label className="form-label small fw-semibold text-dark">Quantity *</label>
                    <input
                      type="number"
                      required
                      min="1"
                      className="form-control form-control-sm"
                      placeholder="e.g. 10"
                      value={adjustQuantity}
                      onChange={(e) => setAdjustQuantity(e.target.value)}
                    />
                  </div>

                  <div className="mb-3">
                    <label className="form-label small fw-semibold text-dark">Reference / Invoice #</label>
                    <input
                      type="text"
                      className="form-control form-control-sm"
                      placeholder="e.g. WEAVER-INV-8492"
                      value={adjustReference}
                      onChange={(e) => setAdjustReference(e.target.value)}
                    />
                  </div>

                  <div className="mb-3">
                    <label className="form-label small fw-semibold text-dark">Reason / Remarks</label>
                    <textarea
                      rows="2"
                      className="form-control form-control-sm"
                      placeholder="Reason for adjustment..."
                      value={adjustReason}
                      onChange={(e) => setAdjustReason(e.target.value)}
                    />
                  </div>
                </div>

                <div className="modal-footer border-0 pt-0 px-4 pb-3">
                  <button type="button" className="btn btn-sm btn-light border px-3" onClick={() => setIsAdjustModalOpen(false)}>
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={adjusting}
                    className="btn btn-sm text-white px-4 fw-semibold shadow-sm"
                    style={{ backgroundColor: store.primaryColor }}
                  >
                    {adjusting ? 'Saving...' : 'Apply Adjustment'}
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

export default StoreInventory;
