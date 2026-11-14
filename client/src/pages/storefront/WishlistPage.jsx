import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Heart, ShoppingBag, Trash2, ShoppingCart, Lock } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useWishlist } from '../../context/WishlistContext';
import { useCart } from '../../context/CartContext';

const WishlistPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { wishlistItems, removeFromWishlist } = useWishlist();
  const { addToCart } = useCart();

  if (!user) {
    return (
      <div className="container py-5 text-center">
        <div
          className="rounded-circle d-flex align-items-center justify-content-center mx-auto mb-3"
          style={{ width: '80px', height: '80px', backgroundColor: '#FFF0F5', color: '#E90064' }}
        >
          <Lock size={36} />
        </div>
        <h4 className="fw-bolder text-dark mb-2">Sign in to View Your Wishlist</h4>
        <p className="text-secondary small mb-4" style={{ maxWidth: '420px', margin: '0 auto' }}>
          Please sign in to your Aaradhya account to access your saved sarees, kurtis, fabrics and luxury collections.
        </p>
        <Link
          to="/login"
          state={{ message: 'Please sign in to access your Wishlist.', returnUrl: '/wishlist' }}
          className="btn rounded-pill px-4 py-2 text-white fw-bold shadow-sm"
          style={{ backgroundColor: '#E90064', borderColor: '#E90064' }}
        >
          Sign In Now
        </Link>
      </div>
    );
  }

  if (wishlistItems.length === 0) {
    return (
      <div className="container py-5 text-center">
        <div
          className="rounded-circle d-flex align-items-center justify-content-center mx-auto mb-3"
          style={{ width: '80px', height: '80px', backgroundColor: '#FFF0F5', color: '#E90064' }}
        >
          <Heart size={38} />
        </div>
        <h4 className="fw-bolder text-dark mb-1">Your Wishlist is Empty</h4>
        <p className="text-muted small mb-4">
          Save your favorite silk sarees and designer fabrics here to review them whenever you're ready.
        </p>
        <Link
          to="/products"
          className="btn rounded-pill px-4 py-2 text-white fw-bold shadow-sm"
          style={{ backgroundColor: '#E90064', borderColor: '#E90064' }}
        >
          Explore Catalog
        </Link>
      </div>
    );
  }

  return (
    <div className="container py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h3 className="fw-bolder mb-0 text-dark">My Wishlist</h3>
          <small className="text-muted">{wishlistItems.length} saved item{wishlistItems.length > 1 ? 's' : ''}</small>
        </div>
        <Link
          to="/cart"
          className="btn btn-outline-dark btn-sm rounded-pill px-3 fw-semibold"
        >
          View Shopping Bag
        </Link>
      </div>

      <div className="row g-3 row-cols-1 row-cols-sm-2 row-cols-md-3 row-cols-lg-4">
        {wishlistItems.map((item) => (
          <div key={item._id} className="col">
            <div
              className="card border-0 rounded-4 h-100 d-flex flex-column p-3 shadow-sm bg-white"
              style={{ border: '1px solid #F0E7ED' }}
            >
              <div
                className="position-relative overflow-hidden rounded-3 mb-3 d-flex align-items-center justify-content-center bg-light"
                style={{ height: '240px' }}
              >
                <img
                  src={item.images?.[0] || item.image || 'https://via.placeholder.com/300'}
                  alt={item.name}
                  style={{ height: '100%', width: '100%', objectFit: 'cover' }}
                />
                <button
                  className="btn btn-light btn-sm text-danger position-absolute top-0 end-0 m-2 rounded-circle p-1.5 shadow-sm"
                  onClick={() => removeFromWishlist(item._id)}
                  title="Remove from wishlist"
                >
                  <Trash2 size={15} />
                </button>
              </div>

              <h6 className="fw-bold small text-dark text-truncate mb-2">{item.name}</h6>

              <div className="mt-auto pt-2 border-top d-flex align-items-center justify-content-between">
                <div>
                  <span className="fw-bold fs-6" style={{ color: '#E90064' }}>
                    ₹{item.price?.toLocaleString()}
                  </span>
                  {item.mrp > item.price && (
                    <span className="text-muted small text-decoration-line-through ms-1.5" style={{ fontSize: '0.75rem' }}>
                      ₹{item.mrp?.toLocaleString()}
                    </span>
                  )}
                </div>

                <button
                  className="btn btn-sm rounded-pill text-white fw-bold d-flex align-items-center gap-1 shadow-sm px-2.5 py-1"
                  style={{ backgroundColor: '#E90064', fontSize: '0.75rem' }}
                  onClick={() => {
                    addToCart(item, 1);
                    removeFromWishlist(item._id);
                  }}
                >
                  <ShoppingCart size={13} /> Move to Bag
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default WishlistPage;
