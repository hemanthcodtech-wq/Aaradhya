import React, { createContext, useContext, useState, useEffect } from 'react';
import axiosClient from '../api/axiosClient';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [vendor, setVendor] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem('shopmart_token') || null);
  const [loading, setLoading] = useState(true);

  // Initialize or fetch current user if token exists
  useEffect(() => {
    const initializeAuth = async () => {
      const storedToken = localStorage.getItem('shopmart_token');
      if (storedToken) {
        try {
          const res = await axiosClient.get('/auth/me');
          if (res.success && res.data) {
            setUser(res.data.user);
            setVendor(res.data.vendor);
          }
        } catch (err) {
          console.warn('Session expired or token invalid. Clearing local session.');
          localStorage.removeItem('shopmart_token');
          setToken(null);
          setUser(null);
          setVendor(null);
        }
      } else {
        // No stored token: User is a guest (unauthenticated)
        setUser(null);
        setVendor(null);
      }
      setLoading(false);
    };

    initializeAuth();
  }, []);

  const login = async (email, password) => {
    const res = await axiosClient.post('/auth/login', { email, password });
    if (res.success && res.data) {
      localStorage.setItem('shopmart_token', res.data.token);
      setToken(res.data.token);
      setUser(res.data.user);
      setVendor(res.data.vendor);
      return res.data;
    }
  };

  const register = async (payload) => {
    const res = await axiosClient.post('/auth/register', payload);
    if (res.success && res.data) {
      localStorage.setItem('shopmart_token', res.data.token);
      setToken(res.data.token);
      setUser(res.data.user);
      setVendor(res.data.vendor);
      return res.data;
    }
  };

  const logout = () => {
    localStorage.removeItem('shopmart_token');
    setToken(null);
    setUser(null);
    setVendor(null);
  };

  // Quick switch role for testing across all 4 applications
  const switchDemoRole = async (targetRole) => {
    setLoading(true);
    let credentials = { email: 'customer@example.com', password: 'customer123' };

    if (targetRole === 'vendor') {
      credentials = { email: 'vendor@technova.com', password: 'vendor123' };
    } else if (targetRole === 'store_manager' || targetRole === 'pos') {
      credentials = { email: 'pos@shopmart.com', password: 'pos123' };
    } else if (targetRole === 'super_admin' || targetRole === 'admin') {
      credentials = { email: 'admin@shopmart.com', password: 'admin123' };
    } else if (targetRole === 'staff') {
      credentials = { email: 'staff@shopmart.com', password: 'staff123' };
    }

    try {
      await login(credentials.email, credentials.password);
    } catch (err) {
      console.error('Failed to switch demo role:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        vendor,
        token,
        loading,
        role: user?.role || 'guest',
        isAuthenticated: !!user,
        login,
        register,
        logout,
        setUser,
        switchDemoRole,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    return {
      user: null,
      vendor: null,
      token: null,
      loading: false,
      role: 'guest',
      isAuthenticated: false,
      login: async () => {},
      register: async () => {},
      logout: () => {},
      setUser: () => {},
      switchDemoRole: () => {},
    };
  }
  return context;
};

