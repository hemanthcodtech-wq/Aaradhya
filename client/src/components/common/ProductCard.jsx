import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Heart, Check, Plus } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';

const ProductCard = ({ product, badgeType, index = 0 }) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { addToCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();

  const [added, setAdded] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  if (!product) return null;

  const isFavorited = isInWishlist(product._id);
  const discount =
    product.discountPercent ||
    (product.mrp && product.mrp > product.price
      ? Math.round(((product.mrp - product.price) / product.mrp) * 100)
      : 0);

  const resolvedBadge =
    badgeType ||
    product.badge ||
    (product.isBestseller ? 'bestseller' : product.isNewArrival ? 'new' : discount > 0 ? 'discount' : 'new');

  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();

    // Enforce login requirement
    if (!user) {
      navigate('/login', {
        state: {
          message: 'Please sign in to add items to your cart.',
          returnUrl: window.location.pathname,
        },
      });
      return;
    }

    addToCart(product, 1);
    setAdded(true);
    setTimeout(() => setAdded(false), 1600);
  };

  const handleWishlistToggle = (e) => {
    e.preventDefault();
    e.stopPropagation();

    // Enforce login requirement
    if (!user) {
      navigate('/login', {
        state: {
          message: 'Please sign in to save items to your wishlist.',
          returnUrl: window.location.pathname,
        },
      });
      return;
    }

    toggleWishlist(product);
  };

  const imageSrc =
    product.images?.[0] ||
    product.image ||
    'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=600&auto=format&fit=crop&q=80';

  return (
    <motion.div
      className="product-card nishorama-fashion-card"
      initial={{ opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.12 }}
      transition={{ duration: 0.45, delay: (index % 5) * 0.05, ease: [0.25, 1, 0.5, 1] }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
      }}
    >
      {/* 1. Tall Rounded Portrait Image Container matching Nishorama screenshot */}
      <div
        className="position-relative overflow-hidden shadow-sm"
        style={{
          borderRadius: '22px',
          backgroundColor: '#F8F6F8',
          paddingTop: '124%', // Tall portrait aspect ratio
          border: '1px solid #F0E7ED',
        }}
      >
        {/* Floating Pill Badge on Top-Left: "New In" or "% OFF" (White pill with dark text) */}
        <span
          className="position-absolute shadow-sm fw-semibold text-dark"
          style={{
            top: '12px',
            left: '12px',
            backgroundColor: '#FFFFFF',
            fontSize: '0.72rem',
            borderRadius: '999px',
            padding: '0.22rem 0.65rem',
            zIndex: 3,
            letterSpacing: '0.02em',
            boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
          }}
        >
          {discount > 0 && resolvedBadge === 'discount' ? `${discount}% OFF` : 'New In'}
        </span>

        {/* Floating Circular Wishlist Heart on Top-Right */}
        <motion.button
          whileHover={{ scale: 1.15 }}
          whileTap={{ scale: 0.88 }}
          className="position-absolute rounded-circle border-0 d-flex align-items-center justify-content-center shadow-sm"
          style={{
            top: '12px',
            right: '12px',
            width: '34px',
            height: '34px',
            backgroundColor: isFavorited ? '#FFF0F5' : 'rgba(255, 255, 255, 0.92)',
            backdropFilter: 'blur(4px)',
            zIndex: 3,
            cursor: 'pointer',
            color: isFavorited ? '#E90064' : '#64748B',
            boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
          }}
          onClick={handleWishlistToggle}
          title={isFavorited ? 'Remove from Wishlist' : 'Add to Wishlist'}
          aria-label="Wishlist"
        >
          <Heart
            size={15}
            fill={isFavorited ? '#E90064' : 'none'}
            color={isFavorited ? '#E90064' : '#64748B'}
          />
        </motion.button>

        {/* Product Image with Smooth Zoom - Direct Link to Product Detail */}
        <Link to={`/product/${product.slug || product._id}`} className="d-block w-100 h-100">
          <motion.img
            src={imageSrc}
            alt={product.name}
            animate={{ scale: isHovered ? 1.05 : 1 }}
            transition={{ duration: 0.45, ease: [0.25, 1, 0.5, 1] }}
            className="position-absolute top-0 start-0 w-100 h-100"
            style={{ objectFit: 'cover' }}
            loading="lazy"
          />
        </Link>
      </div>

      {/* 2. Clean Information Row Below Image matching Nishorama (Title & (Price) on Left, + Add on Right) */}
      <div className="pt-2.5 pb-1 d-flex align-items-center justify-content-between">
        {/* Left Column: Product Name & Formatted Price */}
        <div className="pe-2 text-truncate" style={{ maxWidth: 'calc(100% - 76px)' }}>
          <Link
            to={`/product/${product.slug || product._id}`}
            className="text-decoration-none fw-semibold d-block text-truncate mb-0.5 text-dark"
            title={product.name}
            style={{
              fontSize: '0.9rem',
              lineHeight: 1.25,
              color: '#17233B',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = '#E90064')}
            onMouseLeave={(e) => (e.currentTarget.style.color = '#17233B')}
          >
            {product.name}
          </Link>

          <div
            className="fw-medium text-secondary small"
            style={{ fontSize: '0.84rem', color: '#4B5563' }}
          >
            (₹ {product.price?.toLocaleString()})
          </div>
        </div>

        {/* Right Column: Minimalist Pill "+ Add" Button */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.94 }}
          className="btn btn-sm rounded-pill fw-semibold d-inline-flex align-items-center justify-content-center gap-1 shadow-sm flex-shrink-0"
          style={{
            backgroundColor: added ? '#16A34A' : isHovered ? '#17233B' : '#FFFFFF',
            color: added || isHovered ? '#FFFFFF' : '#17233B',
            border: added ? '1px solid #16A34A' : isHovered ? '1px solid #17233B' : '1px solid #D1D5DB',
            fontSize: '0.78rem',
            padding: '0.28rem 0.8rem',
            minWidth: '68px',
            transition: 'all 0.2s ease',
          }}
          onClick={handleAddToCart}
          aria-label={`Add ${product.name} to bag`}
        >
          {added ? (
            <>
              <Check size={13} />
              <span>Added</span>
            </>
          ) : (
            <>
              <Plus size={13} />
              <span>Add</span>
            </>
          )}
        </motion.button>
      </div>
    </motion.div>
  );
};

export default ProductCard;
