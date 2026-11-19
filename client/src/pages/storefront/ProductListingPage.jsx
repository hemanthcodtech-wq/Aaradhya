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
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Sparkles,
  Store,
  Tag,
  ArrowUpDown,
} from 'lucide-react';
import ProductCard from '../../components/common/ProductCard';
import axiosClient from '../../api/axiosClient';

// Nishorama-Style Visual Category Thumbnails for Mobile & Tablet
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
  {
    id: 'kids-wear',
    name: "Kids Wear",
    label: "KIDS WEAR",
    slug: 'kids-wear',
    image: 'https://images.unsplash.com/photo-1622290291468-a28f7a7dc6a8?w=400&auto=format&fit=crop&q=80',
  },
];

// Nishorama Filter Pills for Desktop
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
  { label: 'Kids Wear', slug: 'kids-wear', type: 'category' },
  { label: 'Accessories', slug: 'accessories', type: 'category' },
];

const ProductListingPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showFilterDrawer, setShowFilterDrawer] = useState(false);

  // Pagination metadata from API response
  const [paginationMeta, setPaginationMeta] = useState({
    total: 0,
    page: 1,
    limit: 12,
    totalPages: 1,
  });

  // Active filter params from URL
  const categoryParam = searchParams.get('category') || '';
  const searchParam = searchParams.get('search') || '';
  const sortParam = searchParams.get('sort') || 'newest';
  const minPriceParam = searchParams.get('minPrice') || '';
  const maxPriceParam = searchParams.get('maxPrice') || '';
  const inStockParam = searchParams.get('inStock') === 'true';
  const storeParam = searchParams.get('store') || '';
  const pageParam = parseInt(searchParams.get('page') || '1', 10);
  const limitParam = parseInt(searchParams.get('limit') || '12', 10);

  const [localMinPrice, setLocalMinPrice] = useState(minPriceParam);
  const [localMaxPrice, setLocalMaxPrice] = useState(maxPriceParam);

  // Count active filters (for badge)
  const activeFiltersCount =
    (categoryParam ? 1 : 0) +
    (minPriceParam || maxPriceParam ? 1 : 0) +
    (inStockParam ? 1 : 0) +
    (storeParam ? 1 : 0) +
    (searchParam ? 1 : 0);

  // Smooth scroll to catalog top
  const scrollToCatalogTop = () => {
    const el = document.getElementById('products-catalog-anchor');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

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
          if (res.meta) {
            setPaginationMeta({
              total: res.meta.total || res.data.length,
              page: res.meta.page || pageParam,
              limit: res.meta.limit || limitParam,
              totalPages: res.meta.totalPages || 1,
            });
          } else {
            setPaginationMeta({
              total: res.data.length,
              page: pageParam,
              limit: limitParam,
              totalPages: Math.ceil(res.data.length / limitParam) || 1,
            });
          }
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

  // Update a single filter in query params (resets page to 1)
  const updateFilter = (key, value) => {
    const next = new URLSearchParams(searchParams);
    if (value === null || value === '' || value === false) {
      next.delete(key);
    } else {
      next.set(key, value);
    }
    if (key !== 'page') {
      next.set('page', '1');
    }
    setSearchParams(next);
  };

  // Handle page number change with smooth scroll to top of catalog
  const handlePageChange = (newPage) => {
    if (newPage < 1 || newPage > paginationMeta.totalPages || newPage === paginationMeta.page) {
      return;
    }
    const next = new URLSearchParams(searchParams);
    next.set('page', String(newPage));
    setSearchParams(next);
    setTimeout(scrollToCatalogTop, 50);
  };

  // Handle items per page change
  const handleLimitChange = (newLimit) => {
    const next = new URLSearchParams(searchParams);
    next.set('limit', String(newLimit));
    next.set('page', '1');
    setSearchParams(next);
    setTimeout(scrollToCatalogTop, 50);
  };

  // Click handler for desktop & mobile category pills
  const handlePillClick = (pill) => {
    const next = new URLSearchParams();
    if (pill.type === 'category') {
      next.set('category', pill.slug);
    } else if (pill.type === 'sort') {
      next.set('sort', pill.value);
    } else if (pill.type === 'search') {
      next.set('search', pill.value);
    }
    next.set('page', '1');
    if (limitParam !== 12) next.set('limit', String(limitParam));
    setSearchParams(next);
    setTimeout(scrollToCatalogTop, 50);
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
    next.set('page', '1');
    if (limitParam !== 12) next.set('limit', String(limitParam));
    setSearchParams(next);
    setTimeout(scrollToCatalogTop, 50);
  };

  // Clear all filters
  const clearAllFilters = () => {
    setLocalMinPrice('');
    setLocalMaxPrice('');
    const next = new URLSearchParams();
    if (limitParam !== 12) next.set('limit', String(limitParam));
    setSearchParams(next);
    setShowFilterDrawer(false);
    setTimeout(scrollToCatalogTop, 50);
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
    setTimeout(scrollToCatalogTop, 50);
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
  let activeCatObj = null;
  if (categoryParam) {
    activeCatObj = categories.find((c) => c.slug === categoryParam);
    currentTitle = activeCatObj ? activeCatObj.name : categoryParam.replace('-', ' ');
  } else if (searchParam) {
    currentTitle = `Results for "${searchParam}"`;
  } else if (sortParam === 'popular') {
    currentTitle = 'Most Wanted';
  } else if (sortParam === 'newest') {
    currentTitle = 'New Arrivals';
  }

  // Calculate current record window range
  const currentTotal = paginationMeta.total || products.length;
  const startIndex = currentTotal === 0 ? 0 : (paginationMeta.page - 1) * paginationMeta.limit + 1;
  const endIndex = Math.min(paginationMeta.page * paginationMeta.limit, currentTotal);

  // Generate page numbers array for pagination pills
  const generatePageNumbers = () => {
    const total = paginationMeta.totalPages;
    const current = paginationMeta.page;
    if (total <= 5) {
      return Array.from({ length: total }, (_, i) => i + 1);
    }
    const pages = [];
    if (current <= 3) {
      pages.push(1, 2, 3, 4, '...', total);
    } else if (current >= total - 2) {
      pages.push(1, '...', total - 3, total - 2, total - 1, total);
    } else {
      pages.push(1, '...', current - 1, current, current + 1, '...', total);
    }
    return pages;
  };

  return (
    <div className="products-page-wrapper storefront-products-bg min-vh-100">
      {/* Top Anchor for Smooth Scroll */}
      <div id="products-catalog-anchor" style={{ position: 'relative', top: '-10px' }} />

      {/* 1. Mobile Top Hero Banner Matching Nishorama Luxury Aesthetic */}
      <div className="d-block d-md-none px-3 pt-3 pb-2">
        <div
          className="position-relative overflow-hidden shadow-sm text-white p-4 d-flex flex-column justify-content-center"
          style={{
            minHeight: '140px',
            backgroundImage:
              'url(https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=800&auto=format&fit=crop&q=85)',
            backgroundSize: 'cover',
            backgroundPosition: 'center 30%',
            borderRadius: '20px',
          }}
        >
          <div
            className="position-absolute top-0 start-0 end-0 bottom-0"
            style={{
              background:
                'linear-gradient(to right, rgba(23, 35, 59, 0.78) 0%, rgba(23, 35, 59, 0.45) 100%)',
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
              AARADHYA SAREES & SILKS
            </span>
            <h2
              className="fw-bolder mb-0 text-white text-capitalize"
              style={{
                fontFamily: 'var(--font-heading-family)',
                letterSpacing: '-0.4px',
                fontSize: '1.75rem',
              }}
            >
              {currentTitle}
            </h2>
          </div>
        </div>
      </div>

      {/* 2. Mobile Visual Category Thumbnail Scroller */}
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
                style={{ width: '80px', cursor: 'pointer' }}
              >
                <div
                  className="category-thumb-card mb-1.5 shadow-2xs"
                  style={{
                    border: isSelected ? '2.5px solid #E90064' : '1px solid #EAECF0',
                    transform: isSelected ? 'scale(1.04)' : 'scale(1)',
                    boxShadow: isSelected ? '0 4px 12px rgba(233, 0, 100, 0.25)' : 'none',
                    borderRadius: '16px',
                    height: '80px',
                    overflow: 'hidden',
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
        {/* 3. Desktop Header Row: Title, Record Count, Items Per Page, Sort & Filter */}
        <div className="d-none d-md-flex align-items-end justify-content-between mb-3 px-1">
          <div>
            <h1
              className="fw-bolder mb-1 text-dark text-capitalize"
              style={{
                fontFamily: 'var(--font-heading-family)',
                fontSize: 'clamp(1.9rem, 3.1vw, 2.6rem)',
                letterSpacing: '-0.5px',
                color: '#17233B',
              }}
            >
              {currentTitle}
            </h1>
            <p className="text-muted small mb-0" style={{ fontSize: '0.88rem' }}>
              Handcrafted pure silks and luxury fabrics directly from our physical stores.
            </p>
          </div>

          <div className="d-flex align-items-center gap-2.5 flex-wrap justify-content-end">
            {/* Record Count Badge */}
            <span
              className="badge bg-white text-dark border px-3 py-2 rounded-pill fw-semibold shadow-xs"
              style={{ fontSize: '0.82rem', borderColor: '#EAECF0' }}
            >
              {currentTotal > 0 ? (
                <span>
                  Showing <strong>{startIndex}–{endIndex}</strong> of <strong>{currentTotal}</strong>
                </span>
              ) : (
                <span>0 products</span>
              )}
            </span>

            {/* Items Per Page Selector */}
            <div className="d-flex align-items-center gap-1.5 bg-white border rounded-pill px-2.5 py-1 shadow-xs">
              <span className="small text-muted fw-semibold" style={{ fontSize: '0.78rem' }}>Show:</span>
              <select
                aria-label="Items per page"
                className="form-select form-select-sm border-0 bg-transparent p-0 fw-bold text-dark cursor-pointer"
                style={{ width: 'auto', fontSize: '0.8rem', outline: 'none', boxShadow: 'none' }}
                value={limitParam}
                onChange={(e) => handleLimitChange(e.target.value)}
              >
                <option value="8">8</option>
                <option value="12">12</option>
                <option value="16">16</option>
                <option value="24">24</option>
              </select>
            </div>

            {/* Quick Sort Dropdown */}
            <select
              aria-label="Sort products"
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

            {/* Filter Trigger Button (Opens Filter Drawer) */}
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

        {/* 4. Sticky Category Filter Pills Scroller */}
        <div
          className="d-flex gap-2 overflow-x-auto pb-2.5 mb-2.5 mb-md-3 scrollbar-hidden text-nowrap align-items-center"
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

        {/* 5. Active Filters Chips Strip (Interactive Badges) */}
        {activeFiltersCount > 0 && (
          <div className="d-flex align-items-center gap-2 flex-wrap mb-3 px-1">
            <span className="small text-muted fw-bold text-uppercase" style={{ fontSize: '0.72rem', letterSpacing: '0.04em' }}>
              Active Filters:
            </span>

            {categoryParam && (
              <span
                className="badge rounded-pill d-inline-flex align-items-center gap-1.5 px-3 py-1.5 fw-semibold border shadow-2xs"
                style={{ backgroundColor: '#FFF0F5', color: '#E90064', borderColor: '#F0E7ED', fontSize: '0.78rem' }}
              >
                <span>Category: {activeCatObj?.name || categoryParam}</span>
                <X
                  size={13}
                  className="cursor-pointer hover-opacity"
                  onClick={() => updateFilter('category', '')}
                  title="Remove Category"
                />
              </span>
            )}

            {storeParam && (
              <span
                className="badge rounded-pill d-inline-flex align-items-center gap-1.5 px-3 py-1.5 fw-semibold border shadow-2xs"
                style={{ backgroundColor: '#EEF4FF', color: '#087CE5', borderColor: '#D0E1FD', fontSize: '0.78rem' }}
              >
                <Store size={12} />
                <span>Store: {storeParam === 'AS' ? 'Aaradhya Silks' : 'Aaradhya Fabrics'}</span>
                <X
                  size={13}
                  className="cursor-pointer hover-opacity"
                  onClick={() => updateFilter('store', '')}
                  title="Remove Store Filter"
                />
              </span>
            )}

            {(minPriceParam || maxPriceParam) && (
              <span
                className="badge rounded-pill d-inline-flex align-items-center gap-1.5 px-3 py-1.5 fw-semibold border shadow-2xs"
                style={{ backgroundColor: '#F8F9FA', color: '#17233B', borderColor: '#E2E8F0', fontSize: '0.78rem' }}
              >
                <Tag size={12} />
                <span>
                  Price: ₹{minPriceParam || '0'} – ₹{maxPriceParam || 'Max'}
                </span>
                <X
                  size={13}
                  className="cursor-pointer hover-opacity"
                  onClick={() => {
                    setLocalMinPrice('');
                    setLocalMaxPrice('');
                    const next = new URLSearchParams(searchParams);
                    next.delete('minPrice');
                    next.delete('maxPrice');
                    next.set('page', '1');
                    setSearchParams(next);
                  }}
                  title="Remove Price Filter"
                />
              </span>
            )}

            {inStockParam && (
              <span
                className="badge rounded-pill d-inline-flex align-items-center gap-1.5 px-3 py-1.5 fw-semibold border shadow-2xs"
                style={{ backgroundColor: '#F0FDF4', color: '#16A34A', borderColor: '#DCFCE7', fontSize: '0.78rem' }}
              >
                <Check size={12} />
                <span>In Stock Only</span>
                <X
                  size={13}
                  className="cursor-pointer hover-opacity"
                  onClick={() => updateFilter('inStock', false)}
                  title="Remove In Stock Filter"
                />
              </span>
            )}

            {searchParam && (
              <span
                className="badge rounded-pill d-inline-flex align-items-center gap-1.5 px-3 py-1.5 fw-semibold border shadow-2xs"
                style={{ backgroundColor: '#F8F9FA', color: '#17233B', borderColor: '#E2E8F0', fontSize: '0.78rem' }}
              >
                <Search size={12} />
                <span>"{searchParam}"</span>
                <X
                  size={13}
                  className="cursor-pointer hover-opacity"
                  onClick={() => updateFilter('search', '')}
                  title="Remove Search"
                />
              </span>
            )}

            <button
              type="button"
              onClick={clearAllFilters}
              className="btn btn-link btn-sm p-0 text-decoration-none fw-bold small ms-1"
              style={{ color: '#DC2626', fontSize: '0.78rem' }}
            >
              Reset All
            </button>
          </div>
        )}

        {/* 6. Full-Width Responsive Product Grid (4 Per Row Desktop, 3 Tablet, 2 Mobile - Zero Sidebar) */}
        {loading ? (
          <div className="product-grid-4">
            {Array.from({ length: limitParam > 8 ? 8 : limitParam }).map((_, i) => (
              <div
                key={i}
                className="card border-0 shadow-sm p-4 text-center rounded-4 bg-white d-flex flex-column align-items-center justify-content-center"
                style={{ minHeight: '340px', borderRadius: '20px' }}
              >
                <div className="spinner-border spinner-border-sm text-danger mb-2" role="status"></div>
                <span className="small text-muted" style={{ fontSize: '0.82rem' }}>
                  Loading boutique catalog...
                </span>
              </div>
            ))}
          </div>
        ) : products.length === 0 ? (
          <div
            className="card border-0 shadow-sm p-5 text-center rounded-4 bg-white mx-auto my-4"
            style={{ maxWidth: '600px', borderColor: '#F0E7ED', borderRadius: '24px' }}
          >
            <Search size={44} className="mx-auto text-muted mb-3" />
            <h4 className="fw-bold text-dark">No Products Found</h4>
            <p className="text-muted small mb-4">
              We couldn't find items matching your selected criteria. Try selecting another category or clearing filters.
            </p>
            <div>
              <button
                className="btn text-white px-4 py-2 rounded-pill fw-semibold shadow-sm"
                style={{ backgroundColor: '#E90064' }}
                onClick={clearAllFilters}
              >
                Clear All Filters
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

        {/* 7. Fully Responsive Pagination & Records Navigation Bar */}
        {!loading && paginationMeta.totalPages > 1 && (
          <div className="catalog-pagination-bar mt-4 pt-3 pb-2 border-top d-flex flex-column flex-sm-row align-items-center justify-content-between gap-3">
            {/* Left: Record Range & Page Status */}
            <div className="text-muted small fw-medium text-center text-sm-start" style={{ fontSize: '0.86rem' }}>
              Showing <strong className="text-dark">{startIndex}–{endIndex}</strong> of{' '}
              <strong className="text-dark">{paginationMeta.total}</strong> products &bull; Page{' '}
              <strong className="text-dark">{paginationMeta.page}</strong> of{' '}
              <strong className="text-dark">{paginationMeta.totalPages}</strong>
            </div>

            {/* Center/Right: Numbered Page Buttons & Navigation Arrows */}
            <div className="d-flex align-items-center gap-1.5 flex-wrap justify-content-center">
              {/* First Page Button */}
              <button
                type="button"
                className="btn btn-sm rounded-circle p-1.5 d-flex align-items-center justify-content-center bg-white border shadow-2xs pagination-nav-btn"
                disabled={paginationMeta.page <= 1}
                onClick={() => handlePageChange(1)}
                title="First Page"
                aria-label="First Page"
              >
                <ChevronsLeft size={16} />
              </button>

              {/* Prev Page Button */}
              <button
                type="button"
                className="btn btn-sm rounded-pill px-2.5 py-1.5 d-flex align-items-center gap-1 bg-white border shadow-2xs pagination-nav-btn"
                disabled={paginationMeta.page <= 1}
                onClick={() => handlePageChange(paginationMeta.page - 1)}
                title="Previous Page"
                aria-label="Previous Page"
              >
                <ChevronLeft size={16} />
                <span className="d-none d-sm-inline small fw-semibold">Prev</span>
              </button>

              {/* Numbered Page Buttons */}
              <div className="d-flex align-items-center gap-1">
                {generatePageNumbers().map((num, i) => {
                  if (num === '...') {
                    return (
                      <span key={`dots-${i}`} className="px-1 text-muted small fw-bold">
                        &hellip;
                      </span>
                    );
                  }
                  const isCurrent = num === paginationMeta.page;
                  return (
                    <button
                      key={`page-${num}`}
                      type="button"
                      onClick={() => handlePageChange(num)}
                      className="btn btn-sm rounded-circle d-flex align-items-center justify-content-center fw-bold pagination-num-btn"
                      style={{
                        width: '34px',
                        height: '34px',
                        backgroundColor: isCurrent ? '#E90064' : '#FFFFFF',
                        color: isCurrent ? '#FFFFFF' : '#17233B',
                        border: isCurrent ? '1px solid #E90064' : '1px solid #EAECF0',
                        fontSize: '0.84rem',
                        boxShadow: isCurrent ? '0 2px 8px rgba(233, 0, 100, 0.3)' : 'none',
                      }}
                    >
                      {num}
                    </button>
                  );
                })}
              </div>

              {/* Next Page Button */}
              <button
                type="button"
                className="btn btn-sm rounded-pill px-2.5 py-1.5 d-flex align-items-center gap-1 bg-white border shadow-2xs pagination-nav-btn"
                disabled={paginationMeta.page >= paginationMeta.totalPages}
                onClick={() => handlePageChange(paginationMeta.page + 1)}
                title="Next Page"
                aria-label="Next Page"
              >
                <span className="d-none d-sm-inline small fw-semibold">Next</span>
                <ChevronRight size={16} />
              </button>

              {/* Last Page Button */}
              <button
                type="button"
                className="btn btn-sm rounded-circle p-1.5 d-flex align-items-center justify-content-center bg-white border shadow-2xs pagination-nav-btn"
                disabled={paginationMeta.page >= paginationMeta.totalPages}
                onClick={() => handlePageChange(paginationMeta.totalPages)}
                title="Last Page"
                aria-label="Last Page"
              >
                <ChevronsRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* 8. Sticky Bottom Advance Filter Bar (Mobile View Only) */}
      <div
        className="sticky-mobile-filter-bar d-flex d-md-none"
        onClick={() => setShowFilterDrawer(true)}
      >
        <span
          className="text-white opacity-75 fw-semibold text-uppercase"
          style={{ fontSize: '0.74rem', letterSpacing: '0.06em' }}
        >
          {paginationMeta.total || products.length} PRODUCTS
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

      {/* 9. Modern Slide-Over Filter Drawer (Offcanvas Desktop & Bottom-Sheet Mobile) */}
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
                {/* Store Filter (Aaradhya Silks vs Fabrics) */}
                <div className="mb-4">
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

                {/* Categories */}
                <div className="mb-4 border-top pt-3">
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
                  Apply Filters ({paginationMeta.total || products.length} Items)
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Bottom clearance for mobile footer & filter bars */}
      <div style={{ height: '110px' }} className="d-md-none" />
    </div>
  );
};

export default ProductListingPage;
