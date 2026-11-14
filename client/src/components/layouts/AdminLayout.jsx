import React, { useState, useEffect, Suspense } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  BarChart3,
  ShoppingCart,
  CreditCard,
  Wallet,
  Package,
  Layers,
  Tag,
  Image as ImageIcon,
  TicketPercent,
  Users,
  FileSpreadsheet,
  Bell,
  Settings,
  ClipboardList,
  ExternalLink,
  LogOut,
  Menu,
  X,
  ChevronLeft,
  ChevronRight,
  Grid,
} from 'lucide-react';
import { FaGem, FaScroll } from 'react-icons/fa6';
import AnimatedFaIcon from '../common/AnimatedFaIcon';
import { useAuth } from '../../context/AuthContext';

const AdminLayout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  // Desktop width state: false = 270px, true = 76px
  const [collapsed, setCollapsed] = useState(false);
  // Mobile off-canvas drawer state
  const [mobileOpen, setMobileOpen] = useState(false);

  // Close mobile drawer on route navigation
  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  // Prevent background body scrolling when mobile off-canvas drawer is active
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

  // The 4 Navigation Groups
  const navigationGroups = [
    {
      groupTitle: 'OVERVIEW',
      items: [
        { label: 'Dashboard', path: '/admin', icon: LayoutDashboard },
        { label: 'Store Analytics', path: '/admin/store-analytics', icon: BarChart3 },
      ],
    },
    {
      groupTitle: 'BUSINESS MANAGEMENT',
      items: [
        { label: 'All Orders', path: '/admin/orders', icon: ShoppingCart },
        { label: 'Transactions & Payments', path: '/admin/transactions', icon: CreditCard },
        { label: 'Store Wallets & Payouts', path: '/admin/wallets', icon: Wallet },
        { label: 'Products', path: '/admin/products', icon: Package, badge: 'VIEW ONLY' },
        { label: 'Inventory', path: '/admin/inventory', icon: Layers, badge: 'VIEW ONLY' },
        { label: 'Categories', path: '/admin/categories', icon: Tag },
      ],
    },
    {
      groupTitle: 'WEBSITE MANAGEMENT',
      items: [
        { label: 'Banners & Gallery', path: '/admin/banners', icon: ImageIcon },
        { label: 'Promo Codes & Offers', path: '/admin/promotions', icon: TicketPercent },
        { label: 'Customers', path: '/admin/customers', icon: Users },
      ],
    },
    {
      groupTitle: 'SYSTEM & REPORTS',
      items: [
        { label: 'Reports & Analytics', path: '/admin/reports', icon: FileSpreadsheet },
        { label: 'Notifications', path: '/admin/notifications', icon: Bell, badgeCount: 3 },
        { label: 'Settings', path: '/admin/settings', icon: Settings },
        { label: 'Audit Logs', path: '/admin/audit-logs', icon: ClipboardList },
      ],
    },
  ];

  // Active Title for Breadcrumb
  const allItems = navigationGroups.flatMap((g) => g.items);
  const currentItem = allItems.find(
    (item) => location.pathname === item.path || (item.path !== '/admin' && location.pathname.startsWith(item.path))
  );
  const currentTitle = currentItem ? currentItem.label : 'Super Admin';

  const handleSignOut = () => {
    if (window.confirm('Are you sure you want to sign out of the Aaradhya Super Admin panel?')) {
      logout();
      navigate('/admin/login');
    }
  };

  // Reusable Sidebar Content Renderer (Strictly Single Column, Pure White, Light Theme)
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
        {/* 1. Header: Logo, Brand & Collapse Button */}
        <div
          className="d-flex align-items-center justify-content-between px-3 border-bottom flex-shrink-0"
          style={{ height: '64px', borderColor: '#EAECF0' }}
        >
          <Link
            to="/admin"
            className="d-flex align-items-center gap-2.5 text-decoration-none overflow-hidden"
            title="Aaradhya Super Admin"
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
              <div className="overflow-hidden">
                <div
                  className="fw-bold text-truncate"
                  style={{
                    color: '#17233B',
                    fontSize: '15px',
                    letterSpacing: '0.04em',
                    lineHeight: 1.2,
                  }}
                >
                  AARADHYA
                </div>
                <div
                  className="text-truncate fw-bold"
                  style={{
                    fontSize: '10px',
                    color: '#E90064',
                    letterSpacing: '0.08em',
                    lineHeight: 1,
                  }}
                >
                  SUPER ADMIN
                </div>
              </div>
            )}
          </Link>

          {/* Desktop Collapse / Expand Toggle Button */}
          {!isDrawer && (
            <button
              type="button"
              className="btn btn-sm d-none d-lg-inline-flex align-items-center justify-content-center p-1 border rounded-2"
              style={{
                backgroundColor: '#FAF8FA',
                borderColor: '#EAECF0',
                color: '#667085',
                width: '28px',
                height: '28px',
              }}
              onClick={() => setCollapsed(!collapsed)}
              title={collapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
              aria-label={collapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
            >
              {collapsed ? <ChevronRight size={15} /> : <ChevronLeft size={15} />}
            </button>
          )}

          {/* Mobile Drawer Close Button */}
          {isDrawer && (
            <button
              type="button"
              className="btn btn-sm p-1 border-0 text-muted"
              onClick={() => setMobileOpen(false)}
              aria-label="Close Sidebar"
            >
              <X size={20} />
            </button>
          )}
        </div>

        {/* 2. Main Navigation Area (Strictly ONE vertical column with slim vertical scroll) */}
        <div
          className="flex-grow-1 custom-scrollbar px-3 py-3"
          style={{
            overflowY: 'auto',
            overflowX: 'hidden',
            display: 'flex',
            flexDirection: 'column',
            flexWrap: 'nowrap',
            width: '100%',
          }}
        >
          <div className="admin-nav-container">
            {navigationGroups.map((group, gIdx) => (
              <div key={gIdx} className="admin-nav-group">
                {/* Group Section Header */}
                {!isCompact && (
                  <div className="admin-group-label" style={{ marginTop: gIdx === 0 ? '0px' : '10px' }}>
                    {group.groupTitle}
                  </div>
                )}

                {/* Vertical Column Menu Items */}
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    flexWrap: 'nowrap',
                    width: '100%',
                    gap: '2px',
                  }}
                >
                  {group.items.map((item, idx) => {
                    const Icon = item.icon;
                    const isActive =
                      location.pathname === item.path ||
                      (item.path !== '/admin' && location.pathname.startsWith(item.path));

                    return (
                      <Link
                        key={idx}
                        to={item.path}
                        className={`admin-nav-item ${isActive ? 'active' : ''} ${
                          isCompact ? 'justify-content-center px-0' : ''
                        }`}
                        title={isCompact ? item.label : undefined}
                      >
                        <div
                          className={`d-flex align-items-center gap-2.5 overflow-hidden ${
                            isCompact ? 'justify-content-center w-100' : ''
                          }`}
                        >
                          <Icon size={18} className="admin-nav-icon" />
                          {!isCompact && <span className="text-truncate">{item.label}</span>}
                        </div>

                        {!isCompact && (
                          <div className="d-flex align-items-center gap-1.5 ms-2 flex-shrink-0">
                            {item.badge && (
                              <span className="admin-view-only-badge">{item.badge}</span>
                            )}
                            {item.badgeCount && (
                              <span className="admin-count-badge">{item.badgeCount}</span>
                            )}
                          </div>
                        )}
                      </Link>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 3. Anchored Bottom Section: Independent Stores & Footer Actions */}
        <div
          className="border-top p-3 flex-shrink-0"
          style={{ borderColor: '#EAECF0', backgroundColor: '#FFFFFF' }}
        >
          {/* Independent Stores Identity Indicators */}
          {!isCompact ? (
            <div className="mb-3">
              <div
                className="fw-semibold text-uppercase mb-2"
                style={{ fontSize: '11px', color: '#98A2B3', letterSpacing: '0.06em' }}
              >
                INDEPENDENT STORES
              </div>
              <div className="d-flex flex-column gap-1.5">
                <Link
                  to="/silks/admin"
                  className="admin-store-card-silks"
                  title="Aaradhya Silks Store Console"
                >
                  <div className="d-flex align-items-center gap-2 overflow-hidden">
                    <AnimatedFaIcon icon={FaGem} size={12} color="#E90064" animation="pulse" />
                    <span
                      className="text-truncate fw-semibold"
                      style={{ fontSize: '13px', color: '#17233B' }}
                    >
                      Aaradhya Silks
                    </span>
                  </div>
                  <span
                    className="badge rounded-pill text-white fw-bold"
                    style={{ backgroundColor: '#E90064', fontSize: '10px', padding: '3px 7px' }}
                  >
                    AS
                  </span>
                </Link>

                <Link
                  to="/fabrics/admin"
                  className="admin-store-card-fabrics"
                  title="Aaradhya Fabrics Store Console"
                >
                  <div className="d-flex align-items-center gap-2 overflow-hidden">
                    <AnimatedFaIcon icon={FaScroll} size={12} color="#087CE5" animation="float" />
                    <span
                      className="text-truncate fw-semibold"
                      style={{ fontSize: '13px', color: '#17233B' }}
                    >
                      Aaradhya Fabrics
                    </span>
                  </div>
                  <span
                    className="badge rounded-pill text-white fw-bold"
                    style={{ backgroundColor: '#087CE5', fontSize: '10px', padding: '3px 7px' }}
                  >
                    AF
                  </span>
                </Link>
              </div>
            </div>
          ) : (
            <div className="d-flex flex-column gap-1.5 mb-2 align-items-center">
              <Link
                to="/silks/admin"
                className="badge rounded-circle d-flex align-items-center justify-content-center text-white"
                style={{ width: '32px', height: '32px', backgroundColor: '#E90064' }}
                title="Aaradhya Silks (AS)"
              >
                AS
              </Link>
              <Link
                to="/fabrics/admin"
                className="badge rounded-circle d-flex align-items-center justify-content-center text-white"
                style={{ width: '32px', height: '32px', backgroundColor: '#087CE5' }}
                title="Aaradhya Fabrics (AF)"
              >
                AF
              </Link>
            </div>
          )}

          {/* Action Footer: Storefront & Sign Out */}
          <div
            className="border-top pt-2 d-flex flex-column gap-1"
            style={{ borderColor: '#EAECF0' }}
          >
            <Link
              to="/"
              target="_blank"
              rel="noopener noreferrer"
              className={`admin-footer-btn storefront-btn ${isCompact ? 'justify-content-center px-0' : ''}`}
              title="View Customer Storefront"
            >
              <ExternalLink size={16} className="flex-shrink-0 text-muted" />
              {!isCompact && <span>View Storefront</span>}
            </Link>

            <button
              type="button"
              className={`admin-footer-btn signout-btn ${isCompact ? 'justify-content-center px-0' : ''}`}
              onClick={handleSignOut}
              title="Sign Out"
            >
              <LogOut size={16} className="flex-shrink-0" />
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

      {/* 2. Mobile / Tablet Off-Canvas Drawer (< 992px) */}
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

      {/* 3. Main Viewport & Layout */}
      <div className={`admin-main-viewport ${collapsed ? 'collapsed' : ''}`}>
        {/* Top Header Navbar */}
        <header
          className="bg-white border-bottom px-3 px-md-4 py-2.5 d-flex align-items-center justify-content-between sticky-top shadow-2xs z-3"
          style={{ borderColor: '#EAECF0', height: '64px' }}
        >
          <div className="d-flex align-items-center gap-2.5">
            {/* Mobile Menu Toggle Button */}
            <button
              type="button"
              className="btn btn-light d-lg-none p-1.5 rounded-2 border"
              style={{ borderColor: '#EAECF0' }}
              onClick={() => setMobileOpen(true)}
              aria-label="Open Sidebar Menu"
            >
              <Menu size={18} />
            </button>

            {/* Breadcrumb Navigation Indicator */}
            <div className="d-flex align-items-center gap-2">
              <span
                className="badge rounded-pill fw-bold text-uppercase d-none d-sm-inline-block"
                style={{
                  backgroundColor: '#FFF0F5',
                  color: '#E90064',
                  fontSize: '0.64rem',
                  border: '1px solid #FFD6E5',
                  letterSpacing: '0.04em',
                }}
              >
                CENTRAL HUB
              </span>
              <span className="text-muted d-none d-sm-inline" style={{ fontSize: '0.8rem' }}>
                /
              </span>
              <span className="text-dark fw-bold" style={{ fontSize: '0.88rem' }}>
                {currentTitle}
              </span>
            </div>
          </div>

          {/* Right Header Status Badges & Administrator Avatar */}
          <div className="d-flex align-items-center gap-2.5">
            {/* MongoDB Atlas Live Indicator */}
            <div
              className="d-none d-md-flex align-items-center gap-1.5 px-2.5 py-1 rounded-pill border small"
              style={{ backgroundColor: '#F8FAFC', borderColor: '#EAECF0', fontSize: '0.72rem' }}
            >
              <span
                className="rounded-circle d-inline-block"
                style={{
                  width: '7px',
                  height: '7px',
                  backgroundColor: '#16A34A',
                  boxShadow: '0 0 0 2px rgba(22, 163, 74, 0.2)',
                }}
              />
              <span className="text-secondary fw-medium">MongoDB Atlas Active</span>
            </div>

            {/* Store Quick Switch Badges */}
            <div className="d-none d-sm-flex align-items-center gap-1.5">
              <Link
                to="/silks/admin"
                className="badge rounded-pill text-decoration-none py-1.5 px-2.5 fw-semibold border"
                style={{
                  backgroundColor: '#FFF0F5',
                  color: '#E90064',
                  borderColor: '#FCE7F1',
                  fontSize: '0.7rem',
                }}
                title="Aaradhya Silks Store Console"
              >
                Silks (AS)
              </Link>
              <Link
                to="/fabrics/admin"
                className="badge rounded-pill text-decoration-none py-1.5 px-2.5 fw-semibold border"
                style={{
                  backgroundColor: '#EFF8FF',
                  color: '#087CE5',
                  borderColor: '#D1E9FF',
                  fontSize: '0.7rem',
                }}
                title="Aaradhya Fabrics Store Console"
              >
                Fabrics (AF)
              </Link>
            </div>

            {/* Notifications Button */}
            <Link
              to="/admin/notifications"
              className="btn btn-light rounded-circle p-1.5 position-relative text-dark border-0"
              style={{ width: '34px', height: '34px', backgroundColor: '#F8F6F8' }}
              title="Notifications"
            >
              <Bell size={16} />
              <span
                className="position-absolute top-0 end-0 translate-middle badge rounded-circle bg-danger"
                style={{ width: '8px', height: '8px', padding: 0 }}
              />
            </Link>

            {/* User Profile Avatar Chip */}
            <div className="d-flex align-items-center gap-2 ps-2 border-start" style={{ borderColor: '#EAECF0' }}>
              <div
                className="rounded-circle d-flex align-items-center justify-content-center text-white fw-bold shadow-2xs"
                style={{ width: '32px', height: '32px', backgroundColor: '#E90064', fontSize: '0.8rem' }}
              >
                {user?.name?.[0]?.toUpperCase() || 'A'}
              </div>
              <div className="d-none d-md-block text-start leading-tight">
                <div className="fw-bold small text-dark" style={{ fontSize: '0.78rem', lineHeight: 1.15 }}>
                  {user?.name || 'Super Admin'}
                </div>
                <div className="text-muted" style={{ fontSize: '0.64rem' }}>
                  Central Authority
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
                  <div className="spinner-border spinner-border-sm mb-2" style={{ color: '#E90064' }} role="status" />
                  <div className="text-muted small fw-semibold" style={{ fontSize: '0.78rem' }}>
                    Loading console module...
                  </div>
                </div>
              }
            >
              <Outlet />
            </Suspense>
          </div>
        </main>
      </div>

      {/* 4. Responsive Mobile Bottom Navigation Bar (< 992px) */}
      <nav className="admin-mobile-bottom-bar d-lg-none">
        <Link
          to="/admin"
          className={`admin-mobile-nav-btn ${location.pathname === '/admin' ? 'active' : ''}`}
        >
          <LayoutDashboard size={19} />
          <span>Dashboard</span>
        </Link>

        <Link
          to="/admin/orders"
          className={`admin-mobile-nav-btn ${location.pathname.startsWith('/admin/orders') ? 'active' : ''}`}
        >
          <ShoppingCart size={19} />
          <span>Orders</span>
        </Link>

        <Link
          to="/admin/store-analytics"
          className={`admin-mobile-nav-btn ${location.pathname.startsWith('/admin/store-analytics') ? 'active' : ''}`}
        >
          <BarChart3 size={19} />
          <span>Analytics</span>
        </Link>

        <Link
          to="/admin/wallets"
          className={`admin-mobile-nav-btn ${location.pathname.startsWith('/admin/wallets') ? 'active' : ''}`}
        >
          <Wallet size={19} />
          <span>Wallets</span>
        </Link>

        <button
          type="button"
          className="admin-mobile-nav-btn"
          onClick={() => setMobileOpen(true)}
          aria-label="Open Full Menu"
        >
          <Grid size={19} />
          <span>More (15)</span>
        </button>
      </nav>
    </div>
  );
};

export default AdminLayout;
