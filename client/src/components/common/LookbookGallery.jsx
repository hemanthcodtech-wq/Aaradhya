import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ExternalLink } from 'lucide-react';
import { FaCameraRetro } from 'react-icons/fa6';
import AnimatedFaIcon from './AnimatedFaIcon';

const DESKTOP_ITEMS = [
  {
    id: 'item-1',
    className: 'item item-1',
    img: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=1200&auto=format&fit=crop&q=85',
    title: 'Pure Kanjeevaram Silks',
    link: '/products?category=sarees',
  },
  {
    id: 'item-2',
    className: 'item item-2',
    img: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=700&auto=format&fit=crop&q=85',
    title: 'Festive Drapes',
    link: '/products?category=sarees',
  },
  {
    id: 'item-3',
    className: 'item item-3',
    img: 'https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?w=700&auto=format&fit=crop&q=85',
    title: 'Artisan Running Fabrics',
    link: '/products?category=fabrics',
  },
  {
    id: 'item-4',
    className: 'item item-4',
    img: 'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?w=700&auto=format&fit=crop&q=85',
    title: 'Banarasi Brocades',
    link: '/products?category=sarees',
  },
  {
    id: 'item-5',
    className: 'item item-5',
    img: 'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=700&auto=format&fit=crop&q=85',
    title: 'Festive Kurtis & Sets',
    link: '/products',
  },
];

const DESKTOP_ITEMS_2 = [
  {
    id: 'item-6',
    className: 'item item-1',
    img: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=1200&auto=format&fit=crop&q=85',
    title: 'Heirloom Celebrations',
    link: '/products?category=sarees',
  },
  {
    id: 'item-7',
    className: 'item item-2',
    img: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=700&auto=format&fit=crop&q=85',
    title: 'Chanderi Gold Zari',
    link: '/products?category=fabrics',
  },
  {
    id: 'item-8',
    className: 'item item-3',
    img: 'https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?w=700&auto=format&fit=crop&q=85',
    title: 'Mulmul Cotton Prints',
    link: '/products?category=fabrics',
  },
  {
    id: 'item-9',
    className: 'item item-4',
    img: 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=700&auto=format&fit=crop&q=85',
    title: 'Natural Indigo Ajrakh',
    link: '/products?category=fabrics',
  },
  {
    id: 'item-10',
    className: 'item item-5',
    img: 'https://images.unsplash.com/photo-1574634534894-89d7576c8259?w=700&auto=format&fit=crop&q=85',
    title: 'European Organic Linen',
    link: '/products?category=fabrics',
  },
];

const MOBILE_ITEMS = [
  {
    src: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=700&auto=format&fit=crop&q=85',
    label: 'Pure Silks',
    link: '/products?category=sarees',
  },
  {
    src: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=700&auto=format&fit=crop&q=85',
    label: 'Festive Drapes',
    link: '/products?category=sarees',
  },
  {
    src: 'https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?w=700&auto=format&fit=crop&q=85',
    label: 'Running Fabrics',
    link: '/products?category=fabrics',
  },
  {
    src: 'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?w=700&auto=format&fit=crop&q=85',
    label: 'Designer Kurtis',
    link: '/products',
  },
  {
    src: 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=700&auto=format&fit=crop&q=85',
    label: 'Block Prints',
    link: '/products?category=fabrics',
  },
  {
    src: 'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=700&auto=format&fit=crop&q=85',
    label: 'Heirloom Sets',
    link: '/products',
  },
];

const LookbookGallery = () => {
  return (
    <section className="mb-5 lookbook-section w-100 overflow-hidden" id="lookbook-gallery">
      {/* Header matching Nishorama lookbook */}
      <div className="container mb-3">
        <div className="d-flex flex-wrap align-items-center justify-content-between gap-2">
          <motion.div
            initial={{ opacity: 0, x: -15 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4 }}
          >
            <div>
              <h4
                className="fw-bold mb-0 text-dark"
                style={{
                  fontSize: 'clamp(1.3rem, 2.7vw, 1.7rem)',
                  letterSpacing: '-0.3px',
                  fontFamily: 'var(--font-heading-family)',
                  color: '#17233B',
                }}
              >
                Moments in Aaradhya
              </h4>
              <div className="d-flex align-items-center gap-2 mt-0.5">
                <span className="small text-secondary" style={{ fontSize: '0.78rem' }}>
                  Woven by tradition, styled by you.
                </span>
                <a
                  href="https://www.instagram.com/aaradhya_silks_kphb?vrfl=MWQ4OG5lNnFpY3Bzbg=="
                  target="_blank"
                  rel="noopener noreferrer"
                  className="badge rounded-pill text-decoration-none px-2.5 py-1 text-white d-inline-flex align-items-center gap-1"
                  style={{ backgroundColor: '#E90064', fontSize: '0.68rem' }}
                >
                  <span>@aaradhya_silks_kphb</span>
                </a>
              </div>
            </div>
          </motion.div>

          <a
            href="https://www.instagram.com/aaradhya_fabrics?xtok=cTN3aXVtZnFnY2ls"
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-outline-dark btn-sm rounded-pill px-3.5 py-1.5 fw-semibold d-inline-flex align-items-center gap-1.5"
            style={{ fontSize: '0.78rem' }}
          >
            <span>Follow on Instagram</span>
            <ExternalLink size={13} />
          </a>
        </div>
      </div>

      {/* 1. Desktop View: Infinite Seamless Auto-Sliding Collage Grid matching Nishorama */}
      <div className="gallery-grid-wrapper desktop">
        <div className="gallery-grid-main">
          {/* Grid Block 1 */}
          <div className="gallery-grid">
            {DESKTOP_ITEMS.map((item) => (
              <Link to={item.link} key={item.id} className={item.className}>
                <img src={item.img} alt={item.title} loading="lazy" />
                <span className="gallery-tile-label">{item.title}</span>
              </Link>
            ))}
          </div>

          {/* Grid Block 2 */}
          <div className="gallery-grid">
            {DESKTOP_ITEMS_2.map((item) => (
              <Link to={item.link} key={item.id} className={item.className}>
                <img src={item.img} alt={item.title} loading="lazy" />
                <span className="gallery-tile-label">{item.title}</span>
              </Link>
            ))}
          </div>

          {/* Duplicate Block 1 for infinite seamless looping */}
          <div className="gallery-grid">
            {DESKTOP_ITEMS.map((item) => (
              <Link to={item.link} key={`dup-${item.id}`} className={item.className}>
                <img src={item.img} alt={item.title} loading="lazy" />
                <span className="gallery-tile-label">{item.title}</span>
              </Link>
            ))}
          </div>

          {/* Duplicate Block 2 for infinite seamless looping */}
          <div className="gallery-grid">
            {DESKTOP_ITEMS_2.map((item) => (
              <Link to={item.link} key={`dup-${item.id}-2`} className={item.className}>
                <img src={item.img} alt={item.title} loading="lazy" />
                <span className="gallery-tile-label">{item.title}</span>
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* 2. Mobile View: Infinite Auto-Marquee Portrait Cards matching Nishorama Mobile */}
      <div className="gallery-grid-wrapper mobile">
        <div className="gallery_hero_marquee">
          {MOBILE_ITEMS.map((item, idx) => (
            <div key={`m-${idx}`} className="gallery_hero_card">
              <img src={item.src} alt={item.label} loading="lazy" />
              <Link to={item.link} className="explore-btn">
                {item.label}
              </Link>
            </div>
          ))}
          {/* Duplicate for infinite seamless marquee */}
          {MOBILE_ITEMS.map((item, idx) => (
            <div key={`m-dup-${idx}`} className="gallery_hero_card">
              <img src={item.src} alt={item.label} loading="lazy" />
              <Link to={item.link} className="explore-btn">
                {item.label}
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default LookbookGallery;
