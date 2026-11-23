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
  Volume2,
  Download,
  Copy,
  Check,
  Keyboard,
} from 'lucide-react';
import { FaGem, FaScroll } from 'react-icons/fa6';
import AnimatedFaIcon from '../../components/common/AnimatedFaIcon';
import axiosClient from '../../api/axiosClient';

// Synthetic Web Audio API Sound Generator for POS Hardware Scanners
const playPosAudioBeep = (type = 'success') => {
  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);

    if (type === 'success') {
      // Crisp 1800Hz POS confirmation chirp (80ms)
      osc.type = 'sine';
      osc.frequency.setValueAtTime(1800, ctx.currentTime);
      gain.gain.setValueAtTime(0.25, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.08);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.08);
    } else {
      // Low dual error tone (380Hz)
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(380, ctx.currentTime);
      gain.gain.setValueAtTime(0.28, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.18);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.18);
    }
  } catch (e) {
    console.error('POS Audio beep error:', e);
  }
};

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
  const [paymentMode, setPaymentMode] = useState('Cash'); // 'Cash' | 'UPI' | 'Card'
  const [cashTendered, setCashTendered] = useState('');
  const [customer, setCustomer] = useState({ name: 'Walk-in Customer', phone: '' });

  // Last scanned instant banner
  const [lastScannedNotice, setLastScannedNotice] = useState(null);

  // Printable receipt state
  const [completedBill, setCompletedBill] = useState(null);
  const [showPrintModal, setShowPrintModal] = useState(false);
  const [receiptTab, setReceiptTab] = useState('epson_80mm'); // 'epson_80mm' | 'escpos' | 'a4'
  const [copiedEscPos, setCopiedEscPos] = useState(false);

  const barcodeInputRef = useRef(null);
  const customerInputRef = useRef(null);
  const scannerBufferRef = useRef('');
  const lastKeyTimeRef = useRef(0);

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

  // Process barcode string from scanner or manual input
  const processScannedBarcode = async (rawCode) => {
    const code = rawCode.trim();
    if (!code) return;

    // Check in-memory products first for zero-latency addition
    const matched = products.find(
      (p) =>
        (p.barcode && p.barcode.toLowerCase() === code.toLowerCase()) ||
        (p.productId && p.productId.toLowerCase() === code.toLowerCase()) ||
        (p.sku && p.sku.toLowerCase() === code.toLowerCase())
    );

    if (matched) {
      playPosAudioBeep('success');
      addItemToCart(matched);
      setLastScannedNotice({
        success: true,
        name: matched.name,
        code: matched.productId || matched.barcode,
        price: matched.price,
      });
      setTimeout(() => setLastScannedNotice(null), 3000);
      setBarcodeInput('');
      return;
    }

    // Fallback: Query backend API
    try {
      const res = await axiosClient.get(`/pos/scan/${encodeURIComponent(code)}`);
      if (res.success && res.data) {
        playPosAudioBeep('success');
        addItemToCart(res.data);
        setLastScannedNotice({
          success: true,
          name: res.data.name,
          code: res.data.productId || res.data.barcode,
          price: res.data.price,
        });
        setTimeout(() => setLastScannedNotice(null), 3000);
        setBarcodeInput('');
      } else {
        playPosAudioBeep('error');
        setLastScannedNotice({
          success: false,
          message: `Barcode "${code}" not found in ${isSilks ? 'Aaradhya Silks' : 'Aaradhya Fabrics'} inventory`,
        });
        setTimeout(() => setLastScannedNotice(null), 3500);
      }
    } catch (err) {
      playPosAudioBeep('error');
      setLastScannedNotice({
        success: false,
        message: `Scan failed for "${code}": ${err.message || 'Item not found'}`,
      });
      setTimeout(() => setLastScannedNotice(null), 3500);
    }
  };

  // Quick Barcode Form Submit
  const handleBarcodeSubmit = (e) => {
    e.preventDefault();
    if (barcodeInput.trim()) {
      processScannedBarcode(barcodeInput);
    }
  };

  // GLOBAL HARDWARE SCANNER & KEYBOARD SHORTCUT LISTENER
  useEffect(() => {
    const handleGlobalKeyDown = (e) => {
      // 1. Retail Keyboard POS Shortcuts (matching physical counter keyboard in Image 4)
      if (e.key === 'F1') {
        e.preventDefault();
        customerInputRef.current?.focus();
        return;
      }
      if (e.key === 'F2') {
        e.preventDefault();
        barcodeInputRef.current?.focus();
        return;
      }
      if (e.key === 'F4') {
        e.preventDefault();
        setPaymentMode('Cash');
        return;
      }
      if (e.key === 'F8') {
        e.preventDefault();
        setPaymentMode('UPI');
        return;
      }
      if (e.key === 'F9') {
        e.preventDefault();
        setPaymentMode('Card');
        return;
      }
      if (e.key === 'F10' || e.key === 'F12') {
        e.preventDefault();
        if (cartItems.length > 0) {
          handleSaveAndPrintBill();
        }
        return;
      }
      if (e.key === 'Escape') {
        if (showPrintModal) {
          setShowPrintModal(false);
        }
        return;
      }

      // 2. Hardware Barcode Scanner Keystroke Detection (USB/Bluetooth HID mode)
      const now = performance.now();
      const interval = now - lastKeyTimeRef.current;
      lastKeyTimeRef.current = now;

      // When the barcode scanner finishes emitting characters, it sends an Enter key
      if (e.key === 'Enter') {
        const buffered = scannerBufferRef.current.trim();
        if (buffered.length >= 3) {
          e.preventDefault();
          processScannedBarcode(buffered);
        }
        scannerBufferRef.current = '';
        return;
      }

      // Check for rapid consecutive character keystrokes from USB laser/2D scanner
      if (e.key.length === 1) {
        if (interval > 75 && scannerBufferRef.current.length > 0) {
          // If interval is slow human typing and not focused in an input, reset buffer
          scannerBufferRef.current = '';
        }
        scannerBufferRef.current += e.key;
      }
    };

    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, [cartItems, showPrintModal, products, currentStore]);

  // Cart operations
  const addItemToCart = (product) => {
    setCartItems((prev) => {
      const index = prev.findIndex((i) => i._id === product._id);
      if (index > -1) {
        const updated = [...prev];
        if (updated[index].quantity < product.stock) {
          updated[index].quantity += 1;
        } else {
          alert(`Maximum stock (${product.stock}) reached for ${product.name}`);
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
  const taxAmount = Math.round(subtotal * 0.05 * 100) / 100; // 5% apparel GST standard (2.5% CGST + 2.5% SGST)
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
            ? 'Ground Floor, KPHB Main Road, Phase 1, Kukatpally, Hyderabad - 500072'
            : '1st Floor, Textile Galleria, KPHB Colony, Hyderabad - 500072',
          gstin: isSilks ? '36AAAAA1234A1Z5' : '36BBBBB1234B1Z6',
          phone: isSilks ? '+91 98765 11001' : '+91 98765 11002',
          cashier: `Counter ${currentStore}-01`,
        });
        setShowPrintModal(true);
        clearCart();
        fetchCatalog(); // Refresh stock counts immediately
      }
    } catch (err) {
      alert(`POS Error: ${err.message || 'Payment processing failed'}`);
    }
  };

  // Generate ESC/POS commands for Epson TM-T88 / TM-T82
  const generateEscPosText = () => {
    if (!completedBill) return '';
    const dateStr = new Date(completedBill.createdAt || Date.now()).toLocaleString();
    let receipt = '';
    receipt += `[ESC @]                -- Initialize Printer\n`;
    receipt += `[ESC a 1]              -- Align Center\n`;
    receipt += `[ESC E 1]AARADHYA SAREES & SILKS[ESC E 0]\n`;
    receipt += `${completedBill.storeName.toUpperCase()}\n`;
    receipt += `${completedBill.address}\n`;
    receipt += `GSTIN: ${completedBill.gstin} | Tel: ${completedBill.phone}\n`;
    receipt += `------------------------------------------------\n`;
    receipt += `[ESC a 0]              -- Align Left\n`;
    receipt += `BILL NO: ${completedBill.billNumber}  DATE: ${dateStr}\n`;
    receipt += `CASHIER: ${completedBill.cashier || 'Counter 1'}  CUSTOMER: ${completedBill.customer?.name || 'Walk-in'}\n`;
    receipt += `------------------------------------------------\n`;
    receipt += `ITEM                     QTY    RATE      AMOUNT\n`;
    receipt += `------------------------------------------------\n`;
    completedBill.items?.forEach((it) => {
      const name = (it.name || '').substring(0, 22).padEnd(23);
      const qty = String(it.quantity).padStart(3);
      const rate = String(it.price).padStart(8);
      const total = String(it.total || it.price * it.quantity).padStart(10);
      receipt += `${name} ${qty} ${rate} ${total}\n`;
    });
    receipt += `------------------------------------------------\n`;
    receipt += `[ESC a 2]              -- Align Right\n`;
    receipt += `SUBTOTAL: Rs. ${(completedBill.subtotal || 0).toFixed(2)}\n`;
    receipt += `CGST (2.5%): Rs. ${((completedBill.taxAmount || 0) / 2).toFixed(2)}\n`;
    receipt += `SGST (2.5%): Rs. ${((completedBill.taxAmount || 0) / 2).toFixed(2)}\n`;
    if (completedBill.discountAmount > 0) {
      receipt += `DISCOUNT: -Rs. ${(completedBill.discountAmount || 0).toFixed(2)}\n`;
    }
    receipt += `[ESC E 1]NET PAYABLE: Rs. ${(completedBill.totalPayable || 0).toFixed(2)}[ESC E 0]\n`;
    receipt += `------------------------------------------------\n`;
    receipt += `[ESC a 1]              -- Align Center\n`;
    receipt += `PAID VIA: ${completedBill.paymentMode?.toUpperCase()} | REF: OK\n`;
    receipt += `[GS k 4 12]${completedBill.billNumber}  -- Code 128 Return Barcode\n`;
    receipt += `*BILL-${completedBill.billNumber}*\n`;
    receipt += `THANK YOU FOR SHOPPING WITH AARADHYA!\n`;
    receipt += `Exchanges allowed within 7 days with tag intact.\n`;
    receipt += `[GS V 0]               -- Partial Paper Cut\n`;
    receipt += `[ESC p 0 25 250]       -- Kick Cash Drawer RJ11\n`;
    return receipt;
  };

  const handleCopyEscPos = () => {
    navigator.clipboard.writeText(generateEscPosText());
    setCopiedEscPos(true);
    setTimeout(() => setCopiedEscPos(false), 2000);
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
                {isSilks ? 'Aaradhya Silks – Retail Billing Counter' : 'Aaradhya Fabrics – Retail Billing Counter'}
              </div>
              <div className="small opacity-75" style={{ fontSize: '0.72rem' }}>
                Epson 80mm POS Thermal Receipt • Zebra GC420t Tag Scannable • HID Scanner Auto-Detect Active
              </div>
            </div>
          </div>
          <div className="d-flex align-items-center gap-2">
            <span className="badge bg-white text-dark small fw-bold">Store {currentStore}</span>
          </div>
        </div>

        {/* Real-time Scanner Active Notification Toast */}
        {lastScannedNotice && (
          <div
            className={`alert ${lastScannedNotice.success ? 'alert-success border-success' : 'alert-danger border-danger'} py-2 px-3 mb-3 d-flex align-items-center justify-content-between shadow-sm rounded-3`}
            style={{ fontSize: '0.82rem' }}
          >
            <div className="d-flex align-items-center gap-2">
              {lastScannedNotice.success ? (
                <>
                  <CheckCircle2 size={16} className="text-success" />
                  <span>
                    <strong>Scanned:</strong> {lastScannedNotice.name} ({lastScannedNotice.code}) — Added to bill (₹{lastScannedNotice.price})
                  </span>
                </>
              ) : (
                <>
                  <AlertCircle size={16} className="text-danger" />
                  <span>{lastScannedNotice.message}</span>
                </>
              )}
            </div>
            <Volume2 size={15} className="text-muted" title="Audio Chime Emitted" />
          </div>
        )}

        {/* Barcode scanner input bar */}
        <div className="card border-0 shadow-sm p-3 mb-3 bg-white rounded-3">
          <form onSubmit={handleBarcodeSubmit} className="d-flex gap-2">
            <div className="input-group">
              <span className="input-group-text bg-white text-muted">
                <Scan size={18} />
              </span>
              <input
                ref={barcodeInputRef}
                type="text"
                className="form-control"
                placeholder={`Hardware USB Scanner Ready — Or enter ${currentStore}-000001 / Barcode (F2)...`}
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
              <Scan size={16} /> Scan / Add
            </button>
          </form>

          {/* Quick Hardware Keyboard Shortcuts Pill */}
          <div className="d-flex gap-2 mt-2 pt-2 border-top flex-wrap text-muted" style={{ fontSize: '0.72rem' }}>
            <span className="badge bg-light text-dark border">
              <Keyboard size={11} className="me-1" /> POS Shortcuts:
            </span>
            <span><kbd>F1</kbd> Customer Phone</span>
            <span><kbd>F2</kbd> Scan Barcode</span>
            <span><kbd>F4</kbd> Cash</span>
            <span><kbd>F8</kbd> UPI QR</span>
            <span><kbd>F9</kbd> Card</span>
            <span><kbd>F10</kbd> / <kbd>F12</kbd> Pay & Print</span>
          </div>
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
                activeCategory === (c._id || c.slug) ? 'text-white' : 'btn-white border text-dark'
              }`}
              style={
                activeCategory === (c._id || c.slug) ? { backgroundColor: primaryColor, borderColor: primaryColor } : {}
              }
              onClick={() => setActiveCategory(c._id || c.slug)}
            >
              {c.name}
            </button>
          ))}
        </div>

        {/* Search Input Bar */}
        <div className="input-group input-group-sm mb-3">
          <span className="input-group-text bg-white border-end-0">
            <Search size={14} className="text-muted" />
          </span>
          <input
            type="text"
            className="form-control border-start-0"
            placeholder="Search merchandise by title, SKU, or fabric..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <button className="btn btn-outline-secondary" type="button" onClick={() => setSearchQuery('')}>
              <X size={14} />
            </button>
          )}
        </div>

        {/* Products Grid */}
        {loading ? (
          <div className="text-center py-5 text-muted">
            <div className="spinner-border spinner-border-sm me-2 text-primary"></div>
            Loading Store {currentStore} catalog...
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="text-center py-5 text-muted bg-white rounded-3 border">
            <Layers size={36} className="mb-2 opacity-50" />
            <p className="mb-0 fw-semibold">No products match your search or filter.</p>
          </div>
        ) : (
          <div className="row g-2.5 row-cols-2 row-cols-sm-3 row-cols-md-4">
            {filteredProducts.map((p) => {
              const inCartItem = cartItems.find((i) => i._id === p._id);
              const qtyInCart = inCartItem?.quantity || 0;
              return (
                <div key={p._id} className="col">
                  <div
                    className={`card h-100 border p-2 cursor-pointer product-grid-card ${
                      qtyInCart > 0 ? 'border-primary shadow-sm' : ''
                    }`}
                    onClick={() => addItemToCart(p)}
                    style={{ transition: 'all 0.15s ease' }}
                  >
                    <div className="position-relative mb-1.5" style={{ paddingTop: '100%', borderRadius: '6px', overflow: 'hidden' }}>
                      <img
                        src={p.image || p.images?.[0] || 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=300'}
                        alt={p.name}
                        className="position-absolute top-0 start-0 w-100 h-100 object-fit-cover"
                      />
                      {qtyInCart > 0 && (
                        <span
                          className="position-absolute top-0 end-0 badge rounded-pill m-1 text-white fw-bold"
                          style={{ backgroundColor: primaryColor }}
                        >
                          {qtyInCart} in bill
                        </span>
                      )}
                      <span className="position-absolute bottom-0 start-0 badge bg-dark bg-opacity-75 text-white m-1 small">
                        {p.productId || 'AS-000001'}
                      </span>
                    </div>

                    <div className="small fw-bold text-dark text-truncate mb-0.5" title={p.name}>
                      {p.name}
                    </div>

                    <div className="d-flex justify-content-between align-items-center mt-auto pt-1">
                      <div>
                        <span className="fw-bolder text-dark" style={{ fontSize: '0.85rem' }}>
                          ₹{p.price?.toLocaleString('en-IN')}
                        </span>
                        {p.mrp > p.price && (
                          <span className="text-muted text-decoration-line-through small ms-1" style={{ fontSize: '0.72rem' }}>
                            ₹{p.mrp}
                          </span>
                        )}
                      </div>
                      <span className="text-muted small" style={{ fontSize: '0.7rem' }}>
                        {p.stock} left
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* RIGHT: Active Bill Summary & Epson Thermal Checkout Panel */}
      <div className="pos-cart-panel bg-white p-3 p-md-4 rounded-3 shadow-sm border d-flex flex-column justify-content-between">
        <div>
          {/* Header */}
          <div className="d-flex justify-content-between align-items-center border-bottom pb-2 mb-3">
            <div className="d-flex align-items-center gap-2">
              <ShoppingCart size={20} style={{ color: primaryColor }} />
              <h5 className="fw-bold mb-0 text-dark">Current Sale</h5>
              <span className="badge bg-light text-dark border">{cartItems.length} items</span>
            </div>
            {cartItems.length > 0 && (
              <button className="btn btn-outline-danger btn-sm py-0 px-2" onClick={clearCart}>
                Clear
              </button>
            )}
          </div>

          {/* Customer Input (F1 Shortcut) */}
          <div className="card bg-light border-0 p-2.5 mb-3 rounded-3">
            <div className="d-flex align-items-center gap-2 mb-1.5">
              <User size={14} className="text-muted" />
              <span className="small fw-bold text-dark">Customer Details (F1)</span>
            </div>
            <div className="row g-1.5">
              <div className="col-6">
                <input
                  ref={customerInputRef}
                  type="text"
                  className="form-control form-control-sm bg-white"
                  placeholder="Customer Phone"
                  value={customer.phone}
                  onChange={(e) => setCustomer({ ...customer, phone: e.target.value })}
                />
              </div>
              <div className="col-6">
                <input
                  type="text"
                  className="form-control form-control-sm bg-white"
                  placeholder="Customer Name"
                  value={customer.name}
                  onChange={(e) => setCustomer({ ...customer, name: e.target.value })}
                />
              </div>
            </div>
          </div>

          {/* Cart Items List */}
          <div className="cart-items-scroll mb-3" style={{ maxHeight: '280px', overflowY: 'auto' }}>
            {cartItems.length === 0 ? (
              <div className="text-center py-4 text-muted">
                <Scan size={36} className="mb-2 opacity-50" />
                <p className="small mb-0">Scan barcode on garment tag or pick item from catalog.</p>
              </div>
            ) : (
              cartItems.map((item) => (
                <div key={item._id} className="p-2 border-bottom d-flex align-items-center justify-content-between gap-2">
                  <div className="flex-grow-1 text-truncate">
                    <div className="fw-semibold text-dark small text-truncate" title={item.name}>
                      {item.name}
                    </div>
                    <div className="text-muted small" style={{ fontSize: '0.72rem' }}>
                      ID: {item.productId || item.sku} • ₹{item.price} each
                    </div>
                  </div>

                  {/* Quantity Stepper */}
                  <div className="d-flex align-items-center gap-1">
                    <button
                      className="btn btn-sm btn-outline-secondary p-0 d-flex align-items-center justify-content-center"
                      style={{ width: '22px', height: '22px' }}
                      onClick={() => updateItemQty(item._id, item.quantity - 1)}
                    >
                      <Minus size={12} />
                    </button>
                    <span className="fw-bold small px-1">{item.quantity}</span>
                    <button
                      className="btn btn-sm btn-outline-secondary p-0 d-flex align-items-center justify-content-center"
                      style={{ width: '22px', height: '22px' }}
                      onClick={() => updateItemQty(item._id, item.quantity + 1)}
                    >
                      <Plus size={12} />
                    </button>
                  </div>

                  <div className="fw-bold text-dark small text-end" style={{ minWidth: '65px' }}>
                    ₹{(item.price * item.quantity).toLocaleString('en-IN')}
                  </div>

                  <button
                    className="btn btn-sm text-danger p-0 border-0 ms-1"
                    onClick={() => removeItem(item._id)}
                    title="Remove item"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Bill Calculations & Payment */}
        <div className="border-top pt-3">
          <div className="d-flex justify-content-between small text-muted mb-1">
            <span>Subtotal:</span>
            <span className="text-dark fw-semibold">₹{subtotal.toLocaleString('en-IN')}</span>
          </div>
          <div className="d-flex justify-content-between small text-muted mb-1">
            <span>Apparel GST (5%):</span>
            <span className="text-dark fw-semibold">₹{taxAmount.toLocaleString('en-IN')}</span>
          </div>
          <div className="d-flex justify-content-between align-items-center small mb-2">
            <span className="text-muted">Discount (₹):</span>
            <input
              type="number"
              className="form-control form-control-sm text-end"
              style={{ width: '85px', height: '26px' }}
              value={discountAmount}
              min="0"
              onChange={(e) => setDiscountAmount(Math.max(0, Number(e.target.value) || 0))}
            />
          </div>

          <div className="d-flex justify-content-between fw-bolder fs-5 text-dark border-top pt-2 mb-3">
            <span>NET TOTAL:</span>
            <span style={{ color: primaryColor }}>₹{totalPayable.toLocaleString('en-IN')}</span>
          </div>

          {/* Payment Method Selector */}
          <div className="mb-3">
            <label className="form-label text-muted small mb-1">Payment Method</label>
            <div className="btn-group w-100 btn-group-sm">
              <button
                type="button"
                className={`btn ${paymentMode === 'Cash' ? 'btn-dark' : 'btn-outline-secondary'}`}
                onClick={() => setPaymentMode('Cash')}
              >
                Cash (F4)
              </button>
              <button
                type="button"
                className={`btn ${paymentMode === 'UPI' ? 'btn-dark' : 'btn-outline-secondary'}`}
                onClick={() => setPaymentMode('UPI')}
              >
                UPI QR (F8)
              </button>
              <button
                type="button"
                className={`btn ${paymentMode === 'Card' ? 'btn-dark' : 'btn-outline-secondary'}`}
                onClick={() => setPaymentMode('Card')}
              >
                Card (F9)
              </button>
            </div>
          </div>

          {/* Cash Tendered Input */}
          {paymentMode === 'Cash' && (
            <div className="row g-2 mb-3">
              <div className="col-6">
                <label className="form-label text-muted small mb-0" style={{ fontSize: '0.7rem' }}>
                  Cash Tendered (₹)
                </label>
                <input
                  type="number"
                  className="form-control form-control-sm"
                  placeholder={`e.g. ${totalPayable}`}
                  value={cashTendered}
                  onChange={(e) => setCashTendered(e.target.value)}
                />
              </div>
              <div className="col-6">
                <label className="form-label text-muted small mb-0" style={{ fontSize: '0.7rem' }}>
                  Change Due (₹)
                </label>
                <div className="form-control form-control-sm bg-light fw-bold text-success">
                  ₹{changeReturned.toLocaleString('en-IN')}
                </div>
              </div>
            </div>
          )}

          {/* Save & Print Bill CTA */}
          <button
            className="btn w-100 py-2.5 fw-bold d-flex align-items-center justify-content-center gap-2 shadow text-white rounded-3"
            style={{ backgroundColor: primaryColor, borderColor: primaryColor }}
            onClick={handleSaveAndPrintBill}
            disabled={cartItems.length === 0}
          >
            <Printer size={18} /> Complete Sale & Print Epson Receipt (F10 / F12)
          </button>
        </div>
      </div>

      {/* EPSON POS 80mm RECEIPT MODAL */}
      {showPrintModal && completedBill && (
        <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.65)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content rounded-4 p-4 shadow-lg border-0">
              <div className="d-flex justify-content-between align-items-center mb-3">
                <div className="d-flex align-items-center gap-2">
                  <Printer size={20} style={{ color: primaryColor }} />
                  <span className="fw-bold fs-5 text-dark">Epson Thermal Receipt Ready</span>
                </div>
                <button type="button" className="btn-close" onClick={() => setShowPrintModal(false)}></button>
              </div>

              {/* Format Switcher */}
              <div className="btn-group btn-group-sm w-100 mb-3">
                <button
                  className={`btn ${receiptTab === 'epson_80mm' ? 'btn-dark' : 'btn-light border'}`}
                  onClick={() => setReceiptTab('epson_80mm')}
                >
                  Epson 80mm Thermal Receipt
                </button>
                <button
                  className={`btn ${receiptTab === 'escpos' ? 'btn-dark' : 'btn-light border'}`}
                  onClick={() => setReceiptTab('escpos')}
                >
                  Raw ESC/POS Commands
                </button>
              </div>

              {receiptTab === 'epson_80mm' && (
                <div
                  className="p-3 border rounded bg-white font-monospace small mb-3 printable-epson-receipt"
                  style={{
                    maxHeight: '400px',
                    overflowY: 'auto',
                    fontSize: '12px',
                    backgroundColor: '#FFFFFF',
                    color: '#000000',
                    lineHeight: '1.3',
                  }}
                  id="pos-thermal-invoice"
                >
                  {/* Epson Header */}
                  <div className="text-center mb-2">
                    <div className="fw-bolder fs-5 text-uppercase text-dark mb-0.5">
                      AARADHYA
                    </div>
                    <div className="fw-bold text-uppercase" style={{ fontSize: '13px' }}>
                      {completedBill.storeName}
                    </div>
                    <div className="small text-dark">{completedBill.address}</div>
                    <div className="small text-dark">GSTIN: {completedBill.gstin}</div>
                    <div className="small text-dark">Phone: {completedBill.phone}</div>
                    <div className="border-bottom border-dark my-1.5" style={{ borderStyle: 'dashed' }}></div>
                    <div className="fw-bold">TAX INVOICE #{completedBill.billNumber}</div>
                    <div>Date: {new Date(completedBill.createdAt || Date.now()).toLocaleString()}</div>
                    <div>Cashier: {completedBill.cashier} • Customer: {completedBill.customer?.name || 'Walk-in'}</div>
                    <div className="border-bottom border-dark my-1.5" style={{ borderStyle: 'dashed' }}></div>
                  </div>

                  {/* Monospace Columns Header */}
                  <div className="d-flex justify-content-between fw-bold mb-1 border-bottom border-dark pb-0.5">
                    <span style={{ width: '48%' }}>ITEM</span>
                    <span style={{ width: '12%', textAlign: 'center' }}>QTY</span>
                    <span style={{ width: '20%', textAlign: 'right' }}>RATE</span>
                    <span style={{ width: '20%', textAlign: 'right' }}>TOTAL</span>
                  </div>

                  {/* Items List */}
                  <div className="mb-2">
                    {completedBill.items?.map((it, idx) => (
                      <div key={idx} className="mb-1">
                        <div className="fw-semibold text-truncate">{it.name}</div>
                        <div className="d-flex justify-content-between text-muted" style={{ fontSize: '11px' }}>
                          <span style={{ width: '48%' }}>{it.productId || it.sku}</span>
                          <span style={{ width: '12%', textAlign: 'center' }}>{it.quantity}</span>
                          <span style={{ width: '20%', textAlign: 'right' }}>₹{it.price}</span>
                          <span style={{ width: '20%', textAlign: 'right', fontWeight: 'bold', color: '#000' }}>
                            ₹{it.total || it.price * it.quantity}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Totals & Tax Breakdown */}
                  <div className="border-top border-dark pt-1.5" style={{ borderStyle: 'dashed' }}>
                    <div className="d-flex justify-content-between">
                      <span>Subtotal:</span>
                      <span>₹{completedBill.subtotal}</span>
                    </div>
                    <div className="d-flex justify-content-between">
                      <span>CGST (2.5%):</span>
                      <span>₹{(completedBill.taxAmount / 2).toFixed(2)}</span>
                    </div>
                    <div className="d-flex justify-content-between">
                      <span>SGST (2.5%):</span>
                      <span>₹{(completedBill.taxAmount / 2).toFixed(2)}</span>
                    </div>
                    {completedBill.discountAmount > 0 && (
                      <div className="d-flex justify-content-between text-danger">
                        <span>Discount:</span>
                        <span>-₹{completedBill.discountAmount}</span>
                      </div>
                    )}
                    <div className="d-flex justify-content-between fw-bold fs-6 border-top border-dark mt-1 pt-1">
                      <span>NET AMOUNT:</span>
                      <span>₹{completedBill.totalPayable}</span>
                    </div>
                    <div className="d-flex justify-content-between text-muted mt-1" style={{ fontSize: '11px' }}>
                      <span>Payment Mode:</span>
                      <span>{completedBill.paymentMode?.toUpperCase()}</span>
                    </div>
                    {completedBill.paymentMode === 'Cash' && completedBill.paymentDetails?.cashTendered && (
                      <div className="d-flex justify-content-between text-muted" style={{ fontSize: '11px' }}>
                        <span>Tendered / Change:</span>
                        <span>₹{completedBill.paymentDetails.cashTendered} / ₹{completedBill.paymentDetails.changeReturned}</span>
                      </div>
                    )}
                  </div>

                  {/* Return Barcode & Policy (Image 4 format) */}
                  <div className="text-center mt-3 border-top border-dark pt-2" style={{ borderStyle: 'dashed' }}>
                    <div className="fw-bold mb-1">RETURN & EXCHANGE SCAN CODE</div>
                    {/* Code 128 Bill Barcode */}
                    <div className="d-flex flex-column align-items-center my-1">
                      <svg width="180" height="30" viewBox="0 0 180 30" style={{ shapeRendering: 'crispEdges' }}>
                        <rect x="0" y="0" width="180" height="30" fill="#FFFFFF" />
                        {[4, 7, 10, 14, 18, 22, 26, 30, 33, 37, 42, 46, 50, 54, 59, 63, 67, 72, 76, 80, 85, 89, 93, 98, 102, 106, 111, 115, 119, 124, 128, 133, 138, 143, 148, 153, 158, 163, 168].map(
                          (x, idx) => (
                            <rect
                              key={idx}
                              x={x}
                              y="1"
                              width={idx % 3 === 0 ? '3' : idx % 2 === 0 ? '2' : '1'}
                              height="24"
                              fill="#000000"
                            />
                          )
                        )}
                      </svg>
                      <div className="fw-bold mt-0.5" style={{ fontSize: '11px', letterSpacing: '1px' }}>
                        *BILL-{completedBill.billNumber}*
                      </div>
                    </div>
                    <div className="small text-muted mt-1" style={{ fontSize: '10px' }}>
                      Exchange allowed within 7 days with original tag and bill.
                    </div>
                    <div className="small fw-semibold mt-1">THANK YOU FOR VISITING AARADHYA!</div>
                    <div className="text-muted small mt-1">--- AUTO CUT HERE ---</div>
                  </div>
                </div>
              )}

              {receiptTab === 'escpos' && (
                <div className="mb-3">
                  <div className="d-flex justify-content-between align-items-center mb-1">
                    <span className="small text-muted">Epson ESC/POS Byte Sequence:</span>
                    <button className="btn btn-sm btn-outline-dark" onClick={handleCopyEscPos}>
                      <Copy size={13} className="me-1" /> {copiedEscPos ? 'Copied ✓' : 'Copy Commands'}
                    </button>
                  </div>
                  <pre
                    className="p-3 bg-dark text-light rounded-3 font-monospace small mb-0"
                    style={{ maxHeight: '320px', overflowY: 'auto', fontSize: '11px' }}
                  >
                    <code>{generateEscPosText()}</code>
                  </pre>
                </div>
              )}

              <div className="d-flex gap-2">
                <button
                  className="btn flex-grow-1 text-white fw-bold py-2 rounded-pill"
                  style={{ backgroundColor: primaryColor, borderColor: primaryColor }}
                  onClick={() => window.print()}
                >
                  <Printer size={16} className="me-1" /> Print to Epson 80mm
                </button>
                <button className="btn btn-outline-secondary rounded-pill px-4" onClick={() => setShowPrintModal(false)}>
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Embedded CSS for Epson POS 80mm Thermal Receipt Printing */}
      <style>{`
        @media print {
          @page {
            size: 80mm auto;
            margin: 0 !important;
          }
          html, body {
            margin: 0 !important;
            padding: 0 !important;
            width: 80mm !important;
            background: #FFFFFF !important;
          }
          body * {
            visibility: hidden;
          }
          #pos-thermal-invoice, #pos-thermal-invoice * {
            visibility: visible;
          }
          #pos-thermal-invoice {
            position: absolute;
            left: 0;
            top: 0;
            width: 76mm !important;
            padding: 2mm !important;
            margin: 0 !important;
            border: none !important;
            box-shadow: none !important;
          }
        }
      `}</style>
    </div>
  );
};

export default PosTerminal;
