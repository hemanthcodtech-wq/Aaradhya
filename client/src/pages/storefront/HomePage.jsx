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
import {
  FaCertificate,
  FaTruckFast,
  FaLayerGroup,
  FaFireFlameCurved,
  FaCrown,
  FaCheck,
  FaBoxOpen,
  FaHouseCircleCheck,
  FaQuestion,
  FaComments,
  FaChevronDown,
  FaLocationDot,
} from 'react-icons/fa6';
import AnimatedFaIcon from '../../components/common/AnimatedFaIcon';
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
  const [activeFaq, setActiveFaq] = useState(0);
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
            className="d-flex align-items-center gap-2"
          >
            <AnimatedFaIcon icon={FaLayerGroup} size={18} color="#E90064" animation="float" />
            <h5 className="fw-bolder mb-0 text-dark" style={{ letterSpacing: '-0.3px', color: '#17233B' }}>
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

      {/* 3. Popular Collection Section - Exactly 5 products per row on laptop with Staggered Motion */}
      <section className="mb-5" id="popular-collection">
        <div className="d-flex align-items-center justify-content-between mb-3">
          <motion.div
            initial={{ opacity: 0, x: -15 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4 }}
            className="d-flex align-items-center gap-2"
          >
            <AnimatedFaIcon icon={FaFireFlameCurved} size={19} color="#E90064" animation="pulse" />
            <h4 className="fw-bolder mb-0 text-dark" style={{ letterSpacing: '-0.3px', color: '#17233B' }}>
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

      {/* Curated Fits for you Component matching Nishorama */}
      <CuratedFits />

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
            className="d-flex align-items-center gap-2"
          >
            <AnimatedFaIcon icon={FaCrown} size={19} color="#E90064" animation="wiggle" />
            <h4 className="fw-bolder mb-0 text-dark" style={{ letterSpacing: '-0.3px', color: '#17233B' }}>
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

      <div className="container py-4">
      {/* 6. Live Order Tracking Flow with Redesigned Luxury Tracker Card */}
      <section className="mb-5">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.55 }}
          className="card border-0 rounded-4 p-4 p-md-5 shadow-lg position-relative overflow-hidden text-white"
          style={{
            background: 'linear-gradient(135deg, #17233B 0%, #1A2A47 50%, #111A2D 100%)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            borderRadius: '26px',
          }}
        >
          {/* Ambient Lighting Orbs */}
          <div
            className="position-absolute"
            style={{
              top: '-60px',
              right: '-60px',
              width: '260px',
              height: '260px',
              background: 'radial-gradient(circle, rgba(233, 0, 100, 0.15) 0%, transparent 70%)',
              borderRadius: '50%',
              pointerEvents: 'none',
            }}
          />
          <div
            className="position-absolute"
            style={{
              bottom: '-60px',
              left: '20%',
              width: '240px',
              height: '240px',
              background: 'radial-gradient(circle, rgba(25, 185, 39, 0.15) 0%, transparent 70%)',
              borderRadius: '50%',
              pointerEvents: 'none',
            }}
          />

          <div className="row align-items-center g-4 position-relative z-1">
            <div className="col-lg-5">
              <span
                className="badge px-3 py-1.5 rounded-pill mb-2.5 fw-bold text-uppercase d-inline-flex align-items-center gap-1.5"
                style={{ backgroundColor: 'rgba(25, 185, 39, 0.18)', color: '#4ADE80', fontSize: '0.74rem' }}
              >
                <AnimatedFaIcon icon={FaTruckFast} size={12} color="#4ADE80" animation="bounce-subtle" />
                <span>Aaradhya Express Dispatch</span>
              </span>
              <h2 className="display-6 fw-bolder mb-3 text-white" style={{ lineHeight: 1.2 }}>
                Your order. Every step, in view.
              </h2>
              <p className="text-light opacity-75 small mb-4" style={{ fontSize: '0.92rem', lineHeight: 1.6 }}>
                Track every pure silk saree, unstitched fabric, and kurti directly from our master weavers to your doorstep with real-time updates.
              </p>

              {/* Instant Order Search Form */}
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  const val = e.target.orderInput?.value?.trim();
                  if (val) {
                    navigate(`/orders/track?id=${encodeURIComponent(val)}`);
                  } else {
                    navigate('/orders/track');
                  }
                }}
                className="position-relative mb-3"
                style={{ maxWidth: '380px' }}
              >
                <input
                  name="orderInput"
                  type="text"
                  className="form-control rounded-pill border-0 py-2.5 ps-3.5 pe-5 shadow-sm text-dark"
                  placeholder="Enter Order ID (e.g. ORD-2026-0001)"
                  style={{ fontSize: '0.86rem', backgroundColor: '#FFFFFF' }}
                />
                <button
                  type="submit"
                  className="btn rounded-pill position-absolute end-0 top-50 translate-middle-y me-1 px-3 py-1.5 text-white fw-bold shadow-sm"
                  style={{ backgroundColor: '#E90064', fontSize: '0.78rem' }}
                >
                  Track Now
                </button>
              </form>
            </div>

            <div className="col-lg-7">
              {/* Glassmorphic Dispatch Tracker Card */}
              <div
                className="rounded-4 p-4 shadow-sm"
                style={{
                  backgroundColor: 'rgba(255, 255, 255, 0.07)',
                  backdropFilter: 'blur(16px)',
                  border: '1px solid rgba(255, 255, 255, 0.14)',
                }}
              >
                <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-2">
                  <div className="d-flex align-items-center gap-2">
                    <span className="small fw-bold text-white-50 text-uppercase tracking-wider" style={{ fontSize: '0.75rem', letterSpacing: '0.05em' }}>
                      SAMPLE DISPATCH PROGRESS
                    </span>
                    <span className="badge rounded-pill bg-white text-dark py-0.5 px-2 small" style={{ fontSize: '0.68rem' }}>
                      #AS-2026-7842
                    </span>
                  </div>
                  <span
                    className="badge rounded-pill fw-semibold d-inline-flex align-items-center gap-1.5 py-1 px-2.5"
                    style={{ backgroundColor: 'rgba(25, 185, 39, 0.22)', color: '#4ADE80', fontSize: '0.72rem' }}
                  >
                    <span className="rounded-circle d-inline-block" style={{ width: '6px', height: '6px', backgroundColor: '#4ADE80' }}></span>
                    <span>On Schedule</span>
                  </span>
                </div>

                {/* Animated 4-Step Milestone Flow */}
                <div className="position-relative my-4">
                  <div className="progress" style={{ height: '4px', overflow: 'hidden', backgroundColor: 'rgba(255,255,255,0.15)' }}>
                    <motion.div
                      className="progress-bar"
                      initial={{ width: 0 }}
                      whileInView={{ width: '70%' }}
                      viewport={{ once: true }}
                      transition={{ duration: 1.2, ease: 'easeOut' }}
                      style={{
                        background: 'linear-gradient(90deg, #19B927 0%, #4ADE80 100%)',
                        boxShadow: '0 0 10px rgba(74, 222, 128, 0.6)',
                      }}
                    />
                  </div>

                  <div className="d-flex justify-content-between position-relative" style={{ marginTop: '-15px' }}>
                    {/* Step 1 */}
                    <div className="text-center">
                      <motion.div
                        initial={{ scale: 0 }}
                        whileInView={{ scale: 1 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.2, type: 'spring' }}
                        className="rounded-circle text-white d-flex align-items-center justify-content-center mx-auto shadow"
                        style={{ width: '30px', height: '30px', backgroundColor: '#19B927', fontSize: '0.75rem' }}
                      >
                        <FaCheck size={12} />
                      </motion.div>
                      <span className="d-block fw-bold text-white small mt-1.5" style={{ fontSize: '0.78rem' }}>Paid</span>
                      <small className="text-white-50" style={{ fontSize: '0.68rem' }}>Confirmed</small>
                    </div>

                    {/* Step 2 */}
                    <div className="text-center">
                      <motion.div
                        initial={{ scale: 0 }}
                        whileInView={{ scale: 1 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.4, type: 'spring' }}
                        className="rounded-circle text-white d-flex align-items-center justify-content-center mx-auto shadow"
                        style={{ width: '30px', height: '30px', backgroundColor: '#19B927', fontSize: '0.75rem' }}
                      >
                        <FaCheck size={12} />
                      </motion.div>
                      <span className="d-block fw-bold text-white small mt-1.5" style={{ fontSize: '0.78rem' }}>Packed</span>
                      <small className="text-white-50" style={{ fontSize: '0.68rem' }}>Loom Verified</small>
                    </div>

                    {/* Step 3 (Active) */}
                    <div className="text-center">
                      <motion.div
                        initial={{ scale: 0 }}
                        whileInView={{ scale: 1 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.6, type: 'spring' }}
                        className="rounded-circle text-white d-flex align-items-center justify-content-center mx-auto shadow position-relative"
                        style={{
                          width: '32px',
                          height: '32px',
                          backgroundColor: '#E90064',
                          border: '2px solid #FFFFFF',
                          boxShadow: '0 0 12px rgba(233, 0, 100, 0.7)',
                        }}
                      >
                        <AnimatedFaIcon icon={FaTruckFast} size={14} color="#FFFFFF" animation="bounce-subtle" />
                      </motion.div>
                      <span className="d-block fw-bold text-white small mt-1.5" style={{ fontSize: '0.78rem' }}>In Transit</span>
                      <small className="fw-semibold text-warning" style={{ fontSize: '0.68rem' }}>Out for delivery</small>
                    </div>

                    {/* Step 4 */}
                    <div className="text-center">
                      <div
                        className="rounded-circle d-flex align-items-center justify-content-center mx-auto"
                        style={{
                          width: '30px',
                          height: '30px',
                          backgroundColor: 'rgba(255, 255, 255, 0.1)',
                          border: '1px solid rgba(255, 255, 255, 0.2)',
                          color: 'rgba(255, 255, 255, 0.5)',
                        }}
                      >
                        <FaHouseCircleCheck size={13} />
                      </div>
                      <span className="d-block fw-bold text-white-50 small mt-1.5" style={{ fontSize: '0.78rem' }}>Delivered</span>
                      <small className="text-white-50" style={{ fontSize: '0.68rem' }}>Expected Today</small>
                    </div>
                  </div>
                </div>

                <div className="border-top border-white border-opacity-10 pt-3 mt-3 d-flex justify-content-between align-items-center small text-white-50">
                  <span style={{ fontSize: '0.74rem' }} className="d-flex align-items-center gap-1">
                    <AnimatedFaIcon icon={FaLocationDot} size={11} color="#B8E000" />
                    <span>Route: Master Weaving Hub → Bengaluru</span>
                  </span>
                  <span style={{ fontSize: '0.74rem', color: '#B8E000' }}>Expected: Today, 6:00 PM</span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* 7. FAQ Accordion with Redesigned Premium Cards & Fa Icons */}
      <section className="mb-5">
        <div className="row g-4">
          <div className="col-lg-4">
            <span
              className="small text-uppercase fw-bold d-inline-flex align-items-center gap-1.5 mb-1"
              style={{ color: '#E90064', letterSpacing: '0.1em', fontSize: '0.75rem' }}
            >
              <AnimatedFaIcon icon={FaQuestion} size={12} color="#E90064" animation="pulse" />
              <span>HERE TO HELP</span>
            </span>
            <h3 className="display-6 fw-bolder mb-3 text-dark" style={{ color: '#17233B', lineHeight: 1.2 }}>
              A few questions. Clear answers.
            </h3>
            <p className="text-secondary small mb-4" style={{ lineHeight: 1.6 }}>
              Everything you need to know about our silk fabrics, authenticity, shipping, and returns.
            </p>
          </div>

          <div className="col-lg-8">
            <div className="d-flex flex-column gap-3">
              {[
                {
                  tag: 'AUTHENTICITY',
                  q: 'Are your sarees authentic Silk Mark certified?',
                  a: 'Yes, 100%. Every silk saree at Aaradhya comes with an authorized Silk Mark India certification tag verifying pure mulberry and Kanchipuram silk purity with genuine zari weaving.',
                },
                {
                  tag: 'SHIPPING & TRANSIT',
                  q: 'How long does delivery take across India?',
                  a: 'Orders are dispatched within 24 hours from our centralized hubs. Metro cities typically receive delivery in 2-3 business days, and other regions within 4-5 business days with full live tracking.',
                },
                {
                  tag: 'CUSTOM ORDERS',
                  q: 'Can I purchase running fabrics in custom lengths (meters)?',
                  a: 'Absolutely! Our Aaradhya Fabrics collection allows you to purchase running fabrics starting from 1 meter and above in 0.5-meter increments with precision cutting and edge finishing.',
                },
                {
                  tag: 'EASY RETURNS',
                  q: 'What is your return or exchange policy?',
                  a: 'We provide a 7-day hassle-free return and exchange policy for unused items with original tags and packaging intact. Reverse pickup is arranged at no additional cost.',
                },
                {
                  tag: 'SECURE PAYMENTS',
                  q: 'What payment options do you support?',
                  a: 'We support all major payment methods via secure 256-bit SSL Razorpay encryption, including UPI (Google Pay, PhonePe, Paytm), Credit & Debit cards, NetBanking, and Cash on Delivery (COD).',
                },
              ].map((faq, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 15 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.05 }}
                  className="card border-0 rounded-4 p-3.5 shadow-sm transition-all"
                  style={{
                    backgroundColor: '#FFFFFF',
                    border: activeFaq === i ? '1.5px solid #E90064' : '1px solid #F0E7ED',
                    borderRadius: '16px',
                    boxShadow: activeFaq === i ? '0 8px 24px rgba(233, 0, 100, 0.08)' : '0 2px 6px rgba(0,0,0,0.02)',
                  }}
                >
                  <button
                    type="button"
                    className="btn btn-link p-0 text-start text-dark text-decoration-none fw-bold d-flex justify-content-between align-items-center w-100"
                    style={{ fontSize: '0.94rem' }}
                    onClick={() => setActiveFaq(activeFaq === i ? -1 : i)}
                  >
                    <div className="pe-2">
                      <span
                        className="badge rounded-pill mb-1 d-block text-uppercase"
                        style={{
                          backgroundColor: activeFaq === i ? '#FFF0F5' : '#F8F6F8',
                          color: activeFaq === i ? '#E90064' : '#77717C',
                          fontSize: '0.62rem',
                          width: 'fit-content',
                          padding: '2px 8px',
                        }}
                      >
                        {faq.tag}
                      </span>
                      <span className="fw-bold" style={{ color: activeFaq === i ? '#E90064' : '#17233B' }}>
                        {faq.q}
                      </span>
                    </div>
                    <motion.span
                      animate={{ rotate: activeFaq === i ? 180 : 0 }}
                      transition={{ duration: 0.2 }}
                      className="rounded-circle d-flex align-items-center justify-content-center flex-shrink-0"
                      style={{
                        width: '28px',
                        height: '28px',
                        backgroundColor: activeFaq === i ? '#E90064' : '#F8F6F8',
                        color: activeFaq === i ? '#FFFFFF' : '#17233B',
                      }}
                    >
                      <FaChevronDown size={12} />
                    </motion.span>
                  </button>

                  <AnimatePresence>
                    {activeFaq === i && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.25, ease: 'easeInOut' }}
                        className="overflow-hidden"
                      >
                        <div className="pt-2 text-secondary small border-top mt-2" style={{ lineHeight: 1.6, fontSize: '0.86rem' }}>
                          {faq.a}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>
      </div>
    </div>
  );
};

export default HomePage;
