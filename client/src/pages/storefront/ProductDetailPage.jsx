import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Star,
  ShieldCheck,
  Truck,
  RotateCcw,
  Share2,
  Check,
  Maximize2,
  ChevronDown,
  ChevronUp,
  Banknote,
  Sparkles,
  Info,
  MapPin,
  HelpCircle,
} from 'lucide-react';
import ProductCard from '../../components/common/ProductCard';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import axiosClient from '../../api/axiosClient';

const SIZES = ['XXS', 'XS', 'S', 'M', 'L', 'XL'];

// Size measurements mapping matching Nishorama Image 3
const SIZE_MEASUREMENTS = {
  inches: {
    XXS: { chest: '28-30 inch', waist: '24-26 inch', hip: '30-32 inch' },
    XS: { chest: '30-32 inch', waist: '26-28 inch', hip: '32-34 inch' },
    S: { chest: '32-34 inch', waist: '28-30 inch', hip: '34-36 inch' },
    M: { chest: '34-36 inch', waist: '30-32 inch', hip: '36-38 inch' },
    L: { chest: '36-38 inch', waist: '32-34 inch', hip: '38-40 inch' },
    XL: { chest: '38-40 inch', waist: '34-36 inch', hip: '40-42 inch' },
  },
  cm: {
    XXS: { chest: '71-76 cm', waist: '61-66 cm', hip: '76-81 cm' },
    XS: { chest: '76-81 cm', waist: '66-71 cm', hip: '81-86 cm' },
    S: { chest: '81-86 cm', waist: '71-76 cm', hip: '86-91 cm' },
    M: { chest: '86-91 cm', waist: '76-81 cm', hip: '91-97 cm' },
    L: { chest: '91-97 cm', waist: '81-86 cm', hip: '97-102 cm' },
    XL: { chest: '97-102 cm', waist: '86-91 cm', hip: '102-107 cm' },
  },
};

const ProductDetailPage = () => {
  const { identifier } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { addToCart } = useCart();

  const [product, setProduct] = useState(null);
  const [related, setRelated] = useState([]);
  const [activeImage, setActiveImage] = useState('');
  const [loading, setLoading] = useState(true);
  const [copiedLink, setCopiedLink] = useState(false);
  const [addedToast, setAddedToast] = useState(false);

  // Nishorama Interactive Attributes State (Image 3)
  const [selectedSize, setSelectedSize] = useState('XS');
  const [unitMode, setUnitMode] = useState('inches'); // 'inches' | 'cm'
  const [openAccordion, setOpenAccordion] = useState('details'); // 'details' | 'shipping' | 'returns' | null
  const [showSizeModal, setShowSizeModal] = useState(false);

  // Pincode Delivery Checker
  const [pincode, setPincode] = useState('560001');
  const [pincodeChecked, setPincodeChecked] = useState(false);

  useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true);
      try {
        const res = await axiosClient.get(`/products/${identifier}`);
        if (res.success && res.data) {
          const prodData = res.data.product || res.data;
          setProduct(prodData);
          if (Array.isArray(res.data.relatedProducts)) {
            setRelated(res.data.relatedProducts);
          }
          const defaultImg =
            prodData.images?.[0] ||
            prodData.image ||
            'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=800&auto=format&fit=crop&q=85';
          setActiveImage(defaultImg);
        }
      } catch (err) {
        console.error('Error fetching product detail:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [identifier]);

  if (loading) {
    return (
      <div className="products-page-wrapper storefront-products-bg min-vh-100 d-flex align-items-center justify-content-center py-5">
        <div className="text-center p-5 bg-white rounded-4 shadow-sm" style={{ maxWidth: '360px' }}>
          <div className="spinner-border text-danger mb-3" role="status"></div>
          <h6 className="fw-bold mb-0 text-dark" style={{ fontFamily: 'var(--font-heading-family)' }}>
            Loading Aaradhya Creation...
          </h6>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="products-page-wrapper storefront-products-bg min-vh-100 py-5 text-center">
        <div className="card p-5 border-0 shadow-sm rounded-4 bg-white mx-auto" style={{ maxWidth: '520px' }}>
          <h4 className="fw-bold text-dark mb-2">Product Not Found</h4>
          <p className="text-muted small mb-4">The item you are looking for may have been archived or moved.</p>
          <Link to="/products" className="btn text-white rounded-pill px-4 py-2 fw-semibold" style={{ backgroundColor: '#E90064' }}>
            Explore All Collections
          </Link>
        </div>
      </div>
    );
  }

  const imagesList =
    product.images && product.images.length > 0
      ? product.images
      : [product.image || 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=800&auto=format&fit=crop&q=85'];

  const discount =
    product.discountPercent ||
    (product.mrp && product.mrp > product.price
      ? Math.round(((product.mrp - product.price) / product.mrp) * 100)
      : 0);

  const measurements =
    SIZE_MEASUREMENTS[unitMode]?.[selectedSize] || SIZE_MEASUREMENTS.inches.XS;

  // Add to cart action
  const handleAddToCart = () => {
    if (!user) {
      navigate('/login', {
        state: {
          message: 'Please sign in to add items to your bag.',
          returnUrl: `/product/${product.slug || product._id}`,
        },
      });
      return;
    }

    addToCart(product, 1, { size: selectedSize });
    setAddedToast(true);
    setTimeout(() => setAddedToast(false), 2400);
  };

  // Direct checkout action (BUY IT NOW matching Image 3)
  const handleBuyNow = () => {
    if (!user) {
      navigate('/login', {
        state: {
          message: 'Please sign in to complete your checkout.',
          returnUrl: '/checkout',
        },
      });
      return;
    }

    addToCart(product, 1, { size: selectedSize });
    navigate('/checkout');
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: product.name,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  const toggleAccordion = (name) => {
    setOpenAccordion(openAccordion === name ? null : name);
  };

  return (
    <div className="products-page-wrapper storefront-products-bg min-vh-100 py-3 py-md-4">
      <div className="container-fluid px-3 px-md-4 px-xl-5">
        {/* Main Product Card Container matching Nishorama Image 3 Layout */}
        <div
          className="bg-white rounded-4 shadow-sm p-3 p-md-4 p-xl-5 mb-4"
          style={{
            borderRadius: '26px',
            border: '1px solid #F0E7ED',
          }}
        >
          <div className="pdp-showcase-grid">
            {/* =========================================================
                COLUMN 1 (LEFT): Tags, Rating, Title, Attributes, Specs & Accordions
                ========================================================= */}
            <div className="pdp-col-details d-flex flex-column justify-content-between h-100">
              {/* Top Section */}
              <div>
                {/* Feature Tags */}
                <div className="d-flex flex-wrap gap-1.5 mb-2">
                  <span className="badge rounded-pill bg-light text-dark border px-2.5 py-1 small fw-semibold" style={{ fontSize: '0.72rem' }}>
                    {product.category?.name || 'Handcrafted'}
                  </span>
                  <span className="badge rounded-pill bg-light text-dark border px-2.5 py-1 small fw-semibold" style={{ fontSize: '0.72rem' }}>
                    {product.storeCode === 'AF' ? 'Aaradhya Fabrics' : 'Aaradhya Silks'}
                  </span>
                  <span
                    className="badge rounded-pill px-2.5 py-1 small fw-semibold"
                    style={{ backgroundColor: '#FFF0F6', color: '#E90064', border: '1px solid #FCE7F1', fontSize: '0.72rem' }}
                  >
                    Silk Mark Genuine
                  </span>
                </div>

                {/* Rating Stars */}
                <div className="d-flex align-items-center gap-1.5 mb-2">
                  <div className="d-flex text-warning">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} size={13} fill="#F59E0B" stroke="#F59E0B" />
                    ))}
                  </div>
                  <span className="small fw-bold text-dark" style={{ fontSize: '0.8rem' }}>4.9</span>
                  <span className="text-muted small" style={{ fontSize: '0.76rem' }}>(142 verified reviews)</span>
                </div>

                {/* Product Title */}
                <h1
                  className="fw-bolder mb-2 text-dark"
                  style={{
                    fontFamily: 'var(--font-heading-family)',
                    fontSize: 'clamp(1.35rem, 1.85vw, 1.75rem)',
                    letterSpacing: '-0.3px',
                    lineHeight: 1.25,
                  }}
                >
                  {product.name}
                </h1>

                {/* Editorial Model & Style Attributes */}
                <div className="d-flex flex-column gap-1 text-muted small mb-3 pb-2.5 border-bottom" style={{ fontSize: '0.82rem' }}>
                  <div className="d-flex justify-content-between">
                    <span className="text-secondary fw-medium">Style</span>
                    <span className="text-dark fw-semibold">{product.category?.name || 'Handloom Silhouette'}</span>
                  </div>
                  <div className="d-flex justify-content-between">
                    <span className="text-secondary fw-medium">Color</span>
                    <span className="text-dark fw-semibold">{product.color || 'Heritage Natural'}</span>
                  </div>
                  <div className="d-flex justify-content-between">
                    <span className="text-secondary fw-medium">Model Fit Check</span>
                    <span className="text-dark fw-semibold">Model is wearing {selectedSize} • 5'8"</span>
                  </div>
                </div>

                {/* Weave & Fabric Specifications Grid */}
                <div className="row g-2 mb-3">
                  <div className="col-6">
                    <div className="p-2 rounded-2 bg-light border text-start">
                      <div className="text-muted" style={{ fontSize: '0.66rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Weave Quality</div>
                      <div className="fw-bold text-dark small" style={{ fontSize: '0.78rem' }}>Pure Mulberry Silk</div>
                    </div>
                  </div>
                  <div className="col-6">
                    <div className="p-2 rounded-2 bg-light border text-start">
                      <div className="text-muted" style={{ fontSize: '0.66rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Artisan Origin</div>
                      <div className="fw-bold text-dark small" style={{ fontSize: '0.78rem' }}>Handloom Certified</div>
                    </div>
                  </div>
                  <div className="col-6">
                    <div className="p-2 rounded-2 bg-light border text-start">
                      <div className="text-muted" style={{ fontSize: '0.66rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Wash Care</div>
                      <div className="fw-bold text-dark small" style={{ fontSize: '0.78rem' }}>Dry Clean Recommended</div>
                    </div>
                  </div>
                  <div className="col-6">
                    <div className="p-2 rounded-2 bg-light border text-start">
                      <div className="text-muted" style={{ fontSize: '0.66rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Dispatch</div>
                      <div className="fw-bold text-dark small" style={{ fontSize: '0.78rem' }}>24–48 Business Hrs</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Bottom Section of Left Column: Accordions & Artisan Seal */}
              <div>
                {/* Collapsible Accordions */}
                <div className="product-accordions border-top pt-1 mb-2.5">
                  {/* 1. Details & Description */}
                  <div className="border-bottom py-2">
                    <button
                      type="button"
                      onClick={() => toggleAccordion('details')}
                      className="w-100 bg-transparent border-0 p-0 d-flex justify-content-between align-items-center text-dark text-uppercase fw-bold text-start"
                      style={{ fontSize: '0.76rem', letterSpacing: '0.05em' }}
                    >
                      <span>DETAILS & DESCRIPTION</span>
                      {openAccordion === 'details' ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                    </button>
                    <AnimatePresence>
                      {openAccordion === 'details' && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.2 }}
                          className="overflow-hidden"
                        >
                          <p className="text-secondary small mt-1.5 mb-1.5" style={{ fontSize: '0.78rem', lineHeight: 1.5 }}>
                            {product.description ||
                              'Carefully handcrafted with authentic Indian silk weaves. Features fine zari border embellishments, natural dyes, and breathable handspun threads curated from master artisans.'}
                          </p>
                          <ul className="text-muted small ps-3 mb-0" style={{ fontSize: '0.74rem' }}>
                            <li>100% Genuine Certified Weave</li>
                            <li>Dry clean only for first 2 washes</li>
                            <li>SKU: {product.sku || 'AS-2026-WEAVE'}</li>
                          </ul>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* 2. Shipping & Delivery */}
                  <div className="border-bottom py-2">
                    <button
                      type="button"
                      onClick={() => toggleAccordion('shipping')}
                      className="w-100 bg-transparent border-0 p-0 d-flex justify-content-between align-items-center text-dark text-uppercase fw-bold text-start"
                      style={{ fontSize: '0.76rem', letterSpacing: '0.05em' }}
                    >
                      <span>SHIPPING & DELIVERY</span>
                      {openAccordion === 'shipping' ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                    </button>
                    <AnimatePresence>
                      {openAccordion === 'shipping' && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.2 }}
                          className="overflow-hidden"
                        >
                          <p className="text-secondary small mt-1.5 mb-1" style={{ fontSize: '0.78rem' }}>
                            Standard insured express delivery across all India pincodes:
                          </p>
                          <ul className="text-muted small ps-3 mb-1" style={{ fontSize: '0.74rem' }}>
                            <li>Dispatched within 24-48 business hours</li>
                            <li>Delivery within 3-5 days in metros</li>
                            <li>Free shipping on all prepaid orders over ₹999</li>
                          </ul>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* 3. Return & Exchange */}
                  <div className="border-bottom py-2">
                    <button
                      type="button"
                      onClick={() => toggleAccordion('returns')}
                      className="w-100 bg-transparent border-0 p-0 d-flex justify-content-between align-items-center text-dark text-uppercase fw-bold text-start"
                      style={{ fontSize: '0.76rem', letterSpacing: '0.05em' }}
                    >
                      <span>RETURN & EXCHANGE</span>
                      {openAccordion === 'returns' ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                    </button>
                    <AnimatePresence>
                      {openAccordion === 'returns' && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.2 }}
                          className="overflow-hidden"
                        >
                          <p className="text-secondary small mt-1.5 mb-0" style={{ fontSize: '0.78rem', lineHeight: 1.45 }}>
                            Hassle-free 7-day doorstep return and size exchange. Item must be in original condition with intact Silk Mark tags.
                          </p>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>

                {/* Master Loom Guarantee Seal */}
                <div
                  className="p-2.5 rounded-3 d-flex align-items-center gap-2.5"
                  style={{ backgroundColor: '#FAF7F5', border: '1px solid #F0E7ED' }}
                >
                  <div
                    className="rounded-circle d-flex align-items-center justify-content-center flex-shrink-0"
                    style={{ width: '32px', height: '32px', backgroundColor: '#FFF0F6', color: '#E90064' }}
                  >
                    <Sparkles size={15} />
                  </div>
                  <div>
                    <div className="fw-bold text-dark small" style={{ fontSize: '0.76rem' }}>Master Weavers Loom Guarantee</div>
                    <div className="text-muted" style={{ fontSize: '0.7rem' }}>Authentic handloom craftsmanship direct from Varanasi & Kanchi</div>
                  </div>
                </div>
              </div>
            </div>

            {/* =========================================================
                COLUMN 2 (CENTER): Big Portrait Model Image & Thumbnails
                ========================================================= */}
            <div className="pdp-col-image d-flex flex-column align-items-center h-100">
              <div
                className="position-relative overflow-hidden shadow-2xs border w-100"
                style={{
                  borderRadius: '22px',
                  backgroundColor: '#F8F6F8',
                  height: '520px',
                  maxHeight: '560px',
                }}
              >
                <img
                  src={activeImage}
                  alt={product.name}
                  className="w-100 h-100"
                  style={{ objectFit: 'cover' }}
                />

                {/* Top Badge: Discount or Silk Mark */}
                {discount > 0 && (
                  <span
                    className="cust-choice-badge position-absolute"
                    style={{ top: '14px', left: '14px' }}
                  >
                    {discount}% OFF
                  </span>
                )}

                {/* Zoom / Fullscreen Preview */}
                <button
                  type="button"
                  onClick={() => window.open(activeImage, '_blank')}
                  className="btn btn-sm btn-light rounded-circle position-absolute bottom-0 end-0 m-3 shadow-sm p-2 d-flex align-items-center justify-content-center"
                  style={{ width: '36px', height: '36px' }}
                  title="View full-size photo"
                >
                  <Maximize2 size={16} />
                </button>
              </div>

              {/* Image Thumbnails Strip beneath center image */}
              {imagesList.length > 1 && (
                <div
                  className="d-flex justify-content-center gap-2 overflow-x-auto pb-1 mt-3 w-100 scrollbar-hidden"
                  style={{ scrollbarWidth: 'none', WebkitOverflowScrolling: 'touch' }}
                >
                  {imagesList.map((img, idx) => (
                    <button
                      key={idx}
                      type="button"
                      className={`btn p-0 rounded-3 overflow-hidden flex-shrink-0 ${
                        activeImage === img ? 'border-2 shadow-sm' : 'border'
                      }`}
                      style={{
                        width: '62px',
                        height: '78px',
                        borderColor: activeImage === img ? '#E90064' : '#E5E7EB',
                        borderRadius: '12px',
                        boxShadow: activeImage === img ? '0 2px 8px rgba(233, 0, 100, 0.3)' : 'none',
                      }}
                      onClick={() => setActiveImage(img)}
                    >
                      <img src={img} alt={`Thumb ${idx}`} className="w-100 h-100" style={{ objectFit: 'cover' }} />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* =========================================================
                COLUMN 3 (RIGHT): Measurements, Sizes, Offers, Purchase & Services
                ========================================================= */}
            <div className="pdp-col-purchase d-flex flex-column justify-content-between h-100">
              {/* Top Section */}
              <div>
                {/* Measurement Unit Toggle + What's My Size? */}
                <div className="d-flex align-items-center justify-content-between mb-2">
                  <div className="d-flex align-items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setUnitMode('inches')}
                      className="btn btn-link p-0 text-decoration-none fw-bold small"
                      style={{
                        fontSize: '0.8rem',
                        color: unitMode === 'inches' ? '#E90064' : '#6B7280',
                        borderBottom: unitMode === 'inches' ? '2px solid #E90064' : '2px solid transparent',
                        paddingBottom: '2px',
                      }}
                    >
                      Inches
                    </button>
                    <span className="text-muted small">/</span>
                    <button
                      type="button"
                      onClick={() => setUnitMode('cm')}
                      className="btn btn-link p-0 text-decoration-none fw-bold small"
                      style={{
                        fontSize: '0.8rem',
                        color: unitMode === 'cm' ? '#E90064' : '#6B7280',
                        borderBottom: unitMode === 'cm' ? '2px solid #E90064' : '2px solid transparent',
                        paddingBottom: '2px',
                      }}
                    >
                      CM
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={() => setShowSizeModal(true)}
                    className="btn btn-sm rounded-pill px-3 py-1 small fw-semibold text-white"
                    style={{
                      backgroundColor: '#E90064',
                      borderColor: '#E90064',
                      fontSize: '0.72rem',
                      letterSpacing: '0.02em',
                      boxShadow: '0 2px 8px rgba(233, 0, 100, 0.25)',
                    }}
                  >
                    What's my size?
                  </button>
                </div>

                {/* Dynamic Size Measurements Table */}
                <div
                  className="p-2.5 rounded-3 mb-2.5 bg-light border d-flex flex-column gap-1"
                  style={{ fontSize: '0.8rem', borderColor: '#E5E7EB' }}
                >
                  <div className="d-flex justify-content-between text-muted">
                    <span>Chest</span>
                    <span className="fw-semibold text-dark">{measurements.chest}</span>
                  </div>
                  <div className="d-flex justify-content-between text-muted">
                    <span>High Waist</span>
                    <span className="fw-semibold text-dark">{measurements.waist}</span>
                  </div>
                  <div className="d-flex justify-content-between text-muted">
                    <span>Hip</span>
                    <span className="fw-semibold text-dark">{measurements.hip}</span>
                  </div>
                </div>

                {/* Size Selectors */}
                <div className="mb-3">
                  <div className="d-flex gap-2 flex-wrap">
                    {SIZES.map((size) => {
                      const isSizeActive = selectedSize === size;
                      return (
                        <button
                          key={size}
                          type="button"
                          onClick={() => setSelectedSize(size)}
                          className="btn fw-bold d-flex align-items-center justify-content-center"
                          style={{
                            width: '44px',
                            height: '44px',
                            borderRadius: '12px',
                            backgroundColor: isSizeActive ? '#E90064' : '#FFFFFF',
                            color: isSizeActive ? '#FFFFFF' : '#17233B',
                            border: isSizeActive ? '2px solid #E90064' : '1px solid #D1D5DB',
                            fontSize: '0.85rem',
                            boxShadow: isSizeActive ? '0 4px 14px rgba(233, 0, 100, 0.32)' : 'none',
                            transition: 'all 0.18s ease',
                          }}
                        >
                          {size}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Price Display */}
                <div className="mb-2.5">
                  <div className="d-flex align-items-baseline gap-2">
                    <span
                      className="fw-bolder text-dark"
                      style={{
                        fontFamily: 'var(--font-heading-family)',
                        fontSize: '1.45rem',
                      }}
                    >
                      (₹ {product.price?.toLocaleString('en-IN')})
                    </span>
                    {product.mrp && product.mrp > product.price && (
                      <span className="text-muted text-decoration-line-through small" style={{ fontSize: '0.95rem' }}>
                        ₹{product.mrp?.toLocaleString('en-IN')}
                      </span>
                    )}
                    {discount > 0 && (
                      <span className="badge rounded-pill bg-success-subtle text-success small fw-bold">
                        Save {discount}%
                      </span>
                    )}
                  </div>
                  <small className="text-muted d-block" style={{ fontSize: '0.74rem' }}>
                    Inclusive of all taxes • Handloom certified
                  </small>
                </div>

                {/* Special Festive Offers Strip */}
                <div
                  className="p-2 rounded-3 mb-3 d-flex align-items-center justify-content-between"
                  style={{ backgroundColor: '#FFF0F6', border: '1px dashed #FBCFE8' }}
                >
                  <div className="d-flex align-items-center gap-1.5">
                    <span className="badge rounded-pill text-white" style={{ backgroundColor: '#E90064', fontSize: '0.65rem' }}>
                      OFFER
                    </span>
                    <span className="small fw-semibold text-dark" style={{ fontSize: '0.74rem' }}>
                      Flat 10% OFF code: <strong>FESTIVE10</strong>
                    </span>
                  </div>
                  <span className="badge text-success bg-white border small fw-bold" style={{ fontSize: '0.65rem' }}>
                    APPLIED
                  </span>
                </div>

                {/* Action Buttons (Side by Side matching Nishorama reference) */}
                <div className="d-flex gap-2 mb-3">
                  {/* ADD TO CART */}
                  <button
                    type="button"
                    onClick={handleAddToCart}
                    className="btn flex-fill py-2.5 rounded-pill fw-bold text-uppercase d-flex align-items-center justify-content-center gap-1.5 shadow-2xs"
                    style={{
                      border: '1.5px solid #E90064',
                      color: '#E90064',
                      fontSize: '0.84rem',
                      letterSpacing: '0.04em',
                      backgroundColor: '#FFF0F6',
                      transition: 'all 0.2s ease',
                    }}
                  >
                    {addedToast ? (
                      <>
                        <Check size={16} /> Added
                      </>
                    ) : (
                      'ADD TO CART'
                    )}
                  </button>

                  {/* BUY IT NOW */}
                  <button
                    type="button"
                    onClick={handleBuyNow}
                    className="btn flex-fill py-2.5 rounded-pill fw-bold text-uppercase text-white d-flex align-items-center justify-content-center gap-1.5 shadow-sm"
                    style={{
                      backgroundColor: '#E90064',
                      borderColor: '#E90064',
                      fontSize: '0.84rem',
                      letterSpacing: '0.04em',
                      boxShadow: '0 4px 14px rgba(233, 0, 100, 0.35)',
                      transition: 'all 0.2s ease',
                    }}
                  >
                    BUY IT NOW
                  </button>
                </div>
              </div>

              {/* Bottom Section of Right Column: Pincode, Trust Badges, Share & Stock */}
              <div>
                {/* Pincode Delivery Estimator */}
                <div className="p-2.5 rounded-3 mb-2 bg-light border">
                  <div className="d-flex align-items-center justify-content-between mb-1.5">
                    <span className="d-flex align-items-center gap-1.5 text-dark fw-bold small" style={{ fontSize: '0.76rem' }}>
                      <Truck size={14} style={{ color: '#E90064' }} />
                      <span>Delivery & Services</span>
                    </span>
                    <span className="text-success small fw-semibold" style={{ fontSize: '0.72rem' }}>Free Shipping</span>
                  </div>
                  <div className="input-group input-group-sm mb-1.5">
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Enter 6-digit Pincode"
                      value={pincode}
                      onChange={(e) => {
                        setPincode(e.target.value);
                        setPincodeChecked(false);
                      }}
                      maxLength={6}
                      style={{ fontSize: '0.78rem' }}
                    />
                    <button
                      className="btn text-white px-3 fw-semibold"
                      type="button"
                      style={{ backgroundColor: '#E90064', fontSize: '0.76rem' }}
                      onClick={() => setPincodeChecked(true)}
                    >
                      Check
                    </button>
                  </div>
                  <div className="d-flex flex-column gap-0.5 text-muted" style={{ fontSize: '0.72rem' }}>
                    <span className="text-dark fw-medium">
                      {pincodeChecked ? `✓ Delivery to ${pincode}: Free by Saturday` : '✓ Standard metro delivery within 3–5 business days'}
                    </span>
                    <span>✓ Cash on Delivery available</span>
                  </div>
                </div>

                {/* Trust Badges */}
                <div className="d-flex flex-column gap-1 pt-1 text-muted small mb-2" style={{ fontSize: '0.76rem' }}>
                  <div className="d-flex align-items-center gap-2">
                    <Banknote size={15} className="text-dark flex-shrink-0" />
                    <span className="text-dark fw-medium">Cash On Delivery Available</span>
                  </div>
                  <div className="d-flex align-items-center gap-2">
                    <RotateCcw size={15} className="text-dark flex-shrink-0" />
                    <span className="text-dark fw-medium">Easy 7 Days Returns and Exchange</span>
                  </div>
                </div>

                {/* Share Button & Stock Status */}
                <div className="pt-2 border-top d-flex justify-content-between align-items-center">
                  <button
                    type="button"
                    onClick={handleShare}
                    className="btn btn-sm btn-link p-0 text-muted text-decoration-none d-flex align-items-center gap-1.5 small"
                    style={{ fontSize: '0.76rem' }}
                  >
                    <Share2 size={13} />
                    <span>{copiedLink ? 'Link Copied!' : 'Share Product'}</span>
                  </button>

                  <span className="badge rounded-pill bg-light text-muted border small" style={{ fontSize: '0.68rem' }}>
                    {product.stock > 0 ? 'In Stock' : 'Low Stock'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* You May Also Like (Related Products Grid) */}
        {related.length > 0 && (
          <div className="mt-5">
            <h3
              className="fw-bolder mb-3 text-dark"
              style={{
                fontFamily: 'var(--font-heading-family)',
                fontSize: 'clamp(1.4rem, 2.5vw, 1.9rem)',
              }}
            >
              You May Also Like
            </h3>
            <div className="product-grid-4">
              {related.slice(0, 4).map((p, idx) => (
                <ProductCard key={p._id} product={p} index={idx} />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Size Guide Modal */}
      {showSizeModal && (
        <div
          className="modal fade show d-block"
          tabIndex="-1"
          style={{ backgroundColor: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(4px)', zIndex: 1070 }}
          onClick={() => setShowSizeModal(false)}
        >
          <div className="modal-dialog modal-dialog-centered" onClick={(e) => e.stopPropagation()}>
            <div className="modal-content rounded-4 border-0 shadow-lg p-4">
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h5 className="fw-bold mb-0 text-dark" style={{ fontFamily: 'var(--font-heading-family)' }}>
                  Aaradhya Size Chart
                </h5>
                <button type="button" className="btn-close" onClick={() => setShowSizeModal(false)} />
              </div>
              <div className="table-responsive">
                <table className="table table-bordered table-sm text-center small mb-0">
                  <thead className="table-light">
                    <tr>
                      <th>Size</th>
                      <th>Bust / Chest</th>
                      <th>Waist</th>
                      <th>Hip</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr><td>XXS</td><td>30" (76 cm)</td><td>26" (66 cm)</td><td>32" (81 cm)</td></tr>
                    <tr><td>XS</td><td>32" (81 cm)</td><td>28" (71 cm)</td><td>34" (86 cm)</td></tr>
                    <tr><td>S</td><td>34" (86 cm)</td><td>30" (76 cm)</td><td>36" (91 cm)</td></tr>
                    <tr><td>M</td><td>36" (91 cm)</td><td>32" (81 cm)</td><td>38" (97 cm)</td></tr>
                    <tr><td>L</td><td>38" (97 cm)</td><td>34" (86 cm)</td><td>40" (102 cm)</td></tr>
                    <tr><td>XL</td><td>40" (102 cm)</td><td>36" (91 cm)</td><td>42" (107 cm)</td></tr>
                  </tbody>
                </table>
              </div>
              <p className="text-muted small mt-3 mb-0" style={{ fontSize: '0.76rem' }}>
                * All pure silk sarees come in standard length of 5.5 meters with an attached 0.8 meter blouse piece.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductDetailPage;