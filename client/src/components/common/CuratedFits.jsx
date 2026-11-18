import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const FITS_DATA = {
  Restocked: [
    {
      id: 'fit-1',
      title: 'Chanderi Flowy Tunic',
      category: 'Kurtis & Tops',
      image: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=700&auto=format&fit=crop&q=85',
      link: '/products?search=Chanderi',
    },
    {
      id: 'fit-2',
      title: 'White High-Waist Palazzos',
      category: 'Bottoms',
      image: 'https://images.unsplash.com/photo-1509631179647-0177331693ae?w=700&auto=format&fit=crop&q=85',
      link: '/products?search=Palazzo',
    },
    {
      id: 'fit-3',
      title: 'Noir Tailored Wide-Leg Trouser',
      category: 'Bottoms',
      image: 'https://images.unsplash.com/photo-1594223274512-ad4803739b7c?w=700&auto=format&fit=crop&q=85',
      link: '/products?search=Trouser',
    },
    {
      id: 'fit-4',
      title: 'Crimson Georgette Cocktail Fit',
      category: 'Dresses',
      image: 'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=700&auto=format&fit=crop&q=85',
      link: '/products?search=Georgette',
    },
    {
      id: 'fit-5',
      title: 'Indigo Block-Printed Halter Fit',
      category: 'Tops',
      image: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=700&auto=format&fit=crop&q=85',
      link: '/products?search=Indigo',
    },
  ],
  Bottoms: [
    {
      id: 'fit-b1',
      title: 'Raw Silk Straight Trousers',
      category: 'Bottoms',
      image: 'https://images.unsplash.com/photo-1509631179647-0177331693ae?w=700&auto=format&fit=crop&q=85',
      link: '/products?search=Bottoms',
    },
    {
      id: 'fit-b2',
      title: 'Handloom Cotton Dhoti Pants',
      category: 'Bottoms',
      image: 'https://images.unsplash.com/photo-1594223274512-ad4803739b7c?w=700&auto=format&fit=crop&q=85',
      link: '/products?search=Dhoti',
    },
    {
      id: 'fit-b3',
      title: 'Embroidered Silk Sharara',
      category: 'Bottoms',
      image: 'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=700&auto=format&fit=crop&q=85',
      link: '/products?search=Sharara',
    },
    {
      id: 'fit-b4',
      title: 'Tailored European Linen Pants',
      category: 'Bottoms',
      image: 'https://images.unsplash.com/photo-1617137984095-74e4e5e3613f?w=700&auto=format&fit=crop&q=85',
      link: '/products?search=Linen',
    },
    {
      id: 'fit-b5',
      title: 'Classic Ivory Flared Palazzo',
      category: 'Bottoms',
      image: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=700&auto=format&fit=crop&q=85',
      link: '/products?search=Palazzo',
    },
  ],
  Tops: [
    {
      id: 'fit-t1',
      title: 'Artisan Embroidered Bralette',
      category: 'Tops',
      image: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=700&auto=format&fit=crop&q=85',
      link: '/products?search=Bralette',
    },
    {
      id: 'fit-t2',
      title: 'Brocade Halter Blouse',
      category: 'Tops',
      image: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=700&auto=format&fit=crop&q=85',
      link: '/products?search=Blouse',
    },
    {
      id: 'fit-t3',
      title: 'Chiffon Bell-Sleeve Coverup',
      category: 'Tops',
      image: 'https://images.unsplash.com/photo-1523381294911-8d3cead13475?w=700&auto=format&fit=crop&q=85',
      link: '/products?search=Coverup',
    },
    {
      id: 'fit-t4',
      title: 'Pure Raw Silk Peplum Kurti',
      category: 'Tops',
      image: 'https://images.unsplash.com/photo-1594223274512-ad4803739b7c?w=700&auto=format&fit=crop&q=85',
      link: '/products?search=Peplum',
    },
    {
      id: 'fit-t5',
      title: 'Ajrakh Hand-Block Printed Tunic',
      category: 'Tops',
      image: 'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=700&auto=format&fit=crop&q=85',
      link: '/products?search=Tunic',
    },
  ],
  Dresses: [
    {
      id: 'fit-d1',
      title: 'Ruby Velvet Anarkali Dress',
      category: 'Dresses',
      image: 'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=700&auto=format&fit=crop&q=85',
      link: '/products?search=Anarkali',
    },
    {
      id: 'fit-d2',
      title: 'Smocked Silk Midi Dress',
      category: 'Dresses',
      image: 'https://images.unsplash.com/photo-1594223274512-ad4803739b7c?w=700&auto=format&fit=crop&q=85',
      link: '/products?search=Midi',
    },
    {
      id: 'fit-d3',
      title: 'Golden Brocade Maxi Gown',
      category: 'Dresses',
      image: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=700&auto=format&fit=crop&q=85',
      link: '/products?search=Maxi',
    },
    {
      id: 'fit-d4',
      title: 'Emerald Georgette Tiered Dress',
      category: 'Dresses',
      image: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=700&auto=format&fit=crop&q=85',
      link: '/products?search=Dress',
    },
    {
      id: 'fit-d5',
      title: 'Pastel Organza Cocktail Dress',
      category: 'Dresses',
      image: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=700&auto=format&fit=crop&q=85',
      link: '/products?search=Organza',
    },
  ],
  Sarees: [
    {
      id: 'fit-s1',
      title: 'Pure Kanjeevaram Silk Saree',
      category: 'Sarees',
      image: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=700&auto=format&fit=crop&q=85',
      link: '/category/sarees',
    },
    {
      id: 'fit-s2',
      title: 'Banarasi Brocade Silk Drape',
      category: 'Sarees',
      image: 'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?w=700&auto=format&fit=crop&q=85',
      link: '/category/sarees',
    },
    {
      id: 'fit-s3',
      title: 'Organza Floral Zari Weave',
      category: 'Sarees',
      image: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=700&auto=format&fit=crop&q=85',
      link: '/category/sarees',
    },
    {
      id: 'fit-s4',
      title: 'Tissue Silk Metallic Drape',
      category: 'Sarees',
      image: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=700&auto=format&fit=crop&q=85',
      link: '/category/sarees',
    },
    {
      id: 'fit-s5',
      title: 'Tussar Hand-Painted Saree',
      category: 'Sarees',
      image: 'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=700&auto=format&fit=crop&q=85',
      link: '/category/sarees',
    },
  ],
  Fabrics: [
    {
      id: 'fit-f1',
      title: 'Running Raw Mulberry Silk',
      category: 'Fabrics',
      image: 'https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?w=700&auto=format&fit=crop&q=85',
      link: '/category/fabrics',
    },
    {
      id: 'fit-f2',
      title: 'Chanderi Zari Dress Material',
      category: 'Dress Materials',
      image: 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=700&auto=format&fit=crop&q=85',
      link: '/category/dress-materials',
    },
    {
      id: 'fit-f3',
      title: 'Handspun Organic Cotton Fabric',
      category: 'Fabrics',
      image: 'https://images.unsplash.com/photo-1523381294911-8d3cead13475?w=700&auto=format&fit=crop&q=85',
      link: '/category/fabrics',
    },
    {
      id: 'fit-f4',
      title: 'Natural Indigo Ajrakh Fabric',
      category: 'Fabrics',
      image: 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=700&auto=format&fit=crop&q=85',
      link: '/category/fabrics',
    },
    {
      id: 'fit-f5',
      title: 'European Organic Linen Fabric',
      category: 'Fabrics',
      image: 'https://images.unsplash.com/photo-1574634534894-89d7576c8259?w=700&auto=format&fit=crop&q=85',
      link: '/category/fabrics',
    },
  ],
};

const CuratedFits = () => {
  const [activeTab, setActiveTab] = useState('Restocked');
  const tabs = ['Restocked', 'Bottoms', 'Tops', 'Dresses', 'Sarees', 'Fabrics'];
  const containerRef = useRef(null);

  const items = FITS_DATA[activeTab] || FITS_DATA['Restocked'];

  const scrollLeft = () => {
    if (containerRef.current) {
      containerRef.current.scrollBy({ left: -280, behavior: 'smooth' });
    }
  };

  const scrollRight = () => {
    if (containerRef.current) {
      containerRef.current.scrollBy({ left: 280, behavior: 'smooth' });
    }
  };

  return (
    <section className="mb-4 mb-md-5">
      {/* Outer Single Rounded Card Container with increased width matching Nishorama layout */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.1 }}
        transition={{ duration: 0.5 }}
        className="p-3 p-sm-4 p-md-4 p-xl-5 rounded-4 shadow-sm"
        style={{
          backgroundColor: '#FFFFFF',
          border: '1px solid #F0E7ED',
          borderRadius: '28px',
          boxShadow: '0 8px 30px rgba(23, 35, 59, 0.05)',
        }}
      >
        {/* Header with Title and Mobile Scroll Controls */}
        <div className="d-flex align-items-center justify-content-between mb-3">
          <h2
            className="fw-bolder mb-0 text-dark"
            style={{
              fontSize: 'clamp(1.35rem, 3vw, 2.1rem)',
              letterSpacing: '-0.4px',
              fontFamily: 'var(--font-heading-family)',
              color: '#17233B',
            }}
          >
            Curated Fits for you
          </h2>

          {/* Quick Scroll Arrows for Mobile & Tablet Slider */}
          <div className="d-flex d-lg-none align-items-center gap-1.5">
            <button
              type="button"
              onClick={scrollLeft}
              className="btn btn-sm btn-light rounded-circle p-1.5 border shadow-xs d-flex align-items-center justify-content-center text-dark"
              style={{ width: '34px', height: '34px', backgroundColor: '#FFFFFF' }}
              aria-label="Previous fit"
            >
              <ChevronLeft size={16} />
            </button>
            <button
              type="button"
              onClick={scrollRight}
              className="btn btn-sm btn-light rounded-circle p-1.5 border shadow-xs d-flex align-items-center justify-content-center text-dark"
              style={{ width: '34px', height: '34px', backgroundColor: '#FFFFFF' }}
              aria-label="Next fit"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>

        {/* Category Filter Pills: Single-Line Horizontal Scroll matching Nishorama */}
        <div
          className="d-flex gap-2 mb-3 mb-md-4 overflow-x-auto text-nowrap pb-1 scrollbar-hidden"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {tabs.map((tab) => {
            const isActive = activeTab === tab;
            return (
              <motion.button
                key={tab}
                type="button"
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                className="btn btn-sm rounded-pill px-3 py-1.5 fw-semibold flex-shrink-0"
                style={{
                  backgroundColor: isActive ? '#E90064' : '#FFFFFF',
                  color: isActive ? '#FFFFFF' : '#4B5563',
                  border: isActive ? '1px solid #E90064' : '1px solid #E5E7EB',
                  fontSize: '0.85rem',
                  fontFamily: 'var(--font-body-family)',
                  boxShadow: isActive ? '0 4px 12px rgba(233, 0, 100, 0.28)' : 'none',
                  transition: 'background-color 0.2s ease, color 0.2s ease, border-color 0.2s ease',
                }}
                onClick={() => setActiveTab(tab)}
              >
                {tab}
              </motion.button>
            );
          })}
        </div>

        {/* Responsive Container: Exactly 5 Per Row on Desktop, Single-Card Slider on Mobile (No Orphan 5th Card) */}
        <div ref={containerRef} className="curated-fits-grid-5">
          <AnimatePresence mode="wait">
            {items.map((fit, idx) => (
              <motion.div
                key={`${activeTab}-${fit.id}`}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -16 }}
                transition={{ duration: 0.35, delay: idx * 0.04 }}
                className="curated-fit-item"
              >
                <Link to={fit.link} className="text-decoration-none d-block">
                  <motion.div
                    whileHover={{ y: -6, scale: 1.02 }}
                    transition={{ duration: 0.25 }}
                    className="position-relative overflow-hidden shadow-sm"
                    style={{
                      borderRadius: '22px',
                      backgroundColor: '#F8F6F8',
                      paddingTop: '136%', // Tall vertical portrait aspect ratio matching Nishorama
                      border: '1px solid #F0E7ED',
                    }}
                  >
                    <img
                      src={fit.image}
                      alt={fit.title}
                      className="position-absolute top-0 start-0 w-100 h-100"
                      style={{ objectFit: 'cover' }}
                      loading="lazy"
                    />

                    {/* Gradient Overlay at Bottom with Category Pill & Title */}
                    <div
                      className="position-absolute bottom-0 start-0 end-0 p-2.5 p-sm-3 text-white"
                      style={{
                        background: 'linear-gradient(to top, rgba(23, 35, 59, 0.85) 0%, rgba(23, 35, 59, 0.35) 60%, transparent 100%)',
                      }}
                    >
                      <span
                        className="badge rounded-pill text-white px-2 py-0.5 mb-1 small d-inline-block"
                        style={{
                          backgroundColor: '#E90064',
                          fontSize: 'clamp(0.58rem, 0.9vw, 0.68rem)',
                          fontWeight: 600,
                        }}
                      >
                        {fit.category}
                      </span>
                      <h6
                        className="fw-bold mb-0 text-white text-truncate"
                        style={{
                          fontSize: 'clamp(0.82rem, 1.1vw, 0.95rem)',
                          fontFamily: 'var(--font-heading-family)',
                          letterSpacing: '-0.2px',
                        }}
                      >
                        {fit.title}
                      </h6>
                    </div>
                  </motion.div>
                </Link>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </motion.div>
    </section>
  );
};

export default CuratedFits;
