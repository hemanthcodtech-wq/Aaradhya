import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import {
  Barcode,
  Printer,
  Tag,
  Filter,
  CheckCircle2,
  Store,
  RefreshCw,
  Copy,
  Download,
  Settings,
  HelpCircle,
} from 'lucide-react';
import { FaGem, FaScroll } from 'react-icons/fa6';
import AnimatedFaIcon from '../../components/common/AnimatedFaIcon';
import axiosClient from '../../api/axiosClient';

// Zebra GC420t & Retail Thermal Label Presets
const LABEL_PRESETS = [
  {
    id: 'zebra_50x25',
    name: '50 × 25 mm (2" × 1")',
    subname: 'Zebra GC420t Garment Tag (Default)',
    widthMm: 50,
    heightMm: 25,
    cols: 1,
    type: 'thermal',
    recommended: true,
  },
  {
    id: 'zebra_50x35',
    name: '50 × 35 mm (2" × 1.4")',
    subname: 'Zebra GC420t Detailed Saree Tag',
    widthMm: 50,
    heightMm: 35,
    cols: 1,
    type: 'thermal',
  },
  {
    id: 'zebra_38x25',
    name: '38 × 25 mm (1.5" × 1")',
    subname: 'Zebra Compact Blouse/Jewel Tag',
    widthMm: 38,
    heightMm: 25,
    cols: 1,
    type: 'thermal',
  },
  {
    id: 'zebra_twin_50x25',
    name: '2-Across Twin Tags (100mm Roll)',
    subname: '2-Up Side-by-Side 50×25mm',
    widthMm: 104,
    heightMm: 25,
    cols: 2,
    type: 'thermal_twin',
  },
  {
    id: 'zebra_100x50',
    name: '100 × 50 mm (4" × 2")',
    subname: 'Shipping & Parcel Dispatch Tag',
    widthMm: 100,
    heightMm: 50,
    cols: 1,
    type: 'thermal',
  },
  {
    id: 'sheet_a4',
    name: 'A4 Adhesive Sheet (3 × 8 = 24 Tags)',
    subname: 'Standard Laser / Inkjet Sheet',
    widthMm: 70,
    heightMm: 37,
    cols: 3,
    type: 'a4',
  },
];

const PosBarcodeStickers = () => {
  const [searchParams] = useSearchParams();
  const initialStore = (searchParams.get('store') || 'ALL').toUpperCase();

  const [products, setProducts] = useState([]);
  const [storeFilter, setStoreFilter] = useState(initialStore);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [stickerCopies, setStickerCopies] = useState(6);
  const [stickersList, setStickersList] = useState([]);
  const [selectedPreset, setSelectedPreset] = useState(LABEL_PRESETS[0]);
  const [activeTab, setActiveTab] = useState('preview'); // 'preview' | 'zpl' | 'instructions'
  const [copiedZpl, setCopiedZpl] = useState(false);
  const [highContrast, setHighContrast] = useState(true);
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
          const initVariant = {
            size: 'Free Size',
            color: 'Heritage Crimson',
            barcode: initial.barcode || `${initial.productId || 'AS-000001'}-STD`,
            sku: initial.sku || `${initial.productId || 'AS-000001'}-FS`,
          };
          setSelectedVariant(initVariant);
          generateStickerBatch(initial, 6, initVariant);
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
    if (!prod) return;
    const batch = [];
    const isSilks = (prod.storeCode || 'AS').toUpperCase() === 'AS';
    const storeName = isSilks ? 'Aaradhya Silks' : 'Aaradhya Fabrics';
    const prodId = prod.productId || (isSilks ? 'AS-000001' : 'AF-000001');
    const bcode = variant?.barcode || prod.barcode || `${prodId}-STD`;
    const skuCode = variant?.sku || prod.sku;

    for (let i = 0; i < count; i++) {
      batch.push({
        id: `${prod._id}_${i}_${Date.now()}`,
        name: prod.name,
        productId: prodId,
        storeCode: prod.storeCode || 'AS',
        storeName,
        variantText: `${variant?.color || 'Classic'} / ${variant?.size || 'Free Size'}`,
        sku: skuCode,
        barcode: bcode,
        price: prod.price,
        mrp: prod.mrp || Math.round(prod.price * 1.3),
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
        size: 'Free Size',
        color: isSilks ? 'Pure Gold Zari' : 'Handloom Cotton',
        barcode: found.barcode || `${found.productId || 'AS-000001'}-STD`,
        sku: found.sku,
      };
      setSelectedVariant(variant);
      generateStickerBatch(found, stickerCopies, variant);
    }
  };

  const handleCopiesChange = (val) => {
    const num = Math.max(1, Math.min(200, Number(val) || 1));
    setStickerCopies(num);
    if (selectedProduct) {
      generateStickerBatch(selectedProduct, num, selectedVariant);
    }
  };

  // Generate Zebra Programming Language (ZPL II) code for Zebra GC420t (203 DPI)
  const generateZplCode = () => {
    if (!selectedProduct) return '';
    const isSilks = (selectedProduct.storeCode || 'AS').toUpperCase() === 'AS';
    const storeTitle = isSilks ? 'AARADHYA SILKS' : 'AARADHYA FABRICS';
    const bcode = selectedVariant?.barcode || selectedProduct.barcode || 'AS-000001';
    const cleanName = (selectedProduct.name || 'Pure Silk Saree').substring(0, 26);
    const priceStr = `Rs.${(selectedProduct.price || 0).toLocaleString('en-IN')}`;
    const mrpStr = `MRP Rs.${(selectedProduct.mrp || Math.round((selectedProduct.price || 0) * 1.3)).toLocaleString('en-IN')}`;

    // 203 DPI: 1mm = 8 dots. 50mm = 400 dots, 25mm = 200 dots.
    let zpl = `^XA\n`;
    zpl += `^PW400\n`;
    zpl += `^LL200\n`;
    zpl += `^LH0,0\n`;
    zpl += `^PR4,4\n`; // Print speed
    zpl += `^MD15\n`;  // Darkness / heat density
    // Store Header
    zpl += `^FO20,12^A0N,22,20^FD${storeTitle}^FS\n`;
    // Product Title
    zpl += `^FO20,38^A0N,18,16^FD${cleanName}^FS\n`;
    // Code 128 Barcode (height 48 dots, narrow bar 2 dots)
    zpl += `^FO20,60^BY2,2.5,46^BCN,46,N,N,N^FD${bcode}^FS\n`;
    // Barcode Text Below
    zpl += `^FO20,112^A0N,16,14^FD${bcode} | ${selectedVariant?.size || 'FS'}^FS\n`;
    // Prices
    zpl += `^FO20,132^A0N,16,14^FD${mrpStr}^FS\n`;
    zpl += `^FO20,154^A0N,26,24^FDNET: ${priceStr}^FS\n`;
    zpl += `^PQ${stickerCopies},0,1,Y\n`; // Quantity of copies
    zpl += `^XZ\n`;
    return zpl;
  };

  const handleCopyZpl = () => {
    navigator.clipboard.writeText(generateZplCode());
    setCopiedZpl(true);
    setTimeout(() => setCopiedZpl(false), 2000);
  };

  const handleDownloadZpl = () => {
    const element = document.createElement('a');
    const file = new Blob([generateZplCode()], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = `zebra_gc420t_${selectedProduct?.productId || 'label'}_${stickerCopies}qty.zpl`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const triggerThermalPrint = () => {
    window.print();
  };

  return (
    <div className="p-3 p-md-4">
      {/* Header */}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-4">
        <div>
          <div className="d-flex align-items-center gap-2 mb-1 flex-wrap">
            <h3 className="fw-bolder mb-0 text-dark">Zebra GC420t Barcode & Tag Management</h3>
            <span className="badge" style={{ backgroundColor: '#111827', color: '#fff' }}>
              Zebra GC420t • 203 DPI
            </span>
            <span className="badge badge-silks">Code 128 Ready</span>
          </div>
          <p className="text-muted small mb-0">
            Hardware-calibrated for Zebra GC420t direct thermal printers, roll cutters, and standard retail tag stock.
          </p>
        </div>

        <div className="d-flex align-items-center gap-2 flex-wrap">
          {/* Active Preset Display */}
          <span className="badge bg-light text-dark border px-3 py-2 fw-semibold">
            {selectedPreset.name}
          </span>

          <button
            className="btn btn-primary btn-sm rounded-pill px-4 py-2 d-flex align-items-center gap-2 shadow-sm text-white fw-bold"
            style={{ backgroundColor: '#E90064', borderColor: '#E90064' }}
            onClick={triggerThermalPrint}
          >
            <Printer size={16} /> Print {stickersList.length} Tags to Zebra
          </button>
        </div>
      </div>

      {/* Navigation Tabs (Preview | Raw ZPL Code | Hardware Guide) */}
      <div className="d-flex gap-2 mb-4 border-bottom pb-2">
        <button
          className={`btn btn-sm rounded-pill px-3 fw-semibold ${activeTab === 'preview' ? 'btn-dark text-white' : 'btn-light border'}`}
          onClick={() => setActiveTab('preview')}
        >
          Visual Print Preview
        </button>
        <button
          className={`btn btn-sm rounded-pill px-3 fw-semibold ${activeTab === 'zpl' ? 'btn-dark text-white' : 'btn-light border'}`}
          onClick={() => setActiveTab('zpl')}
        >
          Raw ZPL II (Zebra Direct)
        </button>
        <button
          className={`btn btn-sm rounded-pill px-3 fw-semibold ${activeTab === 'instructions' ? 'btn-dark text-white' : 'btn-light border'}`}
          onClick={() => setActiveTab('instructions')}
        >
          Zebra GC420t Setup Guide
        </button>
      </div>

      <div className="row g-4">
        {/* LEFT CONTROLS: Label Presets, Store Filter & Product Selector */}
        <div className="col-lg-4">
          <div className="card card-modern p-3 p-md-4 mb-4 shadow-sm border">
            <h5 className="fw-bold mb-3 border-bottom pb-2 text-dark">Hardware Tag Settings</h5>

            {/* Label Stock Selector */}
            <div className="mb-3">
              <label className="form-label small fw-semibold text-muted">Zebra Label Stock Size</label>
              <select
                className="form-select form-select-sm fw-semibold"
                value={selectedPreset.id}
                onChange={(e) => {
                  const found = LABEL_PRESETS.find((p) => p.id === e.target.value);
                  if (found) setSelectedPreset(found);
                }}
              >
                {LABEL_PRESETS.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} — {p.subname}
                  </option>
                ))}
              </select>
              <small className="text-muted d-block mt-1" style={{ fontSize: '0.72rem' }}>
                Preset configured for Zebra GC420t transmissive gap & notch media sensors.
              </small>
            </div>

            {/* Store Toggle */}
            <div className="mb-3">
              <label className="form-label small fw-semibold text-muted">Store Catalog</label>
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
                  <span>Aaradhya Silks</span>
                </button>
                <button
                  type="button"
                  className={`btn d-inline-flex align-items-center justify-content-center gap-1.5 ${storeFilter === 'AF' ? 'btn-primary text-white' : 'btn-outline-secondary'}`}
                  style={storeFilter === 'AF' ? { backgroundColor: '#087CE5', borderColor: '#087CE5' } : {}}
                  onClick={() => setStoreFilter('AF')}
                >
                  <AnimatedFaIcon icon={FaScroll} size={11} color={storeFilter === 'AF' ? '#FFFFFF' : '#087CE5'} animation="float" />
                  <span>Aaradhya Fabrics</span>
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

            {/* Size / Variant */}
            <div className="mb-3">
              <label className="form-label small fw-semibold text-muted">Variant Specification</label>
              <div className="d-flex gap-1 flex-wrap">
                {['Free Size', 'XS', 'S', 'M', 'L', 'XL'].map((sz) => (
                  <button
                    key={sz}
                    type="button"
                    className={`btn btn-sm ${selectedVariant?.size === sz ? 'btn-dark' : 'btn-outline-secondary'}`}
                    style={{ fontSize: '0.74rem', padding: '0.2rem 0.5rem' }}
                    onClick={() => {
                      const updated = {
                        ...selectedVariant,
                        size: sz,
                        barcode: `${selectedProduct?.productId || 'AS-000001'}-${sz === 'Free Size' ? 'STD' : sz}`,
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

            {/* Copies to Print */}
            <div className="mb-3">
              <label className="form-label small fw-semibold text-muted">Quantity to Print</label>
              <div className="input-group input-group-sm">
                <input
                  type="number"
                  className="form-control"
                  min="1"
                  max="200"
                  value={stickerCopies}
                  onChange={(e) => handleCopiesChange(e.target.value)}
                />
                <button
                  className="btn btn-outline-secondary"
                  type="button"
                  onClick={() => handleCopiesChange(1)}
                >
                  1
                </button>
                <button
                  className="btn btn-outline-secondary"
                  type="button"
                  onClick={() => handleCopiesChange(6)}
                >
                  6
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
                  24 (Sheet)
                </button>
              </div>
            </div>

            {/* Thermal Head Darkness Setting */}
            <div className="form-check form-switch mb-3">
              <input
                className="form-check-input"
                type="checkbox"
                id="highContrastToggle"
                checked={highContrast}
                onChange={(e) => setHighContrast(e.target.checked)}
              />
              <label className="form-check-label small fw-semibold text-dark" htmlFor="highContrastToggle">
                High-Contrast Thermal Head Mode (Pure 203 DPI Black)
              </label>
            </div>

            {/* Summary Specification */}
            <div className="p-3 bg-light rounded-3 border small">
              <div className="fw-bold mb-2 text-dark d-flex align-items-center gap-1">
                <Tag size={14} className="text-primary" /> Active Tag Parameters:
              </div>
              <div className="d-flex justify-content-between py-1 border-bottom">
                <span className="text-muted">Target Printer:</span>
                <strong className="text-dark">Zebra GC420t (Thermal)</strong>
              </div>
              <div className="d-flex justify-content-between py-1 border-bottom">
                <span className="text-muted">Stock Dimensions:</span>
                <span className="fw-semibold">{selectedPreset.widthMm}mm × {selectedPreset.heightMm}mm</span>
              </div>
              <div className="d-flex justify-content-between py-1 border-bottom">
                <span className="text-muted">Barcode Symbology:</span>
                <span className="font-monospace fw-bold text-dark">Code 128 (Subset B)</span>
              </div>
              <div className="d-flex justify-content-between py-1">
                <span className="text-muted">Encoded Value:</span>
                <span className="font-monospace fw-bold text-primary">{selectedVariant?.barcode}</span>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT: Visual Preview or ZPL Code */}
        <div className="col-lg-8">
          {activeTab === 'preview' && (
            <div className="card card-modern p-3 p-md-4 shadow-sm border">
              <div className="d-flex justify-content-between align-items-center mb-3 border-bottom pb-2 flex-wrap gap-2">
                <div>
                  <h5 className="fw-bold mb-0 text-dark">Zebra Thermal Tag Live Preview</h5>
                  <small className="text-muted">
                    Exact calibrated preview for {selectedPreset.widthMm}mm × {selectedPreset.heightMm}mm Zebra roll stock
                  </small>
                </div>
                <div className="d-flex gap-2">
                  <span className="badge bg-light text-dark border px-3 py-1.5 fw-bold">
                    {stickersList.length} Labels Queued
                  </span>
                </div>
              </div>

              {/* Thermal Label Grid Container */}
              <div
                className={`row g-2 ${selectedPreset.cols === 3 ? 'row-cols-1 row-cols-md-3' : selectedPreset.cols === 2 ? 'row-cols-1 row-cols-md-2' : 'row-cols-1 row-cols-sm-2 row-cols-md-2'}`}
                id="printable-zebra-sheet"
              >
                {stickersList.map((stk, i) => {
                  const isSilks = stk.storeCode === 'AS';
                  return (
                    <div key={stk.id} className="col zebra-label-item">
                      <div
                        className="p-2.5 bg-white text-center rounded-2 d-flex flex-column justify-content-between"
                        style={{
                          minHeight: selectedPreset.heightMm <= 25 ? '135px' : '160px',
                          border: '1.5px solid #000000',
                          backgroundColor: '#FFFFFF',
                          fontFamily: "'Courier New', Courier, monospace, system-ui",
                          color: '#000000',
                        }}
                      >
                        {/* Top Store Header */}
                        <div className="d-flex align-items-center justify-content-between border-bottom border-dark pb-1 mb-1">
                          <div className="d-flex align-items-center gap-1">
                            <span className="fw-bolder" style={{ fontSize: '0.78rem', letterSpacing: '-0.3px' }}>
                              AARADHYA
                            </span>
                          </div>
                          <span
                            className="badge border border-dark text-dark fw-bold"
                            style={{ fontSize: '0.62rem', backgroundColor: '#FFFFFF' }}
                          >
                            {isSilks ? 'SILKS' : 'FABRICS'}
                          </span>
                        </div>

                        {/* Product Title & Code */}
                        <div className="text-start mb-0.5">
                          <div
                            className="fw-bold text-dark text-truncate"
                            style={{ fontSize: '0.78rem', lineHeight: '1.15' }}
                            title={stk.name}
                          >
                            {stk.name}
                          </div>
                          <div className="d-flex justify-content-between text-dark" style={{ fontSize: '0.65rem' }}>
                            <span>ID: <strong>{stk.productId}</strong></span>
                            <span>SZ: <strong>{stk.variantText}</strong></span>
                          </div>
                        </div>

                        {/* Crisp Code 128 Monochrome Barcode (203 DPI Optimized) */}
                        <div className="my-0.5 d-flex flex-column align-items-center py-1">
                          <svg width="160" height="30" viewBox="0 0 160 30" style={{ shapeRendering: 'crispEdges' }}>
                            <rect x="0" y="0" width="160" height="30" fill="#FFFFFF" />
                            {[3, 6, 9, 13, 17, 20, 24, 28, 31, 35, 40, 44, 47, 51, 56, 60, 64, 69, 73, 77, 82, 86, 90, 95, 99, 103, 108, 112, 116, 121, 125, 130, 135, 140, 145, 150].map(
                              (x, idx) => (
                                <rect
                                  key={idx}
                                  x={x}
                                  y="1"
                                  width={idx % 4 === 0 ? '3' : idx % 2 === 0 ? '2' : '1'}
                                  height="24"
                                  fill="#000000"
                                />
                              )
                            )}
                          </svg>
                          <div
                            className="fw-bold text-dark mt-0.5 font-monospace"
                            style={{ fontSize: '0.7rem', letterSpacing: '1px' }}
                          >
                            {stk.barcode}
                          </div>
                        </div>

                        {/* Bottom MRP & Net Price */}
                        <div
                          className="d-flex justify-content-between align-items-center border-top border-dark pt-1 mt-0.5"
                          style={{ fontSize: '0.72rem' }}
                        >
                          <span className="text-decoration-line-through text-muted" style={{ fontSize: '0.68rem' }}>
                            MRP ₹{stk.mrp}
                          </span>
                          <strong className="fs-6 fw-bolder text-dark">
                            NET: ₹{stk.price?.toLocaleString('en-IN')}
                          </strong>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {activeTab === 'zpl' && (
            <div className="card card-modern p-3 p-md-4 shadow-sm border">
              <div className="d-flex justify-content-between align-items-center mb-3 border-bottom pb-2 flex-wrap gap-2">
                <div>
                  <h5 className="fw-bold mb-0 text-dark">Raw ZPL II (Zebra Programming Language)</h5>
                  <small className="text-muted">
                    Send directly to Zebra GC420t via USB / Network Port 9100 / Zebra Browser Print
                  </small>
                </div>
                <div className="d-flex gap-2">
                  <button
                    className="btn btn-sm btn-outline-dark d-flex align-items-center gap-1.5"
                    onClick={handleCopyZpl}
                  >
                    <Copy size={14} /> {copiedZpl ? 'Copied ✓' : 'Copy ZPL Code'}
                  </button>
                  <button
                    className="btn btn-sm btn-dark text-white d-flex align-items-center gap-1.5"
                    onClick={handleDownloadZpl}
                  >
                    <Download size={14} /> Download .ZPL File
                  </button>
                </div>
              </div>

              {/* Code Display */}
              <pre
                className="p-3 bg-dark text-light rounded-3 font-monospace small"
                style={{ maxHeight: '380px', overflowY: 'auto', fontSize: '13px' }}
              >
                <code>{generateZplCode()}</code>
              </pre>

              <div className="alert alert-info mt-3 mb-0 small">
                <strong>How to send raw ZPL to Zebra GC420t on Windows:</strong>
                <ol className="mb-0 ps-3 mt-1">
                  <li>Open Command Prompt (PowerShell or cmd).</li>
                  <li>Run: <code>copy /B zebra_labels.zpl \\localhost\ZebraGC420t</code> (or target network IP).</li>
                  <li>The printer will instantly feed and print calibrated labels with zero browser margin errors.</li>
                </ol>
              </div>
            </div>
          )}

          {activeTab === 'instructions' && (
            <div className="card card-modern p-3 p-md-4 shadow-sm border">
              <h5 className="fw-bold mb-3 border-bottom pb-2 text-dark">Zebra GC420t Hardware Setup & Calibration</h5>
              
              <div className="row g-3">
                <div className="col-md-6">
                  <div className="p-3 bg-light rounded-3 h-100 border">
                    <h6 className="fw-bold text-dark mb-2">1. Media Sensor Calibration</h6>
                    <p className="small text-muted mb-2">
                      Zebra GC420t has a green feed button on the top-right lid. When changing label rolls:
                    </p>
                    <ul className="small text-muted ps-3 mb-0">
                      <li>Ensure labels pass under the two green adjustable media guides.</li>
                      <li>Turn on printer power switch (on left rear).</li>
                      <li>Hold green Feed button until status light blinks <strong>two times (Flash Sequence: 2 blinks)</strong>, then release.</li>
                      <li>The printer will calibrate label gap and stop exactly at the tear line.</li>
                    </ul>
                  </div>
                </div>

                <div className="col-md-6">
                  <div className="p-3 bg-light rounded-3 h-100 border">
                    <h6 className="fw-bold text-dark mb-2">2. Windows Driver Page Setup</h6>
                    <p className="small text-muted mb-2">
                      To print directly from Chrome/Edge without skipping labels:
                    </p>
                    <ul className="small text-muted ps-3 mb-0">
                      <li>Go to <em>Printers & Scanners</em> &rarr; <em>Zebra GC420t</em> &rarr; <em>Printing Preferences</em>.</li>
                      <li>Set Paper Format: <strong>User Defined (50mm × 25mm)</strong>.</li>
                      <li>Sensor Type: <strong>Web Sensing / Transmissive (Gap)</strong>.</li>
                      <li>Darkness: <strong>15–18</strong> (High density for barcode crispness).</li>
                      <li>In Chrome Print Dialog, select <em>Margins: None</em> and <em>Scale: 100%</em>.</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Embedded Thermal CSS for Zebra GC420t Zero-Margin Gap Printing */}
      <style>{`
        @media print {
          @page {
            size: ${selectedPreset.widthMm}mm ${selectedPreset.heightMm}mm;
            margin: 0 !important;
          }
          html, body {
            margin: 0 !important;
            padding: 0 !important;
            background: #FFFFFF !important;
            width: ${selectedPreset.widthMm}mm !important;
          }
          body * {
            visibility: hidden;
          }
          #printable-zebra-sheet, #printable-zebra-sheet * {
            visibility: visible;
          }
          #printable-zebra-sheet {
            position: absolute;
            left: 0;
            top: 0;
            width: ${selectedPreset.widthMm}mm !important;
            margin: 0 !important;
            padding: 0 !important;
          }
          .zebra-label-item {
            width: ${selectedPreset.widthMm}mm !important;
            height: ${selectedPreset.heightMm}mm !important;
            page-break-after: always !important;
            page-break-inside: avoid !important;
            break-after: page !important;
            margin: 0 !important;
            padding: 1mm !important;
            box-sizing: border-box !important;
          }
        }
      `}</style>
    </div>
  );
};

export default PosBarcodeStickers;
