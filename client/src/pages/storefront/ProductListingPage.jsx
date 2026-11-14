import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import {
  SlidersHorizontal,
  X,
  Filter,
  Check,
  Search,
  RotateCcw,
} from 'lucide-react';
import ProductCard from '../../components/common/ProductCard';
import axiosClient from '../../api/axiosClient';

const ProductListingPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [meta, setMeta] = useState({ total: 0, totalPages: 1, page: 1 });
  const [loading, setLoading] = useState(true);
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  // Filter states
  const categoryParam = searchParams.get('category') || '';
  const searchParam = searchParams.get('search') || '';
  const sortParam = searchParams.get('sort') || 'newest';
  const minPriceParam = searchParams.get('minPrice') || '';
  const maxPriceParam = searchParams.get('maxPrice') || '';
  const inStockParam = searchParams.get('inStock') === 'true';

  const [localMinPrice, setLocalMinPrice] = useState(minPriceParam);
  const [localMaxPrice, setLocalMaxPrice] = useState(maxPriceParam);

  // Active filters count for badge
  const activeFiltersCount =
    (categoryParam ? 1 : 0) +
    (minPriceParam || maxPriceParam ? 1 : 0) +
    (inStockParam ? 1 : 0);

  // Load categories
  useEffect(() => {
    const fetchMetadata = async () => {
      try {
        const catsRes = await axiosClient.get('/categories');
        if (catsRes.success) setCategories(catsRes.data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchMetadata();
  }, []);

  // Fetch filtered products
  useEffect(() => {
    const fetchFiltered = async () => {
      setLoading(true);
      try {
        const query = searchParams.toString();
        const res = await axiosClient.get(`/products?${query}`);
        if (res.success) {
          setProducts(res.data);
          if (res.meta) setMeta(res.meta);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchFiltered();
  }, [searchParams]);

  const updateFilter = (key, value) => {
    const nextParams = new URLSearchParams(searchParams);
    if (value === null || value === '' || value === false) {
      nextParams.delete(key);
    } else {
      nextParams.set(key, value);
    }
    nextParams.set('page', '1');
    setSearchParams(nextParams);
  };

  const clearAllFilters = () => {
    setLocalMinPrice('');
    setLocalMaxPrice('');
    setSearchParams({});
    setShowMobileFilters(false);
  };

  const handlePriceFilterSubmit = (e) => {
    e?.preventDefault();
    const nextParams = new URLSearchParams(searchParams);
    if (localMinPrice) nextParams.set('minPrice', localMinPrice);
    else nextParams.delete('minPrice');

    if (localMaxPrice) nextParams.set('maxPrice', localMaxPrice);
    else nextParams.delete('maxPrice');

    setSearchParams(nextParams);
    setShowMobileFilters(false);
  };

  return (
    <div className="container py-3 py-md-4">
      {/* Breadcrumbs */}
      <nav aria-label="breadcrumb" className="mb-2.5">
        <ol className="breadcrumb small mb-1" style={{ fontSize: '0.8rem' }}>
          <li className="breadcrumb-item"><Link to="/" className="text-decoration-none text-muted">Home</Link></li>
          <li className="breadcrumb-item"><Link to="/products" className="text-decoration-none text-muted">Products</Link></li>
          {categoryParam && <li className="breadcrumb-item active text-capitalize">{categoryParam.replace('-', ' ')}</li>}
          {searchParam && <li className="breadcrumb-item active">Search: "{searchParam}"</li>}
        </ol>
      </nav>

      {/* Mobile Top Horizontal Categories Chip Strip */}
      <div
        className="d-lg-none mb-3 overflow-x-auto pb-1 d-flex gap-2 scrollbar-hidden"
        style={{
          scrollbarWidth: 'none',
          msOverflowStyle: 'none',
          WebkitOverflowScrolling: 'touch',
        }}
      >
        <button
          type="button"
          className={`btn btn-sm rounded-pill px-3 py-1 text-nowrap fw-semibold ${
            !categoryParam ? 'text-white shadow-sm' : 'bg-white text-dark border'
          }`}
          style={{
            backgroundColor: !categoryParam ? '#E90064' : '#FFFFFF',
            borderColor: !categoryParam ? '#E90064' : '#E2E8F0',
            fontSize: '0.8rem',
          }}
          onClick={() => updateFilter('category', '')}
        >
          All
        </button>
        {categories.map((c) => (
          <button
            key={c._id}
            type="button"
            className={`btn btn-sm rounded-pill px-3 py-1 text-nowrap fw-semibold ${
              categoryParam === c.slug ? 'text-white shadow-sm' : 'bg-white text-dark border'
            }`}
            style={{
              backgroundColor: categoryParam === c.slug ? '#E90064' : '#FFFFFF',
              borderColor: categoryParam === c.slug ? '#E90064' : '#E2E8F0',
              fontSize: '0.8rem',
            }}
            onClick={() => updateFilter('category', c.slug)}
          >
            {c.name}
          </button>
        ))}
      </div>

      <div className="row g-4">
        {/* Left Filter Sidebar - Visible ONLY on Desktop (d-none d-lg-block) */}
        <div className="col-lg-3 d-none d-lg-block">
          <div className="card card-modern p-3 sticky-top" style={{ top: '80px', zIndex: 10, borderColor: '#F0E7ED', borderRadius: '18px' }}>
            <div className="d-flex justify-content-between align-items-center mb-3 pb-2 border-bottom">
              <h6 className="fw-bold mb-0 d-flex align-items-center gap-2 text-dark">
                <Filter size={18} style={{ color: '#E90064' }} /> Filters
              </h6>
              {activeFiltersCount > 0 && (
                <button
                  className="btn btn-link p-0 small text-decoration-none fw-semibold"
                  style={{ color: '#E90064', fontSize: '0.78rem' }}
                  onClick={clearAllFilters}
                >
                  Clear All
                </button>
              )}
            </div>

            {/* Category Filter */}
            <div className="mb-4">
              <h6 className="fw-bold small mb-2 text-uppercase text-muted" style={{ fontSize: '0.74rem' }}>
                Categories
              </h6>
              <div className="d-flex flex-column gap-1">
                <div
                  className={`p-2 rounded-2 small cursor-pointer d-flex justify-content-between ${
                    !categoryParam ? 'fw-bold text-white shadow-sm' : 'text-dark hover-bg-light'
                  }`}
                  style={{
                    cursor: 'pointer',
                    backgroundColor: !categoryParam ? '#E90064' : 'transparent',
                    borderRadius: '8px',
                  }}
                  onClick={() => updateFilter('category', '')}
                >
                  <span>All Categories</span>
                </div>
                {categories.map((c) => (
                  <div
                    key={c._id}
                    className={`p-2 rounded-2 small cursor-pointer d-flex justify-content-between align-items-center ${
                      categoryParam === c.slug ? 'fw-bold text-white shadow-sm' : 'text-dark hover-bg-light'
                    }`}
                    style={{
                      cursor: 'pointer',
                      backgroundColor: categoryParam === c.slug ? '#E90064' : 'transparent',
                      borderRadius: '8px',
                    }}
                    onClick={() => updateFilter('category', c.slug)}
                  >
                    <span>{c.name}</span>
                    {c.productCount > 0 && (
                      <span className={`badge rounded-pill small ${categoryParam === c.slug ? 'bg-white text-dark' : 'bg-light text-muted'}`}>
                        {c.productCount}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Price Range Filter */}
            <div className="mb-4 border-top pt-3">
              <h6 className="fw-bold small mb-2 text-uppercase text-muted" style={{ fontSize: '0.74rem' }}>
                Price Range (₹)
              </h6>
              <form onSubmit={handlePriceFilterSubmit}>
                <div className="d-flex align-items-center gap-2 mb-2">
                  <input
                    type="number"
                    className="form-control form-control-sm rounded-2"
                    placeholder="Min"
                    value={localMinPrice}
                    onChange={(e) => setLocalMinPrice(e.target.value)}
                  />
                  <span className="text-muted">-</span>
                  <input
                    type="number"
                    className="form-control form-control-sm rounded-2"
                    placeholder="Max"
                    value={localMaxPrice}
                    onChange={(e) => setLocalMaxPrice(e.target.value)}
                  />
                </div>
                <button
                  type="submit"
                  className="btn btn-sm w-100 rounded-pill fw-semibold text-white shadow-sm"
                  style={{ backgroundColor: '#17233B' }}
                >
                  Apply Price
                </button>
              </form>
            </div>

            {/* In Stock Availability */}
            <div className="border-top pt-3">
              <div className="form-check form-switch">
                <input
                  className="form-check-input"
                  type="checkbox"
                  id="inStockOnly"
                  checked={inStockParam}
                  onChange={(e) => updateFilter('inStock', e.target.checked)}
                />
                <label className="form-check-label small fw-semibold text-dark" htmlFor="inStockOnly">
                  In Stock Only
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* Right Product Grid Column */}
        <div className="col-12 col-lg-9">
          {/* Header Bar with Sorting, Filter Trigger & Count */}
          <div className="card border-0 shadow-sm p-2.5 p-sm-3 mb-3 mb-md-4 rounded-3 bg-white" style={{ borderColor: '#F0E7ED' }}>
            <div className="d-flex flex-wrap align-items-center justify-content-between gap-2">
              <div>
                <h5 className="fw-bolder mb-0 text-dark" style={{ fontSize: 'clamp(1rem, 2vw, 1.25rem)' }}>
                  {categoryParam ? categoryParam.toUpperCase().replace('-', ' ') : searchParam ? `Results for "${searchParam}"` : 'All Fashion & Fabrics'}
                </h5>
                <small className="text-muted">Showing {products.length} products</small>
              </div>

              <div className="d-flex align-items-center gap-2">
                {/* Mobile Filter Button */}
                <button
                  type="button"
                  className="btn btn-sm btn-outline-dark rounded-pill px-3 py-1.5 fw-semibold d-inline-flex d-lg-none align-items-center gap-1.5 shadow-2xs"
                  onClick={() => setShowMobileFilters(true)}
                  style={{ fontSize: '0.8rem' }}
                >
                  <SlidersHorizontal size={14} />
                  <span>Filters</span>
                  {activeFiltersCount > 0 && (
                    <span className="badge rounded-circle text-white p-0 d-inline-flex align-items-center justify-content-center" style={{ backgroundColor: '#E90064', width: '18px', height: '18px', fontSize: '0.65rem' }}>
                      {activeFiltersCount}
                    </span>
                  )}
                </button>

                {/* Sort By Dropdown */}
                <div className="d-flex align-items-center gap-1.5">
                  <span className="small text-muted d-none d-sm-inline" style={{ fontSize: '0.8rem' }}>Sort:</span>
                  <select
                    className="form-select form-select-sm rounded-pill fw-medium"
                    style={{ width: 'auto', borderColor: '#F0E7ED', fontSize: '0.8rem', paddingRight: '2rem' }}
                    value={sortParam}
                    onChange={(e) => updateFilter('sort', e.target.value)}
                  >
                    <option value="newest">Newest Arrivals</option>
                    <option value="popular">Popularity / Best</option>
                    <option value="price_asc">Price: Low to High</option>
                    <option value="price_desc">Price: High to Low</option>
                    <option value="rating">Top Rated</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Product Grid - 2 columns on mobile, 3 on tablet, 4 on desktop */}
          {loading ? (
            <div className="product-grid-4">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="card border-0 shadow-sm p-4 text-center rounded-3 bg-white" style={{ minHeight: '260px' }}>
                  <div className="spinner-border text-danger mx-auto mb-2" role="status"></div>
                  <span className="small text-muted">Loading items...</span>
                </div>
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="card border-0 shadow-sm p-5 text-center rounded-4 bg-white" style={{ borderColor: '#F0E7ED' }}>
              <Search size={48} className="mx-auto text-muted mb-3" />
              <h5 className="fw-bold text-dark">No Products Found</h5>
              <p className="text-muted small mb-4">
                We couldn't find any items matching your selected filters or keywords. Try broadening your criteria.
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
      </div>

      {/* Mobile Slide-Over / Bottom Drawer Filter Modal */}
      {showMobileFilters && (
        <div
          className="modal fade show d-block"
          tabIndex="-1"
          style={{ backgroundColor: 'rgba(15, 23, 42, 0.65)', backdropFilter: 'blur(4px)', zIndex: 1060 }}
          onClick={() => setShowMobileFilters(false)}
        >
          <div
            className="modal-dialog modal-dialog-scrollable modal-dialog-bottom m-0 position-fixed bottom-0 start-0 end-0"
            style={{ maxWidth: '100%' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-content rounded-top-4 border-0 shadow-lg" style={{ maxHeight: '82vh' }}>
              <div className="modal-header border-bottom py-3 px-4 bg-white d-flex justify-content-between align-items-center">
                <div className="d-flex align-items-center gap-2">
                  <SlidersHorizontal size={18} style={{ color: '#E90064' }} />
                  <h6 className="fw-bold mb-0 text-dark">Filter Products</h6>
                  {activeFiltersCount > 0 && (
                    <span className="badge rounded-pill text-white" style={{ backgroundColor: '#E90064', fontSize: '0.7rem' }}>
                      {activeFiltersCount}
                    </span>
                  )}
                </div>
                <div className="d-flex align-items-center gap-3">
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
                    className="btn-close"
                    onClick={() => setShowMobileFilters(false)}
                    aria-label="Close"
                  />
                </div>
              </div>

              <div className="modal-body p-4 bg-white">
                {/* Categories */}
                <div className="mb-4">
                  <h6 className="fw-bold small mb-2 text-uppercase text-muted" style={{ fontSize: '0.74rem' }}>
                    Select Category
                  </h6>
                  <div className="d-flex flex-wrap gap-2">
                    <button
                      type="button"
                      className={`btn btn-sm rounded-pill px-3 py-1.5 fw-semibold ${
                        !categoryParam ? 'btn-primary text-white shadow-sm' : 'btn-light border text-dark'
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
                    {categories.map((c) => (
                      <button
                        key={c._id}
                        type="button"
                        className={`btn btn-sm rounded-pill px-3 py-1.5 fw-semibold ${
                          categoryParam === c.slug ? 'btn-primary text-white shadow-sm' : 'btn-light border text-dark'
                        }`}
                        style={{
                          backgroundColor: categoryParam === c.slug ? '#E90064' : '#F8FAFC',
                          borderColor: categoryParam === c.slug ? '#E90064' : '#E2E8F0',
                          fontSize: '0.8rem',
                        }}
                        onClick={() => updateFilter('category', c.slug)}
                      >
                        {c.name} {c.productCount > 0 ? `(${c.productCount})` : ''}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Price Range */}
                <div className="mb-4 border-top pt-3">
                  <h6 className="fw-bold small mb-2 text-uppercase text-muted" style={{ fontSize: '0.74rem' }}>
                    Price Range (₹)
                  </h6>
                  <div className="d-flex align-items-center gap-2 mb-2">
                    <input
                      type="number"
                      className="form-control form-control-sm rounded-2"
                      placeholder="Min"
                      value={localMinPrice}
                      onChange={(e) => setLocalMinPrice(e.target.value)}
                    />
                    <span className="text-muted">-</span>
                    <input
                      type="number"
                      className="form-control form-control-sm rounded-2"
                      placeholder="Max"
                      value={localMaxPrice}
                      onChange={(e) => setLocalMaxPrice(e.target.value)}
                    />
                  </div>
                </div>

                {/* In Stock */}
                <div className="border-top pt-3 mb-2">
                  <div className="form-check form-switch d-flex justify-content-between align-items-center ps-0">
                    <label className="form-check-label small fw-semibold text-dark" htmlFor="mobileInStockOnly">
                      Show In Stock Items Only
                    </label>
                    <input
                      className="form-check-input ms-0"
                      type="checkbox"
                      id="mobileInStockOnly"
                      checked={inStockParam}
                      onChange={(e) => updateFilter('inStock', e.target.checked)}
                      style={{ cursor: 'pointer' }}
                    />
                  </div>
                </div>
              </div>

              <div className="modal-footer border-top p-3 bg-light">
                <button
                  type="button"
                  className="btn w-100 py-2.5 rounded-pill fw-bold text-white shadow-sm"
                  style={{ backgroundColor: '#E90064', borderColor: '#E90064' }}
                  onClick={handlePriceFilterSubmit}
                >
                  Apply Filters ({products.length} Items)
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Mobile Bottom Bar Clearance Spacer */}
      <div style={{ height: '75px' }} className="d-md-none" />
    </div>
  );
};

export default ProductListingPage;
