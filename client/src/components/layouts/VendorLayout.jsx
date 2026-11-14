import React from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Boxes,
  Truck,
  DollarSign,
  Settings,
  Store,
  LogOut,
  ExternalLink,
  ShieldCheck,
  FileText,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const VendorLayout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, vendor, logout } = useAuth();

  const navItems = [
    { label: 'Dashboard', path: '/vendor', icon: LayoutDashboard },
    { label: 'Products', path: '/vendor/products', icon: Package },
    { label: 'Orders', path: '/vendor/orders', icon: ShoppingCart },
    { label: 'Inventory', path: '/vendor/inventory', icon: Boxes },
    { label: 'Shipments', path: '/vendor/orders', icon: Truck },
    { label: 'Earnings', path: '/vendor/payouts', icon: DollarSign },
    { label: 'Payouts', path: '/vendor/payouts', icon: FileText },
    { label: 'Reports', path: '/vendor', icon: FileText },
    { label: 'Settings', path: '/vendor/settings', icon: Settings },
  ];

  return (
    <div className="d-flex min-vh-100 bg-light">
      {/* Dark Navy Sidebar matching reference mockup */}
      <aside
        className="d-flex flex-column flex-shrink-0 p-3 dashboard-sidebar shadow"
        style={{ width: '250px', position: 'sticky', top: 0, height: '100vh', zIndex: 100, backgroundColor: '#0C1E36' }}
      >
        {/* Brand */}
        <Link to="/" className="d-flex align-items-center gap-2 text-decoration-none mb-4 px-2 text-white">
          <div
            className="rounded-3 d-flex align-items-center justify-content-center text-white"
            style={{ width: '36px', height: '36px', backgroundColor: '#1D4ED8' }}
          >
            <Store size={20} />
          </div>
          <div>
            <div className="fw-bold fs-6 text-white" style={{ letterSpacing: '-0.3px' }}>ShopMart Vendor</div>
            <div className="text-secondary small" style={{ fontSize: '0.68rem', color: '#94A3B8' }}>Seller Portal</div>
          </div>
        </Link>

        {/* Nav Links */}
        <nav className="nav flex-column gap-1 mb-auto">
          {navItems.map((item, index) => {
            const Icon = item.icon;
            const active = location.pathname === item.path;
            return (
              <Link
                key={index}
                to={item.path}
                className={`nav-link d-flex align-items-center gap-2 py-2 px-3 small ${active ? 'active' : ''}`}
              >
                <Icon size={16} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Footer actions */}
        <div className="border-top border-secondary pt-3 d-flex flex-column gap-2" style={{ borderColor: 'rgba(255,255,255,0.1)' }}>
          <Link
            to={`/vendor/store/${vendor?.slug || 'technova-store'}`}
            target="_blank"
            className="btn btn-outline-light btn-sm d-flex align-items-center justify-content-center gap-1 small"
            style={{ fontSize: '0.78rem' }}
          >
            <span>Live Storefront</span> <ExternalLink size={12} />
          </Link>
          <Link to="/" className="btn btn-sm text-start text-light small" style={{ opacity: 0.8 }}>
            ← Storefront
          </Link>
          <button
            className="btn btn-sm text-danger text-start d-flex align-items-center gap-2 p-0 px-2"
            onClick={() => {
              logout();
              navigate('/');
            }}
          >
            <LogOut size={14} /> Sign Out
          </button>
        </div>
      </aside>

      {/* Main Vendor Content */}
      <main className="flex-grow-1 p-4 overflow-auto" style={{ maxHeight: '100vh', backgroundColor: '#F8FAFC' }}>
        <Outlet />
      </main>
    </div>
  );
};

export default VendorLayout;
