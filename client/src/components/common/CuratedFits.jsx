import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight, Sparkles } from 'lucide-react';

const FITS_DATA = {
  Restocked: [
    {
      id: 'fit-1',
      title: 'Chanderi Flowy Tunic',
      category: 'Kurtis & Tops',
      image: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=600&auto=format&fit=crop&q=80',
      link: '/products?search=Chanderi',
    },
    {
      id: 'fit-2',
      title: 'White High-Waist Palazzos',
      category: 'Bottoms',
      image: 'https://images.unsplash.com/photo-1509631179647-0177331693ae?w=600&auto=format&fit=crop&q=80',
      link: '/products?search=Palazzo',
    },
    {
      id: 'fit-3',
      title: 'Noir Tailored Wide-Leg Trouser',
      category: 'Bottoms',
      image: 'https://images.unsplash.com/photo-1594223274512-ad4803739b7c?w=600&auto=format&fit=crop&q=80',
      link: '/products?search=Trouser',
    },
    {
      id: 'fit-4',
      title: 'Crimson Georgette Cocktail Fit',
      category: 'Dresses',
      image: 'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=600&auto=format&fit=crop&q=80',
      link: '/products?search=Georgette',
    },
    {
      id: 'fit-5',
      title: 'Indigo Block-Printed Halter Fit',
      category: 'Tops',
      image: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=600&auto=format&fit=crop&q=80',
      link: '/products?search=Indigo',
    },
  ],
  Bottoms: [
    {
      id: 'fit-b1',
      title: 'Raw Silk Trousers',
      category: 'Bottoms',
      image: 'https://images.unsplash.com/photo-1509631179647-0177331693ae?w=600&auto=format&fit=crop&q=80',
      link: '/products?search=Bottoms',
    },
    {
      id: 'fit-b2',
      title: 'Handloom Cotton Dhoti Pants',
      category: 'Bottoms',
      image: 'https://images.unsplash.com/photo-1594223274512-ad4803739b7c?w=600&auto=format&fit=crop&q=80',
      link: '/products?search=Dhoti',
    },
    {
      id: 'fit-b3',
      title: 'Embroidered Silk Sharara',
      category: 'Bottoms',
      image: 'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=600&auto=format&fit=crop&q=80',
      link: '/products?search=Sharara',
    },
    {
      id: 'fit-b4',
      title: 'Tailored Linen Pants',
      category: 'Bottoms',
      image: 'https://images.unsplash.com/photo-1617137984095-74e4e5e3613f?w=600&auto=format&fit=crop&q=80',
      link: '/products?search=Linen',
    },
  ],
  Tops: [
    {
      id: 'fit-t1',
      title: 'Artisan Embroidered Bralette',
      category: 'Tops',
      image: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=600&auto=format&fit=crop&q=80',
      link: '/products?search=Bralette',
    },
    {
      id: 'fit-t2',
      title: 'Brocade Halter Blouse',
      category: 'Tops',
      image: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=600&auto=format&fit=crop&q=80',
      link: '/products?search=Blouse',
    },
    {
      id: 'fit-t3',
      title: 'Chiffon Bell-Sleeve Coverup',
      category: 'Tops',
      image: 'https://images.unsplash.com/photo-1523381294911-8d3cead13475?w=600&auto=format&fit=crop&q=80',
      link: '/products?search=Coverup',
    },
  ],
  Dresses: [
    {
      id: 'fit-d1',
      title: 'Ruby Velvet Anarkali Dress',
      category: 'Dresses',
      image: 'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=600&auto=format&fit=crop&q=80',
      link: '/products?search=Anarkali',
    },
    {
      id: 'fit-d2',
      title: 'Smocked Silk Midi Dress',
      category: 'Dresses',
      image: 'https://images.unsplash.com/photo-1594223274512-ad4803739b7c?w=600&auto=format&fit=crop&q=80',
      link: '/products?search=Midi',
    },
    {
      id: 'fit-d3',
      title: 'Golden Brocade Maxi Gown',
      category: 'Dresses',
      image: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=600&auto=format&fit=crop&q=80',
      link: '/products?search=Maxi',
    },
  ],
  Sarees: [
    {
      id: 'fit-s1',
      title: 'Basavanagudi Pure Kanchi Saree',
      category: 'Sarees',
      image: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=600&auto=format&fit=crop&q=80',
      link: '/category/sarees',
    },
    {
      id: 'fit-s2',
      title: 'Banarasi Brocade Silk Drape',
      category: 'Sarees',
      image: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=600&auto=format&fit=crop&q=80',
      link: '/category/sarees',
    },
    {
      id: 'fit-s3',
      title: 'Organza Floral Zari Weave',
      category: 'Sarees',
      image: 'https://images.unsplash.com/photo-1594223274512-ad4803739b7c?w=600&auto=format&fit=crop&q=80',
      link: '/category/sarees',
    },
  ],
  Fabrics: [
    {
      id: 'fit-f1',
      title: 'Running Raw Mulberry Silk',
      category: 'Fabrics',
      image: 'https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?w=600&auto=format&fit=crop&q=80',
      link: '/category/fabrics',
    },
    {
      id: 'fit-f2',
      title: 'Chanderi Zari Dress Material',
      category: 'Dress Materials',
      image: 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=600&auto=format&fit=crop&q=80',
      link: '/category/dress-materials',
    },
    {
      id: 'fit-f3',
      title: 'Handspun Organic Cotton Fabric',
      category: 'Fabrics',
      image: 'https://images.unsplash.com/photo-1523381294911-8d3cead13475?w=600&auto=format&fit=crop&q=80',
      link: '/category/fabrics',
    },
  ],
};

const CuratedFits = () => {
  const [activeTab, setActiveTab] = useState('Restocked');
  const tabs = ['Restocked', 'Bottoms', 'Tops', 'Dresses', 'Sarees', 'Fabrics'];

  const items = FITS_DATA[activeTab] || FITS_DATA['Restocked'];

  return (
    <section className="mb-5">
      {/* Outer Rounded Container matching Nishorama layout in media_1794591772833_8cc3c425.jpg */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.15 }}
        transition={{ duration: 0.5 }}
        className="p-3 p-sm-4 p-md-5 rounded-4 shadow-sm"
        style={{
          backgroundColor: '#F3F4F6',
          border: '1px solid #E5E7EB',
          borderRadius: '26px',
        }}
      >
        {/* Title */}
        <h2
          className="fw-bolder mb-3 text-dark"
          style={{
            fontSize: 'clamp(1.4rem, 3.2vw, 2.1rem)',
            letterSpacing: '-0.5px',
            color: '#17233B',
          }}
        >
          Curated Fits for you
        </h2>

        {/* Category Filter Pills */}
        <div className="d-flex flex-wrap gap-2 mb-4">
          {tabs.map((tab) => {
            const isActive = activeTab === tab;
            return (
              <motion.button
                key={tab}
                type="button"
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.96 }}
                className="btn btn-sm rounded-pill px-3 py-1.5 fw-semibold"
                style={{
                  backgroundColor: isActive ? '#17233B' : '#FFFFFF',
                  color: isActive ? '#FFFFFF' : '#4B5563',
                  border: isActive ? '1px solid #17233B' : '1px solid #E5E7EB',
                  fontSize: '0.84rem',
                  boxShadow: isActive ? '0 4px 12px rgba(23, 35, 59, 0.25)' : 'none',
                  transition: 'background-color 0.2s ease, color 0.2s ease, border-color 0.2s ease',
                }}
                onClick={() => setActiveTab(tab)}
              >
                {tab}
              </motion.button>
            );
          })}
        </div>

        {/* Horizontal Container of Tall Rounded Portrait Outfit Cards */}
        <div
          className="d-flex gap-3 overflow-x-auto pb-2 scrollbar-hidden"
          style={{
            scrollSnapType: 'x mandatory',
            scrollbarWidth: 'none',
            msOverflowStyle: 'none',
          }}
        >
          <AnimatePresence mode="wait">
            {items.map((fit, idx) => (
              <motion.div
                key={fit.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.35, delay: idx * 0.05 }}
                className="flex-shrink-0"
                style={{
                  width: 'clamp(200px, 24vw, 250px)',
                  scrollSnapAlign: 'start',
                }}
              >
                <Link to={fit.link} className="text-decoration-none">
                  <motion.div
                    whileHover={{ y: -6, scale: 1.02 }}
                    transition={{ duration: 0.25 }}
                    className="position-relative overflow-hidden shadow-sm"
                    style={{
                      borderRadius: '24px',
                      backgroundColor: '#FFFFFF',
                      paddingTop: '135%', // Tall vertical full outfit aspect ratio matching screenshot
                      border: '1px solid #E5E7EB',
                    }}
                  >
                    <img
                      src={fit.image}
                      alt={fit.title}
                      className="position-absolute top-0 start-0 w-100 h-100"
                      style={{ objectFit: 'cover' }}
                      loading="lazy"
                    />

                    {/* Subtle Overlay at Bottom */}
                    <div
                      className="position-absolute bottom-0 start-0 end-0 p-3 text-white"
                      style={{
                        background: 'linear-gradient(to top, rgba(23, 35, 59, 0.8) 0%, transparent 100%)',
                      }}
                    >
                      <span className="badge rounded-pill text-white px-2 py-0.5 mb-1 small" style={{ backgroundColor: '#E90064', fontSize: '0.62rem' }}>
                        {fit.category}
                      </span>
                      <h6 className="fw-bold mb-0 text-white text-truncate small" style={{ fontSize: '0.84rem' }}>
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
