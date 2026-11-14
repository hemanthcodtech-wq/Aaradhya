import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  User,
  Heart,
  ShoppingBag,
  ChevronDown,
  ChevronRight,
  LogOut,
  Phone,
  Flame,
  ArrowRight,
  TrendingUp,
  X,
  Truck,
  Tag,
  Menu,
  LayoutGrid,
  ShieldCheck,
  Package,
  MapPin,
  Clock,
  Sparkles,
} from 'lucide-react';
import { FaTruckFast, FaTags, FaGem, FaScroll, FaWhatsapp, FaCertificate, FaStore } from 'react-icons/fa6';
import AnimatedFaIcon from './AnimatedFaIcon';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';
import axiosClient from '../../api/axiosClient';

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const { totalItemCount } = useCart();
  const { wishlistCount } = useWishlist();

  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [categories, setCategories] = useState([]);
  const [showAccountMenu, setShowAccountMenu] = useState(false);
  const [showCategoriesDropdown, setShowCategoriesDropdown] = useState(false);
  const [activeNavDropdown, setActiveNavDropdown] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [drawerExpandedCat, setDrawerExpandedCat] = useState(null);
  const [showPortalsInDrawer, setShowPortalsInDrawer] = useState(false);
  const [isSearching, setIsSearching] = useState(false);

  const searchRef = useRef(null);
  const mobileSearchRef = useRef(null);
  const accountRef = useRef(null);
  const categoriesRef = useRef(null);
  const searchInputRef = useRef(null);

  const trendingKeywords = [
    'Pure Kanjeevaram Saree',
    'Anarkali Kurti',
    'Banarasi Silk Saree',
    'Chanderi Dress Material',
    'Organic Cotton Fabric',
    'Raw Silk Men Kurta',
    'Linen Shirting',
  ];

  // Load categories
  useEffect(() => {
    const fetchCats = async () => {
      try {
        const res = await axiosClient.get('/categories');
        if (res.success) setCategories(res.data);
      } catch (err) {
        console.error('Failed to load categories', err);
      }
    };
    fetchCats();
  }, []);

  // Fetch live suggestions as user types
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSuggestions([]);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    const timer = setTimeout(async () => {
      try {
        const res = await axiosClient.get(`/products?search=${encodeURIComponent(searchQuery.trim())}&limit=6`);
        if (res.success) {
          setSuggestions(res.data || []);
        }
      } catch (err) {
        console.error('Failed to load search suggestions', err);
      } finally {
        setIsSearching(false);
      }
    }, 180);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Handle outside clicks
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target) && (!mobileSearchRef.current || !mobileSearchRef.current.contains(e.target))) {
        setShowSuggestions(false);
      }
      if (accountRef.current && !accountRef.current.contains(e.target)) {
        setShowAccountMenu(false);
      }
      if (categoriesRef.current && !categoriesRef.current.contains(e.target)) {
        setShowCategoriesDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close menus on route change
  useEffect(() => {
    setMobileMenuOpen(false);
    setActiveNavDropdown(null);
    setShowSuggestions(false);
    setShowCategoriesDropdown(false);
  }, [location.pathname]);

  // Lock body scroll when mobile drawer is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileMenuOpen]);

  const handleSearchSubmit = (e) => {
    e?.preventDefault();
    if (searchQuery.trim()) {
      setShowSuggestions(false);
      navigate(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const handleSelectKeyword = (keyword) => {
    setSearchQuery(keyword);
    setShowSuggestions(false);
    navigate(`/products?search=${encodeURIComponent(keyword)}`);
  };

  const handleSelectProduct = (product) => {
    setShowSuggestions(false);
    setSearchQuery('');
    navigate(`/product/${product.slug || product._id}`);
  };

  const isHomeActive = location.pathname === '/';

  return (
    <>
      {/* Sticky Main Navigation Header */}
      <header className="sticky-top bg-white border-bottom shadow-sm" style={{ zIndex: 1025 }}>
        {/* 1. Top Announcement Bar */}
        <div
          className="py-1 px-3 text-white text-nowrap"
          style={{
            backgroundColor: '#E90064',
            fontSize: '0.78rem',
            letterSpacing: '0.02em',
          }}
        >
          <div className="container d-flex justify-content-between align-items-center">
            <div className="d-flex align-items-center gap-2 overflow-hidden text-truncate w-100 justify-content-center justify-content-sm-start">
              <span className="d-none d-sm-inline-flex align-items-center gap-1.5 fw-medium text-truncate">
                <AnimatedFaIcon icon={FaTruckFast} size={13} color="#FFFFFF" animation="bounce-subtle" />
                <span>Free Shipping on Orders Above ₹999</span>
              </span>
              <span className="opacity-50 d-none d-sm-inline">|</span>
              <span className="d-none d-sm-inline-flex align-items-center gap-1.5 fw-semibold text-truncate">
                <AnimatedFaIcon icon={FaTags} size={13} color="#B8E000" animation="pulse" />
                <span>New Arrivals – Up to 50% OFF!</span>
              </span>

              {/* Mobile Announcement (Crisp & Animated Fa Icons) */}
              <span className="d-sm-none text-truncate fw-semibold text-center small d-inline-flex align-items-center justify-content-center gap-1.5" style={{ fontSize: '0.74rem' }}>
                <AnimatedFaIcon icon={FaTruckFast} size={11} color="#FFFFFF" animation="bounce-subtle" />
                <span>Free Shipping ₹999+</span>
                <span className="opacity-50">|</span>
                <AnimatedFaIcon icon={FaTags} size={11} color="#B8E000" animation="pulse" />
                <span>Up to 50% OFF</span>
              </span>
            </div>

            <div className="d-none d-sm-flex align-items-center gap-2 gap-md-3 flex-shrink-0 ms-2">
              <Link to="/orders/track" className="text-white text-decoration-none hover-underline small">
                Track Order
              </Link>
              <span className="opacity-50">|</span>
              <Link to="/contact" className="text-white text-decoration-none hover-underline small">
                Help
              </Link>

              {/* Subtle Portal dropdown for Admin / POS */}
              <span className="opacity-50 d-none d-lg-inline">|</span>
              <div className="dropdown d-none d-lg-inline-block">
                <span
                  className="cursor-pointer text-white-50 hover-text-white small"
                  style={{ cursor: 'pointer', fontSize: '0.72rem' }}
                  data-bs-toggle="dropdown"
                  id="portalDropdown"
                >
                  Portals ▾
                </span>
                <ul className="dropdown-menu dropdown-menu-end shadow border-0 p-1 small" aria-labelledby="portalDropdown">
                  <li><Link to="/admin/login" className="dropdown-item py-1 fw-bold" style={{ color: '#E90064' }}>Admin Portal Login</Link></li>
                  <li><hr className="dropdown-divider my-1" /></li>
                  <li><Link to="/silks/admin" className="dropdown-item py-1">Silks Admin</Link></li>
                  <li><Link to="/fabrics/admin" className="dropdown-item py-1">Fabrics Admin</Link></li>
                  <li><Link to="/admin" className="dropdown-item py-1">Super Admin</Link></li>
                  <li><hr className="dropdown-divider my-1" /></li>
                  <li><Link to="/pos?store=AS" className="dropdown-item py-1">Silks POS Terminal</Link></li>
                  <li><Link to="/pos?store=AF" className="dropdown-item py-1">Fabrics POS Terminal</Link></li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* 2. Main Row: Logo, Centered Search Bar, Action Controls */}
      <div className="main-navbar-row py-2 py-md-2.5 bg-white border-bottom">
        <div className="container d-flex align-items-center justify-content-between gap-2 gap-md-4">
          {/* Mobile Hamburger Button */}
          <button
            className="navbar-toggler border-0 p-1 d-lg-none text-dark flex-shrink-0"
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle navigation"
          >
            <Menu size={24} />
          </button>

          {/* Corrected & Prominently Visible Aaradhya Logo */}
          <Link to="/" className="d-flex align-items-center gap-2 gap-sm-2.5 text-decoration-none flex-shrink-0">
            <img
              src="/logo.jpeg"
              alt="AARADHYA"
              className="rounded-2"
              style={{
                height: '48px',
                width: 'auto',
                objectFit: 'contain',
              }}
            />
            <div className="d-flex flex-column justify-content-center">
              <span
                className="fw-bolder"
                style={{
                  color: '#E90064',
                  fontSize: '1.38rem',
                  letterSpacing: '0.04em',
                  lineHeight: 1.05,
                  fontFamily: 'system-ui, -apple-system, sans-serif',
                }}
              >
                AARADHYA
              </span>
              <span
                className="fw-bold"
                style={{
                  fontSize: '0.62rem',
                  letterSpacing: '0.2em',
                  textTransform: 'uppercase',
                  color: '#17233B',
                }}
              >
                Fashion & Fabrics
              </span>
            </div>
          </Link>

          {/* Centered Wide Search Bar with Increased Search Icon (Desktop) */}
          <div
            className="d-none d-lg-block flex-grow-1 mx-auto position-relative"
            ref={searchRef}
            style={{ maxWidth: '540px' }}
          >
            <form onSubmit={handleSearchSubmit} className="position-relative">
              <input
                ref={searchInputRef}
                type="text"
                className="form-control rounded-pill border"
                style={{
                  borderColor: showSuggestions ? '#E90064' : '#F0E7ED',
                  height: '46px',
                  paddingLeft: '1.35rem',
                  paddingRight: '3.6rem',
                  fontSize: '0.92rem',
                  boxShadow: showSuggestions ? '0 0 0 3px rgba(233, 0, 100, 0.12)' : 'none',
                  transition: 'all 0.2s ease',
                  backgroundColor: '#FFFFFF',
                }}
                placeholder="Search for sarees, kurtis, dress materials, fabrics..."
                value={searchQuery}
                onFocus={() => setShowSuggestions(true)}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setShowSuggestions(true);
                }}
              />

              {searchQuery && (
                <button
                  type="button"
                  className="btn btn-link position-absolute top-50 translate-middle-y text-muted p-0"
                  style={{ right: '46px' }}
                  onClick={() => {
                    setSearchQuery('');
                    searchInputRef.current?.focus();
                  }}
                >
                  <X size={16} />
                </button>
              )}

              {/* Increased Bold Search Icon Button in Aaradhya Magenta */}
              <button
                type="submit"
                className="btn position-absolute top-50 end-0 translate-middle-y rounded-circle text-white d-flex align-items-center justify-content-center shadow-sm"
                style={{
                  backgroundColor: '#E90064',
                  borderColor: '#E90064',
                  width: '39px',
                  height: '39px',
                  marginRight: '4px',
                  transition: 'transform 0.15s ease',
                }}
                aria-label="Search"
              >
                <Search size={22} strokeWidth={2.6} />
              </button>
            </form>

            {/* Rich Autocomplete Search Suggestions Dropdown */}
            {showSuggestions && (
              <div
                className="position-absolute start-0 end-0 mt-2 bg-white rounded-4 shadow-lg border p-3 z-3"
                style={{
                  maxHeight: '440px',
                  overflowY: 'auto',
                  borderColor: '#E2E8F0',
                  boxShadow: '0 12px 28px rgba(15, 23, 42, 0.12)',
                }}
              >
                {!searchQuery.trim() && (
                  <div>
                    <div className="d-flex align-items-center gap-1.5 text-muted small fw-bold mb-2">
                      <Flame size={14} className="text-danger" />
                      <span>TRENDING SEARCHES</span>
                    </div>

                    <div className="d-flex flex-wrap gap-2 mb-3">
                      {trendingKeywords.map((kw, i) => (
                        <button
                          key={i}
                          type="button"
                          className="btn btn-sm btn-light border rounded-pill px-3 py-1 small fw-medium text-dark d-flex align-items-center gap-1.5"
                          style={{ fontSize: '0.78rem', backgroundColor: '#F8FAFC' }}
                          onClick={() => handleSelectKeyword(kw)}
                        >
                          <TrendingUp size={12} className="text-primary" />
                          <span>{kw}</span>
                        </button>
                      ))}
                    </div>

                    <div className="border-top pt-2">
                      <div className="text-muted small fw-bold mb-2" style={{ fontSize: '0.72rem' }}>
                        POPULAR CATEGORIES
                      </div>
                      <div className="d-flex flex-wrap gap-1.5">
                        {categories.slice(0, 6).map((cat) => (
                          <Link
                            key={cat._id}
                            to={`/category/${cat.slug}`}
                            className="badge bg-light text-dark border text-decoration-none px-2.5 py-1.5 small fw-medium"
                            onClick={() => setShowSuggestions(false)}
                          >
                            {cat.name}
                          </Link>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {searchQuery.trim() && (
                  <div>
                    {isSearching ? (
                      <div className="py-3 text-center text-muted small">
                        <div className="spinner-border spinner-border-sm text-danger me-2" role="status"></div>
                        Searching clothing...
                      </div>
                    ) : suggestions.length > 0 ? (
                      <div>
                        <div className="d-flex justify-content-between align-items-center text-muted small fw-bold px-1 mb-2">
                          <span style={{ fontSize: '0.72rem' }}>MATCHING PRODUCTS</span>
                          <span style={{ fontSize: '0.72rem' }}>{suggestions.length} items found</span>
                        </div>

                        <div className="d-flex flex-column gap-1">
                          {suggestions.map((p) => (
                            <div
                              key={p._id}
                              className="d-flex align-items-center justify-content-between p-2 rounded-3 cursor-pointer text-decoration-none text-dark transition-all"
                              style={{ cursor: 'pointer', backgroundColor: '#ffffff' }}
                              onClick={() => handleSelectProduct(p)}
                              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#FFF5F8')}
                              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#ffffff')}
                            >
                              <div className="d-flex align-items-center gap-2.5 overflow-hidden">
                                <img
                                  src={p.images?.[0] || 'https://via.placeholder.com/44'}
                                  alt={p.name}
                                  style={{
                                    width: '42px',
                                    height: '42px',
                                    objectFit: 'cover',
                                    borderRadius: '6px',
                                    backgroundColor: '#F8FAFC',
                                  }}
                                />
                                <div className="overflow-hidden">
                                  <div className="text-truncate fw-semibold small text-dark" style={{ fontSize: '0.85rem' }}>
                                    {p.name}
                                  </div>
                                  <div className="text-muted small d-flex align-items-center gap-2" style={{ fontSize: '0.72rem' }}>
                                    <span className="badge bg-light text-muted border py-0.5">{p.category?.name || 'Fashion'}</span>
                                  </div>
                                </div>
                              </div>

                              <div className="text-end ps-2 flex-shrink-0">
                                <div className="fw-bold small" style={{ fontSize: '0.9rem', color: '#E90064' }}>
                                  ₹{p.price?.toLocaleString()}
                                </div>
                                {p.mrp && p.mrp > p.price && (
                                  <div className="text-muted text-decoration-line-through small" style={{ fontSize: '0.7rem' }}>
                                    ₹{p.mrp?.toLocaleString()}
                                  </div>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>

                        <div className="border-top pt-2 mt-2 text-center">
                          <button
                            type="button"
                            className="btn btn-link btn-sm fw-semibold text-decoration-none d-flex align-items-center justify-content-center gap-1 mx-auto"
                            style={{ color: '#E90064' }}
                            onClick={handleSearchSubmit}
                          >
                            <span>See all results for "{searchQuery}"</span>
                            <ArrowRight size={14} />
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="py-4 text-center">
                        <p className="text-muted small mb-2">No clothing found for "{searchQuery}"</p>
                        <button
                          type="button"
                          className="btn btn-outline-danger btn-sm rounded-pill px-3"
                          onClick={() => {
                            setShowSuggestions(false);
                            navigate('/products');
                          }}
                        >
                          Browse All Catalog
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Right Action Controls: Products, Login/Register, Wishlist, Cart (Cleanly Aligned, NO Overlap) */}
          <div className="d-flex align-items-center gap-1 gap-sm-2 flex-shrink-0">
            {/* Direct Products Page Link placed in header space */}
            <Link
              to="/products"
              className="btn btn-sm rounded-pill px-3 py-1.5 fw-semibold small d-none d-md-inline-flex align-items-center gap-1.5 me-1 text-decoration-none transition-all"
              style={{
                backgroundColor: location.pathname === '/products' ? '#E90064' : '#FFF0F5',
                color: location.pathname === '/products' ? '#FFFFFF' : '#E90064',
                border: '1px solid #F0E7ED',
                fontSize: '0.84rem',
              }}
            >
              <ShoppingBag size={14} />
              <span>Products</span>
            </Link>

            {/* Direct Login & Register Buttons (when not logged in) */}
            {!user ? (
              <div className="d-none d-sm-flex align-items-center gap-2 me-1">
                <Link
                  to="/login"
                  className="btn btn-sm rounded-pill px-3 py-1.5 fw-semibold small"
                  style={{
                    borderColor: '#E90064',
                    color: '#E90064',
                    border: '1px solid #E90064',
                    fontSize: '0.84rem',
                  }}
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="btn btn-sm rounded-pill px-3 py-1.5 fw-semibold small text-white shadow-sm"
                  style={{
                    backgroundColor: '#E90064',
                    borderColor: '#E90064',
                    fontSize: '0.84rem',
                  }}
                >
                  Register
                </Link>
              </div>
            ) : (
              /* User Account Dropdown (when logged in) */
              <div className="position-relative me-1" ref={accountRef}>
                <button
                  type="button"
                  className="btn btn-light btn-sm d-flex align-items-center gap-1.5 border-0 bg-transparent py-1 px-2 text-dark"
                  onClick={() => setShowAccountMenu(!showAccountMenu)}
                >
                  <div
                    className="rounded-circle d-flex align-items-center justify-content-center text-white"
                    style={{ width: '32px', height: '32px', backgroundColor: '#E90064' }}
                  >
                    <User size={16} />
                  </div>
                  <span className="small fw-semibold d-none d-md-inline" style={{ fontSize: '0.85rem' }}>
                    {user.name?.split(' ')[0]}
                  </span>
                  <ChevronDown size={13} className="text-muted" />
                </button>

                {showAccountMenu && (
                  <div
                    className="dropdown-menu show shadow-lg border-0 p-2 position-absolute end-0 mt-1 z-3"
                    style={{ width: '220px' }}
                  >
                    <div className="px-3 py-2 border-bottom mb-1">
                      <div className="fw-bold small text-dark">{user.name}</div>
                      <div className="text-muted text-truncate" style={{ fontSize: '0.72rem' }}>
                        {user.email}
                      </div>
                    </div>
                    <Link
                      to="/customer/profile"
                      className="dropdown-item rounded-2 py-1.5 small"
                      onClick={() => setShowAccountMenu(false)}
                    >
                      My Profile
                    </Link>
                    <Link
                      to="/customer/orders"
                      className="dropdown-item rounded-2 py-1.5 small"
                      onClick={() => setShowAccountMenu(false)}
                    >
                      My Orders
                    </Link>
                    <Link
                      to="/wishlist"
                      className="dropdown-item rounded-2 py-1.5 small"
                      onClick={() => setShowAccountMenu(false)}
                    >
                      My Wishlist
                    </Link>
                    <div className="dropdown-divider my-1"></div>
                    <button
                      className="dropdown-item rounded-2 py-1.5 small text-danger d-flex align-items-center gap-1.5"
                      onClick={() => {
                        logout();
                        setShowAccountMenu(false);
                      }}
                    >
                      <LogOut size={13} /> Sign Out
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Wishlist Icon - Requires login; badge only renders if logged in and count > 0 */}
            <Link
              to={user ? "/wishlist" : "/login"}
              state={!user ? { returnUrl: '/wishlist', message: 'Please sign in to access your Wishlist.' } : undefined}
              className="position-relative d-inline-flex align-items-center justify-content-center text-dark text-decoration-none"
              style={{ width: '38px', height: '38px', borderRadius: '50%' }}
              title="Saved Wishlist"
            >
              <Heart size={22} strokeWidth={1.9} />
              {user && wishlistCount > 0 && (
                <span
                  className="position-absolute rounded-circle text-white fw-bold d-flex align-items-center justify-content-center"
                  style={{
                    top: '2px',
                    right: '2px',
                    backgroundColor: '#E90064',
                    fontSize: '0.62rem',
                    minWidth: '17px',
                    height: '17px',
                    padding: '0 3px',
                    border: '2px solid #FFFFFF',
                    lineHeight: 1,
                  }}
                >
                  {wishlistCount}
                </span>
              )}
            </Link>

            {/* Cart Icon / Bag - Requires login; badge only renders if logged in and count > 0 */}
            <Link
              to={user ? "/cart" : "/login"}
              state={!user ? { returnUrl: '/cart', message: 'Please sign in to access your Bag.' } : undefined}
              className="position-relative d-inline-flex align-items-center justify-content-center text-dark text-decoration-none"
              style={{ width: '38px', height: '38px', borderRadius: '50%' }}
              title="Shopping Cart"
            >
              <ShoppingBag size={22} strokeWidth={1.9} />
              {user && totalItemCount > 0 && (
                <span
                  className="position-absolute rounded-circle text-white fw-bold d-flex align-items-center justify-content-center"
                  style={{
                    top: '2px',
                    right: '2px',
                    backgroundColor: '#E90064',
                    fontSize: '0.62rem',
                    minWidth: '17px',
                    height: '17px',
                    padding: '0 3px',
                    border: '2px solid #FFFFFF',
                    lineHeight: 1,
                  }}
                >
                  {totalItemCount}
                </span>
              )}
            </Link>
          </div>
        </div>

        {/* Mobile Search Row (visible on mobile only) */}
        <div className="container d-lg-none pt-2" ref={mobileSearchRef}>
          <form onSubmit={handleSearchSubmit} className="position-relative">
            <input
              type="text"
              className="form-control rounded-pill ps-3 pe-5 border"
              style={{
                borderColor: showSuggestions ? '#E90064' : '#F0E7ED',
                height: '40px',
                fontSize: '0.88rem',
              }}
              placeholder="Search sarees, kurtis, fabrics..."
              value={searchQuery}
              onFocus={() => setShowSuggestions(true)}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setShowSuggestions(true);
              }}
            />
            <button
              type="submit"
              className="btn position-absolute top-50 end-0 translate-middle-y me-1 rounded-circle text-white d-flex align-items-center justify-content-center shadow-sm"
              style={{
                backgroundColor: '#E90064',
                borderColor: '#E90064',
                width: '35px',
                height: '35px',
              }}
              aria-label="Search mobile"
            >
              <Search size={20} strokeWidth={2.6} />
            </button>
          </form>
        </div>
      </div>

      {/* 3. Sub-Navbar Below: Categories, Home, Fashion Men/Women/Kids, Sarees, Fabrics, About, Contact */}
      <div className="sub-navbar-row d-none d-lg-block bg-white border-bottom py-1.5 position-relative" style={{ zIndex: 1020 }}>
        <div className="container d-flex align-items-center justify-content-between">
          <div className="d-flex align-items-center gap-1 gap-xl-2 text-nowrap">
            {/* All Categories Dropdown Trigger */}
            <div className="dropdown position-relative" ref={categoriesRef} style={{ zIndex: 1030 }}>
              <button
                type="button"
                className="btn btn-sm rounded-pill px-3 py-1.5 fw-semibold d-flex align-items-center gap-1.5 text-white shadow-sm"
                style={{
                  backgroundColor: '#17233B',
                  fontSize: '0.82rem',
                }}
                onClick={() => setShowCategoriesDropdown(!showCategoriesDropdown)}
              >
                <LayoutGrid size={14} />
                <span>All Categories</span>
                <ChevronDown size={12} />
              </button>

              {showCategoriesDropdown && (
                <div
                  className="dropdown-menu show shadow-lg border-0 p-2 position-absolute start-0 mt-1"
                  style={{
                    width: '270px',
                    maxHeight: '440px',
                    overflowY: 'auto',
                    backgroundColor: '#FFFFFF',
                    borderRadius: '16px',
                    boxShadow: '0 16px 40px rgba(23, 35, 59, 0.18)',
                    border: '1px solid #F0E7ED',
                    zIndex: 1050,
                  }}
                >
                  <div className="px-2 py-1 text-muted small fw-bold" style={{ fontSize: '0.7rem' }}>
                    SHOP BY CATEGORY
                  </div>
                  {categories.map((cat) => (
                    <Link
                      key={cat._id}
                      to={`/category/${cat.slug}`}
                      className="dropdown-item rounded-2 py-1.5 d-flex align-items-center justify-content-between small"
                      onClick={() => setShowCategoriesDropdown(false)}
                    >
                      <span>{cat.name}</span>
                      {cat.productCount > 0 && (
                        <span className="badge bg-light text-muted" style={{ fontSize: '0.68rem' }}>
                          {cat.productCount}
                        </span>
                      )}
                    </Link>
                  ))}
                  <div className="dropdown-divider my-1"></div>
                  <Link
                    to="/categories"
                    className="dropdown-item text-center fw-bold py-1.5 small"
                    style={{ color: '#E90064' }}
                    onClick={() => setShowCategoriesDropdown(false)}
                  >
                    View All Categories →
                  </Link>
                </div>
              )}
            </div>

            {/* Home Pill */}
            <Link
              to="/"
              className={`text-decoration-none px-3 py-1.5 rounded-pill fw-semibold small transition-all ${
                isHomeActive ? 'text-white' : 'text-dark hover-bg-light'
              }`}
              style={{
                backgroundColor: isHomeActive ? '#E90064' : 'transparent',
                fontSize: '0.86rem',
              }}
            >
              Home
            </Link>

            {/* Products Page Pill */}
            <Link
              to="/products"
              className={`text-decoration-none px-3 py-1.5 rounded-pill fw-semibold small transition-all ${
                location.pathname === '/products' ? 'text-white' : 'text-dark hover-bg-light'
              }`}
              style={{
                backgroundColor: location.pathname === '/products' ? '#E90064' : 'transparent',
                fontSize: '0.86rem',
              }}
            >
              Products
            </Link>

            {/* Men Dropdown */}
            <div
              className="dropdown position-relative"
              onMouseEnter={() => setActiveNavDropdown('men')}
              onMouseLeave={() => setActiveNavDropdown(null)}
            >
              <button
                type="button"
                className="btn btn-link text-decoration-none text-dark fw-semibold small py-1.5 px-2 d-flex align-items-center gap-1 border-0"
                style={{ fontSize: '0.86rem' }}
                onClick={() => navigate('/products?category=mens-wear')}
              >
                <span>Men</span>
                <ChevronDown size={13} className="text-muted" />
              </button>
              {activeNavDropdown === 'men' && (
                <div
                  className="dropdown-menu show shadow-lg border-0 p-2 position-absolute start-0 z-3"
                  style={{ minWidth: '200px', top: '100%' }}
                >
                  <Link to="/products?category=mens-wear" className="dropdown-item py-1.5 small rounded-2">
                    All Men's Wear
                  </Link>
                  <Link to="/products?search=kurta" className="dropdown-item py-1.5 small rounded-2">
                    Raw Silk & Cotton Kurtas
                  </Link>
                  <Link to="/products?search=shirt" className="dropdown-item py-1.5 small rounded-2">
                    Linen & Formal Shirts
                  </Link>
                  <Link to="/products?search=dhoti" className="dropdown-item py-1.5 small rounded-2">
                    Traditional Dhotis
                  </Link>
                  <Link to="/products?search=shirting" className="dropdown-item py-1.5 small rounded-2">
                    Suiting & Shirting Fabrics
                  </Link>
                </div>
              )}
            </div>

            {/* Women Dropdown */}
            <div
              className="dropdown position-relative"
              onMouseEnter={() => setActiveNavDropdown('women')}
              onMouseLeave={() => setActiveNavDropdown(null)}
            >
              <button
                type="button"
                className="btn btn-link text-decoration-none text-dark fw-semibold small py-1.5 px-2 d-flex align-items-center gap-1 border-0"
                style={{ fontSize: '0.86rem' }}
                onClick={() => navigate('/category/sarees')}
              >
                <span>Women</span>
                <ChevronDown size={13} className="text-muted" />
              </button>
              {activeNavDropdown === 'women' && (
                <div
                  className="dropdown-menu show shadow-lg border-0 p-2 position-absolute start-0 z-3"
                  style={{ minWidth: '230px', top: '100%' }}
                >
                  <Link to="/category/sarees" className="dropdown-item py-1.5 small rounded-2 fw-semibold text-danger">
                    Pure Silk Sarees (Kanchi & Banarasi)
                  </Link>
                  <Link to="/category/kurtis" className="dropdown-item py-1.5 small rounded-2">
                    Designer Kurtis & Tunics
                  </Link>
                  <Link to="/category/dresses" className="dropdown-item py-1.5 small rounded-2">
                    Festive Dresses & Gowns
                  </Link>
                  <Link to="/category/dress-materials" className="dropdown-item py-1.5 small rounded-2">
                    Unstitched Dress Materials
                  </Link>
                  <Link to="/category/fabrics" className="dropdown-item py-1.5 small rounded-2">
                    Designer Running Fabrics
                  </Link>
                </div>
              )}
            </div>

            {/* Kids Dropdown */}
            <div
              className="dropdown position-relative"
              onMouseEnter={() => setActiveNavDropdown('kids')}
              onMouseLeave={() => setActiveNavDropdown(null)}
            >
              <button
                type="button"
                className="btn btn-link text-decoration-none text-dark fw-semibold small py-1.5 px-2 d-flex align-items-center gap-1 border-0"
                style={{ fontSize: '0.86rem' }}
                onClick={() => navigate('/products?category=kids-wear')}
              >
                <span>Kids</span>
                <ChevronDown size={13} className="text-muted" />
              </button>
              {activeNavDropdown === 'kids' && (
                <div
                  className="dropdown-menu show shadow-lg border-0 p-2 position-absolute start-0 z-3"
                  style={{ minWidth: '190px', top: '100%' }}
                >
                  <Link to="/products?category=kids-wear" className="dropdown-item py-1.5 small rounded-2">
                    All Kids Wear
                  </Link>
                  <Link to="/products?search=pattu+pavadai" className="dropdown-item py-1.5 small rounded-2">
                    Girls Pattu Pavadai & Frocks
                  </Link>
                  <Link to="/products?search=boys+kurta" className="dropdown-item py-1.5 small rounded-2">
                    Boys Ethnic Kurta Sets
                  </Link>
                </div>
              )}
            </div>

            {/* Direct Popular Category Links */}
            <Link
              to="/category/sarees"
              className="text-decoration-none px-2 py-1.5 text-dark fw-medium small hover-underline"
              style={{ fontSize: '0.86rem' }}
            >
              Sarees
            </Link>

            <Link
              to="/category/kurtis"
              className="text-decoration-none px-2 py-1.5 text-dark fw-medium small hover-underline"
              style={{ fontSize: '0.86rem' }}
            >
              Kurtis
            </Link>

            <Link
              to="/category/dress-materials"
              className="text-decoration-none px-2 py-1.5 text-dark fw-medium small hover-underline"
              style={{ fontSize: '0.86rem' }}
            >
              Dress Materials
            </Link>

            <Link
              to="/category/fabrics"
              className="text-decoration-none px-2 py-1.5 text-dark fw-medium small hover-underline"
              style={{ fontSize: '0.86rem' }}
            >
              Fabrics
            </Link>

            <Link
              to="/products?deal=flash"
              className="text-decoration-none px-2 py-1.5 fw-bold small text-danger d-flex align-items-center gap-1 hover-underline"
              style={{ fontSize: '0.86rem' }}
            >
              <Flame size={13} />
              <span>Offers</span>
            </Link>

            <Link
              to="/about"
              className="text-decoration-none px-2 py-1.5 text-secondary fw-medium small hover-underline"
              style={{ fontSize: '0.86rem' }}
            >
              About Us
            </Link>

            <Link
              to="/contact"
              className="text-decoration-none px-2 py-1.5 text-secondary fw-medium small hover-underline"
              style={{ fontSize: '0.86rem' }}
            >
              Contact Us
            </Link>
          </div>

          {/* Right Side Info */}
          <div className="d-flex align-items-center gap-3 text-muted small ms-3 flex-shrink-0" style={{ fontSize: '0.78rem' }}>
            <span className="d-flex align-items-center gap-1.5 text-nowrap">
              <Phone size={13} style={{ color: '#E90064' }} />
              <span>Customer Care: +91 98765 11001</span>
            </span>
          </div>
        </div>
      </div>
      </header>

      {/* 3. Full Mobile Drawer Navigation (Comprehensive, Overlays Everything) */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <div
            className="d-lg-none position-fixed top-0 start-0 w-100 h-100"
            style={{ backgroundColor: 'rgba(15, 23, 42, 0.65)', backdropFilter: 'blur(4px)', zIndex: 1090 }}
            onClick={() => setMobileMenuOpen(false)}
          >
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ duration: 0.28, ease: [0.25, 1, 0.5, 1] }}
              className="bg-white h-100 shadow-lg d-flex flex-column"
              style={{ width: '320px', maxWidth: '88vw', zIndex: 1095 }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Drawer Header with Logo & Close */}
              <div className="p-3 border-bottom d-flex align-items-center justify-content-between bg-white">
                <Link to="/" className="d-flex align-items-center gap-2 text-decoration-none" onClick={() => setMobileMenuOpen(false)}>
                  <img
                    src="/logo.jpeg"
                    alt="AARADHYA"
                    style={{ height: '38px', width: 'auto', objectFit: 'contain' }}
                  />
                  <div>
                    <strong className="d-block text-danger small" style={{ color: '#E90064', fontSize: '1.05rem', lineHeight: 1.1 }}>
                      AARADHYA
                    </strong>
                    <span className="text-muted fw-bold" style={{ fontSize: '0.58rem', letterSpacing: '0.18em' }}>
                      FASHION & FABRICS
                    </span>
                  </div>
                </Link>
                <button
                  type="button"
                  className="btn btn-light rounded-circle p-1.5 d-flex align-items-center justify-content-center text-dark border-0"
                  style={{ width: '32px', height: '32px', backgroundColor: '#F8F6F8' }}
                  onClick={() => setMobileMenuOpen(false)}
                  aria-label="Close menu"
                >
                  <X size={18} />
                </button>
              </div>

              {/* User Account / Sign In Prompt */}
              <div className="p-3 border-bottom" style={{ backgroundColor: '#FFF5F9' }}>
                {!user ? (
                  <div>
                    <div className="small fw-semibold text-dark mb-2" style={{ fontSize: '0.8rem' }}>
                      Welcome! Sign in for exclusive handloom deals
                    </div>
                    <div className="d-flex gap-2">
                      <Link
                        to="/login"
                        className="btn btn-sm flex-grow-1 rounded-pill fw-semibold text-white shadow-2xs"
                        style={{ backgroundColor: '#E90064', fontSize: '0.82rem' }}
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        Sign In
                      </Link>
                      <Link
                        to="/register"
                        className="btn btn-sm flex-grow-1 rounded-pill fw-semibold bg-white"
                        style={{ borderColor: '#E90064', color: '#E90064', border: '1px solid #E90064', fontSize: '0.82rem' }}
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        Register
                      </Link>
                    </div>
                  </div>
                ) : (
                  <div>
                    <div className="d-flex align-items-center gap-2 mb-2">
                      <div
                        className="rounded-circle d-flex align-items-center justify-content-center text-white fw-bold"
                        style={{ width: '34px', height: '34px', backgroundColor: '#E90064', fontSize: '0.85rem' }}
                      >
                        {user.name?.[0]?.toUpperCase() || 'U'}
                      </div>
                      <div className="overflow-hidden">
                        <strong className="d-block text-dark small text-truncate" style={{ fontSize: '0.85rem' }}>
                          Hi, {user.name}
                        </strong>
                        <span className="text-muted d-block text-truncate" style={{ fontSize: '0.68rem' }}>
                          {user.email}
                        </span>
                      </div>
                    </div>
                    <div className="d-flex gap-1.5 mt-2">
                      <Link
                        to="/customer/orders"
                        className="btn btn-sm btn-white border rounded-pill py-1 px-2.5 small flex-grow-1 text-dark fw-medium text-center"
                        style={{ fontSize: '0.74rem' }}
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        Orders
                      </Link>
                      <Link
                        to="/wishlist"
                        className="btn btn-sm btn-white border rounded-pill py-1 px-2.5 small flex-grow-1 text-dark fw-medium text-center"
                        style={{ fontSize: '0.74rem' }}
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        Wishlist ({wishlistCount})
                      </Link>
                      <button
                        className="btn btn-sm btn-outline-danger rounded-pill py-1 px-2.5 small fw-medium"
                        style={{ fontSize: '0.74rem' }}
                        onClick={() => { logout(); setMobileMenuOpen(false); }}
                      >
                        Sign Out
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Drawer Links & Full Categories Tree */}
              <div className="p-3 flex-grow-1 overflow-auto">
                {/* Fast Action Row */}
                <div className="d-flex align-items-center justify-content-between p-2 rounded-3 bg-light border mb-3">
                  <Link
                    to="/products"
                    className="text-decoration-none small fw-semibold text-dark d-flex align-items-center gap-1.5"
                    style={{ fontSize: '0.78rem' }}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <LayoutGrid size={15} style={{ color: '#E90064' }} />
                    <span>All Catalog</span>
                  </Link>
                  <span className="text-muted opacity-50">|</span>
                  <Link
                    to="/orders/track"
                    className="text-decoration-none small fw-semibold text-dark d-flex align-items-center gap-1.5"
                    style={{ fontSize: '0.78rem' }}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <Truck size={15} style={{ color: '#19B927' }} />
                    <span>Track Order</span>
                  </Link>
                  <span className="text-muted opacity-50">|</span>
                  <Link
                    to={user ? "/cart" : "/login"}
                    className="text-decoration-none small fw-semibold text-dark d-flex align-items-center gap-1.5"
                    style={{ fontSize: '0.78rem' }}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <ShoppingBag size={15} style={{ color: '#E90064' }} />
                    <span>Bag ({totalItemCount})</span>
                  </Link>
                </div>

                {/* Categories Accordion Section */}
                <div className="text-muted fw-bold mb-2 px-1" style={{ fontSize: '0.68rem', letterSpacing: '0.08em' }}>
                  SHOP BY CATEGORY
                </div>

                <div className="d-flex flex-column gap-1 mb-3">
                  {/* Home */}
                  <Link
                    to="/"
                    className="d-flex align-items-center justify-content-between py-2 px-2.5 rounded-3 text-dark text-decoration-none hover-bg-light fw-medium"
                    style={{ fontSize: '0.86rem' }}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <span>Home</span>
                  </Link>

                  {/* Pure Silk Sarees */}
                  <div>
                    <div
                      className="d-flex align-items-center justify-content-between py-2 px-2.5 rounded-3 text-dark cursor-pointer hover-bg-light"
                      style={{ cursor: 'pointer', fontSize: '0.86rem' }}
                      onClick={() => setDrawerExpandedCat(drawerExpandedCat === 'sarees' ? null : 'sarees')}
                    >
                      <div className="d-flex align-items-center gap-2">
                        <span className="fw-semibold">Pure Silk Sarees</span>
                        <span className="badge rounded-pill text-white" style={{ backgroundColor: '#E90064', fontSize: '0.6rem' }}>
                          Silk Mark
                        </span>
                      </div>
                      <ChevronRight
                        size={15}
                        className="text-muted transition-all"
                        style={{ transform: drawerExpandedCat === 'sarees' ? 'rotate(90deg)' : 'none' }}
                      />
                    </div>
                    {drawerExpandedCat === 'sarees' && (
                      <div className="ps-3 pe-2 py-1.5 d-flex flex-column gap-1 bg-light rounded-3 mb-1 ms-1">
                        <Link to="/products?category=sarees&search=kanjeevaram" className="text-decoration-none text-secondary small py-1" onClick={() => setMobileMenuOpen(false)}>
                          • Pure Kanjeevaram Bridal Silk
                        </Link>
                        <Link to="/products?category=sarees&search=banarasi" className="text-decoration-none text-secondary small py-1" onClick={() => setMobileMenuOpen(false)}>
                          • Banarasi Zari Sarees
                        </Link>
                        <Link to="/products?category=sarees&search=soft-silk" className="text-decoration-none text-secondary small py-1" onClick={() => setMobileMenuOpen(false)}>
                          • Lightweight Soft Silk
                        </Link>
                        <Link to="/products?category=sarees&search=chanderi" className="text-decoration-none text-secondary small py-1" onClick={() => setMobileMenuOpen(false)}>
                          • Chanderi & Tussar Silk
                        </Link>
                        <Link to="/category/sarees" className="text-decoration-none fw-bold small py-1 text-danger" style={{ color: '#E90064' }} onClick={() => setMobileMenuOpen(false)}>
                          View All Silk Sarees →
                        </Link>
                      </div>
                    )}
                  </div>

                  {/* Designer Kurtis */}
                  <div>
                    <div
                      className="d-flex align-items-center justify-content-between py-2 px-2.5 rounded-3 text-dark cursor-pointer hover-bg-light"
                      style={{ cursor: 'pointer', fontSize: '0.86rem' }}
                      onClick={() => setDrawerExpandedCat(drawerExpandedCat === 'kurtis' ? null : 'kurtis')}
                    >
                      <div className="d-flex align-items-center gap-2">
                        <span className="fw-semibold">Designer Kurtis</span>
                        <span className="badge rounded-pill bg-light text-muted border" style={{ fontSize: '0.6rem' }}>
                          Trending
                        </span>
                      </div>
                      <ChevronRight
                        size={15}
                        className="text-muted transition-all"
                        style={{ transform: drawerExpandedCat === 'kurtis' ? 'rotate(90deg)' : 'none' }}
                      />
                    </div>
                    {drawerExpandedCat === 'kurtis' && (
                      <div className="ps-3 pe-2 py-1.5 d-flex flex-column gap-1 bg-light rounded-3 mb-1 ms-1">
                        <Link to="/products?category=kurtis&search=anarkali" className="text-decoration-none text-secondary small py-1" onClick={() => setMobileMenuOpen(false)}>
                          • Anarkali Sets
                        </Link>
                        <Link to="/products?category=kurtis&search=straight" className="text-decoration-none text-secondary small py-1" onClick={() => setMobileMenuOpen(false)}>
                          • Straight Cut Kurtis
                        </Link>
                        <Link to="/products?category=kurtis&search=festive" className="text-decoration-none text-secondary small py-1" onClick={() => setMobileMenuOpen(false)}>
                          • Festive Co-ord Sets
                        </Link>
                        <Link to="/category/kurtis" className="text-decoration-none fw-bold small py-1 text-danger" style={{ color: '#E90064' }} onClick={() => setMobileMenuOpen(false)}>
                          View All Kurtis →
                        </Link>
                      </div>
                    )}
                  </div>

                  {/* Dress Materials */}
                  <div>
                    <div
                      className="d-flex align-items-center justify-content-between py-2 px-2.5 rounded-3 text-dark cursor-pointer hover-bg-light"
                      style={{ cursor: 'pointer', fontSize: '0.86rem' }}
                      onClick={() => setDrawerExpandedCat(drawerExpandedCat === 'materials' ? null : 'materials')}
                    >
                      <div className="d-flex align-items-center gap-2">
                        <span className="fw-semibold">Dress Materials</span>
                        <span className="badge rounded-pill bg-light text-muted border" style={{ fontSize: '0.6rem' }}>
                          Unstitched
                        </span>
                      </div>
                      <ChevronRight
                        size={15}
                        className="text-muted transition-all"
                        style={{ transform: drawerExpandedCat === 'materials' ? 'rotate(90deg)' : 'none' }}
                      />
                    </div>
                    {drawerExpandedCat === 'materials' && (
                      <div className="ps-3 pe-2 py-1.5 d-flex flex-column gap-1 bg-light rounded-3 mb-1 ms-1">
                        <Link to="/products?category=dress-materials&search=silk" className="text-decoration-none text-secondary small py-1" onClick={() => setMobileMenuOpen(false)}>
                          • Pure Silk Suit Material
                        </Link>
                        <Link to="/products?category=dress-materials&search=chanderi" className="text-decoration-none text-secondary small py-1" onClick={() => setMobileMenuOpen(false)}>
                          • Chanderi Dress Sets
                        </Link>
                        <Link to="/products?category=dress-materials&search=cotton" className="text-decoration-none text-secondary small py-1" onClick={() => setMobileMenuOpen(false)}>
                          • Handloom Cotton
                        </Link>
                        <Link to="/category/dress-materials" className="text-decoration-none fw-bold small py-1 text-danger" style={{ color: '#E90064' }} onClick={() => setMobileMenuOpen(false)}>
                          View All Dress Materials →
                        </Link>
                      </div>
                    )}
                  </div>

                  {/* Running Fabrics */}
                  <div>
                    <div
                      className="d-flex align-items-center justify-content-between py-2 px-2.5 rounded-3 text-dark cursor-pointer hover-bg-light"
                      style={{ cursor: 'pointer', fontSize: '0.86rem' }}
                      onClick={() => setDrawerExpandedCat(drawerExpandedCat === 'fabrics' ? null : 'fabrics')}
                    >
                      <div className="d-flex align-items-center gap-2">
                        <span className="fw-semibold">Running Fabrics</span>
                        <span className="badge rounded-pill text-white" style={{ backgroundColor: '#19B927', fontSize: '0.6rem' }}>
                          Per Meter
                        </span>
                      </div>
                      <ChevronRight
                        size={15}
                        className="text-muted transition-all"
                        style={{ transform: drawerExpandedCat === 'fabrics' ? 'rotate(90deg)' : 'none' }}
                      />
                    </div>
                    {drawerExpandedCat === 'fabrics' && (
                      <div className="ps-3 pe-2 py-1.5 d-flex flex-column gap-1 bg-light rounded-3 mb-1 ms-1">
                        <Link to="/products?category=fabrics&search=raw-silk" className="text-decoration-none text-secondary small py-1" onClick={() => setMobileMenuOpen(false)}>
                          • Pure Raw Silk Yardage
                        </Link>
                        <Link to="/products?category=fabrics&search=linen" className="text-decoration-none text-secondary small py-1" onClick={() => setMobileMenuOpen(false)}>
                          • Natural Handloom Linen
                        </Link>
                        <Link to="/products?category=fabrics&search=brocade" className="text-decoration-none text-secondary small py-1" onClick={() => setMobileMenuOpen(false)}>
                          • Banarasi Brocade Fabrics
                        </Link>
                        <Link to="/products?category=fabrics&search=organza" className="text-decoration-none text-secondary small py-1" onClick={() => setMobileMenuOpen(false)}>
                          • Organza & Tissue Sheer
                        </Link>
                        <Link to="/category/fabrics" className="text-decoration-none fw-bold small py-1 text-danger" style={{ color: '#E90064' }} onClick={() => setMobileMenuOpen(false)}>
                          View All Running Fabrics →
                        </Link>
                      </div>
                    )}
                  </div>

                  {/* Men's Fashion */}
                  <Link
                    to="/products?category=mens-wear"
                    className="d-flex align-items-center justify-content-between py-2 px-2.5 rounded-3 text-dark text-decoration-none hover-bg-light fw-medium"
                    style={{ fontSize: '0.86rem' }}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <span>Men's Ethnic & Kurtas</span>
                    <ChevronRight size={14} className="text-muted" />
                  </Link>

                  {/* Kids' Collection */}
                  <Link
                    to="/products?category=kids-wear"
                    className="d-flex align-items-center justify-content-between py-2 px-2.5 rounded-3 text-dark text-decoration-none hover-bg-light fw-medium"
                    style={{ fontSize: '0.86rem' }}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <span>Kids' Festive Collection</span>
                    <ChevronRight size={14} className="text-muted" />
                  </Link>

                  {/* Accessories */}
                  <Link
                    to="/products?category=accessories"
                    className="d-flex align-items-center justify-content-between py-2 px-2.5 rounded-3 text-dark text-decoration-none hover-bg-light fw-medium"
                    style={{ fontSize: '0.86rem' }}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <span>Fashion Accessories</span>
                    <ChevronRight size={14} className="text-muted" />
                  </Link>

                  {/* Special Offers (Up to 50% OFF) */}
                  <Link
                    to="/products?deal=flash"
                    className="d-flex align-items-center justify-content-between py-2 px-2.5 rounded-3 text-decoration-none"
                    style={{ backgroundColor: '#FFF0F5', color: '#E90064', fontSize: '0.86rem', fontWeight: 700 }}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <div className="d-flex align-items-center gap-1.5">
                      <AnimatedFaIcon icon={FaTags} size={13} color="#E90064" animation="pulse" />
                      <span>Festive Deals (Up to 50% OFF)</span>
                    </div>
                    <span className="badge rounded-pill text-white" style={{ backgroundColor: '#E90064', fontSize: '0.62rem' }}>
                      HOT
                    </span>
                  </Link>
                </div>

                {/* Company & Support Section */}
                <div className="border-top pt-3 mb-2">
                  <div className="text-muted fw-bold mb-2 px-1" style={{ fontSize: '0.68rem', letterSpacing: '0.08em' }}>
                    COMPANY & SUPPORT
                  </div>
                  <div className="d-flex flex-column gap-1">
                    <Link to="/about" className="nav-link py-1.5 px-2.5 small text-dark d-flex align-items-center gap-2" onClick={() => setMobileMenuOpen(false)}>
                      <span>About Aaradhya Heritage</span>
                    </Link>
                    <Link to="/contact" className="nav-link py-1.5 px-2.5 small text-dark d-flex align-items-center gap-2" onClick={() => setMobileMenuOpen(false)}>
                      <span>Contact Us</span>
                    </Link>
                    <Link to="/orders/track" className="nav-link py-1.5 px-2.5 small text-dark d-flex align-items-center gap-2" onClick={() => setMobileMenuOpen(false)}>
                      <span>Live Order Tracking</span>
                    </Link>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Navbar;
