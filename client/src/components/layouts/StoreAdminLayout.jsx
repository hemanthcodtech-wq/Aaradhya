import React, { useState, useEffect, Suspense } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  BarChart3,
  Package,
  Tag,
  Layers,
  Barcode,
  ShoppingCart,
  Terminal,
  FileText,
  RotateCcw,
  Wallet,
  ArrowUpRight,
  CreditCard,
  Users,
  Bell,
  FileSpreadsheet,
  Settings,
  ExternalLink,
  LogOut,
  Menu,
  X,
  ChevronLeft,
  ChevronRight,
  Store,
  Grid,
} from 'lucide-react';
import { FaGem, FaScroll } from 'react-icons/fa6';
import AnimatedFaIcon from '../common/AnimatedFaIcon';
import { useAuth } from '../../context/AuthContext';
import { useStore } from '../../context/StoreContext';

const StoreAdminLayout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const store = useStore();

  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileOpen]);

  const base = store.baseRoute;

  // The 5 Specific Groups Defined in Master Prompt Section 6
  const navigationGroups = [
    {
      groupTitle: 'OVERVIEW',
      items: [
        { label: 'Dashboard', path: `${base}`, icon: LayoutDashboard },
        { label: 'Store Analytics', path: `${base}/analytics`, icon: BarChart3 },
      ],
    },
    {
      groupTitle: 'STORE MANAGEMENT',
      items: [
        { label: 'Products', path: `${base}/products`, icon: Package },
        { label: 'Categories', path: `${base}/categories`, icon: Tag },
        { label: 'Inventory', path: `${base}/inventory`, icon: Layers },
        { label: 'Barcode Management', path: `${base}/barcodes`, icon: Barcode },
      ],
    },
    {
      groupTitle: 'SALES & ORDERS',
      items: [
        { label: 'Online Orders', path: `${base}/orders`, icon: ShoppingCart },
        { label: 'Counter / POS', path: `${base}/pos`, icon: Terminal },
        { label: 'Sales & Invoices', path: `${base}/sales`, icon: FileText },
        { label: 'Returns & Exchanges', path: `${base}/returns`, icon: RotateCcw },
      ],
    },
    {
      groupTitle: 'FINANCE',
      items: [
        { label: 'My Wallet', path: `${base}/wallet`, icon: Wallet },
        { label: 'Payouts', path: `${base}/payouts`, icon: ArrowUpRight },
        { label: 'Transactions', path: `${base}/transactions`, icon: CreditCard },
      ],
    },
    {
      groupTitle: 'MANAGEMENT',
      items: [
        { label: 'Customers', path: `${base}/customers`, icon: Users },
        { label: 'Notifications', path: `${base}/notifications`, icon: Bell, badgeCount: 2 },
        { label: 'Reports', path: `${base}/reports`, icon: FileSpreadsheet },
        { label: 'Settings', path: `${base}/settings`, icon: Settings },
      ],
    },
  ];

  const allItems = navigationGroups.flatMap((g) => g.items);
  const currentItem = allItems.find(
    (item) => location.pathname === item.path || (item.path !== base && location.pathname.startsWith(item.path))
  );
  const currentTitle = currentItem ? currentItem.label : 'Store Admin';

  const handleSignOut = () => {
    if (window.confirm(`Sign out of ${store.storeName} admin console?`)) {
      logout();
      navigate('/admin/login');
    }
  };

  const renderSidebar = (isDrawer = false) => {
    const isCompact = !isDrawer && collapsed;

    return (
      <div
        className="d-flex flex-column h-100"
        style={{
          backgroundColor: '#FFFFFF',
          width: '100%',
          overflow: 'hidden',
          boxSizing: 'border-box',
        }}
      >
        {/* 1. Header: Logo, Store Name & Collapse Button */}
        <div
          className="d-flex align-items-center justify-content-between px-3 border-bottom flex-shrink-0"
          style={{ height: '64px', borderColor: '#EAECF0' }}
        >
          <Link
            to={base}
            className="d-flex align-items-center gap-2.5 text-decoration-none overflow-hidden"
            title={`${store.storeName} Console`}
          >
            <div
              className="rounded-2 p-1 d-flex align-items-center justify-content-center flex-shrink-0"
              style={{
                width: '36px',
                height: '36px',
                backgroundColor: '#FFFFFF',
                border: '1px solid #EAECF0',
                boxShadow: '0 1px 2px rgba(16, 24, 40, 0.05)',
              }}
            >
              <img
                src="/logo.jpeg"
                alt="Aaradhya Logo"
                style={{ width: '28px', height: '28px', objectFit: 'contain' }}
              />
            </div>

            {!isCompact && (
              <div className="d-flex flex-column overflow-hidden text-truncate">
                <span
                  className="fw-bolder text-truncate leading-tight"
                  style={{
                    color: '#17233B',
                    fontSize: '0.86rem',
                    letterSpacing: '0.04em',
                    lineHeight: 1.2,
                  }}
                >
                  {store.storeName.toUpperCase()}
                </span>
                <span
                  className="fw-bold text-uppercase"
                  style={{
                    color: store.primaryColor,
                    fontSize: '0.62rem',
                    letterSpacing: '0.08em',
                  }}
                >
                  STORE {store.storeCode} CONSOLE
                </span>
              </div>
            )}
          </Link>

          {!isDrawer && (
            <button
              type="button"
              className="btn btn-sm btn-light border rounded-2 p-1 d-none d-lg-flex align-items-center justify-content-center text-muted"
              style={{ width: '26px', height: '26px', borderColor: '#EAECF0' }}
              onClick={() => setCollapsed(!collapsed)}
              title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
              aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            >
              {collapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
            </button>
          )}

          {isDrawer && (
            <button
              type="button"
              className="btn btn-sm btn-light border rounded-2 p-1 d-flex align-items-center justify-content-center text-dark"
              style={{ width: '28px', height: '28px', borderColor: '#EAECF0' }}
              onClick={() => setMobileOpen(false)}
              aria-label="Close Drawer"
            >
              <X size={16} />
            </button>
          )}
        </div>

        {/* 2. Scrollable Navigation List (Single Column) */}
        <div className="flex-grow-1 overflow-y-auto px-2 py-3 custom-scrollbar">
          <nav className="d-flex flex-column gap-3">
            {navigationGroups.map((group, gIdx) => (
              <div key={gIdx} className="admin-nav-group">
                {!isCompact ? (
                  <div
                    className="px-2.5 mb-1.5 text-uppercase fw-bold"
                    style={{
                      fontSize: '0.66rem',
                      letterSpacing: '0.06em',
                      color: '#98A2B3',
                    }}
                  >
                    {group.groupTitle}
                  </div>
                ) : (
                  <div className="border-top my-2 mx-1" style={{ borderColor: '#F2F4F7' }} />
                )}

                <div className="d-flex flex-column gap-1">
                  {group.items.map((item, iIdx) => {
                    const IconComponent = item.icon;
                    const isActive =
                      item.path === base
                        ? location.pathname === base
                        : location.pathname === item.path || location.pathname.startsWith(`${item.path}/`);

                    return (
                      <Link
                        key={iIdx}
                        to={item.path}
                        className={`admin-nav-item ${isActive ? 'active' : ''} ${isCompact ? 'compact justify-content-center px-0' : ''}`}
                        style={
                          isActive
                            ? {
                                backgroundColor: store.badgeBg,
                                color: store.primaryColor,
                                borderColor: store.badgeBorder,
                                fontWeight: 600,
                              }
                            : {}
                        }
                        title={isCompact ? item.label : undefined}
                      >
                        <IconComponent
                          size={18}
                          className="flex-shrink-0"
                          style={{
                            color: isActive ? store.primaryColor : '#64748B',
                          }}
                        />

                        {!isCompact && (
                          <span className="flex-grow-1 text-truncate" style={{ fontSize: '0.82rem' }}>
                            {item.label}
                          </span>
                        )}

                        {!isCompact && item.badgeCount && (
                          <span
                            className="badge rounded-pill ms-auto flex-shrink-0"
                            style={{
                              backgroundColor: '#FEE2E2',
                              color: '#DC2626',
                              fontSize: '0.64rem',
                              padding: '2px 6px',
                            }}
                          >
                            {item.badgeCount}
                          </span>
                        )}
                      </Link>
                    );
                  })}
                </div>
              </div>
            ))}
          </nav>
        </div>

        {/* 3. Footer: Store Identity, Storefront Link, Sign Out */}
        <div className="p-2.5 border-top flex-shrink-0 bg-white" style={{ borderColor: '#EAECF0' }}>
          {/* Active Store Identity Chip */}
          {!isCompact && (
            <div
              className="p-2 rounded-2 mb-2 border d-flex align-items-center justify-content-between"
              style={{
                backgroundColor: store.badgeBg,
                borderColor: store.badgeBorder,
              }}
            >
              <div className="d-flex align-items-center gap-2 overflow-hidden">
                <div
                  className="rounded-circle d-flex align-items-center justify-content-center text-white flex-shrink-0"
                  style={{ width: '24px', height: '24px', backgroundColor: store.primaryColor }}
                >
                  <AnimatedFaIcon
                    icon={store.isSilks ? FaGem : FaScroll}
                    size={11}
                    color="#FFFFFF"
                    animation={store.isSilks ? 'pulse' : 'float'}
                  />
                </div>
                <div className="overflow-hidden">
                  <div className="fw-bold small text-truncate" style={{ fontSize: '0.74rem', color: '#17233B' }}>
                    {store.storeName}
                  </div>
                  <div className="text-muted text-truncate" style={{ fontSize: '0.62rem' }}>
                    Code: {store.storeCode} • Active
                  </div>
                </div>
              </div>
              <span
                className="badge rounded-pill text-white fw-bold"
                style={{ backgroundColor: store.primaryColor, fontSize: '0.62rem' }}
              >
                {store.storeCode}
              </span>
            </div>
          )}

          <div className="d-flex flex-column gap-1">
            <Link
              to="/"
              target="_blank"
              rel="noreferrer"
              className={`admin-footer-btn ${isCompact ? 'justify-content-center px-0' : ''}`}
              title="View Customer Storefront"
            >
              <ExternalLink size={15} className="flex-shrink-0 text-muted" />
              {!isCompact && <span>View Storefront</span>}
            </Link>

            <button
              type="button"
              className={`admin-footer-btn signout-btn ${isCompact ? 'justify-content-center px-0' : ''}`}
              onClick={handleSignOut}
              title="Sign Out"
            >
              <LogOut size={15} className="flex-shrink-0" />
              {!isCompact && <span>Sign Out</span>}
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="admin-layout-wrapper">
      {/* 1. Desktop Persistent Sidebar */}
      <aside className={`admin-sidebar d-none d-lg-flex ${collapsed ? 'collapsed' : ''}`}>
        {renderSidebar(false)}
      </aside>

      {/* 2. Mobile Off-Canvas Drawer */}
      {mobileOpen && (
        <div
          className="d-lg-none position-fixed top-0 start-0 w-100 h-100"
          style={{
            backgroundColor: 'rgba(15, 23, 42, 0.45)',
            backdropFilter: 'blur(4px)',
            zIndex: 1090,
          }}
          onClick={() => setMobileOpen(false)}
        >
          <div
            className="h-100 shadow-lg"
            style={{
              width: '275px',
              maxWidth: '85vw',
              backgroundColor: '#FFFFFF',
              borderRight: '1px solid #EAECF0',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {renderSidebar(true)}
          </div>
        </div>
      )}

      {/* 3. Main Viewport & Content Area */}
      <div className={`admin-main-viewport ${collapsed ? 'collapsed' : ''}`}>
        {/* Top Header Navbar */}
        <header
          className="bg-white border-bottom px-3 px-md-4 py-2.5 d-flex align-items-center justify-content-between sticky-top shadow-2xs z-3"
          style={{ borderColor: '#EAECF0', height: '64px' }}
        >
          <div className="d-flex align-items-center gap-2.5">
            <button
              type="button"
              className="btn btn-light d-lg-none p-1.5 rounded-2 border"
              style={{ borderColor: '#EAECF0' }}
              onClick={() => setMobileOpen(true)}
              aria-label="Open Sidebar Menu"
            >
              <Menu size={18} />
            </button>

            <div className="d-flex align-items-center gap-2">
              <span
                className="badge rounded-pill fw-bold text-uppercase d-none d-sm-inline-block"
                style={{
                  backgroundColor: store.badgeBg,
                  color: store.primaryColor,
                  fontSize: '0.64rem',
                  border: `1px solid ${store.badgeBorder}`,
                  letterSpacing: '0.04em',
                }}
              >
                {store.storeName.toUpperCase()}
              </span>
              <span className="text-muted d-none d-sm-inline" style={{ fontSize: '0.8rem' }}>
                /
              </span>
              <span className="text-dark fw-bold" style={{ fontSize: '0.88rem' }}>
                {currentTitle}
              </span>
            </div>
          </div>

          {/* Right Header: POS Launch Shortcut, Store Switcher (Super Admin), Profile */}
          <div className="d-flex align-items-center gap-2.5">
            {/* Quick POS Launch Button */}
            <Link
              to={`${base}/pos`}
              className="btn btn-sm text-white rounded-pill px-3 py-1.5 fw-semibold d-none d-sm-inline-flex align-items-center gap-1.5 shadow-2xs"
              style={{ backgroundColor: store.primaryColor, borderColor: store.primaryColor, fontSize: '0.76rem' }}
            >
              <Terminal size={14} />
              <span>Launch POS Counter</span>
            </Link>

            {/* Super Admin Store Switcher */}
            {store.canSwitchStore && (
              <div className="d-none d-md-flex align-items-center gap-1 bg-light p-1 rounded-pill border">
                <button
                  type="button"
                  className={`btn btn-sm rounded-pill py-0.5 px-2.5 fw-bold ${store.isSilks ? 'btn-white shadow-2xs text-danger' : 'text-muted border-0 bg-transparent'}`}
                  style={{ fontSize: '0.68rem' }}
                  onClick={() => store.switchStore('AS')}
                >
                  Silks (AS)
                </button>
                <button
                  type="button"
                  className={`btn btn-sm rounded-pill py-0.5 px-2.5 fw-bold ${!store.isSilks ? 'btn-white shadow-2xs text-primary' : 'text-muted border-0 bg-transparent'}`}
                  style={{ fontSize: '0.68rem' }}
                  onClick={() => store.switchStore('AF')}
                >
                  Fabrics (AF)
                </button>
              </div>
            )}

            {/* Notifications */}
            <Link
              to={`${base}/notifications`}
              className="btn btn-light rounded-circle p-1.5 position-relative text-dark border-0"
              style={{ width: '34px', height: '34px', backgroundColor: '#F8F6F8' }}
              title="Store Notifications"
            >
              <Bell size={16} />
              <span
                className="position-absolute top-0 end-0 translate-middle badge rounded-circle bg-danger"
                style={{ width: '8px', height: '8px', padding: 0 }}
              />
            </Link>

            {/* Admin Avatar Chip */}
            <div className="d-flex align-items-center gap-2 ps-2 border-start" style={{ borderColor: '#EAECF0' }}>
              <div
                className="rounded-circle d-flex align-items-center justify-content-center text-white fw-bold shadow-2xs"
                style={{ width: '32px', height: '32px', backgroundColor: store.primaryColor, fontSize: '0.8rem' }}
              >
                {user?.name?.[0]?.toUpperCase() || (store.isSilks ? 'S' : 'F')}
              </div>
              <div className="d-none d-md-block text-start leading-tight">
                <div className="fw-bold small text-dark" style={{ fontSize: '0.78rem', lineHeight: 1.15 }}>
                  {user?.name || `${store.storeName} Admin`}
                </div>
                <div className="text-muted" style={{ fontSize: '0.64rem' }}>
                  {store.storeCode} Authority
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content Viewport */}
        <main
          className="flex-grow-1 p-3 p-sm-4 p-xl-4 overflow-auto mb-5 mb-lg-0 pb-5 pb-lg-3"
          style={{
            backgroundColor: '#FAF8FA',
            minHeight: 'calc(100vh - 64px)',
          }}
        >
          <div className="container-fluid p-0 mb-4 mb-lg-0">
            <Suspense
              fallback={
                <div className="d-flex flex-column align-items-center justify-content-center p-5" style={{ minHeight: '360px' }}>
                  <div className="spinner-border spinner-border-sm mb-2" style={{ color: store.primaryColor }} role="status" />
                  <div className="text-muted small fw-semibold" style={{ fontSize: '0.78rem' }}>
                    Loading {store.storeName} console module...
                  </div>
                </div>
              }
            >
              <Outlet />
            </Suspense>
          </div>
        </main>
      </div>

      {/* 4. Responsive Mobile Bottom Bar */}
      <nav className="admin-mobile-bottom-bar d-lg-none">
        <Link
          to={base}
          className={`admin-mobile-nav-btn ${location.pathname === base ? 'active' : ''}`}
        >
          <LayoutDashboard size={19} />
          <span>Dashboard</span>
        </Link>

        <Link
          to={`${base}/orders`}
          className={`admin-mobile-nav-btn ${location.pathname.startsWith(`${base}/orders`) ? 'active' : ''}`}
        >
          <ShoppingCart size={19} />
          <span>Orders</span>
        </Link>

        <Link
          to={`${base}/pos`}
          className={`admin-mobile-nav-btn ${location.pathname.startsWith(`${base}/pos`) ? 'active' : ''}`}
        >
          <Terminal size={19} />
          <span>POS</span>
        </Link>

        <Link
          to={`${base}/inventory`}
          className={`admin-mobile-nav-btn ${location.pathname.startsWith(`${base}/inventory`) ? 'active' : ''}`}
        >
          <Layers size={19} />
          <span>Inventory</span>
        </Link>

        <button
          type="button"
          className="admin-mobile-nav-btn"
          onClick={() => setMobileOpen(true)}
          aria-label="Open Full Menu"
        >
          <Grid size={19} />
          <span>More (14)</span>
        </button>
      </nav>
    </div>
  );
};

export default StoreAdminLayout;
