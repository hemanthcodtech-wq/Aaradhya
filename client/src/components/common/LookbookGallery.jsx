import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, ExternalLink } from 'lucide-react';
import { FaCameraRetro } from 'react-icons/fa6';
import AnimatedFaIcon from './AnimatedFaIcon';
import axiosClient from '../../api/axiosClient';

const LookbookGallery = () => {
  const [galleryItems, setGalleryItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const scrollRef = useRef(null);

  useEffect(() => {
    const fetchGallery = async () => {
      try {
        const res = await axiosClient.get('/gallery');
        if (res.success && res.data?.length > 0) {
          setGalleryItems(res.data);
        }
      } catch (err) {
        console.error('Failed to load gallery items', err);
      } finally {
        setLoading(false);
      }
    };
    fetchGallery();
  }, []);

  const handleScroll = (direction) => {
    if (!scrollRef.current) return;
    const scrollAmount = 450;
    scrollRef.current.scrollBy({
      left: direction === 'left' ? -scrollAmount : scrollAmount,
      behavior: 'smooth',
    });
  };

  // Build dynamic columns: Hero (single full-height wide), Portrait (single full-height), and Stacked (pair of 2)
  const buildColumns = () => {
    const columns = [];
    let i = 0;

    while (i < galleryItems.length) {
      const item = galleryItems[i];

      if (item.aspect === 'hero') {
        // Hero / Centerpiece full-height wide column
        columns.push({
          type: 'hero',
          items: [item],
          key: `hero-${item._id || i}`,
        });
        i += 1;
      } else if (item.aspect === 'portrait') {
        // Single portrait full-height column
        columns.push({
          type: 'portrait',
          items: [item],
          key: `portrait-${item._id || i}`,
        });
        i += 1;
      } else {
        // Stacked column: take up to 2 items
        const stackedItems = [item];
        if (i + 1 < galleryItems.length && galleryItems[i + 1].aspect !== 'hero' && galleryItems[i + 1].aspect !== 'portrait') {
          stackedItems.push(galleryItems[i + 1]);
          i += 2;
        } else {
          i += 1;
        }
        columns.push({
          type: 'stacked',
          items: stackedItems,
          key: `stacked-${item._id || i}`,
        });
      }
    }

    return columns;
  };

  if (!loading && galleryItems.length === 0) return null;

  const columns = buildColumns();

  return (
    <section className="mb-5 lookbook-section">
      {/* Header matching Nishorama lookbook */}
      <div className="d-flex flex-wrap align-items-center justify-content-between mb-3 gap-2">
        <motion.div
          initial={{ opacity: 0, x: -15 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4 }}
          className="d-flex align-items-center gap-2"
        >
          <AnimatedFaIcon icon={FaCameraRetro} size={20} color="#E90064" animation="float" />
          <div>
            <h4 className="fw-bolder mb-0 text-dark" style={{ letterSpacing: '-0.3px', color: '#17233B' }}>
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

        {/* Navigation & Instagram Link */}
        <div className="d-flex align-items-center gap-2">
          <a
            href="https://www.instagram.com/aaradhya_fabrics?xtok=cTN3aXVtZnFnY2ls"
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-outline-dark btn-sm rounded-pill px-3 py-1.5 fw-semibold d-none d-sm-inline-flex align-items-center gap-1.5"
            style={{ fontSize: '0.78rem' }}
          >
            <span>Follow on Instagram</span>
            <ExternalLink size={12} />
          </a>

          <button
            type="button"
            className="btn btn-light rounded-circle border d-flex align-items-center justify-content-center shadow-sm"
            style={{ width: '36px', height: '36px' }}
            onClick={() => handleScroll('left')}
            aria-label="Previous gallery photos"
          >
            <ChevronLeft size={18} />
          </button>
          <button
            type="button"
            className="btn btn-light rounded-circle border d-flex align-items-center justify-content-center shadow-sm"
            style={{ width: '36px', height: '36px' }}
            onClick={() => handleScroll('right')}
            aria-label="Next gallery photos"
          >
            <ChevronRight size={18} />
          </button>
        </div>
      </div>

      {/* Collage Scroller Track matching Nishorama (media_1794592837374_e2df7b94.jpg) */}
      <div
        ref={scrollRef}
        className="d-flex overflow-x-auto pb-2 scrollbar-hidden"
        style={{
          gap: '12px',
          height: 'clamp(380px, 42vw, 480px)',
          scrollSnapType: 'x mandatory',
          scrollbarWidth: 'none',
          msOverflowStyle: 'none',
          WebkitOverflowScrolling: 'touch',
        }}
      >
        {columns.map((col, colIdx) => {
          if (col.type === 'hero') {
            // Wide Centerpiece Hero Image
            const item = col.items[0];
            return (
              <motion.div
                key={col.key}
                initial={{ opacity: 0, scale: 0.96 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ duration: 0.45, delay: colIdx * 0.05 }}
                className="flex-shrink-0 position-relative overflow-hidden shadow-sm"
                style={{
                  width: 'clamp(340px, 46vw, 560px)',
                  height: '100%',
                  borderRadius: '24px',
                  scrollSnapAlign: 'start',
                  backgroundColor: '#F3F4F6',
                }}
              >
                <img
                  src={item.imageUrl}
                  alt={item.caption || 'Aaradhya Lookbook'}
                  className="w-100 h-100"
                  style={{
                    objectFit: 'cover',
                    transition: 'transform 0.45s ease',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.03)')}
                  onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
                  loading="lazy"
                />
                {/* Gradient Caption Overlay */}
                <div
                  className="position-absolute bottom-0 start-0 end-0 p-3 p-md-4 text-white d-flex flex-column justify-content-end"
                  style={{
                    background: 'linear-gradient(to top, rgba(23, 35, 59, 0.85) 0%, rgba(23, 35, 59, 0.3) 60%, transparent 100%)',
                    zIndex: 2,
                    pointerEvents: 'none',
                  }}
                >
                  <span
                    className="badge rounded-pill mb-1 d-inline-block align-self-start fw-bold"
                    style={{ backgroundColor: '#E90064', fontSize: '0.68rem', padding: '3px 9px' }}
                  >
                    {item.tag || 'Lookbook'}
                  </span>
                  <div
                    className="fw-bold text-white text-truncate"
                    style={{ fontSize: '1.02rem', textShadow: '0 1px 4px rgba(0,0,0,0.5)' }}
                  >
                    {item.caption || 'Moments in Aaradhya'}
                  </div>
                </div>
              </motion.div>
            );
          }

          if (col.type === 'portrait') {
            // Tall Single Portrait Image
            const item = col.items[0];
            return (
              <motion.div
                key={col.key}
                initial={{ opacity: 0, scale: 0.96 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ duration: 0.45, delay: colIdx * 0.05 }}
                className="flex-shrink-0 position-relative overflow-hidden shadow-sm"
                style={{
                  width: 'clamp(210px, 24vw, 280px)',
                  height: '100%',
                  borderRadius: '24px',
                  scrollSnapAlign: 'start',
                  backgroundColor: '#F3F4F6',
                }}
              >
                <img
                  src={item.imageUrl}
                  alt={item.caption || 'Aaradhya Lookbook'}
                  className="w-100 h-100"
                  style={{
                    objectFit: 'cover',
                    transition: 'transform 0.45s ease',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.03)')}
                  onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
                  loading="lazy"
                />
                {/* Gradient Caption Overlay */}
                <div
                  className="position-absolute bottom-0 start-0 end-0 p-3 text-white d-flex flex-column justify-content-end"
                  style={{
                    background: 'linear-gradient(to top, rgba(23, 35, 59, 0.85) 0%, rgba(23, 35, 59, 0.3) 60%, transparent 100%)',
                    zIndex: 2,
                    pointerEvents: 'none',
                  }}
                >
                  <span
                    className="badge rounded-pill mb-1 d-inline-block align-self-start fw-bold"
                    style={{ backgroundColor: '#E90064', fontSize: '0.62rem', padding: '2px 8px' }}
                  >
                    {item.tag || 'Silks'}
                  </span>
                  <div
                    className="fw-bold text-white text-truncate small"
                    style={{ fontSize: '0.84rem', textShadow: '0 1px 4px rgba(0,0,0,0.5)' }}
                  >
                    {item.caption || 'Moments in Aaradhya'}
                  </div>
                </div>
              </motion.div>
            );
          }

          // Stacked Column: 2 rounded images stacked vertically
          return (
            <div
              key={col.key}
              className="flex-shrink-0 d-flex flex-column"
              style={{
                width: 'clamp(190px, 21vw, 250px)',
                height: '100%',
                gap: '12px',
                scrollSnapAlign: 'start',
              }}
            >
              {col.items.map((item, itemIdx) => (
                <motion.div
                  key={item._id || itemIdx}
                  initial={{ opacity: 0, scale: 0.96 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true, amount: 0.2 }}
                  transition={{ duration: 0.45, delay: (colIdx * 2 + itemIdx) * 0.04 }}
                  className="position-relative overflow-hidden shadow-sm w-100"
                  style={{
                    height: col.items.length === 1 ? '100%' : 'calc(50% - 6px)',
                    borderRadius: '24px',
                    backgroundColor: '#F3F4F6',
                  }}
                >
                  <img
                    src={item.imageUrl}
                    alt={item.caption || 'Aaradhya Lookbook'}
                    className="w-100 h-100"
                    style={{
                      objectFit: 'cover',
                      transition: 'transform 0.45s ease',
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.03)')}
                    onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
                    loading="lazy"
                  />
                  {/* Gradient Caption Overlay */}
                  <div
                    className="position-absolute bottom-0 start-0 end-0 p-2.5 text-white d-flex flex-column justify-content-end"
                    style={{
                      background: 'linear-gradient(to top, rgba(23, 35, 59, 0.85) 0%, rgba(23, 35, 59, 0.3) 60%, transparent 100%)',
                      zIndex: 2,
                      pointerEvents: 'none',
                    }}
                  >
                    <span
                      className="badge rounded-pill mb-1 d-inline-block align-self-start fw-bold"
                      style={{ backgroundColor: '#E90064', fontSize: '0.58rem', padding: '2px 7px' }}
                    >
                      {item.tag || 'Fabrics'}
                    </span>
                    <div
                      className="fw-bold text-white text-truncate"
                      style={{ fontSize: '0.78rem', textShadow: '0 1px 3px rgba(0,0,0,0.5)' }}
                    >
                      {item.caption || 'Moments in Aaradhya'}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          );
        })}
      </div>
    </section>
  );
};

export default LookbookGallery;
