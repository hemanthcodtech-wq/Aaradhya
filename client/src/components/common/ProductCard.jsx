import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Check, Bookmark, ShoppingBag } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';

const ProductCard = ({ product, badgeType, index = 0 }) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { addToCart } = useCart();

  const [added, setAdded] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [isWishlisted, setIsWishlisted] = useState(false);

  if (!product) return null;

  // Calculate pricing & discount
  const sellingPrice = Number(product.price) || 0;
  const mrp = Number(product.mrp) && Number(product.mrp) > sellingPrice
    ? Number(product.mrp)
    : Math.round(sellingPrice * 1.3);

  const discount =
    product.discountPercent ||
    (mrp > sellingPrice ? Math.round(((mrp - sellingPrice) / mrp) * 100) : 23);

  // Subtitle (Color / Fabric / Type) matching Nishorama Row 2
  const subtitle =
    product.color ||
    product.colors?.[0] ||
    product.fabric ||
    product.fabricType ||
    (product.storeCode === 'AF' ? 'Pure Handloom Fabric' : 'Pure Handloom Silk');

  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();

    // Enforce login requirement if configured
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
    setTimeout(() => setAdded(false), 1800);
  };

  const handleToggleWishlist = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsWishlisted(!isWishlisted);
  };

  const imageSrc =
    product.images?.[0] ||
    product.image ||
    'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=700&auto=format&fit=crop&q=85';

  return (
    <motion.div
      className="product-card nishorama-fashion-card"
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.1 }}
      transition={{ duration: 0.4, delay: (index % 5) * 0.04, ease: [0.25, 1, 0.5, 1] }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        background: 'transparent',
        border: 'none',
      }}
    >
      {/* 1. Tall Rounded Portrait Image Container (Exact 3:4 aspect ratio matching Nishorama) */}
      <div
        className="card-media-wrapper position-relative overflow-hidden"
        style={{
          borderRadius: '14px',
          backgroundColor: '#F8F6F8',
          paddingTop: '133.333%', // 3:4 portrait ratio
          border: '1px solid #ECE6EB',
        }}
      >
        {/* Floating Bookmark / Wishlist Icon on Top-Right matching Nishorama */}
        <button
          type="button"
          onClick={handleToggleWishlist}
          className="position-absolute d-flex align-items-center justify-content-center border-0 p-0"
          style={{
            top: '12px',
            right: '12px',
            width: '32px',
            height: '32px',
            borderRadius: '50%',
            backgroundColor: 'rgba(255, 255, 255, 0.85)',
            backdropFilter: 'blur(4px)',
            color: isWishlisted ? '#E90064' : '#17233B',
            zIndex: 3,
            cursor: 'pointer',
            boxShadow: '0 2px 6px rgba(0,0,0,0.08)',
            transition: 'transform 0.2s ease, background-color 0.2s ease',
          }}
          title={isWishlisted ? 'Saved to Wishlist' : 'Save to Wishlist'}
          aria-label="Wishlist"
        >
          <Bookmark size={15} fill={isWishlisted ? '#E90064' : 'none'} />
        </button>

        {/* Optional Top-Left Badge (e.g. New In) */}
        {product.isNewArrival && (
          <span
            className="position-absolute px-2 py-0.5 small fw-semibold text-dark bg-white rounded-pill shadow-sm"
            style={{
              top: '12px',
              left: '12px',
              fontSize: '0.68rem',
              zIndex: 3,
              letterSpacing: '0.02em',
            }}
          >
            New In
          </span>
        )}

        {/* Product Image with Zoom */}
        <Link to={`/product/${product.slug || product._id}`} className="d-block w-100 h-100">
          <motion.img
            src={imageSrc}
            alt={product.name}
            animate={{ scale: isHovered ? 1.04 : 1 }}
            transition={{ duration: 0.4, ease: [0.25, 1, 0.5, 1] }}
            className="product-thumb"
            loading="lazy"
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              objectFit: 'cover',
            }}
          />
        </Link>
      </div>

      {/* 2. Card Details Below Image (Row 1: Title, Row 2: Color, Row 3: Price + Discount Badge, Row 4: Full-width Add to bag) */}
      <div className="pt-2 d-flex flex-column flex-grow-1 justify-content-between">
        <div>
          {/* Row 1: Product Title matching Nishorama */}
          <Link
            to={`/product/${product.slug || product._id}`}
            className="card-info-title text-decoration-none fw-semibold d-block text-truncate mb-0.5 text-dark"
            title={product.name}
            style={{
              fontSize: '0.92rem',
              lineHeight: 1.25,
              color: '#111827',
              fontFamily: "'Assistant', sans-serif",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = '#E90064')}
            onMouseLeave={(e) => (e.currentTarget.style.color = '#111827')}
          >
            {product.name}
          </Link>

          {/* Row 2: Subtitle / Color matching Nishorama */}
          <div
            className="card-info-subtitle small text-truncate mb-1"
            style={{
              fontSize: '0.82rem',
              color: '#6B7280',
              fontFamily: "'Assistant', sans-serif",
              lineHeight: 1.2,
            }}
          >
            {subtitle}
          </div>

          {/* Row 3: Pricing Row matching Nishorama (Selling Price + Strikethrough MRP + Solid Black Discount Badge) */}
          <div className="d-flex align-items-center gap-2 mb-2 flex-wrap">
            <span
              className="fw-bold"
              style={{
                fontSize: '0.9rem',
                color: '#111827',
                fontFamily: "'Assistant', sans-serif",
              }}
            >
              ₹{sellingPrice.toLocaleString('en-IN')}
            </span>

            {mrp > sellingPrice && (
              <span
                className="text-decoration-line-through"
                style={{
                  fontSize: '0.78rem',
                  color: '#9CA3AF',
                  fontFamily: "'Assistant', sans-serif",
                }}
              >
                ₹{mrp.toLocaleString('en-IN')}
              </span>
            )}

            {discount > 0 && (
              <span
                className="badge text-white fw-bold"
                style={{
                  backgroundColor: '#111827',
                  borderRadius: '4px',
                  padding: '2px 6px',
                  fontSize: '0.72rem',
                  letterSpacing: '0.02em',
                }}
              >
                -{discount}%
              </span>
            )}
          </div>
        </div>

        {/* Row 4: Full-Width Pill 'Add to bag' Button matching Nishorama */}
        <motion.button
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.98 }}
          type="button"
          onClick={handleAddToCart}
          className="btn w-100 rounded-pill card-add-bag-btn d-flex align-items-center justify-content-center gap-1.5 fw-semibold mt-auto"
          style={{
            backgroundColor: added ? '#16A34A' : '#111827',
            color: '#FFFFFF',
            border: added ? '1px solid #16A34A' : '1px solid #111827',
            padding: '0.45rem 1rem',
            fontSize: '0.85rem',
            fontFamily: "'Assistant', sans-serif",
            letterSpacing: '0.02em',
            transition: 'background-color 0.2s ease, border-color 0.2s ease, box-shadow 0.2s ease',
            boxShadow: '0 2px 4px rgba(0,0,0,0.06)',
            cursor: 'pointer',
          }}
          aria-label={`Add ${product.name} to bag`}
        >
          {added ? (
            <>
              <Check size={15} />
              <span>Added ✓</span>
            </>
          ) : (
            <span>Add to bag</span>
          )}
        </motion.button>
      </div>
    </motion.div>
  );
};

export default ProductCard;
