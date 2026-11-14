import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Sparkles } from 'lucide-react';

const SLIDES = [
  {
    id: 1,
    desktopImg: 'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?w=1920&h=1080&auto=format&fit=crop&crop=focalpoint&fp-y=0.35&q=85',
    mobileImg: 'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?w=900&h=1600&auto=format&fit=crop&crop=focalpoint&fp-y=0.35&q=85',
    badge: 'Heritage Collection',
    title: 'AARADHYA SILKS',
    tagline: 'Pure Kanjeevarams & Heirloom Bridal Drapes',
    ctaText: 'Explore Pure Silks',
    ctaLink: '/products?category=sarees',
  },
  {
    id: 2,
    desktopImg: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=1920&h=1080&auto=format&fit=crop&crop=focalpoint&fp-y=0.27&q=85',
    mobileImg: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=900&h=1600&auto=format&fit=crop&crop=focalpoint&fp-y=0.32&q=85',
    badge: 'Artisan Textiles',
    title: 'AARADHYA FABRICS',
    tagline: 'Handloom Mulmul, Indigo Ajrakh & Organic Linens',
    ctaText: 'Discover Running Fabrics',
    ctaLink: '/products?category=fabrics',
  },
  {
    id: 3,
    desktopImg: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=1920&h=1080&auto=format&fit=crop&crop=focalpoint&fp-y=0.38&q=85',
    mobileImg: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=900&h=1600&auto=format&fit=crop&crop=focalpoint&fp-y=0.4&q=85',
    badge: 'Festive Edition 2026',
    title: 'FESTIVE DRAPES & SETS',
    tagline: 'Chanderi Kurtis, Palazzo Coordinates & Designer Suits',
    ctaText: 'Shop Festive Sets',
    ctaLink: '/products',
  },
];

const HeroBanner = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [touchStart, setTouchStart] = useState(0);
  const [touchEnd, setTouchEnd] = useState(0);

  // Auto rotate every 5 seconds
  useEffect(() => {
    if (isPaused) return;
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % SLIDES.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [isPaused]);

  const slide = SLIDES[currentSlide];

  const handlePrev = () => {
    setCurrentSlide((prev) => (prev - 1 + SLIDES.length) % SLIDES.length);
  };

  const handleNext = () => {
    setCurrentSlide((prev) => (prev + 1) % SLIDES.length);
  };

  // Mobile Touch Swipe Handling
  const handleTouchStart = (e) => {
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    const minSwipeDistance = 50;

    if (distance > minSwipeDistance) {
      handleNext(); // swipe left -> next slide
    } else if (distance < -minSwipeDistance) {
      handlePrev(); // swipe right -> prev slide
    }

    setTouchStart(0);
    setTouchEnd(0);
  };

  return (
    <div
      className="cust-gallery-hero"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      role="region"
      aria-label="Aaradhya Fashion Hero Slideshow"
    >
      {/* Slides with AnimatePresence for cinematic cross-fade */}
      <AnimatePresence mode="wait">
        <motion.div
          key={slide.id}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.65, ease: [0.25, 1, 0.5, 1] }}
          className="cust-gallery-hero-slide position-absolute top-0 start-0 w-100 h-100"
        >
          {/* Desktop high-res image */}
          <img
            src={slide.desktopImg}
            alt={slide.title}
            className="desktop"
            loading="eager"
          />

          {/* Mobile vertical portrait image */}
          <img
            src={slide.mobileImg}
            alt={slide.title}
            className="mobile"
            loading="eager"
          />

          {/* Luxury Vignette & Soft Bottom Gradient Overlay */}
          <div
            className="position-absolute top-0 start-0 w-100 h-100 pointer-events-none"
            style={{
              background: 'linear-gradient(to top, rgba(23, 35, 59, 0.65) 0%, rgba(23, 35, 59, 0.2) 30%, transparent 65%)',
            }}
          />

          {/* Text and Branding Caption Overlay above CTA */}
          <div className="hero-caption-wrapper">
            <div className="d-inline-flex align-items-center gap-1.5 px-3 py-1 rounded-pill bg-white bg-opacity-75 backdrop-blur-sm text-dark small fw-bold text-uppercase mb-2 shadow-sm" style={{ fontSize: '0.68rem', letterSpacing: '0.08em' }}>
              <Sparkles size={11} color="#E90064" />
              <span>{slide.badge}</span>
            </div>
            <h2 className="text-white fw-bolder mb-1 hero-slide-heading text-shadow" style={{ letterSpacing: '-0.5px' }}>
              {slide.title}
            </h2>
            <p className="text-white text-opacity-90 small mb-0 d-none d-sm-block font-sans" style={{ fontSize: '0.92rem' }}>
              {slide.tagline}
            </p>
          </div>

          {/* Centered Bottom Floating Pill CTA matching Nishorama */}
          <Link to={slide.ctaLink} className="gallery-banner-link">
            {slide.ctaText}
          </Link>
        </motion.div>
      </AnimatePresence>

      {/* Interactive Pagination Indicator Bullets */}
      <div className="hero-pagination-bullets">
        {SLIDES.map((_, index) => (
          <button
            key={index}
            type="button"
            className={`hero-bullet ${currentSlide === index ? 'active' : ''}`}
            onClick={() => setCurrentSlide(index)}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>

      {/* Desktop Navigation Chevrons */}
      <button
        type="button"
        className="hero-nav-arrow hero-nav-prev d-none d-md-flex"
        onClick={handlePrev}
        aria-label="Previous Banner Slide"
      >
        <ChevronLeft size={22} />
      </button>

      <button
        type="button"
        className="hero-nav-arrow hero-nav-next d-none d-md-flex"
        onClick={handleNext}
        aria-label="Next Banner Slide"
      >
        <ChevronRight size={22} />
      </button>
    </div>
  );
};

export default HeroBanner;
