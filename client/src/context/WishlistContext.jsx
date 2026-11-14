import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';

const WishlistContext = createContext(null);

export const WishlistProvider = ({ children }) => {
  const { user } = useAuth();

  const [wishlistItems, setWishlistItems] = useState(() => {
    try {
      const token = localStorage.getItem('shopmart_token');
      if (!token) return [];
      const saved = localStorage.getItem('shopmart_wishlist');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Clear wishlist if user is not logged in
  useEffect(() => {
    if (!user) {
      setWishlistItems([]);
      try {
        localStorage.removeItem('shopmart_wishlist');
      } catch (e) {}
    }
  }, [user]);

  // Persist only when user is logged in
  useEffect(() => {
    if (user) {
      try {
        localStorage.setItem('shopmart_wishlist', JSON.stringify(wishlistItems));
      } catch (err) {
        console.error('Failed to save wishlist', err);
      }
    }
  }, [wishlistItems, user]);

  const toggleWishlist = (product) => {
    if (!user || !product) return false;
    setWishlistItems((prev) => {
      const exists = prev.some((item) => item._id === product._id);
      if (exists) {
        return prev.filter((item) => item._id !== product._id);
      } else {
        return [...prev, product];
      }
    });
    return true;
  };

  const isInWishlist = (productId) => {
    if (!user) return false;
    return wishlistItems.some((item) => item._id === productId);
  };

  const removeFromWishlist = (productId) => {
    if (!user) return;
    setWishlistItems((prev) => prev.filter((item) => item._id !== productId));
  };

  return (
    <WishlistContext.Provider
      value={{
        wishlistItems: user ? wishlistItems : [],
        wishlistCount: user ? wishlistItems.length : 0,
        toggleWishlist,
        isInWishlist,
        removeFromWishlist,
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
};

export const useWishlist = () => {
  const context = useContext(WishlistContext);
  if (!context) {
    return {
      wishlistItems: [],
      wishlistCount: 0,
      toggleWishlist: () => false,
      isInWishlist: () => false,
      removeFromWishlist: () => {},
    };
  }
  return context;
};
