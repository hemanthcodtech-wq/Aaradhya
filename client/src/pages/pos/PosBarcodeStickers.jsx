import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Barcode, Printer, Tag, Filter, CheckCircle2, Store, RefreshCw } from 'lucide-react';
import { FaGem, FaScroll } from 'react-icons/fa6';
import AnimatedFaIcon from '../../components/common/AnimatedFaIcon';
import axiosClient from '../../api/axiosClient';

const PosBarcodeStickers = () => {
  const [searchParams] = useSearchParams();
  const initialStore = (searchParams.get('store') || 'ALL').toUpperCase();

  const [products, setProducts] = useState([]);
  const [storeFilter, setStoreFilter] = useState(initialStore);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [stickerCopies, setStickerCopies] = useState(6);
  const [stickersList, setStickersList] = useState([]);
  const [sheetLayout, setSheetLayout] = useState('thermal'); // 'thermal' (50x35mm) | 'a4' (24-up grid)
  const [loading, setLoading] = useState(true);

  // Fetch products
  useEffect(() => {
    const fetchProds = async () => {
      setLoading(true);
      try {
        const res = await axiosClient.get('/pos/products');
        if (res.success && res.data.length > 0) {
          setProducts(res.data);
          const initial = res.data[0];
          setSelectedProduct(initial);
          setSelectedVariant({
            size: 'M',
            color: 'Classic',
            barcode: initial.barcode || `${initial.productId || 'AS-000001'}-STD-M`,
            sku: initial.sku || `${initial.productId || 'AS-000001'}-M`,
          });
          generateStickerBatch(initial, 6, {
            size: 'M',
            color: 'Classic',
            barcode: initial.barcode || `${initial.productId || 'AS-000001'}-STD-M`,
            sku: initial.sku || `${initial.productId || 'AS-000001'}-M`,
          });
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchProds();
  }, []);

  const filteredProducts = products.filter((p) => {
    if (storeFilter === 'AS') return (p.storeCode || '').toUpperCase() === 'AS';
    if (storeFilter === 'AF') return (p.storeCode || '').toUpperCase() === 'AF';
    return true;
  });

  const generateStickerBatch = (prod, count, variant) => {
    const batch = [];
    const isSilks = (prod.storeCode || 'AS').toUpperCase() === 'AS';
    const storeName = isSilks ? 'Aaradhya Silks' : 'Aaradhya Fabrics';
    const prodId = prod.productId || (isSilks ? 'AS-000001' : 'AF-000001');
    const bcode = variant?.barcode || prod.barcode || `${prodId}-GRN-M`;
    const skuCode = variant?.sku || prod.sku;

    for (let i = 0; i < count; i++) {
      batch.push({
        id: `${prod._id}_${i}_${Date.now()}`,
        name: prod.name,
        productId: prodId,
        storeCode: prod.storeCode || 'AS',
        storeName,
        variantText: `${variant?.color || 'Emerald Green'} / ${variant?.size || 'M'}`,
        sku: skuCode,
        barcode: bcode,
        price: prod.price,
        mrp: prod.mrp || Math.round(prod.price * 1.25),
      });
    }
    setStickersList(batch);
  };

  const handleProductSelect = (pId) => {
    const found = products.find((p) => p._id === pId);
    if (found) {
      setSelectedProduct(found);
      const isSilks = (found.storeCode || 'AS').toUpperCase() === 'AS';
      const variant = {
        size: 'M',
        color: isSilks ? 'Silk Gold' : 'Pure Cotton',
        barcode: found.barcode || `${found.productId || 'AS-000001'}-GRN-M`,
        sku: found.sku,
      };
      setSelectedVariant(variant);
      generateStickerBatch(found, stickerCopies, variant);
    }
  };

  const handleCopiesChange = (val) => {
    const num = Math.max(1, Math.min(100, Number(val) || 1));
    setStickerCopies(num);
    if (selectedProduct) {
      generateStickerBatch(selectedProduct, num, selectedVariant);
    }
  };

  return (
    <div className="p-3 p-md-4">
      {/* Header */}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-4">
        <div>
          <div className="d-flex align-items-center gap-2 mb-1">
            <h3 className="fw-bolder mb-0 text-dark">Barcode & Label Management</h3>
            <span className="badge badge-silks">Code 128 Format</span>
          </div>
          <p className="text-muted small mb-0">
            Generate store-specific product barcodes (AS-000001+ / AF-000001+) for thermal sticker printers and A4 adhesive sheets.
          </p>
        </div>

        <div className="d-flex align-items-center gap-2 flex-wrap">
          {/* Format Selector */}
          <div className="btn-group btn-group-sm bg-white border p-1 rounded-pill">
            <button
              className={`btn btn-sm rounded-pill px-3 ${sheetLayout === 'thermal' ? 'btn-dark text-white' : 'btn-light text-muted'}`}
              onClick={() => setSheetLayout('thermal')}
            >
              Thermal Roll (50×35mm)
            </button>
            <button
              className={`btn btn-sm rounded-pill px-3 ${sheetLayout === 'a4' ? 'btn-dark text-white' : 'btn-light text-muted'}`}
              onClick={() => setSheetLayout('a4')}
            >
              A4 Sheet (24 Stickers)
            </button>
          </div>

          <button
            className="btn btn-primary btn-sm rounded-pill px-4 py-2 d-flex align-items-center gap-2 shadow-sm text-white"
            style={{ backgroundColor: '#E90064', borderColor: '#E90064' }}
            onClick={() => window.print()}
          >
            <Printer size={16} /> Print {stickersList.length} Stickers
          </button>
        </div>
      </div>

      <div className="row g-4">
        {/* LEFT CONTROLS: Store Filter & Product Selector */}
        <div className="col-lg-4">
          <div className="card card-modern p-3 p-md-4 mb-4 shadow-sm border">
            <h5 className="fw-bold mb-3 border-bottom pb-2 text-dark">Sticker Settings</h5>

            {/* Store Toggle */}
            <div className="mb-3">
              <label className="form-label small fw-semibold text-muted">Filter by Store</label>
              <div className="btn-group w-100 btn-group-sm">
                <button
                  type="button"
                  className={`btn ${storeFilter === 'ALL' ? 'btn-dark' : 'btn-outline-secondary'}`}
                  onClick={() => setStoreFilter('ALL')}
                >
                  All Stores
                </button>
                <button
                  type="button"
                  className={`btn d-inline-flex align-items-center justify-content-center gap-1.5 ${storeFilter === 'AS' ? 'btn-primary text-white' : 'btn-outline-secondary'}`}
                  style={storeFilter === 'AS' ? { backgroundColor: '#E90064', borderColor: '#E90064' } : {}}
                  onClick={() => setStoreFilter('AS')}
                >
                  <AnimatedFaIcon icon={FaGem} size={11} color={storeFilter === 'AS' ? '#FFFFFF' : '#E90064'} animation="pulse" />
                  <span>Aaradhya Silks (AS)</span>
                </button>
                <button
                  type="button"
                  className={`btn d-inline-flex align-items-center justify-content-center gap-1.5 ${storeFilter === 'AF' ? 'btn-primary text-white' : 'btn-outline-secondary'}`}
                  style={storeFilter === 'AF' ? { backgroundColor: '#087CE5', borderColor: '#087CE5' } : {}}
                  onClick={() => setStoreFilter('AF')}
                >
                  <AnimatedFaIcon icon={FaScroll} size={11} color={storeFilter === 'AF' ? '#FFFFFF' : '#087CE5'} animation="float" />
                  <span>Aaradhya Fabrics (AF)</span>
                </button>
              </div>
            </div>

            {/* Merchandise Product */}
            <div className="mb-3">
              <label className="form-label small fw-semibold text-muted">Select Merchandise Item</label>
              <select
                className="form-select form-select-sm"
                value={selectedProduct?._id || ''}
                onChange={(e) => handleProductSelect(e.target.value)}
              >
                {filteredProducts.map((p) => (
                  <option key={p._id} value={p._id}>
                    [{p.storeCode || 'AS'}] {p.productId || 'AS-000001'} — {p.name} (₹{p.price})
                  </option>
                ))}
              </select>
            </div>

            {/* Size Variant */}
            <div className="mb-3">
              <label className="form-label small fw-semibold text-muted">Variant (Size / Colour)</label>
              <div className="d-flex gap-1">
                {['XS', 'S', 'M', 'L', 'XL', 'Free Size'].map((sz) => (
                  <button
                    key={sz}
                    type="button"
                    className={`btn btn-sm flex-fill ${selectedVariant?.size === sz ? 'btn-dark' : 'btn-outline-secondary'}`}
                    style={{ fontSize: '0.72rem', padding: '0.2rem 0.4rem' }}
                    onClick={() => {
                      const updated = {
                        ...selectedVariant,
                        size: sz,
                        barcode: `${selectedProduct?.productId || 'AS-000001'}-GRN-${sz}`,
                        sku: `${selectedProduct?.sku || 'SKU'}-${sz}`,
                      };
                      setSelectedVariant(updated);
                      generateStickerBatch(selectedProduct, stickerCopies, updated);
                    }}
                  >
                    {sz}
                  </button>
                ))}
              </div>
            </div>

            {/* Number of copies */}
            <div className="mb-3">
              <label className="form-label small fw-semibold text-muted">Number of Copies to Print</label>
              <div className="input-group input-group-sm">
                <input
                  type="number"
                  className="form-control"
                  min="1"
                  max="100"
                  value={stickerCopies}
                  onChange={(e) => handleCopiesChange(e.target.value)}
                />
                <button
                  className="btn btn-outline-secondary"
                  type="button"
                  onClick={() => handleCopiesChange(1)}
                >
                  Single (1)
                </button>
                <button
                  className="btn btn-outline-secondary"
                  type="button"
                  onClick={() => handleCopiesChange(12)}
                >
                  12
                </button>
                <button
                  className="btn btn-outline-secondary"
                  type="button"
                  onClick={() => handleCopiesChange(24)}
                >
                  Sheet (24)
                </button>
              </div>
              <small className="text-muted d-block mt-1" style={{ fontSize: '0.7rem' }}>
                Compatible with Zebra/TSC/TVS thermal label printers and standard A4 adhesive sheets.
              </small>
            </div>

            {/* Selected Spec Overview */}
            <div className="p-3 bg-light rounded-3 border small">
              <div className="fw-bold mb-2 text-dark d-flex align-items-center gap-1">
                <Tag size={14} className="text-primary" /> Single Sticker Data Specification:
              </div>
              <div className="d-flex justify-content-between py-1 border-bottom">
                <span className="text-muted">Brand / Store:</span>
                <strong className={selectedProduct?.storeCode === 'AF' ? 'text-primary' : 'text-danger'}>
                  {selectedProduct?.storeCode === 'AF' ? 'Aaradhya Fabrics' : 'Aaradhya Silks'}
                </strong>
              </div>
              <div className="d-flex justify-content-between py-1 border-bottom">
                <span className="text-muted">Product ID:</span>
                <span className="fw-mono fw-bold">{selectedProduct?.productId || 'AS-000001'}</span>
              </div>
              <div className="d-flex justify-content-between py-1 border-bottom">
                <span className="text-muted">Variant:</span>
                <span>{selectedVariant?.size || 'M'}</span>
              </div>
              <div className="d-flex justify-content-between py-1 border-bottom">
                <span className="text-muted">Code 128:</span>
                <span className="font-monospace fw-semibold">{selectedVariant?.barcode || selectedProduct?.barcode}</span>
              </div>
              <div className="d-flex justify-content-between py-1">
                <span className="text-muted">MRP / Selling:</span>
                <strong className="text-success">₹{selectedProduct?.price?.toLocaleString()}</strong>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT: Live Sticker Grid / Print Preview */}
        <div className="col-lg-8">
          <div className="card card-modern p-3 p-md-4 shadow-sm border">
            <div className="d-flex justify-content-between align-items-center mb-3 border-bottom pb-2">
              <div>
                <h5 className="fw-bold mb-0 text-dark">Sticker Print Preview</h5>
                <small className="text-muted">
                  Layout: {sheetLayout === 'thermal' ? '50×35mm Thermal Roll' : 'A4 Grid (3 Columns × 8 Rows)'}
                </small>
              </div>
              <span className="badge bg-light text-dark border px-3 py-1.5 fw-bold">
                {stickersList.length} Stickers Ready
              </span>
            </div>

            {/* Sticker Grid container with @media print styling */}
            <div
              className={`row g-2 ${sheetLayout === 'thermal' ? 'row-cols-1 row-cols-sm-2 row-cols-md-2' : 'row-cols-1 row-cols-sm-2 row-cols-md-3'}`}
              id="printable-sticker-sheet"
            >
              {stickersList.map((stk, i) => {
                const isSilks = stk.storeCode === 'AS';
                return (
                  <div key={stk.id} className="col">
                    <div
                      className="p-2.5 bg-white text-center rounded-2 shadow-sm d-flex flex-column justify-content-between"
                      style={{
                        minHeight: '150px',
                        border: '1px dashed #d1d5db',
                        boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
                        fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif",
                      }}
                    >
                      {/* Top Header: Logo + Brand + Store Name */}
                      <div className="d-flex align-items-center justify-content-between border-bottom pb-1 mb-1">
                        <div className="d-flex align-items-center gap-1.5">
                          <img
                            src="/logo.jpeg"
                            alt="Aaradhya"
                            style={{ width: '18px', height: '18px', objectFit: 'contain', borderRadius: '3px' }}
                          />
                          <span
                            className="fw-bolder"
                            style={{ fontSize: '0.72rem', letterSpacing: '-0.2px', color: '#17233B' }}
                          >
                            AARADHYA
                          </span>
                        </div>
                        <span
                          className={`badge ${isSilks ? 'badge-silks' : 'badge-fabrics'}`}
                          style={{ fontSize: '0.62rem', padding: '0.15rem 0.45rem' }}
                        >
                          {stk.storeName}
                        </span>
                      </div>

                      {/* Product Name & ID */}
                      <div className="text-start mb-1">
                        <div
                          className="fw-bold text-dark text-truncate"
                          style={{ fontSize: '0.76rem', lineHeight: '1.2' }}
                          title={stk.name}
                        >
                          {stk.name}
                        </div>
                        <div className="d-flex justify-content-between text-muted" style={{ fontSize: '0.65rem' }}>
                          <span>ID: <strong>{stk.productId}</strong></span>
                          <span>Var: <strong>{stk.variantText}</strong></span>
                        </div>
                      </div>

                      {/* Code 128 Barcode Simulation */}
                      <div className="my-1 d-flex flex-column align-items-center py-1 bg-light rounded-1">
                        <svg width="150" height="28" viewBox="0 0 150 28">
                          <rect x="0" y="0" width="150" height="28" fill="transparent" />
                          {[4, 7, 10, 14, 18, 21, 25, 29, 32, 36, 41, 45, 48, 52, 57, 61, 65, 70, 74, 78, 83, 87, 91, 96, 100, 104, 109, 113, 117, 122, 126, 131, 136, 142].map(
                            (x, idx) => (
                              <rect
                                key={idx}
                                x={x}
                                y="1"
                                width={idx % 4 === 0 ? '3' : idx % 2 === 0 ? '2' : '1.2'}
                                height="22"
                                fill="#000000"
                              />
                            )
                          )}
                        </svg>
                        <div
                          className="font-monospace fw-bold text-dark mt-0.5"
                          style={{ fontSize: '0.66rem', letterSpacing: '1px' }}
                        >
                          {stk.barcode}
                        </div>
                      </div>

                      {/* Bottom Price & SKU */}
                      <div
                        className="d-flex justify-content-between align-items-center border-top pt-1 mt-1"
                        style={{ fontSize: '0.68rem' }}
                      >
                        <span className="text-muted text-truncate" style={{ maxWidth: '85px' }} title={stk.sku}>
                          {stk.sku}
                        </span>
                        <div>
                          <span className="text-decoration-line-through text-muted me-1" style={{ fontSize: '0.62rem' }}>
                            ₹{stk.mrp}
                          </span>
                          <strong className="fs-6 fw-bolder text-success">₹{stk.price?.toLocaleString()}</strong>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Embedded Print CSS */}
      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          #printable-sticker-sheet, #printable-sticker-sheet * {
            visibility: visible;
          }
          #printable-sticker-sheet {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
          }
        }
      `}</style>
    </div>
  );
};

export default PosBarcodeStickers;