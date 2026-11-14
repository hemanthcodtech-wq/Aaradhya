import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';

const CartContext = createContext(null);

export const CartProvider = ({ children }) => {
  const { user } = useAuth();

  const [cartItems, setCartItems] = useState(() => {
    try {
      const token = localStorage.getItem('shopmart_token');
      if (!token) return [];
      const saved = localStorage.getItem('shopmart_cart');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [coupon, setCoupon] = useState(null);
  const [deliveryPincode, setDeliveryPincode] = useState('201309');
  const [deliverySpeed, setDeliverySpeed] = useState('standard'); // 'standard' | 'express'

  // If user is not logged in, cart must be empty and cleared from storage
  useEffect(() => {
    if (!user) {
      setCartItems([]);
      setCoupon(null);
      try {
        localStorage.removeItem('shopmart_cart');
      } catch (e) {}
    }
  }, [user]);

  // Persist only when user is authenticated
  useEffect(() => {
    if (user) {
      try {
        localStorage.setItem('shopmart_cart', JSON.stringify(cartItems));
      } catch (err) {
        console.error('Failed to save cart to localStorage', err);
      }
    }
  }, [cartItems, user]);

  const addToCart = (product, quantity = 1, variant = null) => {
    if (!user || !product) return false;
    setCartItems((prevItems) => {
      const variantId = variant?.id || null;
      const existingIndex = prevItems.findIndex(
        (item) => (item.productId === product._id || item.product?._id === product._id) && item.variantId === variantId
      );

      const unitPrice = Number(variant?.price || product.price) || 0;
      const unitMrp = Number(variant?.mrp || product.mrp) || unitPrice;
      const itemImage = variant?.image || (product.images && product.images[0]) || product.image || '';
      const itemSku = variant?.sku || product.sku || '';
      const maxStock = (product.stock !== undefined && product.stock !== null && Number(product.stock) > 0) ? Number(product.stock) : 99;
      const addQty = Math.max(1, Math.min(Number(quantity) || 1, maxStock));

      if (existingIndex > -1) {
        const updated = [...prevItems];
        const newQty = Math.min(updated[existingIndex].quantity + addQty, maxStock);
        updated[existingIndex] = {
          ...updated[existingIndex],
          quantity: newQty,
        };
        return updated;
      } else {
        return [
          ...prevItems,
          {
            product,
            productId: product._id,
            variantId,
            variantName: variant?.name || '',
            name: product.name,
            price: unitPrice,
            mrp: unitMrp,
            sku: itemSku,
            image: itemImage,
            vendor: product.vendor,
            storeCode: product.storeCode,
            storeName: product.storeName,
            quantity: addQty,
          },
        ];
      }
    });
    return true;
  };

  const updateQuantity = (productId, newQty, variantId = null) => {
    if (!user) return;
    if (newQty <= 0) {
      removeFromCart(productId, variantId);
      return;
    }
    setCartItems((prev) =>
      prev.map((item) => {
        if (item.product._id === productId && item.variantId === variantId) {
          const maxStock = item.product.stock || 99;
          return { ...item, quantity: Math.min(newQty, maxStock) };
        }
        return item;
      })
    );
  };

  const removeFromCart = (productId, variantId = null) => {
    if (!user) return;
    setCartItems((prev) =>
      prev.filter(
        (item) => !(item.product._id === productId && item.variantId === variantId)
      )
    );
  };

  const clearCart = () => {
    setCartItems([]);
    setCoupon(null);
    try {
      localStorage.removeItem('shopmart_cart');
    } catch (e) {}
  };

  const effectiveCartItems = user ? cartItems : [];

  // Calculations
  const subtotal = effectiveCartItems.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const taxAmount = Math.round(subtotal * 0.18 * 100) / 100; // 18% GST

  // Shipping
  let shippingFee = subtotal >= 999 || effectiveCartItems.length === 0 ? 0 : 99;
  if (deliverySpeed === 'express' && effectiveCartItems.length > 0) {
    shippingFee += 99;
  }

  // Coupon discount
  let discountAmount = 0;
  if (coupon && subtotal >= (coupon.minPurchaseAmount || 0)) {
    if (coupon.discountType === 'percentage') {
      discountAmount = (subtotal * coupon.discountValue) / 100;
      if (coupon.maxDiscountAmount) {
        discountAmount = Math.min(discountAmount, coupon.maxDiscountAmount);
      }
    } else {
      discountAmount = coupon.discountValue;
    }
    discountAmount = Math.round(discountAmount * 100) / 100;
  }

  const totalAmount = Math.max(0, Math.round((subtotal + taxAmount + shippingFee - discountAmount) * 100) / 100);
  const totalItemCount = user ? effectiveCartItems.reduce((acc, item) => acc + item.quantity, 0) : 0;

  const applyCoupon = (code) => {
    if (!user) return { success: false, message: 'Please sign in first' };
    const uppercase = code.trim().toUpperCase();
    if (uppercase === 'WELCOME10') {
      setCoupon({
        code: 'WELCOME10',
        description: '10% Instant Off on First Order',
        discountType: 'percentage',
        discountValue: 10,
        minPurchaseAmount: 999,
        maxDiscountAmount: 500,
      });
      return { success: true, message: 'Coupon WELCOME10 applied!' };
    } else if (uppercase === 'FESTIVE20') {
      if (subtotal < 2999) {
        return { success: false, message: 'Minimum cart value of ₹2,999 required for FESTIVE20' };
      }
      setCoupon({
        code: 'FESTIVE20',
        description: '20% Mega Festive Off',
        discountType: 'percentage',
        discountValue: 20,
        minPurchaseAmount: 2999,
        maxDiscountAmount: 1500,
      });
      return { success: true, message: 'Coupon FESTIVE20 applied!' };
    } else {
      return { success: false, message: 'Invalid or expired coupon code' };
    }
  };

  const removeCoupon = () => {
    setCoupon(null);
  };

  return (
    <CartContext.Provider
      value={{
        cartItems: effectiveCartItems,
        totalItemCount,
        subtotal,
        taxAmount,
        shippingFee,
        discountAmount,
        totalAmount,
        coupon,
        deliveryPincode,
        deliverySpeed,
        setDeliveryPincode,
        setDeliverySpeed,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        applyCoupon,
        removeCoupon,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    return {
      cartItems: [],
      totalItemCount: 0,
      subtotal: 0,
      taxAmount: 0,
      shippingFee: 0,
      discountAmount: 0,
      totalAmount: 0,
      coupon: null,
      deliveryPincode: '201309',
      deliverySpeed: 'standard',
      setDeliveryPincode: () => {},
      setDeliverySpeed: () => {},
      addToCart: () => false,
      updateQuantity: () => {},
      removeFromCart: () => {},
      clearCart: () => {},
      applyCoupon: () => ({ success: false, message: 'Cart not initialized' }),
      removeCoupon: () => {},
    };
  }
  return context;
};
