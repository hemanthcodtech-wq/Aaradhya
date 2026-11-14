import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Trash2,
  ArrowRight,
  ShieldCheck,
  ShoppingBag,
  Tag,
  CheckCircle,
  AlertCircle,
  Truck,
  Store,
  Layers,
  Sparkles,
  Lock,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';

const CartPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const {
    cartItems,
    totalItemCount,
    subtotal,
    taxAmount,
    shippingFee,
    discountAmount,
    totalAmount,
    coupon,
    updateQuantity,
    removeFromCart,
    clearCart,
    applyCoupon,
    removeCoupon,
  } = useCart();

  const [couponInput, setCouponInput] = useState('');
  const [couponMessage, setCouponMessage] = useState(null);

  const handleApplyCoupon = (e) => {
    e.preventDefault();
    if (!couponInput.trim()) return;

    const res = applyCoupon(couponInput);
    setCouponMessage(res);
    if (res.success) {
      setCouponInput('');
    }
  };

  // Enforce sign in to access cart
  if (!user) {
    return (
      <div className="container py-5 text-center" style={{ minHeight: '62vh' }}>
        <div
          className="rounded-circle d-flex align-items-center justify-content-center mx-auto mb-3"
          style={{ width: '84px', height: '84px', backgroundColor: '#FFF0F5', color: '#E90064' }}
        >
          <Lock size={40} />
        </div>
        <h4 className="fw-bolder text-dark mb-2">Sign in to Access Your Aaradhya Bag</h4>
        <p className="text-secondary small mb-4 mx-auto" style={{ maxWidth: '440px' }}>
          Please sign in to your Aaradhya account to view your bag, access saved items, and proceed to checkout.
        </p>
        <div className="d-flex justify-content-center gap-2">
          <Link
            to="/login"
            state={{ message: 'Please sign in to access your Bag.', returnUrl: '/cart' }}
            className="btn rounded-pill px-4 py-2 text-white fw-bold shadow-sm"
            style={{ backgroundColor: '#E90064', borderColor: '#E90064' }}
          >
            Sign In Now
          </Link>
          <Link
            to="/products"
            className="btn btn-outline-dark rounded-pill px-4 py-2 fw-semibold small"
          >
            Explore Catalog
          </Link>
        </div>
      </div>
    );
  }

  if (cartItems.length === 0) {
    return (
      <div className="container py-5 text-center">
        <div
          className="rounded-circle d-flex align-items-center justify-content-center mx-auto mb-3"
          style={{ width: '80px', height: '80px', backgroundColor: '#F0E7ED', color: '#E90064' }}
        >
          <ShoppingBag size={40} />
        </div>
        <h4 className="fw-bold">Your Aaradhya Bag is Empty</h4>
        <p className="text-muted small mb-4">
          Discover handpicked Pure Silks and premium unstitched Fabrics ready for your festive wardrobe.
        </p>
        <Link
          to="/products"
          className="btn btn-primary px-4 py-2.5 rounded-pill text-white fw-bold shadow-sm"
          style={{ backgroundColor: '#E90064', borderColor: '#E90064' }}
        >
          Explore Aaradhya Collections
        </Link>
      </div>
    );
  }

  return (
    <div className="container py-4">
      {/* Title */}
      <div className="d-flex justify-content-between align-items-end mb-4">
        <div>
          <h3 className="fw-bolder mb-1" style={{ color: '#17233B' }}>
            Shopping Bag ({totalItemCount} {totalItemCount === 1 ? 'Item' : 'Items'})
          </h3>
          <p className="text-muted small mb-0">
            Aaradhya centralized bag with direct artisan dispatch across India.
          </p>
        </div>
        <button
          className="btn btn-link btn-sm text-danger text-decoration-none p-0 small fw-semibold"
          onClick={clearCart}
        >
          Clear All
        </button>
      </div>

      <div className="row g-4">
        {/* Left Column: Cart Items */}
        <div className="col-lg-8">
          <div className="card card-modern p-3 mb-3 border shadow-sm">
            <div className="d-flex justify-content-between align-items-center border-bottom pb-2 mb-3">
              <span className="fw-bold small text-dark">Bag Items ({cartItems.length})</span>
              <small className="text-muted" style={{ fontSize: '0.72rem' }}>
                100% Handloom Authenticity Guaranteed
              </small>
            </div>

            <div className="d-flex flex-column gap-3">
              {cartItems.map((item, index) => (
                <div
                  key={`${item.product._id}_${item.variantId || index}`}
                  className="d-flex flex-column flex-sm-row align-items-sm-center justify-content-between gap-3 p-3 rounded-3 border bg-light bg-opacity-50"
                >
                  <div className="d-flex align-items-center gap-3">
                    <img
                      src={item.image || 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=120'}
                      alt={item.name}
                      style={{ width: '70px', height: '70px', objectFit: 'cover', borderRadius: '8px' }}
                    />
                    <div>
                      <Link
                        to={`/product/${item.product.slug || item.product._id}`}
                        className="fw-bold text-dark text-decoration-none small line-clamp-1"
                        style={{ maxWidth: '280px' }}
                      >
                        {item.name}
                      </Link>
                      <div className="d-flex align-items-center gap-1.5 mt-0.5">
                        <span className="badge bg-light text-muted border" style={{ fontSize: '0.62rem' }}>
                          {item.product?.productId || 'AR-000001'}
                        </span>
                        {item.variantName && (
                          <span className="badge bg-secondary text-white" style={{ fontSize: '0.65rem' }}>
                            Size: {item.variantName}
                          </span>
                        )}
                      </div>
                      <div className="fw-bold fs-6 mt-1" style={{ color: '#E90064' }}>
                        ₹{item.price?.toLocaleString()}
                        {item.mrp > item.price && (
                          <span className="text-muted text-decoration-line-through small ms-2 fw-normal">
                            ₹{item.mrp?.toLocaleString()}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Quantity Controls & Delete */}
                  <div className="d-flex align-items-center justify-content-between gap-3 mt-2 mt-sm-0">
                    <div className="input-group input-group-sm" style={{ width: '105px' }}>
                      <button
                        className="btn btn-outline-secondary"
                        onClick={() => updateQuantity(item.product._id, item.quantity - 1, item.variantId)}
                      >
                        -
                      </button>
                      <input
                        type="text"
                        className="form-control text-center fw-bold"
                        value={item.quantity}
                        readOnly
                      />
                      <button
                        className="btn btn-outline-secondary"
                        onClick={() => updateQuantity(item.product._id, item.quantity + 1, item.variantId)}
                      >
                        +
                      </button>
                    </div>

                    <div className="fw-bold text-dark text-end" style={{ minWidth: '80px' }}>
                      ₹{(item.price * item.quantity).toLocaleString()}
                    </div>

                    <button
                      className="btn btn-light btn-sm text-danger border-0"
                      onClick={() => removeFromCart(item.product._id, item.variantId)}
                      title="Remove"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Delivery notice */}
          <div className="alert alert-success d-flex align-items-center gap-2 py-2 px-3 small border-0 shadow-sm">
            <Truck size={18} />
            <span>
              {subtotal >= 999
                ? 'Yay! Your order qualifies for FREE Express Shipping across India.'
                : `Add ₹${(999 - subtotal).toLocaleString()} more to your bag to enjoy FREE Shipping!`}
            </span>
          </div>
        </div>

        {/* Right Column: Order Summary & Coupon */}
        <div className="col-lg-4">
          <div className="card card-modern p-4 mb-3 border shadow-sm">
            <h5 className="fw-bold mb-3 border-bottom pb-2 text-dark">Order Summary</h5>

            {/* Coupon Code Input */}
            <div className="mb-4">
              <label className="fw-semibold small text-muted mb-1 d-flex align-items-center gap-1">
                <Tag size={14} /> Promotional Coupon
              </label>
              {coupon ? (
                <div className="d-flex align-items-center justify-content-between p-2 rounded-2 bg-success bg-opacity-10 border border-success">
                  <div>
                    <span className="fw-bold text-success small">{coupon.code}</span>
                    <span className="text-muted small ms-2">-₹{discountAmount}</span>
                  </div>
                  <button className="btn btn-link btn-sm text-danger text-decoration-none p-0 small fw-bold" onClick={removeCoupon}>
                    Remove
                  </button>
                </div>
              ) : (
                <form onSubmit={handleApplyCoupon} className="d-flex gap-2">
                  <input
                    type="text"
                    className="form-control form-control-sm text-uppercase"
                    placeholder="e.g. WELCOME10"
                    value={couponInput}
                    onChange={(e) => setCouponInput(e.target.value)}
                  />
                  <button
                    type="submit"
                    className="btn btn-sm px-3 text-white fw-bold"
                    style={{ backgroundColor: '#E90064', borderColor: '#E90064' }}
                  >
                    Apply
                  </button>
                </form>
              )}

              {couponMessage && (
                <div className={`small mt-1 ${couponMessage.success ? 'text-success' : 'text-danger'}`}>
                  {couponMessage.message}
                </div>
              )}
              <div className="text-muted mt-1" style={{ fontSize: '0.72rem' }}>
                Tip: Try code <strong>AARADHYA10</strong> or <strong>FESTIVE20</strong>
              </div>
            </div>

            {/* Price Calculations */}
            <div className="d-flex flex-column gap-2 border-bottom pb-3 mb-3 small">
              <div className="d-flex justify-content-between">
                <span className="text-muted">Subtotal ({totalItemCount} items)</span>
                <span className="fw-semibold">₹{subtotal.toLocaleString()}</span>
              </div>
              <div className="d-flex justify-content-between">
                <span className="text-muted">Apparel GST (5% inclusive)</span>
                <span className="fw-semibold">₹{taxAmount.toLocaleString()}</span>
              </div>
              <div className="d-flex justify-content-between">
                <span className="text-muted">Shipping Fee</span>
                <span className="fw-semibold">
                  {shippingFee === 0 ? <span className="text-success fw-bold">FREE</span> : `₹${shippingFee}`}
                </span>
              </div>
              {discountAmount > 0 && (
                <div className="d-flex justify-content-between text-success">
                  <span>Coupon Discount</span>
                  <span className="fw-bold">-₹{discountAmount.toLocaleString()}</span>
                </div>
              )}
            </div>

            {/* Total Payable */}
            <div className="d-flex justify-content-between align-items-center mb-4">
              <span className="fs-5 fw-bold text-dark">Total Amount</span>
              <span className="fs-4 fw-bolder" style={{ color: '#E90064' }}>
                ₹{totalAmount.toLocaleString()}
              </span>
            </div>

            <button
              className="btn w-100 py-3 fw-bold d-flex align-items-center justify-content-center gap-2 shadow-sm text-white"
              style={{ backgroundColor: '#E90064', borderColor: '#E90064', borderRadius: '50px' }}
              onClick={() => {
                if (!user) {
                  navigate('/login', {
                    state: {
                      message: 'Please sign in to proceed to checkout.',
                      returnUrl: '/cart',
                    },
                  });
                  return;
                }
                navigate('/checkout');
              }}
            >
              Proceed to Secure Checkout <ArrowRight size={18} />
            </button>

            <div className="d-flex align-items-center justify-content-center gap-2 text-muted small mt-3">
              <ShieldCheck size={16} className="text-success" />
              <span>Razorpay 256-bit Encrypted Unified Checkout</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartPage;