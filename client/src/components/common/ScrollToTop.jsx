import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { ChevronUp } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * ScrollToTop: Automatically scrolls the window to top on route change,
 * and provides a floating Back-to-Top button when user scrolls through records.
 */
const ScrollToTop = () => {
  const { pathname, hash } = useLocation();
  const [showScrollBtn, setShowScrollBtn] = useState(false);

  // Automatically scroll to top on route / path change
  useEffect(() => {
    if (hash) {
      setTimeout(() => {
        const el = document.querySelector(hash);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth' });
          return;
        }
      }, 100);
    } else {
      try {
        window.scrollTo({
          top: 0,
          left: 0,
          behavior: 'instant',
        });
      } catch {
        window.scrollTo(0, 0);
      }
    }
  }, [pathname]);

  // Track window scroll to reveal floating button
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 280) {
        setShowScrollBtn(true);
      } else {
        setShowScrollBtn(false);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  return (
    <AnimatePresence>
      {showScrollBtn && (
        <motion.button
          type="button"
          onClick={scrollToTop}
          initial={{ opacity: 0, scale: 0.6, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.6, y: 20 }}
          whileHover={{ scale: 1.1, translateY: -2 }}
          whileTap={{ scale: 0.94 }}
          transition={{ duration: 0.22, ease: 'easeOut' }}
          className="btn position-fixed rounded-circle d-flex align-items-center justify-content-center shadow-lg floating-scroll-top-btn"
          title="Scroll to Top"
          aria-label="Scroll to Top"
        >
          <ChevronUp size={20} strokeWidth={2.4} />
        </motion.button>
      )}
    </AnimatePresence>
  );
};

export default ScrollToTop;
