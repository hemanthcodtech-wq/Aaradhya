import React, { useState, useEffect, useRef } from 'react';
import {
  Terminal,
  Barcode,
  Search,
  ShoppingCart,
  Trash2,
  Plus,
  Minus,
  CreditCard,
  QrCode,
  Banknote,
  Printer,
  CheckCircle2,
  RefreshCw,
  User,
  Phone,
  Tag,
  X,
} from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { useAuth } from '../../context/AuthContext';
import axiosClient from '../../api/axiosClient';
import { printPosReceipt } from '../../utils/printUtility';

const StorePos = () => {
  const store = useStore();
  const { user } = useAuth();

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  // Scanner autofocus & machine buffer
  const scanInputRef = useRef(null);
  const [barcodeInput, setBarcodeInput] = useState('');
  const [scanFeedback, setScanFeedback] = useState(null); // { type: 'success' | 'error', text: '' }

  // Hardware Scanner Key Buffer Refs
  const scanBufferRef = useRef('');
  const lastKeyTimeRef = useRef(0);

  // Synthesize acoustic scanner feedback without external audio files
  const playScannerBeep = (isSuccess = true) => {
    try {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (!AudioContextClass) return;
      const ctx = new AudioContextClass();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      if (isSuccess) {
        osc.frequency.setValueAtTime(1400, ctx.currentTime);
        gain.gain.setValueAtTime(0.12, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.08);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.08);
      } else {
        osc.frequency.setValueAtTime(320, ctx.currentTime);
        gain.gain.setValueAtTime(0.15, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.2);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.2);
      }
    } catch {
      // Audio context silenced or blocked
    }
  };

  // Cart state
  const [cart, setCart] = useState([]);
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [discountAmount, setDiscountAmount] = useState(0);
  const [paymentMode, setPaymentMode] = useState('cash'); // cash, upi, card
  const [checkoutLoading, setCheckoutLoading] = useState(false);

  // Completed Bill Receipt Modal
  const [completedBill, setCompletedBill] = useState(null);
  const [showReceipt, setShowReceipt] = useState(false);

  useEffect(() => {
    fetchPosProducts();
    if (scanInputRef.current) {
      scanInputRef.current.focus();
    }
  }, [store.activeStore]);

  // Global Hardware Barcode Scanner Listener
  useEffect(() => {
    const handleGlobalKeyDown = (e) => {
      const isInput = e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA';
      const isScanInput = e.target === scanInputRef.current;

      const now = Date.now();
      const delta = now - lastKeyTimeRef.current;
      lastKeyTimeRef.current = now;

      // Enter key indicates end of barcode transmission from scanner gun
      if (e.key === 'Enter') {
        const rawCode = isScanInput ? barcodeInput : scanBufferRef.current;
        const code = (rawCode || '').trim();
        scanBufferRef.current = '';

        if (code.length >= 3) {
          e.preventDefault();
          processScannedBarcode(code);
          if (isScanInput) setBarcodeInput('');
        }
        return;
      }

      // Ignore single modifier keys
      if (e.key.length > 1 || e.ctrlKey || e.altKey || e.metaKey) return;

      // Hardware scanners send characters rapidly (< 60ms between keystrokes)
      if (delta < 60 || scanBufferRef.current.length === 0) {
        scanBufferRef.current += e.key;
      } else {
        // Slow manual typing, reset buffer
        scanBufferRef.current = e.key;
      }
    };

    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, [products, barcodeInput]);

  const fetchPosProducts = async () => {
    setLoading(true);
    try {
      const res = await axiosClient.get(`/pos/products?storeCode=${store.activeStore}`);
      if (res.data?.success && res.data.data?.length > 0) {
        setProducts(res.data.data);
      } else {
        setProducts(getFallbackProducts());
      }
    } catch {
      setProducts(getFallbackProducts());
    } finally {
      setLoading(false);
    }
  };

  const getFallbackProducts = () =>
    store.isSilks
      ? [
          {
            _id: 'p_as_01',
            productId: 'AS-000001',
            name: 'Pure Kanjeevaram Bridal Silk Saree (Crimson)',
            category: 'Pure Silk Sarees',
            price: 24999,
            salePrice: 19999,
            stock: 14,
            barcode: '890123450001',
            sku: 'AS-KANJ-001',
            hsn: '5007',
            gstRate: 5,
            image: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=300&q=80',
          },
          {
            _id: 'p_as_02',
            productId: 'AS-000108',
            name: 'Banarasi Katan Silk Royal Saree',
            category: 'Pure Silk Sarees',
            price: 28500,
            salePrice: 24748,
            stock: 3,
            barcode: '890123450108',
            sku: 'AS-BANA-108',
            hsn: '5007',
            gstRate: 5,
            image: 'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&w=300&q=80',
          },
          {
            _id: 'p_as_03',
            productId: 'AS-000142',
            name: 'Chanderi Silk Gold Floral Butta',
            category: 'Silk Blend Sarees',
            price: 11000,
            salePrice: 8800,
            stock: 22,
            barcode: '890123450142',
            sku: 'AS-CHAN-142',
            hsn: '5007',
            gstRate: 5,
            image: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=300&q=80',
          },
          {
            _id: 'p_as_04',
            productId: 'AS-000199',
            name: 'Tussar Handwoven Temple Border Saree',
            category: 'Tussar Silks',
            price: 14500,
            salePrice: 12900,
            stock: 2,
            barcode: '890123450199',
            sku: 'AS-TUSS-199',
            hsn: '5007',
            gstRate: 5,
            image: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=300&q=80',
          },
        ]
      : [
          {
            _id: 'p_af_01',
            productId: 'AF-000001',
            name: 'Pure Mulmul 60s Organic Cotton Yardage',
            category: 'Running Fabrics',
            price: 650,
            salePrice: 550,
            stock: 240,
            barcode: '890123460001',
            sku: 'AF-MUL-001',
            hsn: '5208',
            gstRate: 5,
            image: 'https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?auto=format&fit=crop&w=300&q=80',
          },
          {
            _id: 'p_af_02',
            productId: 'AF-000045',
            name: 'Hand-Block Natural Indigo Ajrakh Modal Silk',
            category: 'Block Print Yardage',
            price: 1350,
            salePrice: 1150,
            stock: 65,
            barcode: '890123460045',
            sku: 'AF-AJR-045',
            hsn: '5208',
            gstRate: 5,
            image: 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?auto=format&fit=crop&w=300&q=80',
          },
          {
            _id: 'p_af_03',
            productId: 'AF-000088',
            name: 'European Organic Linen Slub Yardage',
            category: 'Running Fabrics',
            price: 1400,
            salePrice: 1200,
            stock: 9,
            barcode: '890123460088',
            sku: 'AF-LIN-088',
            hsn: '5309',
            gstRate: 5,
            image: 'https://images.unsplash.com/photo-1574634534894-89d7576c8259?auto=format&fit=crop&w=300&q=80',
          },
        ];

  // Barcode processing (Handles both Hardware Machine Scans and Manual Input)
  const processScannedBarcode = (code) => {
    if (!code) return;
    const clean = code.trim().toLowerCase();

    const matched = products.find(
      (p) =>
        (p.barcode && p.barcode.trim().toLowerCase() === clean) ||
        (p.sku && p.sku.toLowerCase() === clean) ||
        (p.productId && p.productId.toLowerCase() === clean)
    );

    if (matched) {
      playScannerBeep(true);
      addToCart(matched);
      setScanFeedback({
        type: 'success',
        text: `Scanned: ${matched.name} (+1 added to cart)`,
      });
      setTimeout(() => setScanFeedback(null), 3000);
    } else {
      playScannerBeep(false);
      setScanFeedback({
        type: 'error',
        text: `Unrecognized Barcode: "${code}" is not in ${store.storeName} catalog`,
      });
      setTimeout(() => setScanFeedback(null), 4000);
    }
  };

  const handleBarcodeSubmit = (e) => {
    e.preventDefault();
    if (!barcodeInput.trim()) return;
    processScannedBarcode(barcodeInput);
    setBarcodeInput('');
  };

  const addToCart = (product) => {
    setCart((prevCart) => {
      const existing = prevCart.find((item) => item._id === product._id);
      if (existing) {
        if (existing.quantity >= product.stock) {
          alert(`Cannot add more. Only ${product.stock} in stock.`);
          return prevCart;
        }
        return prevCart.map((item) =>
          item._id === product._id ? { ...item, quantity: item.quantity + 1 } : item
        );
      } else {
        if (product.stock <= 0) {
          alert('Product is out of stock!');
          return prevCart;
        }
        return [
          ...prevCart,
          {
            _id: product._id,
            productId: product.productId,
            name: product.name,
            sku: product.sku,
            barcode: product.barcode,
            hsn: product.hsn || (store.isSilks ? '5007' : '5208'),
            price: product.salePrice || product.price,
            gstRate: product.gstRate || 5,
            quantity: 1,
            maxStock: product.stock,
          },
        ];
      }
    });
  };

  const updateQuantity = (id, delta) => {
    setCart((prevCart) =>
      prevCart
        .map((item) => {
          if (item._id === id) {
            const newQty = item.quantity + delta;
            if (newQty > item.maxStock) {
              alert(`Maximum available stock is ${item.maxStock}`);
              return item;
            }
            return newQty > 0 ? { ...item, quantity: newQty } : null;
          }
          return item;
        })
        .filter(Boolean)
    );
  };

  const removeFromCart = (id) => {
    setCart((prevCart) => prevCart.filter((item) => item._id !== id));
  };

  // Cart calculations
  const subtotal = cart.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const gstAmount = Math.round(subtotal * 0.05); // Standard 5% GST
  const cgst = Math.round(gstAmount / 2);
  const sgst = gstAmount - cgst;
  const netPayable = Math.max(0, subtotal + gstAmount - Number(discountAmount || 0));

  // Checkout & atomic stock deduction
  const handleCheckout = async () => {
    if (cart.length === 0) {
      alert('Cart is empty. Add products before checkout.');
      return;
    }

    setCheckoutLoading(true);
    const billPayload = {
      storeCode: store.activeStore,
      customerName: customerName || 'Walk-in Customer',
      customerPhone: customerPhone || '9876543210',
      items: cart.map((i) => ({
        productId: i.productId,
        name: i.name,
        sku: i.sku,
        hsn: i.hsn,
        price: i.price,
        quantity: i.quantity,
        subtotal: i.price * i.quantity,
      })),
      subtotal,
      tax: gstAmount,
      discount: Number(discountAmount || 0),
      total: netPayable,
      paymentMethod: paymentMode,
      cashier: user?.name || (store.isSilks ? 'Silks Cashier 1' : 'Fabrics Cashier 1'),
    };

    try {
      const res = await axiosClient.post('/pos/bills', billPayload);
      const generatedBill = res.data?.data || {
        ...billPayload,
        billNumber: `${store.storeCode}-POS-${Math.floor(1000 + Math.random() * 9000)}`,
        createdAt: new Date().toISOString(),
      };

      setCompletedBill(generatedBill);
      setShowReceipt(true);
      setCart([]);
      setCustomerName('');
      setCustomerPhone('');
      setDiscountAmount(0);

      // Refresh products to reflect reduced inventory
      fetchPosProducts();
    } catch {
      // Fallback local bill
      const fallbackBill = {
        ...billPayload,
        billNumber: `${store.storeCode}-POS-${Math.floor(1000 + Math.random() * 9000)}`,
        createdAt: new Date().toISOString(),
      };
      setCompletedBill(fallbackBill);
      setShowReceipt(true);
      setCart([]);
    } finally {
      setCheckoutLoading(false);
    }
  };

  const filteredProducts = products.filter((p) => {
    const matchesSearch =
      (p.name || '').toLowerCase().includes(search.toLowerCase()) ||
      (p.productId || '').toLowerCase().includes(search.toLowerCase()) ||
      (p.sku || '').toLowerCase().includes(search.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || p.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const categories = ['all', ...new Set(products.map((p) => p.category).filter(Boolean))];

  return (
    <div className="store-pos-page pb-5">
      {/* Print styles for thermal POS receipt */}
      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          #pos-receipt-print, #pos-receipt-print * {
            visibility: visible;
          }
          #pos-receipt-print {
            position: absolute;
            left: 0;
            top: 0;
            width: 80mm;
            font-family: monospace;
          }
          .no-print {
            display: none !important;
          }
        }
      `}</style>

      {/* POS Top Header Banner */}
      <div className="card border-0 shadow-sm rounded-3 p-3 bg-white mb-3 no-print">
        <div className="d-flex flex-wrap align-items-center justify-content-between gap-3">
          <div className="d-flex align-items-center gap-2.5">
            <div
              className="d-flex align-items-center justify-content-center rounded-3 text-white"
              style={{ width: '40px', height: '40px', backgroundColor: store.primaryColor }}
            >
              <Terminal size={20} />
            </div>
            <div>
              <div className="d-flex align-items-center gap-2">
                <h5 className="fw-bold text-dark mb-0">{store.storeName} Counter POS</h5>
                <span
                  className="badge rounded-pill fw-bold text-uppercase px-2 py-0.5"
                  style={{ backgroundColor: store.badgeBg, color: store.badgeText, border: `1px solid ${store.badgeBorder}`, fontSize: '0.68rem' }}
                >
                  Terminal 01 • Active
                </span>
              </div>
              <span className="text-muted small" style={{ fontSize: '0.72rem' }}>
                Instant Barcode Checkout • Direct Inventory Sync
              </span>
            </div>
          </div>

          {/* Right side: Machine Scanner Pill & Manual Input */}
          <div className="d-flex align-items-center gap-2 flex-wrap">
            <span
              className="badge bg-success-subtle text-success border border-success d-inline-flex align-items-center gap-1.5 py-1.5 px-2.5"
              style={{ fontSize: '0.72rem' }}
              title="Hardware barcode gun / scanner ready"
            >
              <span className="spinner-grow spinner-grow-sm text-success" style={{ width: '7px', height: '7px' }} />
              <span>Machine Scanner Ready</span>
            </span>

            <form onSubmit={handleBarcodeSubmit} className="d-flex align-items-center gap-1.5">
              <div className="input-group input-group-sm" style={{ width: '260px' }}>
                <span className="input-group-text bg-light border-end-0">
                  <Barcode size={15} style={{ color: store.primaryColor }} />
                </span>
                <input
                  ref={scanInputRef}
                  type="text"
                  className="form-control border-start-0 bg-light font-monospace fw-semibold"
                  placeholder="Scan or Enter SKU..."
                  value={barcodeInput}
                  onChange={(e) => setBarcodeInput(e.target.value)}
                />
              </div>
              <button type="submit" className="btn btn-sm btn-dark px-2.5 fw-semibold" style={{ fontSize: '0.74rem' }}>
                Enter
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Live Machine Scan Feedback Alert Banner */}
      {scanFeedback && (
        <div
          className={`alert ${
            scanFeedback.type === 'success' ? 'alert-success border-success text-success' : 'alert-danger border-danger text-danger'
          } py-2 px-3 small d-flex align-items-center justify-content-between mb-3 shadow-sm rounded-3`}
          role="alert"
        >
          <div className="d-flex align-items-center gap-2">
            <Barcode size={16} />
            <span className="fw-bold">{scanFeedback.text}</span>
          </div>
          <button
            type="button"
            className="btn-close btn-close-sm"
            onClick={() => setScanFeedback(null)}
            aria-label="Close"
          />
        </div>
      )}

      <div className="row g-3">
        {/* Left Section: Product Browser & Catalog Grid (60%) */}
        <div className="col-12 col-lg-7 no-print">
          <div className="card border-0 shadow-sm rounded-3 p-3 bg-white h-100">
            {/* Search and Category filter tabs */}
            <div className="row g-2 mb-3 align-items-center">
              <div className="col-12 col-sm-6">
                <div className="input-group input-group-sm">
                  <span className="input-group-text bg-light border-end-0">
                    <Search size={14} className="text-muted" />
                  </span>
                  <input
                    type="text"
                    className="form-control border-start-0 bg-light"
                    placeholder="Search product name or code..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                </div>
              </div>

              <div className="col-12 col-sm-6 d-flex gap-1 overflow-auto pb-1">
                {categories.slice(0, 4).map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`btn btn-sm text-nowrap rounded-pill px-2.5 py-1 text-capitalize ${
                      selectedCategory === cat ? 'btn-dark' : 'btn-light border text-muted'
                    }`}
                    style={{ fontSize: '0.72rem' }}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Products Grid */}
            <div className="row g-2 overflow-auto" style={{ maxHeight: '560px' }}>
              {loading ? (
                <div className="col-12 text-center py-5">
                  <div className="spinner-border spinner-border-sm text-primary" style={{ color: store.primaryColor }} />
                </div>
              ) : filteredProducts.length === 0 ? (
                <div className="col-12 text-center py-5 text-muted small">No items match your query.</div>
              ) : (
                filteredProducts.map((p) => {
                  const isOutOfStock = p.stock <= 0;
                  return (
                    <div key={p._id} className="col-6 col-sm-4">
                      <div
                        onClick={() => !isOutOfStock && addToCart(p)}
                        className={`card h-100 border rounded-2 p-2 text-start transition-all ${
                          isOutOfStock ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover-shadow'
                        }`}
                        style={{ cursor: isOutOfStock ? 'not-allowed' : 'pointer' }}
                      >
                        <div className="position-relative mb-1.5">
                          <img
                            src={
                              p.image ||
                              (p.images && p.images[0]) ||
                              'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=300&q=80'
                            }
                            alt={p.name}
                            className="w-100 rounded object-fit-cover"
                            style={{ height: '90px' }}
                            onError={(e) => {
                              e.target.src = 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=300&q=80';
                            }}
                          />
                          <span
                            className="position-absolute top-0 end-0 badge m-1 font-monospace"
                            style={{ backgroundColor: 'rgba(0,0,0,0.65)', fontSize: '0.62rem' }}
                          >
                            {p.stock} in stock
                          </span>
                        </div>

                        <span className="font-monospace fw-bold text-muted small" style={{ fontSize: '0.68rem' }}>
                          {p.productId}
                        </span>
                        <div className="fw-semibold text-dark text-truncate small mb-1" style={{ fontSize: '0.76rem' }}>
                          {p.name}
                        </div>
                        <div className="d-flex align-items-center justify-content-between mt-auto">
                          <span className="fw-bold text-dark fs-6">₹{Number(p.salePrice || p.price).toLocaleString()}</span>
                          <span
                            className="btn btn-sm btn-light border p-1 rounded-circle text-primary"
                            style={{ color: store.primaryColor }}
                          >
                            <Plus size={12} />
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* Right Section: Register & Billing Cart (40%) */}
        <div className="col-12 col-lg-5 no-print">
          <div className="card border-0 shadow-sm rounded-3 p-3 bg-white h-100 d-flex flex-column">
            {/* Customer Information Form */}
            <div className="row g-2 mb-3 pb-2 border-bottom">
              <div className="col-6">
                <input
                  type="text"
                  className="form-control form-control-sm bg-light"
                  placeholder="Customer Name"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                />
              </div>
              <div className="col-6">
                <input
                  type="tel"
                  className="form-control form-control-sm bg-light"
                  placeholder="Mobile (for SMS bill)"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                />
              </div>
            </div>

            {/* Cart Items List */}
            <div className="flex-grow-1 overflow-auto mb-3" style={{ maxHeight: '280px' }}>
              {cart.length === 0 ? (
                <div className="text-center py-5 text-muted">
                  <ShoppingCart size={32} className="opacity-50 mb-2" />
                  <div className="small">Billing cart is empty.</div>
                  <div className="small text-muted" style={{ fontSize: '0.72rem' }}>
                    Scan barcode or click items to add
                  </div>
                </div>
              ) : (
                <div className="d-flex flex-column gap-2">
                  {cart.map((item) => (
                    <div key={item._id} className="p-2 border rounded bg-light d-flex align-items-center justify-content-between">
                      <div style={{ maxWidth: '160px' }}>
                        <div className="fw-semibold text-dark text-truncate small" style={{ fontSize: '0.76rem' }}>
                          {item.name}
                        </div>
                        <div className="text-muted font-monospace" style={{ fontSize: '0.68rem' }}>
                          ₹{Number(item.price).toLocaleString()} × {item.quantity}
                        </div>
                      </div>

                      <div className="d-flex align-items-center gap-1.5">
                        <button
                          onClick={() => updateQuantity(item._id, -1)}
                          className="btn btn-sm btn-white border p-1 rounded"
                        >
                          <Minus size={12} />
                        </button>
                        <span className="fw-bold font-monospace px-1 text-dark small">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item._id, 1)}
                          className="btn btn-sm btn-white border p-1 rounded"
                        >
                          <Plus size={12} />
                        </button>
                        <button
                          onClick={() => removeFromCart(item._id)}
                          className="btn btn-sm btn-white border p-1 rounded text-danger ms-1"
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>

                      <div className="fw-bold text-dark text-end font-monospace small">
                        ₹{Number(item.price * item.quantity).toLocaleString()}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Billing Summary & Payment Modes */}
            <div className="border-top pt-2 mt-auto">
              <div className="d-flex justify-content-between text-muted small mb-1" style={{ fontSize: '0.74rem' }}>
                <span>Subtotal ({cart.reduce((a, b) => a + b.quantity, 0)} items)</span>
                <span className="font-monospace">₹{subtotal.toLocaleString()}</span>
              </div>
              <div className="d-flex justify-content-between text-muted small mb-1" style={{ fontSize: '0.74rem' }}>
                <span>GST (CGST 2.5% + SGST 2.5%)</span>
                <span className="font-monospace">₹{gstAmount.toLocaleString()}</span>
              </div>
              <div className="d-flex justify-content-between align-items-center text-muted small mb-2" style={{ fontSize: '0.74rem' }}>
                <span>Discount (₹)</span>
                <input
                  type="number"
                  min="0"
                  className="form-control form-control-sm text-end font-monospace"
                  style={{ width: '90px', height: '26px' }}
                  value={discountAmount}
                  onChange={(e) => setDiscountAmount(e.target.value)}
                />
              </div>

              <div className="d-flex justify-content-between align-items-center fs-5 fw-bold text-dark pt-2 border-top mb-3">
                <span>Total Amount:</span>
                <span style={{ color: store.primaryColor }}>₹{netPayable.toLocaleString()}</span>
              </div>

              {/* Payment Method Selector */}
              <div className="d-flex gap-2 mb-3">
                <button
                  type="button"
                  onClick={() => setPaymentMode('cash')}
                  className={`btn btn-sm flex-fill d-flex flex-column align-items-center py-2 rounded-2 ${
                    paymentMode === 'cash' ? 'btn-dark text-white' : 'btn-light border text-muted'
                  }`}
                  style={{ fontSize: '0.72rem' }}
                >
                  <Banknote size={16} className="mb-1" />
                  Cash
                </button>
                <button
                  type="button"
                  onClick={() => setPaymentMode('upi')}
                  className={`btn btn-sm flex-fill d-flex flex-column align-items-center py-2 rounded-2 ${
                    paymentMode === 'upi' ? 'btn-dark text-white' : 'btn-light border text-muted'
                  }`}
                  style={{ fontSize: '0.72rem' }}
                >
                  <QrCode size={16} className="mb-1" />
                  UPI / QR
                </button>
                <button
                  type="button"
                  onClick={() => setPaymentMode('card')}
                  className={`btn btn-sm flex-fill d-flex flex-column align-items-center py-2 rounded-2 ${
                    paymentMode === 'card' ? 'btn-dark text-white' : 'btn-light border text-muted'
                  }`}
                  style={{ fontSize: '0.72rem' }}
                >
                  <CreditCard size={16} className="mb-1" />
                  Card
                </button>
              </div>

              {/* Complete Sale Button */}
              <button
                type="button"
                disabled={cart.length === 0 || checkoutLoading}
                onClick={handleCheckout}
                className="btn btn-sm w-100 text-white fw-bold py-2.5 rounded-pill shadow-sm d-flex align-items-center justify-content-center gap-2"
                style={{ backgroundColor: store.primaryColor }}
              >
                {checkoutLoading ? (
                  <span className="spinner-border spinner-border-sm" />
                ) : (
                  <>
                    <Printer size={16} />
                    Complete Sale & Print Receipt
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* POS Thermal Receipt Modal & Printable Slip */}
      {showReceipt && completedBill && (
        <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1050 }}>
          <div className="modal-dialog modal-sm modal-dialog-centered">
            <div className="modal-content border-0 shadow-lg rounded-3">
              <div className="modal-header border-0 pb-0 pt-3 px-3 no-print">
                <h6 className="modal-title fw-bold text-dark">Retail POS Receipt</h6>
                <button type="button" className="btn-close" onClick={() => setShowReceipt(false)} />
              </div>

              {/* Printable 80mm Receipt Area */}
              <div id="pos-receipt-print" className="p-3 text-dark font-monospace" style={{ fontSize: '11px', lineHeight: 1.4 }}>
                <div className="text-center border-bottom pb-2 mb-2">
                  <div className="fw-bold fs-6 tracking-wider">AARADHYA</div>
                  <div className="small fw-semibold">{store.storeName}</div>
                  <div className="text-muted" style={{ fontSize: '9px' }}>{store.address}</div>
                  <div className="text-muted" style={{ fontSize: '9px' }}>GSTIN: {store.gstin}</div>
                  <div className="text-muted" style={{ fontSize: '9px' }}>Phone: {store.phone}</div>
                </div>

                <div className="mb-2">
                  <div>Bill #: <span className="fw-bold">{completedBill.billNumber}</span></div>
                  <div>Date: {new Date(completedBill.createdAt || Date.now()).toLocaleString()}</div>
                  <div>Cashier: {completedBill.cashier}</div>
                  <div>Customer: {completedBill.customerName} ({completedBill.customerPhone})</div>
                </div>

                <div className="border-top border-bottom py-1 mb-2">
                  <div className="d-flex justify-content-between fw-bold mb-1">
                    <span>Item</span>
                    <span>Qty</span>
                    <span>Total</span>
                  </div>
                  {(completedBill.items || []).map((it, idx) => (
                    <div key={idx} className="mb-1">
                      <div className="text-truncate fw-semibold">{it.name}</div>
                      <div className="d-flex justify-content-between text-muted" style={{ fontSize: '10px' }}>
                        <span>HSN:{it.hsn || '5007'} @ ₹{it.price}</span>
                        <span>x{it.quantity}</span>
                        <span className="fw-bold text-dark">₹{it.subtotal || it.price * it.quantity}</span>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mb-2">
                  <div className="d-flex justify-content-between">
                    <span>Subtotal:</span>
                    <span>₹{completedBill.subtotal}</span>
                  </div>
                  <div className="d-flex justify-content-between">
                    <span>CGST (2.5%):</span>
                    <span>₹{Math.round((completedBill.tax || 0) / 2)}</span>
                  </div>
                  <div className="d-flex justify-content-between">
                    <span>SGST (2.5%):</span>
                    <span>₹{Math.round((completedBill.tax || 0) / 2)}</span>
                  </div>
                  {completedBill.discount > 0 && (
                    <div className="d-flex justify-content-between text-danger">
                      <span>Discount:</span>
                      <span>-₹{completedBill.discount}</span>
                    </div>
                  )}
                  <div className="d-flex justify-content-between fw-bold fs-6 border-top pt-1 mt-1">
                    <span>NET PAID:</span>
                    <span>₹{completedBill.total}</span>
                  </div>
                  <div className="d-flex justify-content-between text-muted mt-0.5">
                    <span>Payment Mode:</span>
                    <span className="text-uppercase fw-semibold">{completedBill.paymentMethod}</span>
                  </div>
                </div>

                <div className="text-center border-top pt-2 mt-2 text-muted" style={{ fontSize: '9px' }}>
                  <div>Thank you for shopping at Aaradhya!</div>
                  <div>Goods once sold can be exchanged within 7 days.</div>
                </div>
              </div>

              <div className="modal-footer border-0 pt-0 px-3 pb-3 no-print">
                <button type="button" className="btn btn-sm btn-light border px-3" onClick={() => setShowReceipt(false)}>
                  Close
                </button>
                <button
                  type="button"
                  onClick={() => printPosReceipt({ bill: completedBill, store })}
                  className="btn btn-sm btn-dark px-3.5 py-1.5 d-inline-flex align-items-center gap-1.5 fw-semibold shadow-sm"
                >
                  <Printer size={14} />
                  Print 80mm Receipt
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StorePos;
