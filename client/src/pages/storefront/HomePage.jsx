import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowRight,
  ChevronRight,
  ShieldCheck,
  Truck,
  RotateCcw,
  CheckCircle2,
  Package,
  HelpCircle,
  Plus,
  Minus,
  Sparkles,
  ShoppingBag,
  Heart,
  ChevronLeft,
} from 'lucide-react';
import ProductCard from '../../components/common/ProductCard';
import CuratedFits from '../../components/common/CuratedFits';
import LookbookGallery from '../../components/common/LookbookGallery';
import HeroBanner from '../../components/common/HeroBanner';
import axiosClient from '../../api/axiosClient';

// Animation variants
const fadeInUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      delay: i * 0.08,
      ease: [0.25, 1, 0.5, 1],
    },
  }),
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.06,
      delayChildren: 0.1,
    },
  },
};

const HomePage = () => {
  const [highlights, setHighlights] = useState(null);
  const [banners, setBanners] = useState([]);
  const [activeBannerIndex, setActiveBannerIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Fetch homepage highlights and banners
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [homeRes, bannerRes] = await Promise.all([
          axiosClient.get('/products/home/highlights'),
          axiosClient.get('/banners').catch(() => ({ success: false })),
        ]);

        if (homeRes.success) {
          setHighlights(homeRes.data);
        }
        if (bannerRes.success && bannerRes.data?.length > 0) {
          setBanners(bannerRes.data);
        }
      } catch (err) {
        console.error('Failed to load homepage data', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Auto rotate banners if more than 1
  useEffect(() => {
    if (banners.length <= 1) return;
    const timer = setInterval(() => {
      setActiveBannerIndex((prev) => (prev + 1) % banners.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [banners.length]);

  // Fallback hero if no banners from backend
  const currentBanner = banners[activeBannerIndex] || {
    title: 'Trendy Fashion',
    highlight: 'Better You',
    scriptTag: 'Style Your World',
    subtitle: 'Discover the latest collection in clothing for every occasion.',
    image: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=900&auto=format&fit=crop&q=80',
    ctaText: 'Shop Now',
    ctaLink: '/products',
    discount: '50%',
  };

  const defaultCategoryShortcuts = [
    { name: "Men's Fashion", link: '/products?category=mens-wear', img: 'https://images.unsplash.com/photo-1617137984095-74e4e5e3613f?w=300&auto=format&fit=crop&q=80' },
    { name: "Women's Fashion", link: '/category/sarees', img: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=300&auto=format&fit=crop&q=80' },
    { name: "Kids Fashion", link: '/products?category=kids-wear', img: 'https://images.unsplash.com/photo-1622290291468-a28f7a7dc6a8?w=300&auto=format&fit=crop&q=80' },
    { name: "Accessories", link: '/products?category=accessories', img: 'https://images.unsplash.com/photo-1601924994987-69e26d50dc26?w=300&auto=format&fit=crop&q=80' },
    { name: "Pure Silk Sarees", link: '/category/sarees', img: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=300&auto=format&fit=crop&q=80' },
    { name: "Dress Materials", link: '/category/dress-materials', img: 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=300&auto=format&fit=crop&q=80' },
    { name: "Running Fabrics", link: '/category/fabrics', img: 'https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?w=300&auto=format&fit=crop&q=80' },
    { name: "Festive Offers", link: '/products?deal=flash', img: 'https://images.unsplash.com/photo-1523381294911-8d3cead13475?w=300&auto=format&fit=crop&q=80' },
  ];

  const popularList = highlights?.popularCollections || highlights?.newArrivals || [];
  const bestSellersList = highlights?.bestSellers || [];

  return (
    <div className="homepage-wrapper">
      {/* 1. Full-Bleed Edge-to-Edge Hero Slider matching Nishorama (100% width, 92vh desktop, 80vh mobile) */}
      <HeroBanner />

      <div className="container py-4">
        {/* 2. Explore Categories: Single Horizontal Line, Sleek Circular Avatars (NO Square Cards) */}
      <section className="mb-4 mb-md-5">
        <div className="d-flex align-items-center justify-content-between mb-2 mb-md-3">
          <motion.div
            initial={{ opacity: 0, x: -15 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4 }}
          >
            <h5
              className="fw-bold mb-0 text-dark"
              style={{
                fontSize: 'clamp(1.2rem, 2.5vw, 1.55rem)',
                letterSpacing: '-0.3px',
                fontFamily: 'var(--font-heading-family)',
                color: '#17233B',
              }}
            >
              Explore Categories
            </h5>
          </motion.div>

          <Link to="/categories" className="text-decoration-none fw-semibold small d-flex align-items-center gap-1" style={{ color: '#E90064' }}>
            <span>View All</span>
            <ChevronRight size={14} />
          </Link>
        </div>

        {/* Center-Aligned Horizontal Scroller (No square cards, circular icons + full names) */}
        <div
          className="d-flex align-items-start justify-content-start justify-content-lg-center gap-3 gap-md-4 overflow-x-auto pb-2 scrollbar-hidden"
          style={{
            scrollbarWidth: 'none',
            msOverflowStyle: 'none',
            WebkitOverflowScrolling: 'touch',
            scrollSnapType: 'x mandatory',
          }}
        >
          {defaultCategoryShortcuts.map((cat, idx) => (
            <motion.div
              key={idx}
              whileHover={{ y: -4 }}
              transition={{ duration: 0.2 }}
              className="flex-shrink-0 text-center"
              style={{
                width: 'clamp(82px, 10.5vw, 102px)',
                scrollSnapAlign: 'center',
              }}
            >
              <Link
                to={cat.link}
                className="text-decoration-none d-flex flex-column align-items-center"
              >
                <div
                  className="rounded-circle overflow-hidden mb-2 d-flex align-items-center justify-content-center shadow-sm"
                  style={{
                    width: 'clamp(64px, 8.5vw, 80px)',
                    height: 'clamp(64px, 8.5vw, 80px)',
                    backgroundColor: '#FFF0F5',
                    border: '2.5px solid #F0E7ED',
                    padding: '2px',
                    transition: 'all 0.25s ease',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = '#E90064';
                    e.currentTarget.style.boxShadow = '0 6px 18px rgba(233, 0, 100, 0.25)';
                    e.currentTarget.style.transform = 'scale(1.06)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = '#F0E7ED';
                    e.currentTarget.style.boxShadow = '0 2px 6px rgba(0,0,0,0.06)';
                    e.currentTarget.style.transform = 'scale(1)';
                  }}
                >
                  <img
                    src={cat.img}
                    alt={cat.name}
                    className="w-100 h-100 rounded-circle"
                    style={{ objectFit: 'cover' }}
                    loading="lazy"
                  />
                </div>
                <span
                  className="fw-semibold text-dark text-center d-block w-100"
                  style={{
                    fontSize: 'clamp(0.72rem, 1vw, 0.82rem)',
                    letterSpacing: '-0.2px',
                    lineHeight: 1.25,
                    color: '#17233B',
                    whiteSpace: 'normal',
                    wordBreak: 'break-word',
                  }}
                >
                  {cat.name}
                </span>
              </Link>
            </motion.div>
          ))}
        </div>
      </section>

      {/* 3. Popular Collection Section */}
      <section className="mb-5" id="popular-collection">
        <div className="d-flex align-items-center justify-content-between mb-3">
          <motion.div
            initial={{ opacity: 0, x: -15 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4 }}
          >
            <h4
              className="fw-bold mb-0 text-dark"
              style={{
                fontSize: 'clamp(1.3rem, 2.7vw, 1.7rem)',
                letterSpacing: '-0.3px',
                fontFamily: 'var(--font-heading-family)',
                color: '#17233B',
              }}
            >
              Popular Collection
            </h4>
          </motion.div>

          <Link
            to="/products"
            className="btn btn-outline-dark btn-sm rounded-pill px-3 py-1 fw-semibold small"
          >
            <span>Discover More</span>
          </Link>
        </div>

        {/* Nishorama 4 Products Per Row Grid on Desktop, 2 on Mobile */}
        <div className="product-grid-4">
          {popularList.slice(0, 8).map((product, idx) => (
            <ProductCard key={product._id} product={product} index={idx} />
          ))}
        </div>
      </section>
      </div>

      {/* Curated Fits for you Component with Expanded Container & 5 per row */}
      <div className="container-fluid px-3 px-md-4 px-xl-5">
        <CuratedFits />
      </div>

      <div className="container py-2">

      {/* 4. Single Card Length Horizontal Scroller of 3 Cards */}
      <section className="mb-5">
        <div
          className="d-flex overflow-x-auto pb-2 scrollbar-hidden gap-3"
          style={{
            scrollSnapType: 'x mandatory',
            scrollbarWidth: 'none',
            msOverflowStyle: 'none',
            WebkitOverflowScrolling: 'touch',
          }}
        >
          {/* Card 1: Fashion for Every Mood (Magenta Themed) */}
          <motion.div
            whileHover={{ y: -4, scale: 1.01 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            className="card border-0 rounded-4 overflow-hidden position-relative shadow-sm p-4 text-white d-flex flex-column justify-content-center flex-grow-1"
            style={{
              flex: '0 0 clamp(280px, 86vw, 380px)',
              minHeight: '220px',
              scrollSnapAlign: 'start',
              background: 'linear-gradient(135deg, #E90064 0%, #C70054 60%, #9F0043 100%)',
              borderRadius: '22px',
            }}
          >
            {/* Background texture */}
            <div
              className="position-absolute end-0 top-0 bottom-0 w-50 opacity-25"
              style={{
                backgroundImage: 'url(https://images.unsplash.com/photo-1523381294911-8d3cead13475?w=600&auto=format&fit=crop&q=80)',
                backgroundSize: 'cover',
                backgroundPosition: 'center',
              }}
            />

            <div className="position-relative z-1" style={{ maxWidth: '280px' }}>
              <span
                className="fst-italic fw-medium d-block mb-1"
                style={{
                  fontSize: '1.15rem',
                  fontFamily: 'cursive, "Brush Script MT", Georgia, serif',
                }}
              >
                Fashion for
              </span>
              <h3 className="fw-bolder mb-2" style={{ lineHeight: 1.15, fontSize: '1.6rem' }}>
                Every Mood
              </h3>
              <p className="small text-white opacity-75 mb-3" style={{ fontSize: '0.8rem' }}>
                Handpicked silks & contemporary ready-to-wear
              </p>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="d-inline-block">
                <Link
                  to="/products"
                  className="btn bg-white rounded-pill px-3.5 py-1.5 fw-semibold small d-inline-flex align-items-center gap-1.5 shadow-sm"
                  style={{ color: '#E90064', fontSize: '0.82rem' }}
                >
                  <span>Explore More</span>
                  <ArrowRight size={14} />
                </Link>
              </motion.div>
            </div>
          </motion.div>

          {/* Card 2: Special Offer Flat 50% OFF (Lime/Leaf Green Themed) */}
          <motion.div
            whileHover={{ y: -4, scale: 1.01 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            className="card border-0 rounded-4 overflow-hidden position-relative shadow-sm p-4 d-flex flex-column justify-content-center flex-grow-1"
            style={{
              flex: '0 0 clamp(280px, 86vw, 380px)',
              minHeight: '220px',
              scrollSnapAlign: 'start',
              background: 'linear-gradient(135deg, #EAF8D9 0%, #DCF6C1 50%, #CFF0A9 100%)',
              border: '1px solid #D1EEA4',
              borderRadius: '22px',
            }}
          >
            {/* Background shopping bags imagery */}
            <div
              className="position-absolute end-0 top-0 bottom-0 w-50 opacity-30"
              style={{
                backgroundImage: 'url(https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=600&auto=format&fit=crop&q=80)',
                backgroundSize: 'cover',
                backgroundPosition: 'center',
              }}
            />

            <div className="position-relative z-1" style={{ maxWidth: '280px' }}>
              <span
                className="fst-italic fw-bold d-block mb-1"
                style={{
                  color: '#19B927',
                  fontSize: '1.15rem',
                  fontFamily: 'cursive, "Brush Script MT", Georgia, serif',
                }}
              >
                Special Offer
              </span>
              <h3 className="fw-bolder mb-2" style={{ color: '#17233B', lineHeight: 1.15, fontSize: '1.6rem' }}>
                Flat 50% OFF
              </h3>
              <p className="small text-muted mb-3" style={{ fontSize: '0.8rem' }}>
                Limited handloom weaves & festive festival specials
              </p>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="d-inline-block">
                <Link
                  to="/products?deal=flash"
                  className="btn rounded-pill px-3.5 py-1.5 fw-semibold small d-inline-flex align-items-center gap-1.5 text-white shadow-sm"
                  style={{ backgroundColor: '#19B927', borderColor: '#19B927', fontSize: '0.82rem' }}
                >
                  <span>Grab Now</span>
                  <ArrowRight size={14} />
                </Link>
              </motion.div>
            </div>
          </motion.div>

          {/* Card 3: Pure Silks & Artisan Fabrics (Deep Navy & Royal Blue) */}
          <motion.div
            whileHover={{ y: -4, scale: 1.01 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            className="card border-0 rounded-4 overflow-hidden position-relative shadow-sm p-4 text-white d-flex flex-column justify-content-center flex-grow-1"
            style={{
              flex: '0 0 clamp(280px, 86vw, 380px)',
              minHeight: '220px',
              scrollSnapAlign: 'start',
              background: 'linear-gradient(135deg, #17233B 0%, #1A365D 50%, #087CE5 100%)',
              borderRadius: '22px',
            }}
          >
            {/* Background fabrics texture */}
            <div
              className="position-absolute end-0 top-0 bottom-0 w-50 opacity-25"
              style={{
                backgroundImage: 'url(https://images.unsplash.com/photo-1607083206869-4c7672e72a8a?w=600&auto=format&fit=crop&q=80)',
                backgroundSize: 'cover',
                backgroundPosition: 'center',
              }}
            />

            <div className="position-relative z-1" style={{ maxWidth: '280px' }}>
              <span
                className="fst-italic fw-medium d-block mb-1"
                style={{
                  color: '#B8E000',
                  fontSize: '1.15rem',
                  fontFamily: 'cursive, "Brush Script MT", Georgia, serif',
                }}
              >
                Handloom Yardage
              </span>
              <h3 className="fw-bolder mb-2" style={{ lineHeight: 1.15, fontSize: '1.6rem' }}>
                Artisan Fabrics
              </h3>
              <p className="small text-white opacity-75 mb-3" style={{ fontSize: '0.8rem' }}>
                Unstitched luxury dress materials & pure silks
              </p>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="d-inline-block">
                <Link
                  to="/products?category=fabrics"
                  className="btn bg-white rounded-pill px-3.5 py-1.5 fw-semibold small d-inline-flex align-items-center gap-1.5 shadow-sm"
                  style={{ color: '#087CE5', fontSize: '0.82rem' }}
                >
                  <span>Shop Fabrics</span>
                  <ArrowRight size={14} />
                </Link>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* 5. Best Sellers Section - Exactly 5 products per row on laptop with React Motion */}
      <section className="mb-5">
        <div className="d-flex align-items-center justify-content-between mb-3">
          <motion.div
            initial={{ opacity: 0, x: -15 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4 }}
          >
            <h4
              className="fw-bold mb-0 text-dark"
              style={{
                fontSize: 'clamp(1.3rem, 2.7vw, 1.7rem)',
                letterSpacing: '-0.3px',
                fontFamily: 'var(--font-heading-family)',
                color: '#17233B',
              }}
            >
              Best Sellers
            </h4>
          </motion.div>

          <Link
            to="/products?sort=popular"
            className="btn btn-outline-dark btn-sm rounded-pill px-3 py-1 fw-semibold small"
          >
            <span>Discover More</span>
          </Link>
        </div>

        {/* Nishorama 4 Products Per Row Grid on Desktop, 2 on Mobile */}
        <div className="product-grid-4">
          {bestSellersList.slice(0, 8).map((product, idx) => (
            <ProductCard key={product._id} product={product} index={idx} />
          ))}
        </div>
      </section>
      </div>

      {/* Full-Bleed Infinite Auto-Sliding Gallery matching Nishorama */}
      <LookbookGallery />

    </div>
  );
};

export default HomePage;
