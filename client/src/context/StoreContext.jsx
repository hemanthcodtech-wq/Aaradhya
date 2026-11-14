import React, { createContext, useContext, useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from './AuthContext';

const StoreContext = createContext(null);

export const StoreProvider = ({ children }) => {
  const { user } = useAuth();
  const location = useLocation();

  // Detect store code from user account or URL
  const getInitialStore = () => {
    const path = location.pathname.toLowerCase();
    if (path.includes('fabrics')) return 'AF';
    if (path.includes('silks')) return 'AS';
    if (user?.storeCode) return user.storeCode.toUpperCase();
    if (user?.role === 'fabrics_admin') return 'AF';
    return 'AS';
  };

  const [activeStore, setActiveStore] = useState(getInitialStore);

  // Sync store with user role or URL changes
  useEffect(() => {
    const path = location.pathname.toLowerCase();
    if (path.includes('fabrics')) {
      setActiveStore('AF');
    } else if (path.includes('silks')) {
      setActiveStore('AS');
    } else if (user?.storeCode) {
      setActiveStore(user.storeCode.toUpperCase());
    } else if (user?.role === 'fabrics_admin') {
      setActiveStore('AF');
    }
  }, [location.pathname, user]);

  const validCode = (activeStore || 'AS').toUpperCase();
  const isSilks = validCode === 'AS';

  const storeInfo = {
    activeStore: validCode,
    storeCode: validCode,
    storeName: isSilks ? 'Aaradhya Silks' : 'Aaradhya Fabrics',
    storeSubtitle: isSilks ? 'Store AS • Pure Handloom Silks' : 'Store AF • Running Yardage & Textiles',
    productPrefix: isSilks ? 'AS' : 'AF',
    sampleProductId: isSilks ? 'AS-000001' : 'AF-000001',
    primaryColor: isSilks ? '#E90064' : '#087CE5',
    secondaryColor: isSilks ? '#087CE5' : '#E90064',
    badgeBg: isSilks ? '#FFF0F5' : '#EFF8FF',
    badgeText: isSilks ? '#E90064' : '#087CE5',
    badgeBorder: isSilks ? '#FCE7F1' : '#D1E9FF',
    tagline: isSilks ? 'Pure Handloom Silks & Sarees' : 'Running Yardage, Fabrics & Textiles',
    address: isSilks ? 'Plot 42, Handloom Galleria, Jubilee Hills, Hyderabad - 500033' : 'Textile Market Complex, KPHB Colony, Hyderabad - 500072',
    phone: isSilks ? '+91 98765 00002' : '+91 98765 00003',
    email: isSilks ? 'silks@aaradhya.com' : 'fabrics@aaradhya.com',
    gstin: isSilks ? '36AAACA1234F1Z5' : '36AAACB5678G2Z9',
    isSilks,
    canSwitchStore: user?.role === 'super_admin',
    switchStore: (code) => {
      if (user?.role === 'super_admin') {
        setActiveStore(code.toUpperCase());
      }
    },
    baseRoute: location.pathname.includes('/silks-admin')
      ? '/silks-admin'
      : location.pathname.includes('/fabrics-admin')
      ? '/fabrics-admin'
      : '/store-admin',
  };

  return <StoreContext.Provider value={storeInfo}>{children}</StoreContext.Provider>;
};

export const useStore = () => {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error('useStore must be used within a StoreProvider');
  }
  return context;
};

export default StoreContext;
