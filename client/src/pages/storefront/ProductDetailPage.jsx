import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  Star,
  ShieldCheck,
  Truck,
  RotateCcw,
  Heart,
  Share2,
  ShoppingCart,
  Zap,
  MapPin,
  CheckCircle2,
  AlertCircle,
  Store,
  Check,
  Maximize2,
  Lock,
  ChevronRight,
  MessageSquare,
  HelpCircle,
  Tag,
  Barcode,
} from 'lucide-react';
import { FaCertificate } from 'react-icons/fa6';
import AnimatedFaIcon from '../../components/common/AnimatedFaIcon';
import ProductCard from '../../components/common/ProductCard';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';
import axiosClient from '../../api/axiosClient';

const ProductDetailPage = () => {
  const { identifier } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { addToCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();

  const [product, setProduct] = useState(null);
  const [related, setRelated] = useState([]);
  const [activeImage, setActiveImage] = useState('');
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [copiedLink, setCopiedLink] = useState(false);
  const [activeTab, setActiveTab] = useState('description');

  // Fashion & Fabrics variant selections
  const [selectedSize, setSelectedSize] = useState('M');
  const [selectedColor, setSelectedColor] = useState('Royal Magenta');

  const colorOptions = [
    { name: 'Royal Magenta', hex: '#E90064' },
    { name: 'Peacock Blue', hex: '#087CE5' },
    { name: 'Emerald Green', hex: '#19B927' },
    { name: 'Mustard Gold', hex: '#D97706' },
    { name: 'Midnight Navy', hex: '#17233B' },
  ];

  const sizeOptions = ['XS', 'S', 'M', 'L', 'XL', 'Free Size'];

  // Delivery Pincode checker state
  const [pincodeInput, setPincodeInput] = useState('560004'); // Bengaluru default
  const [pincodeResult, setPincodeResult] = useState(null);
  const [isChangingPincode, setIsChangingPincode] = useState(false);
  const [checkingPincode, setCheckingPincode] = useState(false);

  useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true);
      try {
        const res = await axiosClient.get(`/products/${identifier}`);
        if (res.success && res.data) {
          const prod = res.data.product;
          setProduct(prod);
          setRelated(res.data.relatedProducts || []);
          setActiveImage(prod.images?.[0] || '');
          if (prod.variants && prod.variants.length > 0) {
            setSelectedVariant(prod.variants[0]);
          }
        }
      } catch (err) {
        console.error('Failed to load product details', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
    window.scrollTo(0, 0);
  }, [identifier]);

  // Handle live delivery pincode check
  const handleCheckPincode = async (e) => {
    e?.preventDefault();
    if (!pincodeInput || pincodeInput.length !== 6) return;

    setCheckingPincode(true);
    try {
      const res = await axiosClient.get(`/shipping/check-pincode/${pincodeInput}`);
      if (res.success) {
        setPincodeResult(res.data);
        setIsChangingPincode(false);
      }
    } catch (err) {
      setPincodeResult({ isServiceable: true, city: 'Bengaluru' });
    } finally {
      setCheckingPincode(false);
    }
  };

  useEffect(() => {
    handleCheckPincode();
  }, []);

  const handleShare = () => {
    navigator.clipboard?.writeText(window.location.href);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  if (loading) {
    return (
      <div className="container py-5 text-center">
        <div className="spinner-border text-primary" style={{ color: '#E90064' }} role="status"></div>
        <p className="mt-2 text-muted">Loading Aaradhya details...</p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="container py-5 text-center">
        <h4>Product Not Found</h4>
        <Link to="/products" className="btn btn-primary mt-3" style={{ backgroundColor: '#E90064', borderColor: '#E90064' }}>
          Browse Catalog
        </Link>
      </div>
    );
  }

  const isSilks = (product.storeCode || 'AS').toUpperCase() === 'AS';
  const storeTitle = isSilks ? 'Aaradhya Silks' : 'Aaradhya Fabrics';
  const storeLocation = isSilks ? 'Basavanagudi, Bengaluru' : 'Commercial Street, Bengaluru';
  const primaryBrandColor = isSilks ? '#E90064' : '#087CE5';

  const currentPrice = selectedVariant?.price || product.price;
  const currentMrp = selectedVariant?.mrp || product.mrp || Math.round(currentPrice * 1.3);
  const discount =
    currentMrp > currentPrice
      ? Math.round(((currentMrp - currentPrice) / currentMrp) * 100)
      : 25;

  const isFavorited = isInWishlist(product._id);

  const handleAddToCart = () => {
    if (!user) {
      navigate('/login', {
        state: {
          message: 'Please sign in to add items to your cart.',
          returnUrl: window.location.pathname,
        },
      });
      return;
    }
    addToCart(
      {
        ...product,
        storeCode: product.storeCode || (isSilks ? 'AS' : 'AF'),
        storeName: storeTitle,
      },
      quantity,
      {
        ...selectedVariant,
        size: selectedSize,
        color: selectedColor,
      }
    );
  };

  const handleBuyNow = () => {
    if (!user) {
      navigate('/login', {
        state: {
          message: 'Please sign in to proceed with your order.',
          returnUrl: window.location.pathname,
        },
      });
      return;
    }
    handleAddToCart();
    navigate('/checkout');
  };

  const imagesList =
    product.images && product.images.length > 0
      ? product.images
      : [
          'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=800&auto=format&fit=crop&q=80',
          'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=800&auto=format&fit=crop&q=80',
          'https://images.unsplash.com/photo-1594223274512-ad4803739b7c?w=800&auto=format&fit=crop&q=80',
        ];

  return (
    <div className="container py-3 py-md-4">
      {/* Breadcrumbs */}
      <nav aria-label="breadcrumb" className="mb-3">
        <ol className="breadcrumb small">
          <li className="breadcrumb-item">
            <Link to="/" className="text-decoration-none text-muted">Home</Link>
          </li>
          <li className="breadcrumb-item">
            <Link to="/products" className="text-decoration-none text-muted">
              Collections
            </Link>
          </li>
          <li className="breadcrumb-item">
            <span className="text-muted">{product.category?.name || 'Fashion'}</span>
          </li>
          <li className="breadcrumb-item active text-truncate fw-semibold text-dark" style={{ maxWidth: '300px' }}>
            {product.name}
          </li>
        </ol>
      </nav>

      {/* Main Product Layout */}
      <div className="card card-modern p-3 p-md-4 mb-4 border shadow-sm rounded-4" style={{ borderRadius: '22px', borderColor: '#F0E7ED' }}>
        <div className="row g-3 g-md-4">
          {/* Left Column: Responsive Thumbnails + Main Stage */}
          <div className="col-12 col-lg-6">
            <div className="d-flex flex-column flex-lg-row gap-2 gap-md-3">
              {/* Desktop Vertical Thumbnails List */}
              <div className="d-none d-lg-flex flex-column gap-2 flex-shrink-0" style={{ width: '68px' }}>
                {imagesList.map((img, idx) => (
                  <button
                    key={idx}
                    type="button"
                    className={`btn p-1 border rounded-2 ${
                      activeImage === img ? 'border-2 shadow-sm' : 'border-light'
                    }`}
                    style={{
                      width: '68px',
                      height: '68px',
                      backgroundColor: '#ffffff',
                      borderColor: activeImage === img ? '#E90064' : '#E2E8F0',
                    }}
                    onClick={() => setActiveImage(img)}
                  >
                    <img
                      src={img}
                      alt={`Thumbnail ${idx}`}
                      style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '4px' }}
                    />
                  </button>
                ))}
              </div>

              {/* Large Main Product Image Stage (Proportionate on Mobile & Laptop) */}
              <div
                className="position-relative rounded-3 rounded-md-4 overflow-hidden flex-grow-1 d-flex align-items-center justify-content-center bg-white border"
                style={{
                  height: 'clamp(300px, 72vw, 450px)',
                  borderColor: '#F0E7ED',
                  backgroundColor: '#FAFAFA',
                  borderRadius: '18px',
                }}
              >
                <img
                  src={activeImage || imagesList[0]}
                  alt={product.name}
                  className="img-fluid p-2"
                  style={{ maxHeight: '100%', maxWidth: '100%', objectFit: 'contain' }}
                />

                {/* Silk Mark Genuine Certified Badge */}
                <span
                  className="badge position-absolute top-0 start-0 m-2.5 m-md-3 bg-white text-dark border shadow-sm d-inline-flex align-items-center gap-1.5"
                  style={{ fontSize: '0.72rem', padding: '0.35rem 0.65rem', borderRadius: '999px' }}
                >
                  <AnimatedFaIcon icon={FaCertificate} size={11} color="#E90064" animation="pulse" />
                  <span>100% Authentic Handloom</span>
                </span>

                {/* Expand / Zoom icon */}
                <button
                  className="btn btn-light btn-sm position-absolute bottom-0 end-0 m-2.5 m-md-3 rounded-circle shadow-sm p-2 d-flex align-items-center justify-content-center"
                  style={{ width: '36px', height: '36px' }}
                  title="Zoom Image"
                  onClick={() => window.open(activeImage || imagesList[0], '_blank')}
                >
                  <Maximize2 size={16} className="text-secondary" />
                </button>
              </div>

              {/* Mobile Horizontal Thumbnails Strip (Appears beneath main image on mobile) */}
              {imagesList.length > 1 && (
                <div
                  className="d-flex d-lg-none gap-2 overflow-x-auto pb-1 mt-1 scrollbar-hidden"
                  style={{
                    scrollbarWidth: 'none',
                    msOverflowStyle: 'none',
                    WebkitOverflowScrolling: 'touch',
                  }}
                >
                  {imagesList.map((img, idx) => (
                    <button
                      key={idx}
                      type="button"
                      className={`btn p-1 border rounded-2 flex-shrink-0 ${
                        activeImage === img ? 'border-2 shadow-sm' : 'border-light'
                      }`}
                      style={{
                        width: '56px',
                        height: '56px',
                        backgroundColor: '#ffffff',
                        borderColor: activeImage === img ? '#E90064' : '#E2E8F0',
                      }}
                      onClick={() => setActiveImage(img)}
                    >
                      <img
                        src={img}
                        alt={`Thumbnail ${idx}`}
                        style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '4px' }}
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* 4 Value Proposition Badges (2x2 on Mobile, 4 in a row on Desktop) */}
            <div className="row g-2 mt-2 pt-2.5 border-top text-center">
              <div className="col-6 col-md-3">
                <div className="p-2 rounded-3 bg-light border h-100 d-flex flex-column align-items-center justify-content-center">
                  <ShieldCheck size={17} className="text-success mb-1" />
                  <span className="fw-semibold text-dark" style={{ fontSize: '0.72rem' }}>Silk Mark Certified</span>
                </div>
              </div>
              <div className="col-6 col-md-3">
                <div className="p-2 rounded-3 bg-light border h-100 d-flex flex-column align-items-center justify-content-center">
                  <RotateCcw size={17} className="text-primary mb-1" />
                  <span className="fw-semibold text-dark" style={{ fontSize: '0.72rem' }}>7-Day Exchange</span>
                </div>
              </div>
              <div className="col-6 col-md-3">
                <div className="p-2 rounded-3 bg-light border h-100 d-flex flex-column align-items-center justify-content-center">
                  <Truck size={17} className="text-success mb-1" />
                  <span className="fw-semibold text-dark" style={{ fontSize: '0.72rem' }}>Free Shipping ₹999+</span>
                </div>
              </div>
              <div className="col-6 col-md-3">
                <div className="p-2 rounded-3 bg-light border h-100 d-flex flex-column align-items-center justify-content-center">
                  <Lock size={17} className="text-danger mb-1" />
                  <span className="fw-semibold text-dark" style={{ fontSize: '0.72rem' }}>Genuine Handloom</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Title, Ratings, Pricing, Variants & Controls */}
          <div className="col-12 col-lg-6">
            {/* Top row: Category tag & Share/Wishlist buttons */}
            <div className="d-flex align-items-center justify-content-between mb-2">
              <div className="d-flex align-items-center gap-2">
                <span className="badge bg-light text-dark border" style={{ fontSize: '0.72rem', padding: '0.3rem 0.6rem' }}>
                  AARADHYA • {product.category?.name || 'Exclusive Edit'}
                </span>
                <span className="badge bg-success bg-opacity-10 text-success" style={{ fontSize: '0.7rem' }}>
                  ✓ In Stock
                </span>
              </div>
              <div className="d-flex align-items-center gap-2">
                <button
                  className="btn btn-light btn-sm rounded-circle p-2 border"
                  onClick={handleShare}
                  title="Share Product"
                >
                  <Share2 size={16} className="text-muted" />
                </button>
                <button
                  className={`btn btn-light btn-sm rounded-circle p-2 border ${isFavorited ? 'text-danger' : 'text-muted'}`}
                  onClick={() => {
                    if (!user) {
                      navigate('/login', {
                        state: {
                          message: 'Please sign in to save items to your wishlist.',
                          returnUrl: window.location.pathname,
                        },
                      });
                      return;
                    }
                    toggleWishlist(product);
                  }}
                  title="Wishlist"
                >
                  <Heart size={16} fill={isFavorited ? '#E90064' : 'none'} color={isFavorited ? '#E90064' : 'currentColor'} />
                </button>
              </div>
            </div>

            {copiedLink && (
              <div className="alert alert-success py-1 px-2 small mb-2 text-center" style={{ fontSize: '0.75rem' }}>
                Product link copied to clipboard!
              </div>
            )}

            {/* Product Title */}
            <h1 className="fw-bolder mb-2 text-dark" style={{ letterSpacing: '-0.3px', fontSize: 'clamp(1.25rem, 2.8vw, 1.85rem)', lineHeight: 1.25 }}>
              {product.name}
            </h1>

            {/* Ratings & Sold counts */}
            <div className="d-flex align-items-center gap-2 mb-3 small text-muted">
              <div className="d-flex align-items-center gap-1">
                <Star size={15} fill="#F59E0B" color="#F59E0B" />
                <span className="fw-bold text-dark">{product.rating || 4.8}</span>
                <span>({product.reviewCount?.toLocaleString() || '1,240'} reviews)</span>
              </div>
              <span className="mx-1 opacity-50">|</span>
              <span className="text-success fw-semibold">Ready for Express Dispatch</span>
            </div>

            {/* Price Section */}
            <div className="mb-3 pb-3 border-bottom">
              <div className="d-flex align-items-baseline gap-3 mb-1">
                <span className="fw-bolder" style={{ color: primaryBrandColor, letterSpacing: '-0.8px', fontSize: 'clamp(1.75rem, 4vw, 2.4rem)' }}>
                  ₹{currentPrice?.toLocaleString()}
                </span>
                {currentMrp > currentPrice && (
                  <span className="fs-5 text-muted text-decoration-line-through">
                    ₹{currentMrp?.toLocaleString()}
                  </span>
                )}
                {discount > 0 && (
                  <span className="badge badge-discount fs-6 fw-bold">
                    {discount}% OFF
                  </span>
                )}
              </div>
              <div className="text-muted small">Inclusive of 5% Apparel GST</div>
            </div>

            {/* Colour Swatch Selector */}
            <div className="mb-3">
              <div className="small fw-semibold text-dark mb-2">
                Colour: <span className="text-muted fw-normal">{selectedColor}</span>
              </div>
              <div className="d-flex gap-2 align-items-center">
                {colorOptions.map((c) => (
                  <button
                    key={c.name}
                    type="button"
                    className={`rounded-circle border p-0 ${selectedColor === c.name ? 'ring-2' : ''}`}
                    style={{
                      width: '28px',
                      height: '28px',
                      backgroundColor: c.hex,
                      outline: selectedColor === c.name ? `3px solid ${c.hex}` : 'none',
                      outlineOffset: '2px',
                    }}
                    onClick={() => setSelectedColor(c.name)}
                    title={c.name}
                  />
                ))}
              </div>
            </div>

            {/* Available Sizes Pills */}
            <div className="mb-3">
              <div className="d-flex justify-content-between align-items-center mb-2">
                <span className="small fw-semibold text-dark">Available Sizes:</span>
                <span className="small text-primary cursor-pointer fw-semibold" style={{ fontSize: '0.75rem' }}>Size Guide</span>
              </div>
              <div className="d-flex gap-2 flex-wrap">
                {sizeOptions.map((sz) => (
                  <button
                    key={sz}
                    type="button"
                    className={`btn btn-sm rounded-pill px-3 py-1 fw-bold ${
                      selectedSize === sz ? 'text-white' : 'btn-light border text-dark'
                    }`}
                    style={{
                      backgroundColor: selectedSize === sz ? primaryBrandColor : '#ffffff',
                      borderColor: selectedSize === sz ? primaryBrandColor : '#E2E8F0',
                      fontSize: '0.78rem',
                    }}
                    onClick={() => setSelectedSize(sz)}
                  >
                    {sz}
                  </button>
                ))}
              </div>
            </div>

            {/* Deliver To Pincode Card */}
            <div className="p-3 rounded-3 bg-light border mb-4">
              <div className="d-flex justify-content-between align-items-center mb-1">
                <div className="d-flex align-items-center gap-2">
                  <MapPin size={16} style={{ color: '#E90064' }} />
                  <span className="small fw-semibold text-dark">
                    Deliver to {pincodeResult?.city || 'Bengaluru'} - {pincodeInput}
                  </span>
                </div>
                <button
                  type="button"
                  className="btn btn-link btn-sm p-0 text-decoration-none fw-semibold"
                  style={{ color: '#E90064' }}
                  onClick={() => setIsChangingPincode(!isChangingPincode)}
                >
                  Change
                </button>
              </div>

              {isChangingPincode ? (
                <form onSubmit={handleCheckPincode} className="d-flex gap-2 mt-2">
                  <input
                    type="text"
                    maxLength={6}
                    className="form-control form-control-sm"
                    placeholder="Enter 6-digit Pincode"
                    value={pincodeInput}
                    onChange={(e) => setPincodeInput(e.target.value.replace(/\D/g, ''))}
                  />
                  <button
                    type="submit"
                    className="btn btn-sm px-3 text-white fw-bold"
                    style={{ backgroundColor: '#E90064', borderColor: '#E90064' }}
                    disabled={checkingPincode}
                  >
                    {checkingPincode ? 'Checking...' : 'Check'}
                  </button>
                </form>
              ) : (
                <div className="small text-muted ps-4" style={{ fontSize: '0.78rem' }}>
                  Standard dispatch in 24 hours | <span className="text-success fw-semibold">FREE Shipping</span>
                </div>
              )}
            </div>

            {/* Action Buttons: Responsive for Mobile & Laptop */}
            <div className="d-flex flex-column flex-sm-row align-items-stretch gap-2 mb-2">
              <div className="d-flex align-items-center gap-2 flex-grow-1">
                {/* Stepper */}
                <div className="input-group" style={{ width: '105px' }}>
                  <button
                    className="btn btn-outline-secondary btn-sm"
                    type="button"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    disabled={quantity <= 1}
                  >
                    -
                  </button>
                  <input
                    type="text"
                    className="form-control form-control-sm text-center fw-bold bg-white"
                    value={quantity}
                    readOnly
                  />
                  <button
                    className="btn btn-outline-secondary btn-sm"
                    type="button"
                    onClick={() => setQuantity(Math.min(product.stock || 10, quantity + 1))}
                    disabled={quantity >= (product.stock || 10)}
                  >
                    +
                  </button>
                </div>

                {/* Add to Bag */}
                <button
                  className="btn flex-grow-1 py-2.5 fw-bold d-flex align-items-center justify-content-center gap-2 shadow-sm rounded-pill text-white"
                  style={{ backgroundColor: '#E90064', borderColor: '#E90064' }}
                  onClick={handleAddToCart}
                  disabled={product.stock <= 0}
                >
                  <ShoppingCart size={18} /> Add to Bag
                </button>
              </div>

              {/* Buy Now (Full width on small mobile, auto on desktop) */}
              <button
                className="btn py-2.5 px-4 fw-bold d-flex align-items-center justify-content-center gap-2 rounded-pill"
                style={{ borderColor: '#E90064', color: '#E90064', border: '1.5px solid #E90064' }}
                onClick={handleBuyNow}
                disabled={product.stock <= 0}
              >
                <Zap size={18} /> Buy Now
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Product Information Tabs */}
      <div className="card card-modern p-3 p-md-4 mb-4 mb-md-5 border shadow-sm rounded-4" style={{ borderRadius: '20px', borderColor: '#F0E7ED' }}>
        <ul className="nav nav-tabs border-bottom mb-3 mb-md-4 flex-nowrap overflow-x-auto scrollbar-hidden" role="tablist" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
          <li className="nav-item">
            <button
              className={`nav-link fw-bold px-3 px-md-4 py-2 text-nowrap ${activeTab === 'description' ? 'active' : 'text-muted'}`}
              onClick={() => setActiveTab('description')}
              style={activeTab === 'description' ? { borderBottom: '2.5px solid #E90064', color: '#E90064', fontSize: '0.88rem' } : { fontSize: '0.88rem' }}
            >
              Description & Craft
            </button>
          </li>
          <li className="nav-item">
            <button
              className={`nav-link fw-bold px-3 px-md-4 py-2 text-nowrap ${activeTab === 'specifications' ? 'active' : 'text-muted'}`}
              onClick={() => setActiveTab('specifications')}
              style={activeTab === 'specifications' ? { borderBottom: '2.5px solid #E90064', color: '#E90064', fontSize: '0.88rem' } : { fontSize: '0.88rem' }}
            >
              Fabric Specifications
            </button>
          </li>
          <li className="nav-item">
            <button
              className={`nav-link fw-bold px-3 px-md-4 py-2 text-nowrap ${activeTab === 'reviews' ? 'active' : 'text-muted'}`}
              onClick={() => setActiveTab('reviews')}
              style={activeTab === 'reviews' ? { borderBottom: '2.5px solid #E90064', color: '#E90064', fontSize: '0.88rem' } : { fontSize: '0.88rem' }}
            >
              Customer Reviews ({product.reviewCount || 1240})
            </button>
          </li>
        </ul>

        {activeTab === 'description' && (
          <div>
            <h5 className="fw-bold text-dark mb-3">About this creation</h5>
            <p className="text-secondary mb-4" style={{ maxWidth: '850px', lineHeight: '1.7' }}>
              {product.description ||
                'Crafted with heritage artisan weaving techniques, this exquisite piece features pure zari work, intricate temple border detailing, and luxurious drape.'}
            </p>

            <div className="row g-4 align-items-center">
              <div className="col-md-7">
                <div className="d-flex flex-column gap-2 mb-3">
                  {[
                    '100% Authentic Handloom Pure Silk / Natural Fabric certified with Silk Mark',
                    'Intricate zari pallu and contrast border detailing',
                    'Soft, breathable texture suitable for weddings, festive occasions and celebrations',
                    'Comes with unstitched matching blouse / lining fabric piece',
                    'Directly sourced from traditional master weavers of South India',
                  ].map((feature, i) => (
                    <div key={i} className="d-flex align-items-center gap-2">
                      <div className="rounded-circle bg-success bg-opacity-10 text-success p-1 d-flex align-items-center justify-content-center">
                        <Check size={14} />
                      </div>
                      <span className="text-dark small fw-medium">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Brand Promo Box */}
              <div className="col-md-5">
                <div
                  className="rounded-4 p-4 text-white position-relative overflow-hidden shadow-sm"
                  style={{
                    background: 'linear-gradient(135deg, #17233B 0%, #E90064 100%)',
                    minHeight: '170px',
                  }}
                >
                  <span className="badge bg-white text-dark mb-2">Exclusive Edition</span>
                  <h4 className="fw-bold mb-1">Aaradhya Fashion & Fabrics</h4>
                  <p className="small text-white-50 mb-0">
                    Heritage South Indian Weaves • Handpicked Perfection
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'specifications' && (
          <div className="table-responsive">
            <table className="table table-bordered table-sm small">
              <tbody>
                <tr>
                  <td className="bg-light fw-semibold text-secondary" style={{ width: '30%' }}>Brand</td>
                  <td className="fw-bold">AARADHYA – Fashion & Fabrics</td>
                </tr>
                <tr>
                  <td className="bg-light fw-semibold text-secondary">Fabric Material</td>
                  <td>{product.fabricType || 'Pure Handloom Silk / Chanderi Cotton'}</td>
                </tr>
                <tr>
                  <td className="bg-light fw-semibold text-secondary">Certification</td>
                  <td><span className="badge bg-success bg-opacity-10 text-success fw-bold">Silk Mark Certified Authentic</span></td>
                </tr>
                <tr>
                  <td className="bg-light fw-semibold text-secondary">Weave Type</td>
                  <td>Traditional Handloom Artisan Weave</td>
                </tr>
                <tr>
                  <td className="bg-light fw-semibold text-secondary">Wash & Care Instructions</td>
                  <td>Dry Clean Only to preserve natural luster and zari shine</td>
                </tr>
                <tr>
                  <td className="bg-light fw-semibold text-secondary">GST Tax Rate</td>
                  <td>5% Apparel GST (included in price)</td>
                </tr>
              </tbody>
            </table>
          </div>
        )}

        {activeTab === 'reviews' && (
          <div>
            <div className="d-flex align-items-center gap-3 mb-4 p-3 bg-light rounded-3">
              <div className="text-center pe-3 border-end">
                <div className="fs-2 fw-bold text-dark">{product.rating || 4.8}</div>
                <div className="d-flex text-warning">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} size={14} fill="#F59E0B" />
                  ))}
                </div>
                <small className="text-muted">{product.reviewCount || 1240} Verified Buyers</small>
              </div>
              <div className="flex-grow-1">
                <div className="d-flex align-items-center gap-2 small text-muted mb-1">
                  <span>5 ★</span>
                  <div className="progress flex-grow-1" style={{ height: '6px' }}>
                    <div className="progress-bar bg-success" style={{ width: '88%' }}></div>
                  </div>
                  <span>88%</span>
                </div>
                <div className="d-flex align-items-center gap-2 small text-muted">
                  <span>4 ★</span>
                  <div className="progress flex-grow-1" style={{ height: '6px' }}>
                    <div className="progress-bar" style={{ width: '10%', backgroundColor: '#E90064' }}></div>
                  </div>
                  <span>10%</span>
                </div>
              </div>
            </div>

            <div className="d-flex flex-column gap-3">
              <div className="border-bottom pb-3">
                <div className="d-flex justify-content-between mb-1">
                  <strong className="text-dark small">Deepika Ramanathan</strong>
                  <span className="text-muted small">Verified Purchase • 3 days ago</span>
                </div>
                <div className="d-flex text-warning mb-1">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} size={12} fill="#F59E0B" />
                  ))}
                </div>
                <p className="text-secondary small mb-0">
                  The silk luster and zari work are beyond beautiful! Real silk mark authenticity and pristine packaging from Aaradhya Silks. Delivered in Bengaluru in just 2 days.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Similar Products Section */}
      <div className="mb-4">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h4 className="fw-bold mb-0 text-dark">You May Also Like</h4>
          <Link to="/products" className="fw-semibold small text-decoration-none" style={{ color: '#E90064' }}>
            View Full Collection &gt;
          </Link>
        </div>

        {/* 7 per row on big screen */}
        <div className="product-grid-7">
          {(related.length > 0 ? related : [...Array(7)].map(() => product)).slice(0, 7).map((item, idx) => (
            <ProductCard key={item._id || idx} product={item} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default ProductDetailPage;