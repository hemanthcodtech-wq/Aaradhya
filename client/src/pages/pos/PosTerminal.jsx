import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import {
  Scan,
  Search,
  ShoppingCart,
  Trash2,
  Printer,
  CreditCard,
  QrCode,
  DollarSign,
  User,
  Plus,
  Minus,
  CheckCircle2,
  X,
  AlertCircle,
  Clock,
  Layers,
  Store,
  Sparkles,
} from 'lucide-react';
import { FaGem, FaScroll } from 'react-icons/fa6';
import AnimatedFaIcon from '../../components/common/AnimatedFaIcon';
import axiosClient from '../../api/axiosClient';

const PosTerminal = () => {
  const [searchParams] = useSearchParams();
  const currentStore = (searchParams.get('store') || 'AS').toUpperCase();
  const isSilks = currentStore === 'AS';

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [barcodeInput, setBarcodeInput] = useState('');
  const [loading, setLoading] = useState(true);

  // Cart state
  const [cartItems, setCartItems] = useState([]);
  const [discountAmount, setDiscountAmount] = useState(0);
  const [paymentMode, setPaymentMode] = useState('Cash');
  const [cashTendered, setCashTendered] = useState('');
  const [customer, setCustomer] = useState({ name: 'Walk-in Customer', phone: '' });

  // Printable receipt state
  const [completedBill, setCompletedBill] = useState(null);
  const [showPrintModal, setShowPrintModal] = useState(false);
  const [printFormat, setPrintFormat] = useState('thermal'); // 'thermal' | 'a4'

  const barcodeInputRef = useRef(null);
  const primaryColor = isSilks ? '#E90064' : '#087CE5';

  // Load catalog for selected store
  const fetchCatalog = async () => {
    setLoading(true);
    try {
      const [prodRes, catRes] = await Promise.all([
        axiosClient.get(`/pos/products?storeCode=${currentStore}`),
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
    fetchCatalog();
    setCartItems([]); // Reset cart when changing store
  }, [currentStore]);

  // Quick Barcode Scan or Enter handler
  const handleBarcodeScan = async (e) => {
    e.preventDefault();
    if (!barcodeInput.trim()) return;

    try {
      const res = await axiosClient.get(`/pos/scan/${encodeURIComponent(barcodeInput.trim())}`);
      if (res.success && res.data) {
        addItemToCart(res.data);
        setBarcodeInput('');
      }
    } catch (err) {
      alert(`Barcode Scan Error: ${err.message || 'Product not found'}`);
    }
  };

  // Cart operations
  const addItemToCart = (product) => {
    setCartItems((prev) => {
      const index = prev.findIndex((i) => i._id === product._id);
      if (index > -1) {
        const updated = [...prev];
        if (updated[index].quantity < product.stock) {
          updated[index].quantity += 1;
        } else {
          alert(`Maximum stock reached for ${product.name}`);
        }
        return updated;
      } else {
        return [
          ...prev,
          {
            _id: product._id,
            productId: product.productId,
            name: product.name,
            sku: product.sku,
            barcode: product.barcode,
            storeCode: product.storeCode || currentStore,
            storeName: product.storeName || (isSilks ? 'Aaradhya Silks' : 'Aaradhya Fabrics'),
            price: product.price,
            mrp: product.mrp,
            gstRate: product.gstRate || 5,
            image: product.image,
            quantity: 1,
            maxStock: product.stock,
          },
        ];
      }
    });
  };

  const updateItemQty = (id, newQty) => {
    if (newQty <= 0) {
      setCartItems((prev) => prev.filter((i) => i._id !== id));
      return;
    }
    setCartItems((prev) =>
      prev.map((i) => {
        if (i._id === id) {
          return { ...i, quantity: Math.min(newQty, i.maxStock) };
        }
        return i;
      })
    );
  };

  const removeItem = (id) => {
    setCartItems((prev) => prev.filter((i) => i._id !== id));
  };

  const clearCart = () => {
    setCartItems([]);
    setDiscountAmount(0);
    setCashTendered('');
  };

  // Computations
  const subtotal = cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const taxAmount = Math.round(subtotal * 0.05 * 100) / 100; // 5% apparel GST standard
  const totalPayable = Math.max(0, Math.round((subtotal + taxAmount - Number(discountAmount || 0)) * 100) / 100);
  const changeReturned = cashTendered ? Math.max(0, Number(cashTendered) - totalPayable) : 0;

  // Complete POS Sale
  const handleSaveAndPrintBill = async () => {
    if (cartItems.length === 0) {
      alert('Cart is empty. Please scan or select products first.');
      return;
    }

    try {
      const payload = {
        storeCode: currentStore,
        storeName: isSilks ? 'Aaradhya Silks' : 'Aaradhya Fabrics',
        items: cartItems.map((i) => ({
          product: i._id,
          productId: i.productId,
          name: i.name,
          sku: i.sku,
          barcode: i.barcode,
          price: i.price,
          quantity: i.quantity,
          gstRate: i.gstRate,
        })),
        customer,
        discountAmount: Number(discountAmount || 0),
        paymentMode,
        paymentDetails: {
          cashTendered: Number(cashTendered || totalPayable),
          changeReturned: Math.round(changeReturned * 100) / 100,
          upiRef: paymentMode === 'UPI' ? `UPI-${Date.now().toString().slice(-6)}` : '',
        },
      };

      const res = await axiosClient.post('/pos/bills', payload);
      if (res.success && res.data) {
        setCompletedBill({
          ...res.data,
          storeCode: currentStore,
          storeName: isSilks ? 'Aaradhya Silks' : 'Aaradhya Fabrics',
          address: isSilks
            ? 'Silk Weaver Street, Basavanagudi, Bengaluru - 560004'
            : '108 Commercial Street, Shivajinagar, Bengaluru - 560001',
          gstin: isSilks ? '29AAAAA0000A1Z5' : '29BBBBB0000B1Z6',
          phone: isSilks ? '+91 98765 11001' : '+91 98765 11002',
        });
        setShowPrintModal(true);
        clearCart();
        fetchCatalog(); // Refresh stock counts immediately
      }
    } catch (err) {
      alert(`POS Error: ${err.message || 'Payment processing failed'}`);
    }
  };

  // Filter products by category & search
  const filteredProducts = products.filter((p) => {
    if (activeCategory !== 'all') {
      const catMatch =
        p.category === activeCategory ||
        p.category?._id === activeCategory ||
        p.category?.slug === activeCategory;
      if (!catMatch) return false;
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        p.name.toLowerCase().includes(q) ||
        p.sku?.toLowerCase().includes(q) ||
        p.productId?.toLowerCase().includes(q) ||
        p.barcode?.includes(q)
      );
    }
    return true;
  });

  return (
    <div className="pos-container">
      {/* LEFT: Catalog Grid and Scanner Panel */}
      <div className="pos-catalog-panel">
        {/* Store Active Banner */}
        <div
          className="p-2.5 px-3 rounded-3 mb-3 d-flex justify-content-between align-items-center text-white"
          style={{ backgroundColor: primaryColor }}
        >
          <div className="d-flex align-items-center gap-2">
            <AnimatedFaIcon
              icon={isSilks ? FaGem : FaScroll}
              size={18}
              color="#FFFFFF"
              animation={isSilks ? 'pulse' : 'float'}
            />
            <div>
              <div className="fw-bolder" style={{ fontSize: '0.9rem' }}>
                {isSilks ? 'Aaradhya Silks – Counter POS' : 'Aaradhya Fabrics – Counter POS'}
              </div>
              <div className="small opacity-75" style={{ fontSize: '0.7rem' }}>
                Inventory prefix: {isSilks ? 'AS-000001+' : 'AF-000001+'} • Real-time Online Stock Deductions
              </div>
            </div>
          </div>
          <span className="badge bg-white text-dark small fw-bold">Store {currentStore}</span>
        </div>

        {/* Barcode scanner input bar */}
        <div className="card border-0 shadow-sm p-3 mb-3 bg-white rounded-3">
          <form onSubmit={handleBarcodeScan} className="d-flex gap-2">
            <div className="input-group">
              <span className="input-group-text bg-white text-muted">
                <Scan size={18} />
              </span>
              <input
                ref={barcodeInputRef}
                type="text"
                className="form-control"
                placeholder={`Scan Code 128 barcode or enter ${currentStore}-000001 / SKU...`}
                value={barcodeInput}
                onChange={(e) => setBarcodeInput(e.target.value)}
                autoFocus
              />
            </div>
            <button
              type="submit"
              className="btn text-white px-4 d-flex align-items-center gap-1 text-nowrap fw-bold"
              style={{ backgroundColor: primaryColor, borderColor: primaryColor }}
            >
              <Scan size={16} /> Scan Item
            </button>
          </form>
        </div>

        {/* Category Navigation Pills */}
        <div className="d-flex gap-2 overflow-auto pb-2 mb-3">
          <button
            className={`btn btn-sm rounded-pill px-3 text-nowrap fw-semibold ${
              activeCategory === 'all' ? 'text-white' : 'btn-white border text-dark'
            }`}
            style={activeCategory === 'all' ? { backgroundColor: primaryColor, borderColor: primaryColor } : {}}
            onClick={() => setActiveCategory('all')}
          >
            All {isSilks ? 'Silks' : 'Fabrics'} ({products.length})
          </button>
          {categories.map((c) => (
            <button
              key={c._id || c.slug}
              className={`btn btn-sm rounded-pill px-3 text-nowrap fw-semibold ${
                activeCategory === c._id || activeCategory === c.slug ? 'text-white' : 'btn-white border text-dark'
              }`}
              style={
                activeCategory === c._id || activeCategory === c.slug
                  ? { backgroundColor: primaryColor, borderColor: primaryColor }
                  : {}
              }
              onClick={() => setActiveCategory(c.slug || c._id)}
            >
              {c.name}
            </button>
          ))}
        </div>

        {/* Product Grid Tiles */}
        <div className="row g-2 row-cols-2 row-cols-sm-3 row-cols-md-4 row-cols-xl-5">
          {filteredProducts.map((p) => (
            <div key={p._id} className="col">
              <div
                className="pos-tile h-100 d-flex flex-column p-2 bg-white rounded-3 border shadow-sm cursor-pointer"
                onClick={() => addItemToCart(p)}
                style={{ transition: 'transform 0.15s ease' }}
              >
                <div
                  className="rounded-2 overflow-hidden mb-2 d-flex align-items-center justify-content-center bg-light position-relative"
                  style={{ height: '110px' }}
                >
                  <img
                    src={p.image}
                    alt={p.name}
                    style={{ maxHeight: '100%', maxWidth: '100%', objectFit: 'contain' }}
                  />
                  <span
                    className={`badge position-absolute top-0 start-0 m-1 ${
                      p.storeCode === 'AF' ? 'badge-fabrics' : 'badge-silks'
                    }`}
                    style={{ fontSize: '0.62rem' }}
                  >
                    {p.productId || `${p.storeCode || 'AS'}-000001`}
                  </span>
                </div>

                <div className="fw-semibold small line-clamp-1 mb-1 text-dark" title={p.name} style={{ fontSize: '0.78rem' }}>
                  {p.name}
                </div>
                <div className="text-muted" style={{ fontSize: '0.68rem' }}>
                  SKU: {p.sku}
                </div>

                <div className="d-flex justify-content-between align-items-center mt-auto pt-2">
                  <span className="fw-bolder fs-6" style={{ color: primaryColor }}>
                    ₹{p.price?.toLocaleString()}
                  </span>
                  <span
                    className={`badge ${p.stock <= 5 ? 'bg-danger text-white' : 'bg-light text-muted border'}`}
                    style={{ fontSize: '0.65rem' }}
                  >
                    {p.stock} left
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* RIGHT: Bill Cart Panel */}
      <div className="pos-cart-panel p-3 bg-white border-start">
        {/* Customer Header */}
        <div className="d-flex justify-content-between align-items-center mb-2 pb-2 border-bottom">
          <div>
            <div className="text-muted" style={{ fontSize: '0.72rem' }}>
              CURRENT BILL ({cartItems.reduce((acc, i) => acc + i.quantity, 0)} items)
            </div>
            <strong className="text-dark small">
              #{currentStore}-BILL-{new Date().toISOString().slice(5, 10).replace('-', '')}-LIVE
            </strong>
          </div>
          <div className="d-flex gap-2">
            <button
              className="btn btn-outline-secondary btn-sm py-0 px-2 small"
              onClick={() => alert('Bill held. You can resume scanning anytime.')}
            >
              Hold
            </button>
            <button className="btn btn-link btn-sm text-danger text-decoration-none p-0 small" onClick={clearCart}>
              Clear
            </button>
          </div>
        </div>

        {/* Customer phone / name */}
        <div className="p-2 rounded bg-light border mb-2 d-flex align-items-center gap-2">
          <User size={16} className="text-muted" />
          <input
            type="text"
            className="form-control form-control-sm border-0 bg-transparent p-0"
            placeholder="Walk-in Customer / Phone"
            value={customer.name}
            onChange={(e) => setCustomer({ ...customer, name: e.target.value })}
          />
        </div>

        {/* Cart Item rows */}
        <div className="flex-grow-1 overflow-auto pe-1 d-flex flex-column gap-2 mb-3" style={{ maxHeight: '330px' }}>
          {cartItems.length === 0 ? (
            <div className="text-center py-5 text-muted small">
              <ShoppingCart size={32} className="mx-auto mb-2 opacity-50" />
              <div>Cart is empty</div>
              <div style={{ fontSize: '0.75rem' }}>Scan barcode or click tiles to add items</div>
            </div>
          ) : (
            cartItems.map((item) => (
              <div key={item._id} className="p-2 rounded border bg-light d-flex align-items-center justify-content-between gap-2">
                <div className="overflow-hidden flex-grow-1">
                  <div className="fw-bold text-dark small text-truncate" style={{ fontSize: '0.78rem' }}>
                    {item.name}
                  </div>
                  <div className="text-muted" style={{ fontSize: '0.68rem' }}>
                    ID: {item.productId} • ₹{item.price?.toLocaleString()}
                  </div>
                </div>

                <div className="d-flex align-items-center gap-1">
                  <button className="btn btn-sm btn-white border p-0 px-2" onClick={() => updateItemQty(item._id, item.quantity - 1)}>
                    -
                  </button>
                  <span className="fw-bold px-1 small">{item.quantity}</span>
                  <button className="btn btn-sm btn-white border p-0 px-2" onClick={() => updateItemQty(item._id, item.quantity + 1)}>
                    +
                  </button>
                </div>

                <div className="fw-bold small text-end" style={{ minWidth: '60px', color: primaryColor }}>
                  ₹{(item.price * item.quantity).toLocaleString()}
                </div>

                <button className="btn btn-link btn-sm text-danger p-0" onClick={() => removeItem(item._id)}>
                  <Trash2 size={14} />
                </button>
              </div>
            ))
          )}
        </div>

        {/* Totals & Discounts Breakdown */}
        <div className="border-top pt-2 small d-flex flex-column gap-1 mb-3">
          <div className="d-flex justify-content-between text-muted">
            <span>Subtotal:</span>
            <span>₹{subtotal.toLocaleString()}</span>
          </div>

          <div className="d-flex justify-content-between align-items-center">
            <span className="text-muted">Discount (₹):</span>
            <input
              type="number"
              className="form-control form-control-sm text-end"
              style={{ width: '80px', height: '26px' }}
              value={discountAmount}
              onChange={(e) => setDiscountAmount(e.target.value)}
            />
          </div>

          <div className="d-flex justify-content-between text-muted">
            <span>Apparel GST (5%):</span>
            <span>₹{taxAmount.toLocaleString()}</span>
          </div>

          <div className="d-flex justify-content-between fw-bold fs-5 text-dark border-top pt-2 mt-1">
            <span>Total Payable:</span>
            <span style={{ color: primaryColor }}>₹{totalPayable.toLocaleString()}</span>
          </div>
        </div>

        {/* Payment mode tender buttons */}
        <div className="row g-1 mb-2">
          {['Cash', 'Card', 'UPI', 'Split'].map((mode) => (
            <div key={mode} className="col-3">
              <button
                type="button"
                className={`btn btn-sm w-100 py-1.5 fw-semibold ${
                  paymentMode === mode ? 'btn-dark text-white' : 'btn-light border'
                }`}
                onClick={() => setPaymentMode(mode)}
              >
                {mode}
              </button>
            </div>
          ))}
        </div>

        {paymentMode === 'Cash' && (
          <div className="row g-2 mb-3">
            <div className="col-6">
              <label className="form-label text-muted small mb-0" style={{ fontSize: '0.7rem' }}>Cash Tendered (₹)</label>
              <input
                type="number"
                className="form-control form-control-sm"
                placeholder={totalPayable}
                value={cashTendered}
                onChange={(e) => setCashTendered(e.target.value)}
              />
            </div>
            <div className="col-6">
              <label className="form-label text-muted small mb-0" style={{ fontSize: '0.7rem' }}>Change Due (₹)</label>
              <div className="form-control form-control-sm bg-light fw-bold text-success">
                ₹{changeReturned.toLocaleString()}
              </div>
            </div>
          </div>
        )}

        {/* Save & Print Bill CTA matching reference screenshot */}
        <button
          className="btn w-100 py-2.5 fw-bold d-flex align-items-center justify-content-center gap-2 shadow text-white"
          style={{ backgroundColor: primaryColor, borderColor: primaryColor }}
          onClick={handleSaveAndPrintBill}
          disabled={cartItems.length === 0}
        >
          <Printer size={18} /> Pay & Print Invoice (F10)
        </button>
      </div>

      {/* Printable Retail Receipt Modal */}
      {showPrintModal && completedBill && (
        <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.6)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content rounded-4 p-4">
              <div className="d-flex justify-content-between align-items-center mb-3">
                <span className="fw-bold fs-5 text-dark">Retail Invoice Generated</span>
                <button type="button" className="btn-close" onClick={() => setShowPrintModal(false)}></button>
              </div>

              {/* Format Switcher */}
              <div className="btn-group btn-group-sm w-100 mb-3">
                <button
                  className={`btn ${printFormat === 'thermal' ? 'btn-dark' : 'btn-light border'}`}
                  onClick={() => setPrintFormat('thermal')}
                >
                  Thermal Receipt (80mm)
                </button>
                <button
                  className={`btn ${printFormat === 'a4' ? 'btn-dark' : 'btn-light border'}`}
                  onClick={() => setPrintFormat('a4')}
                >
                  Standard A4 Tax Invoice
                </button>
              </div>

              {/* Thermal 80mm preview box */}
              <div
                className="p-3 border rounded bg-white font-monospace small mb-3 printable-receipt"
                style={{ maxHeight: '350px', overflowY: 'auto', fontSize: '12px' }}
                id="pos-thermal-invoice"
              >
                <div className="text-center mb-2">
                  <div className="d-flex justify-content-center align-items-center gap-2 mb-1">
                    <img
                      src="/logo.jpeg"
                      alt="Aaradhya"
                      style={{ width: '28px', height: '28px', objectFit: 'contain', borderRadius: '4px' }}
                    />
                    <div className="fw-bolder fs-6" style={{ color: '#17233B' }}>
                      AARADHYA
                    </div>
                  </div>
                  <div className="fw-bold text-uppercase" style={{ color: primaryColor }}>
                    {completedBill.storeName}
                  </div>
                  <div className="text-muted" style={{ fontSize: '10px' }}>Fashion & Fabrics</div>
                  <div className="text-muted" style={{ fontSize: '10px' }}>{completedBill.address}</div>
                  <div className="text-muted" style={{ fontSize: '10px' }}>GSTIN: {completedBill.gstin}</div>
                  <div className="text-muted" style={{ fontSize: '10px' }}>Tel: {completedBill.phone}</div>
                  <div className="border-bottom my-1"></div>
                  <div className="fw-bold">TAX INVOICE #{completedBill.billNumber}</div>
                  <div>Date: {new Date(completedBill.createdAt || Date.now()).toLocaleString()}</div>
                  <div>Store: {completedBill.storeCode} • Cashier: Counter {completedBill.storeCode}</div>
                  <div className="border-bottom my-1"></div>
                </div>

                <div className="mb-2">
                  {completedBill.items?.map((it, idx) => (
                    <div key={idx} className="d-flex justify-content-between mb-1">
                      <div>
                        <div>{it.name}</div>
                        <div className="text-muted" style={{ fontSize: '10px' }}>
                          ID: {it.productId || it.sku} • {it.quantity} × ₹{it.price}
                        </div>
                      </div>
                      <div className="fw-bold">₹{it.total}</div>
                    </div>
                  ))}
                </div>

                <div className="border-top pt-2">
                  <div className="d-flex justify-content-between">
                    <span>Subtotal:</span>
                    <span>₹{completedBill.subtotal}</span>
                  </div>
                  <div className="d-flex justify-content-between">
                    <span>Apparel GST (5%):</span>
                    <span>₹{completedBill.taxAmount}</span>
                  </div>
                  {completedBill.discountAmount > 0 && (
                    <div className="d-flex justify-content-between text-danger">
                      <span>Discount:</span>
                      <span>-₹{completedBill.discountAmount}</span>
                    </div>
                  )}
                  <div className="d-flex justify-content-between fw-bold fs-6 border-top mt-1 pt-1">
                    <span>TOTAL PAYABLE:</span>
                    <span style={{ color: primaryColor }}>₹{completedBill.totalPayable}</span>
                  </div>
                  <div className="d-flex justify-content-between text-muted" style={{ fontSize: '10px' }}>
                    <span>Payment Mode:</span>
                    <span>{completedBill.paymentMode}</span>
                  </div>
                </div>

                <div className="text-center mt-3 border-top pt-2" style={{ fontSize: '10px' }}>
                  <div className="fw-semibold">THANK YOU FOR SHOPPING AT AARADHYA!</div>
                  <div className="text-muted">Exchange within 7 days with original tag & bill</div>
                  <div className="my-1 font-monospace" style={{ letterSpacing: '2px' }}>
                    |||| | || ||| |||| | ||
                  </div>
                </div>
              </div>

              <div className="d-flex gap-2">
                <button
                  className="btn flex-grow-1 text-white fw-bold"
                  style={{ backgroundColor: primaryColor, borderColor: primaryColor }}
                  onClick={() => window.print()}
                >
                  <Printer size={16} className="me-1" /> Print Receipt
                </button>
                <button className="btn btn-outline-secondary" onClick={() => setShowPrintModal(false)}>
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

export default PosTerminal;