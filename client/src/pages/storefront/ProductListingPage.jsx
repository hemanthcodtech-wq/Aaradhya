import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  SlidersHorizontal,
  X,
  Filter,
  Check,
  Search,
  RotateCcw,
  ChevronDown,
  Sparkles,
} from 'lucide-react';
import ProductCard from '../../components/common/ProductCard';
import axiosClient from '../../api/axiosClient';

// Nishorama-Style Visual Category Thumbnails for Mobile & Tablet (Image 3)
const VISUAL_CATEGORIES = [
  {
    id: 'shop-all',
    name: 'Shop All',
    label: 'SHOP ALL',
    slug: '',
    image: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=400&auto=format&fit=crop&q=80',
  },
  {
    id: 'most-wanted',
    name: 'Most Wanted',
    label: 'MOST WANTED',
    slug: 'most-wanted',
    filterType: 'sort',
    filterValue: 'popular',
    image: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=400&auto=format&fit=crop&q=80',
  },
  {
    id: 'sets',
    name: 'Sets',
    label: 'SETS',
    slug: 'sets',
    filterType: 'search',
    filterValue: 'Set',
    image: 'https://images.unsplash.com/photo-1509631179647-0177331693ae?w=400&auto=format&fit=crop&q=80',
  },
  {
    id: 'new-in',
    name: 'New In',
    label: 'NEW IN',
    slug: 'new-in',
    filterType: 'sort',
    filterValue: 'newest',
    image: 'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=400&auto=format&fit=crop&q=80',
  },
  {
    id: 'sarees',
    name: 'Sarees',
    label: 'SAREES',
    slug: 'sarees',
    image: 'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?w=400&auto=format&fit=crop&q=80',
  },
  {
    id: 'kurtis',
    name: 'Kurtis',
    label: 'KURTIS',
    slug: 'kurtis',
    image: 'https://images.unsplash.com/photo-1594223274512-ad4803739b7c?w=400&auto=format&fit=crop&q=80',
  },
  {
    id: 'fabrics',
    name: 'Fabrics',
    label: 'FABRICS',
    slug: 'fabrics',
    image: 'https://images.unsplash.com/photo-1607083206869-4c7672e72a8a?w=400&auto=format&fit=crop&q=80',
  },
  {
    id: 'dresses',
    name: 'Dresses',
    label: 'DRESSES',
    slug: 'dresses',
    image: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=400&auto=format&fit=crop&q=80',
  },
  {
    id: 'bottoms',
    name: 'Bottoms',
    label: 'BOTTOMS',
    slug: 'bottoms',
    filterType: 'search',
    filterValue: 'Bottom',
    image: 'https://images.unsplash.com/photo-1617137984095-74e4e5e3613f?w=400&auto=format&fit=crop&q=80',
  },
  {
    id: 'dress-materials',
    name: 'Materials',
    label: 'MATERIALS',
    slug: 'dress-materials',
    image: 'https://images.unsplash.com/photo-1523381294911-8d3cead13475?w=400&auto=format&fit=crop&q=80',
  },
  {
    id: 'mens-wear',
    name: "Men's Wear",
    label: "MEN'S WEAR",
    slug: 'mens-wear',
    image: 'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=400&auto=format&fit=crop&q=80',
  },
];

// Nishorama Filter Pills for Desktop (Image 2)
const DESKTOP_PILLS = [
  { label: 'Shop All', slug: '', type: 'all' },
  { label: 'Most Wanted', slug: 'most-wanted', type: 'sort', value: 'popular' },
  { label: 'Sets', slug: 'sets', type: 'search', value: 'Set' },
  { label: 'New In', slug: 'new-in', type: 'sort', value: 'newest' },
  { label: 'Bestsellers', slug: 'bestsellers', type: 'sort', value: 'popular' },
  { label: 'Sarees', slug: 'sarees', type: 'category' },
  { label: 'Kurtis', slug: 'kurtis', type: 'category' },
  { label: 'Dress Materials', slug: 'dress-materials', type: 'category' },
  { label: 'Fabrics', slug: 'fabrics', type: 'category' },
  { label: 'Tops', slug: 'tops', type: 'search', value: 'Top' },
  { label: 'Bottoms', slug: 'bottoms', type: 'search', value: 'Bottom' },
  { label: 'Dresses', slug: 'dresses', type: 'category' },
  { label: "Men's Wear", slug: 'mens-wear', type: 'category' },
  { label: 'Accessories', slug: 'accessories', type: 'category' },
];

const ProductListingPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showFilterDrawer, setShowFilterDrawer] = useState(false);

  // Active filter params
  const categoryParam = searchParams.get('category') || '';
  const searchParam = searchParams.get('search') || '';
  const sortParam = searchParams.get('sort') || 'newest';
  const minPriceParam = searchParams.get('minPrice') || '';
  const maxPriceParam = searchParams.get('maxPrice') || '';
  const inStockParam = searchParams.get('inStock') === 'true';
  const storeParam = searchParams.get('store') || '';

  const [localMinPrice, setLocalMinPrice] = useState(minPriceParam);
  const [localMaxPrice, setLocalMaxPrice] = useState(maxPriceParam);

  // Count active filters (for badge)
  const activeFiltersCount =
    (categoryParam ? 1 : 0) +
    (minPriceParam || maxPriceParam ? 1 : 0) +
    (inStockParam ? 1 : 0) +
    (storeParam ? 1 : 0) +
    (searchParam ? 1 : 0);

  // Load backend categories
  useEffect(() => {
    const fetchCats = async () => {
      try {
        const res = await axiosClient.get('/categories');
        if (res.success && Array.isArray(res.data)) {
          setCategories(res.data);
        }
      } catch (err) {
        console.error('Error loading categories:', err);
      }
    };
    fetchCats();
  }, []);

  // Fetch products whenever searchParams change
  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const query = searchParams.toString();
        const res = await axiosClient.get(`/products?${query}`);
        if (res.success && Array.isArray(res.data)) {
          setProducts(res.data);
        }
      } catch (err) {
        console.error('Error loading products:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, [searchParams]);

  // Synchronize local price inputs with searchParams
  useEffect(() => {
    setLocalMinPrice(minPriceParam);
    setLocalMaxPrice(maxPriceParam);
  }, [minPriceParam, maxPriceParam]);

  // Update a single filter in query params
  const updateFilter = (key, value) => {
    const next = new URLSearchParams(searchParams);
    if (value === null || value === '' || value === false) {
      next.delete(key);
    } else {
      next.set(key, value);
    }
    next.set('page', '1');
    setSearchParams(next);
  };

  // Click handler for desktop & mobile pills
  const handlePillClick = (pill) => {
    const next = new URLSearchParams();
    if (pill.type === 'category') {
      next.set('category', pill.slug);
    } else if (pill.type === 'sort') {
      next.set('sort', pill.value);
    } else if (pill.type === 'search') {
      next.set('search', pill.value);
    }
    setSearchParams(next);
  };

  // Click handler for mobile visual category thumbnails
  const handleVisualCategoryClick = (item) => {
    const next = new URLSearchParams();
    if (item.filterType === 'sort') {
      next.set('sort', item.filterValue);
    } else if (item.filterType === 'search') {
      next.set('search', item.filterValue);
    } else if (item.slug) {
      next.set('category', item.slug);
    }
    setSearchParams(next);
  };

  // Clear all filters
  const clearAllFilters = () => {
    setLocalMinPrice('');
    setLocalMaxPrice('');
    setSearchParams({});
    setShowFilterDrawer(false);
  };

  // Apply custom price filter
  const applyPriceFilter = (e) => {
    e?.preventDefault();
    const next = new URLSearchParams(searchParams);
    if (localMinPrice) next.set('minPrice', localMinPrice);
    else next.delete('minPrice');

    if (localMaxPrice) next.set('maxPrice', localMaxPrice);
    else next.delete('maxPrice');

    next.set('page', '1');
    setSearchParams(next);
    setShowFilterDrawer(false);
  };

  // Set quick price chip
  const setQuickPrice = (min, max) => {
    setLocalMinPrice(min || '');
    setLocalMaxPrice(max || '');
    const next = new URLSearchParams(searchParams);
    if (min) next.set('minPrice', min);
    else next.delete('minPrice');
    if (max) next.set('maxPrice', max);
    else next.delete('maxPrice');
    next.set('page', '1');
    setSearchParams(next);
  };

  // Determine current active display title
  let currentTitle = 'Shop All';
  if (categoryParam) {
    const foundCat = categories.find((c) => c.slug === categoryParam);
    currentTitle = foundCat ? foundCat.name : categoryParam.replace('-', ' ');
  } else if (searchParam) {
    currentTitle = `Results for "${searchParam}"`;
  } else if (sortParam === 'popular') {
    currentTitle = 'Most Wanted';
  }

  return (
    <div className="products-page-wrapper storefront-products-bg min-vh-100">
      {/* 1. Mobile Top Hero Banner Matching Nishorama Image 3 */}
      <div className="d-block d-md-none px-3 pt-3 pb-2">
        <div
          className="position-relative overflow-hidden shadow-sm text-white p-4 d-flex flex-column justify-content-center"
          style={{
            minHeight: '150px',
            backgroundImage:
              'url(https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=800&auto=format&fit=crop&q=85)',
            backgroundSize: 'cover',
            backgroundPosition: 'center 30%',
            borderRadius: '20px',
          }}
        >
          {/* Subtle dark gradient overlay */}
          <div
            className="position-absolute top-0 start-0 end-0 bottom-0"
            style={{
              background:
                'linear-gradient(to right, rgba(23, 35, 59, 0.75) 0%, rgba(23, 35, 59, 0.45) 100%)',
            }}
          />
          <div className="position-relative z-1 text-center">
            <span
              className="badge rounded-pill text-white px-2.5 py-1 mb-1.5 small text-uppercase"
              style={{
                backgroundColor: 'rgba(255, 255, 255, 0.22)',
                fontSize: '0.65rem',
                letterSpacing: '0.08em',
              }}
            >
              Collection 2026
            </span>
            <h2
              className="fw-bolder mb-0 text-white text-capitalize"
              style={{
                fontFamily: 'var(--font-heading-family)',
                letterSpacing: '-0.4px',
                fontSize: '1.85rem',
              }}
            >
              {currentTitle}
            </h2>
          </div>
        </div>
      </div>

      {/* 2. Mobile Visual Category Thumbnail Scroller Matching Nishorama Image 3 */}
      <div className="d-block d-md-none px-3 mb-2">
        <div
          className="d-flex gap-2.5 overflow-x-auto pb-2 scrollbar-hidden"
          style={{ scrollbarWidth: 'none', WebkitOverflowScrolling: 'touch' }}
        >
          {VISUAL_CATEGORIES.map((item) => {
            const isSelected =
              (!categoryParam && !searchParam && item.slug === '' && sortParam === 'newest') ||
              (item.slug && categoryParam === item.slug) ||
              (item.filterType === 'sort' && sortParam === item.filterValue) ||
              (item.filterType === 'search' && searchParam === item.filterValue);

            return (
              <div
                key={item.id}
                onClick={() => handleVisualCategoryClick(item)}
                className="text-center flex-shrink-0"
                style={{ width: '82px', cursor: 'pointer' }}
              >
                <div
                  className="category-thumb-card mb-1.5 shadow-2xs"
                  style={{
                    border: isSelected ? '2.5px solid #E90064' : '1px solid #EAECF0',
                    transform: isSelected ? 'scale(1.04)' : 'scale(1)',
                    boxShadow: isSelected ? '0 4px 12px rgba(233, 0, 100, 0.25)' : 'none',
                  }}
                >
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-100 h-100"
                    style={{ objectFit: 'cover' }}
                    loading="lazy"
                  />
                </div>
                <span
                  className="d-block text-truncate fw-bold text-uppercase"
                  style={{
                    fontSize: '0.64rem',
                    letterSpacing: '0.04em',
                    color: isSelected ? '#E90064' : '#17233B',
                    fontFamily: 'var(--font-body-family)',
                  }}
                >
                  {item.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Main Content Container (Full Width, Zero Permanent Sidebar) */}
      <div className="container-fluid px-3 px-md-4 px-xl-5 py-2 py-md-4">
        {/* 3. Desktop Header Row Matching Nishorama Image 2 */}
        <div className="d-none d-md-flex align-items-end justify-content-between mb-3 px-1">
          <div>
            <h1
              className="fw-bolder mb-1 text-dark text-capitalize"
              style={{
                fontFamily: 'var(--font-heading-family)',
                fontSize: 'clamp(2rem, 3.2vw, 2.7rem)',
                letterSpacing: '-0.5px',
                color: '#17233B',
              }}
            >
              {currentTitle}
            </h1>
            <p className="text-muted small mb-0" style={{ fontSize: '0.9rem' }}>
              In the near future, your wardrobe could look like this.
            </p>
          </div>

          <div className="d-flex align-items-center gap-3">
            <span className="text-muted small fw-medium" style={{ fontSize: '0.86rem' }}>
              {products.length} products
            </span>

            {/* Quick Sort Dropdown */}
            <select
              className="form-select form-select-sm rounded-pill fw-semibold border shadow-xs"
              style={{
                width: 'auto',
                borderColor: '#E5E7EB',
                fontSize: '0.84rem',
                paddingRight: '2.2rem',
                backgroundColor: '#FFFFFF',
                color: '#344054',
              }}
              value={sortParam}
              onChange={(e) => updateFilter('sort', e.target.value)}
            >
              <option value="newest">Newest Arrivals</option>
              <option value="popular">Popularity / Best</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
              <option value="rating">Top Rated</option>
            </select>

            {/* Filter Trigger Button (Opens Modern Filter Drawer) */}
            <button
              type="button"
              onClick={() => setShowFilterDrawer(true)}
              className="btn rounded-pill px-3.5 py-1.5 fw-semibold text-white shadow-sm d-inline-flex align-items-center gap-2"
              style={{
                backgroundColor: '#E90064',
                border: '1px solid #E90064',
                fontSize: '0.85rem',
                boxShadow: '0 4px 12px rgba(233, 0, 100, 0.28)',
              }}
            >
              <SlidersHorizontal size={15} />
              <span>Filter</span>
              {activeFiltersCount > 0 && (
                <span
                  className="badge rounded-pill text-dark bg-white px-1.5 py-0.5"
                  style={{ fontSize: '0.68rem', fontWeight: 700 }}
                >
                  {activeFiltersCount}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* 4. Category Filter Pills Scroller Matching Nishorama Image 2 */}
        <div
          className="d-flex gap-2 overflow-x-auto pb-2.5 mb-3 mb-md-4 scrollbar-hidden text-nowrap"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none', WebkitOverflowScrolling: 'touch' }}
        >
          {DESKTOP_PILLS.map((pill) => {
            const isPillActive =
              (pill.type === 'all' && !categoryParam && !searchParam && sortParam === 'newest') ||
              (pill.type === 'category' && categoryParam === pill.slug) ||
              (pill.type === 'sort' && sortParam === pill.value) ||
              (pill.type === 'search' && searchParam === pill.value);

            return (
              <button
                key={pill.slug || pill.label}
                type="button"
                onClick={() => handlePillClick(pill)}
                className={`filter-pill-btn btn ${isPillActive ? 'active' : ''}`}
              >
                {pill.label}
              </button>
            );
          })}
        </div>

        {/* 5. Full-Width Product Grid (4 Per Row on Desktop, 3 on Tablet, 2 on Mobile - No Sidebar!) */}
        {loading ? (
          <div className="product-grid-4">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <div
                key={i}
                className="card border-0 shadow-sm p-4 text-center rounded-4 bg-white"
                style={{ minHeight: '320px', borderRadius: '20px' }}
              >
                <div className="spinner-border text-danger mx-auto mb-2" role="status"></div>
                <span className="small text-muted">Loading boutique collection...</span>
              </div>
            ))}
          </div>
        ) : products.length === 0 ? (
          <div
            className="card border-0 shadow-sm p-5 text-center rounded-4 bg-white mx-auto my-4"
            style={{ maxWidth: '600px', borderColor: '#F0E7ED', borderRadius: '24px' }}
          >
            <Search size={48} className="mx-auto text-muted mb-3" />
            <h4 className="fw-bold text-dark">No Products Found</h4>
            <p className="text-muted small mb-4">
              We couldn't find items matching your selected criteria. Try selecting another category or resetting filters.
            </p>
            <div>
              <button
                className="btn text-white px-4 py-2 rounded-pill fw-semibold shadow-sm"
                style={{ backgroundColor: '#E90064' }}
                onClick={clearAllFilters}
              >
                Reset All Filters
              </button>
            </div>
          </div>
        ) : (
          <div className="product-grid-4">
            {products.map((p, idx) => (
              <ProductCard key={p._id} product={p} index={idx} />
            ))}
          </div>
        )}
      </div>

      {/* 6. Sticky Bottom Advance Filter Bar (Mobile View Only - Matching Image 3) */}
      <div
        className="sticky-mobile-filter-bar d-flex d-md-none"
        onClick={() => setShowFilterDrawer(true)}
      >
        <span
          className="text-white opacity-75 fw-semibold text-uppercase"
          style={{ fontSize: '0.74rem', letterSpacing: '0.06em' }}
        >
          {products.length} PRODUCTS
        </span>
        <div className="d-flex align-items-center gap-1.5 text-white fw-bold text-uppercase" style={{ fontSize: '0.76rem', letterSpacing: '0.06em' }}>
          <span>ADVANCE FILTER</span>
          <SlidersHorizontal size={14} />
          {activeFiltersCount > 0 && (
            <span
              className="badge rounded-circle text-white p-0 d-inline-flex align-items-center justify-content-center ms-1"
              style={{
                backgroundColor: '#E90064',
                width: '16px',
                height: '16px',
                fontSize: '0.62rem',
              }}
            >
              {activeFiltersCount}
            </span>
          )}
        </div>
      </div>

      {/* 7. Modern Slide-Over Filter Drawer (Offcanvas for Desktop & Bottom-Sheet for Mobile) */}
      <AnimatePresence>
        {showFilterDrawer && (
          <div
            className="filter-drawer-backdrop"
            onClick={() => setShowFilterDrawer(false)}
          >
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'tween', duration: 0.28, ease: 'easeOut' }}
              className="filter-drawer-panel"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Drawer Header */}
              <div className="p-3.5 px-4 border-bottom d-flex align-items-center justify-content-between bg-white">
                <div className="d-flex align-items-center gap-2">
                  <SlidersHorizontal size={18} style={{ color: '#E90064' }} />
                  <h5 className="fw-bold mb-0 text-dark" style={{ fontFamily: 'var(--font-heading-family)' }}>
                    Filter Products
                  </h5>
                  {activeFiltersCount > 0 && (
                    <span
                      className="badge rounded-pill text-white"
                      style={{ backgroundColor: '#E90064', fontSize: '0.7rem' }}
                    >
                      {activeFiltersCount}
                    </span>
                  )}
                </div>
                <div className="d-flex align-items-center gap-2">
                  {activeFiltersCount > 0 && (
                    <button
                      type="button"
                      className="btn btn-link p-0 small text-decoration-none fw-semibold"
                      style={{ color: '#E90064', fontSize: '0.8rem' }}
                      onClick={clearAllFilters}
                    >
                      Clear All
                    </button>
                  )}
                  <button
                    type="button"
                    className="btn btn-sm btn-light rounded-circle p-1.5 d-flex align-items-center justify-content-center"
                    onClick={() => setShowFilterDrawer(false)}
                    aria-label="Close filters"
                  >
                    <X size={18} />
                  </button>
                </div>
              </div>

              {/* Drawer Body */}
              <div className="p-4 overflow-y-auto flex-grow-1 custom-scrollbar bg-white">
                {/* Categories */}
                <div className="mb-4">
                  <h6
                    className="fw-bold small mb-2.5 text-uppercase text-muted"
                    style={{ fontSize: '0.72rem', letterSpacing: '0.05em' }}
                  >
                    Categories
                  </h6>
                  <div className="d-flex flex-wrap gap-2">
                    <button
                      type="button"
                      className={`btn btn-sm rounded-pill px-3 py-1.5 fw-semibold ${
                        !categoryParam
                          ? 'text-white shadow-sm'
                          : 'btn-light border text-dark'
                      }`}
                      style={{
                        backgroundColor: !categoryParam ? '#E90064' : '#F8FAFC',
                        borderColor: !categoryParam ? '#E90064' : '#E2E8F0',
                        fontSize: '0.8rem',
                      }}
                      onClick={() => updateFilter('category', '')}
                    >
                      All Categories
                    </button>
                    {categories.map((c) => {
                      const isCatActive = categoryParam === c.slug;
                      return (
                        <button
                          key={c._id}
                          type="button"
                          className={`btn btn-sm rounded-pill px-3 py-1.5 fw-semibold ${
                            isCatActive ? 'text-white shadow-sm' : 'btn-light border text-dark'
                          }`}
                          style={{
                            backgroundColor: isCatActive ? '#E90064' : '#F8FAFC',
                            borderColor: isCatActive ? '#E90064' : '#E2E8F0',
                            fontSize: '0.8rem',
                          }}
                          onClick={() => updateFilter('category', c.slug)}
                        >
                          {c.name} {c.productCount > 0 ? `(${c.productCount})` : ''}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Price Range */}
                <div className="mb-4 border-top pt-3">
                  <h6
                    className="fw-bold small mb-2.5 text-uppercase text-muted"
                    style={{ fontSize: '0.72rem', letterSpacing: '0.05em' }}
                  >
                    Price Range (₹)
                  </h6>

                  {/* Quick price chips */}
                  <div className="d-flex flex-wrap gap-1.5 mb-3">
                    <button
                      type="button"
                      className="btn btn-sm btn-outline-secondary rounded-pill px-2.5 py-1 small"
                      style={{ fontSize: '0.75rem' }}
                      onClick={() => setQuickPrice('', '1000')}
                    >
                      Under ₹1,000
                    </button>
                    <button
                      type="button"
                      className="btn btn-sm btn-outline-secondary rounded-pill px-2.5 py-1 small"
                      style={{ fontSize: '0.75rem' }}
                      onClick={() => setQuickPrice('1000', '3000')}
                    >
                      ₹1,000 - ₹3,000
                    </button>
                    <button
                      type="button"
                      className="btn btn-sm btn-outline-secondary rounded-pill px-2.5 py-1 small"
                      style={{ fontSize: '0.75rem' }}
                      onClick={() => setQuickPrice('3000', '8000')}
                    >
                      ₹3,000 - ₹8,000
                    </button>
                    <button
                      type="button"
                      className="btn btn-sm btn-outline-secondary rounded-pill px-2.5 py-1 small"
                      style={{ fontSize: '0.75rem' }}
                      onClick={() => setQuickPrice('8000', '')}
                    >
                      Above ₹8,000
                    </button>
                  </div>

                  <form onSubmit={applyPriceFilter}>
                    <div className="d-flex align-items-center gap-2 mb-2">
                      <input
                        type="number"
                        className="form-control form-control-sm rounded-pill px-3"
                        placeholder="Min ₹"
                        value={localMinPrice}
                        onChange={(e) => setLocalMinPrice(e.target.value)}
                      />
                      <span className="text-muted">-</span>
                      <input
                        type="number"
                        className="form-control form-control-sm rounded-pill px-3"
                        placeholder="Max ₹"
                        value={localMaxPrice}
                        onChange={(e) => setLocalMaxPrice(e.target.value)}
                      />
                    </div>
                  </form>
                </div>

                {/* Sort By Selection in Drawer */}
                <div className="mb-4 border-top pt-3">
                  <h6
                    className="fw-bold small mb-2.5 text-uppercase text-muted"
                    style={{ fontSize: '0.72rem', letterSpacing: '0.05em' }}
                  >
                    Sort By
                  </h6>
                  <div className="d-flex flex-column gap-1.5">
                    {[
                      { label: 'Newest Arrivals', val: 'newest' },
                      { label: 'Popularity / Best', val: 'popular' },
                      { label: 'Price: Low to High', val: 'price_asc' },
                      { label: 'Price: High to Low', val: 'price_desc' },
                      { label: 'Top Rated', val: 'rating' },
                    ].map((s) => (
                      <label
                        key={s.val}
                        className={`d-flex align-items-center justify-content-between p-2 rounded-3 cursor-pointer ${
                          sortParam === s.val ? 'bg-light fw-bold text-dark' : 'text-muted'
                        }`}
                        style={{ cursor: 'pointer', fontSize: '0.85rem' }}
                        onClick={() => updateFilter('sort', s.val)}
                      >
                        <span>{s.label}</span>
                        {sortParam === s.val && <Check size={16} style={{ color: '#E90064' }} />}
                      </label>
                    ))}
                  </div>
                </div>

                {/* Store Filter */}
                <div className="mb-4 border-top pt-3">
                  <h6
                    className="fw-bold small mb-2.5 text-uppercase text-muted"
                    style={{ fontSize: '0.72rem', letterSpacing: '0.05em' }}
                  >
                    Store Identity
                  </h6>
                  <div className="d-flex flex-wrap gap-2">
                    {[
                      { label: 'All Stores', val: '' },
                      { label: 'Aaradhya Silks (AS)', val: 'AS' },
                      { label: 'Aaradhya Fabrics (AF)', val: 'AF' },
                    ].map((st) => (
                      <button
                        key={st.val}
                        type="button"
                        className={`btn btn-sm rounded-pill px-3 py-1.5 fw-semibold ${
                          storeParam === st.val
                            ? 'text-white shadow-sm'
                            : 'btn-light border text-dark'
                        }`}
                        style={{
                          backgroundColor: storeParam === st.val ? '#17233B' : '#F8FAFC',
                          borderColor: storeParam === st.val ? '#17233B' : '#E2E8F0',
                          fontSize: '0.8rem',
                        }}
                        onClick={() => updateFilter('store', st.val)}
                      >
                        {st.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* In Stock Availability */}
                <div className="border-top pt-3 mb-2">
                  <div className="form-check form-switch d-flex justify-content-between align-items-center ps-0">
                    <label
                      className="form-check-label small fw-semibold text-dark"
                      htmlFor="drawerInStockOnly"
                      style={{ cursor: 'pointer' }}
                    >
                      Show In Stock Items Only
                    </label>
                    <input
                      className="form-check-input ms-0"
                      type="checkbox"
                      id="drawerInStockOnly"
                      checked={inStockParam}
                      onChange={(e) => updateFilter('inStock', e.target.checked)}
                      style={{ cursor: 'pointer' }}
                    />
                  </div>
                </div>
              </div>

              {/* Drawer Footer */}
              <div className="p-3.5 px-4 border-top bg-light d-flex gap-2">
                <button
                  type="button"
                  className="btn btn-outline-secondary rounded-pill px-3 py-2 fw-semibold small flex-shrink-0"
                  onClick={clearAllFilters}
                >
                  <RotateCcw size={14} className="me-1" />
                  Reset
                </button>
                <button
                  type="button"
                  className="btn w-100 py-2.5 rounded-pill fw-bold text-white shadow-sm"
                  style={{ backgroundColor: '#E90064', borderColor: '#E90064', fontSize: '0.88rem' }}
                  onClick={applyPriceFilter}
                >
                  Apply Filters ({products.length} Items)
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Bottom spacer for mobile bars clearance (Sticky Filter Bar 48px + Bottom Bar 56px + breathing room) */}
      <div style={{ height: '110px' }} className="d-md-none" />
    </div>
  );
};

export default ProductListingPage;