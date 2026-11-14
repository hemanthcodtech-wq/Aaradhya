import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Home,
  LayoutGrid,
  Heart,
  ShoppingBag,
  User,
} from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';
import { useAuth } from '../../context/AuthContext';

const MobileBottomBar = () => {
  const location = useLocation();
  const cart = useCart();
  const totalItemCount = cart?.totalItemCount || 0;
  const wishlist = useWishlist();
  const wishlistCount = wishlist?.wishlistCount || 0;
  const auth = useAuth();
  const user = auth?.user || null;

  const navItems = [
    {
      label: 'Home',
      icon: Home,
      path: '/',
      isActive: location.pathname === '/',
    },
    {
      label: 'Products',
      icon: LayoutGrid,
      path: '/products',
      isActive: location.pathname === '/products' || location.pathname.startsWith('/category'),
    },
    {
      label: 'Wishlist',
      icon: Heart,
      path: user ? '/wishlist' : '/login',
      badge: user ? wishlistCount : 0,
      isActive: location.pathname === '/wishlist',
    },
    {
      label: 'Bag',
      icon: ShoppingBag,
      path: user ? '/cart' : '/login',
      badge: user ? totalItemCount : 0,
      isActive: location.pathname === '/cart' || location.pathname === '/checkout',
    },
    {
      label: user ? 'Account' : 'Login',
      icon: User,
      path: user ? '/customer/profile' : '/login',
      isActive:
        location.pathname === '/login' ||
        location.pathname === '/register' ||
        location.pathname.startsWith('/customer'),
    },
  ];

  return (
    <nav
      className="d-md-none fixed-bottom bg-white border-top"
      style={{
        zIndex: 1045,
        height: '62px',
        borderColor: '#EAECF0',
        backgroundColor: '#FFFFFF',
        boxShadow: '0 -4px 18px rgba(23, 35, 59, 0.08)',
        paddingBottom: 'env(safe-area-inset-bottom, 0px)',
      }}
      aria-label="Mobile Navigation"
    >
      <div className="container-fluid px-1 h-100">
        <div className="d-flex align-items-center justify-content-around h-100 py-1">
          {navItems.map((item, idx) => {
            const Icon = item.icon;
            const active = item.isActive;

            return (
              <Link
                key={idx}
                to={item.path}
                className="text-decoration-none d-flex flex-column align-items-center justify-content-center h-100 position-relative px-1 flex-grow-1"
                style={{
                  color: active ? '#E90064' : '#64748B',
                  minWidth: '44px',
                  transition: 'color 0.15s ease',
                }}
              >
                <div
                  className="position-relative d-flex align-items-center justify-content-center"
                  style={{ width: '24px', height: '22px' }}
                >
                  <Icon
                    size={20}
                    strokeWidth={active ? 2.3 : 1.8}
                    color={active ? '#E90064' : '#64748B'}
                  />

                  {/* Badge Count strictly if logged in and > 0 */}
                  {user && item.badge > 0 && (
                    <span
                      className="position-absolute rounded-circle text-white d-flex align-items-center justify-content-center fw-bold"
                      style={{
                        top: '-5px',
                        right: '-8px',
                        backgroundColor: '#E90064',
                        fontSize: '0.58rem',
                        minWidth: '15px',
                        height: '15px',
                        padding: '0 2px',
                        border: '2px solid #FFFFFF',
                        lineHeight: 1,
                      }}
                    >
                      {item.badge}
                    </span>
                  )}
                </div>

                <span
                  className="text-truncate text-center w-100"
                  style={{
                    fontSize: '0.64rem',
                    fontWeight: active ? 700 : 500,
                    letterSpacing: '-0.2px',
                    lineHeight: 1.1,
                    marginTop: '3px',
                    color: active ? '#E90064' : '#64748B',
                  }}
                >
                  {item.label}
                </span>

                {/* Subtle active indicator dot */}
                {active && (
                  <div
                    className="rounded-pill position-absolute"
                    style={{
                      bottom: '4px',
                      width: '12px',
                      height: '2px',
                      backgroundColor: '#E90064',
                    }}
                  />
                )}
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
};

export default MobileBottomBar;
