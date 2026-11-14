import React, { useState, useEffect } from 'react';
import { Outlet, Link, useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import {
  Terminal,
  Receipt,
  Boxes,
  Barcode,
  Clock,
  Store,
  User,
  ExternalLink,
  Wifi,
} from 'lucide-react';
import { FaGem, FaScroll } from 'react-icons/fa6';
import AnimatedFaIcon from '../common/AnimatedFaIcon';
import { useAuth } from '../../context/AuthContext';

const PosLayout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user } = useAuth();
  const [time, setTime] = useState(new Date().toLocaleTimeString());

  // Current store: 'AS' (Silks) or 'AF' (Fabrics)
  const currentStore = (searchParams.get('store') || 'AS').toUpperCase();
  const isSilks = currentStore === 'AS';

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date().toLocaleTimeString()), 1000);
    return () => clearInterval(timer);
  }, []);

  const handleSwitchStore = (code) => {
    const params = new URLSearchParams(location.search);
    params.set('store', code);
    navigate(`${location.pathname}?${params.toString()}`);
  };

  const navItems = [
    { label: 'POS Terminal (Billing)', path: '/pos', icon: Terminal },
    { label: 'Bill History & Receipts', path: '/pos/bills', icon: Receipt },
    { label: 'Stock & Inventory', path: '/pos/inventory', icon: Boxes },
    { label: 'Barcode Sticker Printing', path: '/pos/barcodes', icon: Barcode },
  ];

  return (
    <div className="d-flex flex-column min-vh-100 bg-light">
      {/* Top Aaradhya POS Header matching Panel 5 in Mockup */}
      <header className="bg-white border-bottom px-3 py-2 d-flex justify-content-between align-items-center shadow-sm sticky-top z-3">
        <div className="d-flex align-items-center gap-2 gap-md-3">
          <Link to="/" className="d-flex align-items-center gap-2 text-decoration-none">
            <img
              src="/logo.jpeg"
              alt="Aaradhya Logo"
              style={{ width: '34px', height: '34px', objectFit: 'contain', borderRadius: '8px' }}
            />
            <div>
              <span className="fw-bolder fs-6" style={{ color: '#17233B', letterSpacing: '-0.3px' }}>
                AARADHYA <span style={{ color: '#E90064' }}>POS</span>
              </span>
            </div>
          </Link>

          {/* Store Switcher Tabs */}
          <div className="btn-group btn-group-sm bg-light p-1 rounded-pill border" role="group">
            <button
              type="button"
              className={`btn btn-sm rounded-pill px-2.5 py-1 fw-bold text-nowrap d-inline-flex align-items-center gap-1.5 ${
                isSilks ? 'text-white shadow-sm' : 'text-muted'
              }`}
              style={{
                backgroundColor: isSilks ? '#E90064' : 'transparent',
                borderColor: 'transparent',
                fontSize: '0.75rem',
              }}
              onClick={() => handleSwitchStore('AS')}
            >
              <AnimatedFaIcon icon={FaGem} size={11} color={isSilks ? '#FFFFFF' : '#E90064'} animation="pulse" />
              <span>Aaradhya Silks (Counter A)</span>
            </button>
            <button
              type="button"
              className={`btn btn-sm rounded-pill px-2.5 py-1 fw-bold text-nowrap d-inline-flex align-items-center gap-1.5 ${
                !isSilks ? 'text-white shadow-sm' : 'text-muted'
              }`}
              style={{
                backgroundColor: !isSilks ? '#087CE5' : 'transparent',
                borderColor: 'transparent',
                fontSize: '0.75rem',
              }}
              onClick={() => handleSwitchStore('AF')}
            >
              <AnimatedFaIcon icon={FaScroll} size={11} color={!isSilks ? '#FFFFFF' : '#087CE5'} animation="float" />
              <span>Aaradhya Fabrics (Counter B)</span>
            </button>
          </div>

          <span className="badge bg-success bg-opacity-10 text-success border border-success border-opacity-25 px-2 py-1 small d-none d-md-flex align-items-center gap-1">
            <span className="rounded-circle bg-success" style={{ width: '6px', height: '6px' }}></span> Realtime Sync
          </span>

          {/* Navigation links */}
          <nav className="d-none d-xl-flex gap-1 ms-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={`${item.path}?store=${currentStore}`}
                  className={`btn btn-sm d-flex align-items-center gap-1 rounded-pill px-3 ${
                    active ? 'text-white shadow-sm' : 'btn-light text-secondary'
                  }`}
                  style={
                    active
                      ? { backgroundColor: isSilks ? '#E90064' : '#087CE5', borderColor: isSilks ? '#E90064' : '#087CE5' }
                      : {}
                  }
                >
                  <Icon size={14} />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Right side controls */}
        <div className="d-flex align-items-center gap-2 gap-md-3 small">
          <div className="d-none d-md-flex align-items-center gap-1 text-muted">
            <Clock size={14} /> <span>{time}</span>
          </div>

          <div className="d-flex align-items-center gap-2 border-start ps-2 ps-md-3">
            <div className="rounded-circle bg-secondary text-white p-1">
              <User size={14} />
            </div>
            <div className="text-start">
              <div className="fw-bold text-dark" style={{ fontSize: '0.75rem' }}>
                {user?.name?.split(' ')[0] || (isSilks ? 'Pooja (Silks)' : 'Ramesh (Fabrics)')}
              </div>
              <div className="text-muted" style={{ fontSize: '0.65rem' }}>
                {isSilks ? 'Counter AS #01' : 'Counter AF #02'}
              </div>
            </div>
          </div>

          <Link
            to={isSilks ? '/silks/admin' : '/fabrics/admin'}
            className="btn btn-sm border rounded-pill px-2.5 py-1 text-muted d-none d-sm-inline-flex align-items-center gap-1"
            title="Store Admin Dashboard"
          >
            <Store size={13} />
            <span style={{ fontSize: '0.72rem' }}>{isSilks ? 'Silks Admin' : 'Fabrics Admin'}</span>
          </Link>

          <Link to="/" className="btn btn-light btn-sm border text-muted" title="Customer storefront">
            <ExternalLink size={14} />
          </Link>
        </div>
      </header>

      {/* Main POS Content */}
      <main className="flex-grow-1 overflow-hidden">
        <Outlet />
      </main>
    </div>
  );
};

export default PosLayout;