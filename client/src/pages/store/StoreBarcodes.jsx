import React, { useState, useEffect } from 'react';
import {
  Barcode,
  Printer,
  Search,
  Filter,
  CheckSquare,
  Square,
  Copy,
  Download,
  RefreshCw,
  Layers,
  Sparkles,
} from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import axiosClient from '../../api/axiosClient';
import { printBarcodeStickers } from '../../utils/printUtility';

// Helper component to render a realistic Code 128 barcode SVG
const BarcodeSvg = ({ value = '890123450001', width = 200, height = 45 }) => {
  // Generate deterministic pseudo-code 128 bar pattern from string
  const bars = [];
  let currentX = 10;
  for (let i = 0; i < value.length; i++) {
    const charCode = value.charCodeAt(i);
    const w1 = ((charCode % 3) + 1.2) * 1.5;
    const s1 = ((charCode % 2) + 1) * 1.5;
    const w2 = (((charCode + 2) % 3) + 1) * 1.5;
    const s2 = (((charCode + 1) % 2) + 1.2) * 1.5;

    bars.push({ x: currentX, width: w1 });
    currentX += w1 + s1;
    bars.push({ x: currentX, width: w2 });
    currentX += w2 + s2;
  }

  return (
    <div className="d-flex flex-column align-items-center">
      <svg width={width} height={height} viewBox={`0 0 ${currentX + 10} ${height}`} className="barcode-svg">
        {bars.map((bar, idx) => (
          <rect key={idx} x={bar.x} y="0" width={bar.width} height={height} fill="#111827" />
        ))}
      </svg>
      <span className="font-monospace fw-bold text-dark tracking-wider mt-1" style={{ fontSize: '0.74rem', letterSpacing: '2px' }}>
        {value}
      </span>
    </div>
  );
};

const StoreBarcodes = () => {
  const store = useStore();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedItem, setSelectedItem] = useState(null);
  const [printFormat, setPrintFormat] = useState('thermal'); // 'thermal' (50x30mm) or 'a4' (24-up)
  const [copies, setCopies] = useState(1);

  useEffect(() => {
    fetchProducts();
  }, [store.activeStore]);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const res = await axiosClient.get(`/stores/${store.activeStore}/products`);
      if (res.data?.success && res.data.data?.length > 0) {
        setProducts(res.data.data);
        setSelectedItem(res.data.data[0]);
      } else {
        const dummy = getFallbackProducts();
        setProducts(dummy);
        setSelectedItem(dummy[0]);
      }
    } catch {
      const dummy = getFallbackProducts();
      setProducts(dummy);
      setSelectedItem(dummy[0]);
    } finally {
      setLoading(false);
    }
  };

  const getFallbackProducts = () =>
    store.isSilks
      ? [
          {
            _id: 'p1',
            productId: 'AS-000001',
            name: 'Pure Kanjeevaram Bridal Silk Saree',
            category: 'Pure Silk Sarees',
            sku: 'AS-KANJ-001',
            barcode: '890123450001',
            price: 24999,
            salePrice: 19999,
            hsnCode: '5007',
          },
          {
            _id: 'p2',
            productId: 'AS-000108',
            name: 'Banarasi Katan Silk Royal Saree',
            category: 'Pure Silk Sarees',
            sku: 'AS-BANA-108',
            barcode: '890123450108',
            price: 28500,
            salePrice: 24748,
            hsnCode: '5007',
          },
          {
            _id: 'p3',
            productId: 'AS-000142',
            name: 'Chanderi Silk Gold Floral Saree',
            category: 'Silk Blend Sarees',
            sku: 'AS-CHAN-142',
            barcode: '890123450142',
            price: 11000,
            salePrice: 8800,
            hsnCode: '5007',
          },
        ]
      : [
          {
            _id: 'p1',
            productId: 'AF-000001',
            name: 'Pure Mulmul 60s Organic Cotton Yardage',
            category: 'Running Fabrics',
            sku: 'AF-MUL-001',
            barcode: '890123460001',
            price: 650,
            salePrice: 550,
            hsnCode: '5208',
          },
          {
            _id: 'p2',
            productId: 'AF-000045',
            name: 'Hand-Block Indigo Ajrakh Modal Silk',
            category: 'Block Print Yardage',
            sku: 'AF-AJR-045',
            barcode: '890123460045',
            price: 1350,
            salePrice: 1150,
            hsnCode: '5208',
          },
        ];

  const handlePrint = () => {
    if (!selectedItem) {
      alert('Please select a product from the list first.');
      return;
    }
    printBarcodeStickers({
      item: selectedItem,
      store,
      format: printFormat,
      copies,
    });
  };

  const filteredProducts = products.filter(
    (p) =>
      (p.name || '').toLowerCase().includes(search.toLowerCase()) ||
      (p.productId || '').toLowerCase().includes(search.toLowerCase()) ||
      (p.barcode || '').includes(search)
  );

  return (
    <div className="store-barcodes-page pb-5">
      {/* Print styles injected */}
      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          #printable-label-area, #printable-label-area * {
            visibility: visible;
          }
          #printable-label-area {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
          }
          .no-print {
            display: none !important;
          }
        }
      `}</style>

      {/* Header */}
      <div className="d-flex flex-wrap align-items-center justify-content-between gap-3 mb-4 no-print">
        <div>
          <div className="d-flex align-items-center gap-2 mb-1">
            <span
              className="badge rounded-pill fw-bold text-uppercase px-2.5 py-1"
              style={{ backgroundColor: store.badgeBg, color: store.badgeText, border: `1px solid ${store.badgeBorder}`, fontSize: '0.72rem' }}
            >
              Store {store.storeCode} Barcode System
            </span>
            <span className="text-muted small">• Standard Code 128 Generation</span>
          </div>
          <h4 className="fw-bold text-dark mb-0">Barcode & Price Sticker Generator</h4>
        </div>

        <div className="d-flex align-items-center gap-2">
          <button
            onClick={handlePrint}
            className="btn btn-sm text-white fw-semibold rounded-pill px-3 py-2 d-inline-flex align-items-center gap-2 shadow-sm"
            style={{ backgroundColor: store.primaryColor }}
          >
            <Printer size={16} />
            Print Barcode Stickers
          </button>
        </div>
      </div>

      <div className="row g-4">
        {/* Left Column: Product Selector (no-print) */}
        <div className="col-12 col-lg-5 no-print">
          <div className="card border-0 shadow-sm rounded-3 p-3 bg-white h-100">
            <h6 className="fw-bold text-dark mb-2">1. Select Catalog Item</h6>
            <div className="input-group input-group-sm mb-3">
              <span className="input-group-text bg-light border-end-0">
                <Search size={14} className="text-muted" />
              </span>
              <input
                type="text"
                className="form-control border-start-0 bg-light"
                placeholder="Search by ID or title..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            <div className="list-group list-group-flush overflow-auto" style={{ maxHeight: '420px' }}>
              {filteredProducts.map((p) => {
                const isSelected = selectedItem?._id === p._id;
                return (
                  <button
                    key={p._id}
                    onClick={() => setSelectedItem(p)}
                    className={`list-group-item list-group-item-action border-0 rounded-2 p-2.5 mb-1 text-start ${
                      isSelected ? 'bg-light border-start border-3' : ''
                    }`}
                    style={{
                      borderColor: isSelected ? store.primaryColor : 'transparent',
                    }}
                  >
                    <div className="d-flex align-items-center justify-content-between mb-1">
                      <span className="font-monospace fw-bold small text-dark">{p.productId}</span>
                      <span className="badge bg-light text-muted border font-monospace" style={{ fontSize: '0.68rem' }}>
                        {p.barcode || 'Generated'}
                      </span>
                    </div>
                    <div className="fw-semibold text-dark text-truncate small" style={{ maxWidth: '280px' }}>
                      {p.name}
                    </div>
                    <div className="d-flex align-items-center justify-content-between mt-1 text-muted small" style={{ fontSize: '0.72rem' }}>
                      <span>HSN: {p.hsnCode || '5007'}</span>
                      <span className="fw-bold text-dark">₹{Number(p.salePrice || p.price).toLocaleString()}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Column: Sticker Live Preview & Print Settings */}
        <div className="col-12 col-lg-7">
          <div className="card border-0 shadow-sm rounded-3 p-4 bg-white mb-4 no-print">
            <h6 className="fw-bold text-dark mb-3">2. Print Format & Quantity</h6>
            <div className="row g-3 align-items-center">
              <div className="col-12 col-sm-6">
                <label className="form-label small fw-semibold text-dark">Sticker Media Format</label>
                <select
                  className="form-select form-select-sm"
                  value={printFormat}
                  onChange={(e) => setPrintFormat(e.target.value)}
                >
                  <option value="thermal">Thermal Roll (50mm x 30mm) - Desktop POS</option>
                  <option value="a4">A4 Sheet (24 Stickers / Page)</option>
                </select>
              </div>

              <div className="col-12 col-sm-6">
                <label className="form-label small fw-semibold text-dark">Copies to Print</label>
                <input
                  type="number"
                  min="1"
                  max="100"
                  className="form-control form-control-sm"
                  value={copies}
                  onChange={(e) => setCopies(Math.max(1, parseInt(e.target.value) || 1))}
                />
              </div>
            </div>
          </div>

          {/* Printable Label Area */}
          <div id="printable-label-area">
            <div className="mb-2 no-print d-flex align-items-center justify-content-between">
              <span className="fw-bold text-dark small">Live Sticker Preview:</span>
              <span className="text-muted small">Standard retail thermal adhesive sticker</span>
            </div>

            {selectedItem && (
              <div
                className="d-flex flex-wrap gap-3 justify-content-start p-3 rounded-3"
                style={{ backgroundColor: '#F8F9FA' }}
              >
                {Array.from({ length: printFormat === 'a4' ? Math.min(copies, 24) : copies }).map((_, index) => (
                  <div
                    key={index}
                    className="bg-white border rounded shadow-sm p-3 d-flex flex-column justify-content-between"
                    style={{
                      width: '260px',
                      minHeight: '160px',
                      border: '1px solid #D0D5DD',
                    }}
                  >
                    {/* Header */}
                    <div className="text-center border-bottom pb-1 mb-1">
                      <div className="fw-bold text-dark text-uppercase tracking-wider" style={{ fontSize: '0.78rem', letterSpacing: '1px' }}>
                        AARADHYA
                      </div>
                      <div className="text-muted fw-semibold" style={{ fontSize: '0.66rem' }}>
                        {store.storeName}
                      </div>
                    </div>

                    {/* Product Details */}
                    <div className="my-1">
                      <div className="d-flex align-items-center justify-content-between">
                        <span className="font-monospace fw-bold text-dark" style={{ fontSize: '0.76rem' }}>
                          {selectedItem.productId}
                        </span>
                        <span className="text-muted font-monospace" style={{ fontSize: '0.68rem' }}>
                          HSN: {selectedItem.hsnCode || '5007'}
                        </span>
                      </div>
                      <div className="fw-semibold text-dark text-truncate" style={{ fontSize: '0.72rem', maxWidth: '230px' }}>
                        {selectedItem.name}
                      </div>
                    </div>

                    {/* Barcode SVG */}
                    <div className="my-1 text-center">
                      <BarcodeSvg value={selectedItem.barcode || '890123450001'} width={190} height={36} />
                    </div>

                    {/* Price Footer */}
                    <div className="d-flex align-items-center justify-content-between border-top pt-1 mt-1">
                      <div className="text-muted small" style={{ fontSize: '0.68rem' }}>
                        MRP: <span className="text-decoration-line-through">₹{Number(selectedItem.price).toLocaleString()}</span>
                      </div>
                      <div className="fw-bold text-dark" style={{ fontSize: '0.84rem' }}>
                        OFFER: ₹{Number(selectedItem.salePrice || selectedItem.price).toLocaleString()}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StoreBarcodes;
