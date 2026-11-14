import React from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, ShieldCheck } from 'lucide-react';
import LoginBranding from './LoginBranding';

const AdminLoginLayout = ({
  portalType = 'super_admin',
  children,
}) => {
  return (
    <div
      className="min-vh-100 d-flex flex-column"
      style={{
        backgroundColor: '#FAF8FA',
        fontFamily: "'Plus Jakarta Sans', system-ui, -apple-system, sans-serif",
      }}
    >
      {/* 1. Mobile & Small Tablet Top Header (< 992px) */}
      <header className="d-lg-none bg-white border-bottom sticky-top shadow-2xs px-3 py-2.5 z-3">
        <div className="container-fluid p-0 d-flex align-items-center justify-content-between">
          <div className="d-flex align-items-center gap-2.5">
            <img
              src="/logo.jpeg"
              alt="Aaradhya"
              className="rounded-2 shadow-2xs"
              style={{ width: '38px', height: '38px', objectFit: 'contain' }}
            />
            <div>
              <div
                className="fw-bolder"
                style={{ color: '#E90064', fontSize: '1.05rem', lineHeight: 1.1, letterSpacing: '0.02em' }}
              >
                AARADHYA
              </div>
              <span className="text-muted fw-bold" style={{ fontSize: '0.58rem', letterSpacing: '0.18em' }}>
                ADMINISTRATION PORTAL
              </span>
            </div>
          </div>

          <a
            href="/"
            className="btn btn-outline-secondary btn-sm rounded-pill px-3 py-1 d-inline-flex align-items-center gap-1 text-decoration-none"
            style={{ fontSize: '0.78rem' }}
          >
            <span>Storefront</span>
            <span aria-hidden="true">&rarr;</span>
          </a>
        </div>
      </header>

      {/* 2. Tablet Reduced Editorial Hero Banner (768px <= width < 992px) */}
      <div
        className="d-none d-md-block d-lg-none border-bottom position-relative overflow-hidden"
        style={{
          backgroundColor: '#FFF0F5',
          backgroundImage: 'linear-gradient(135deg, #FFF0F5 0%, #FAF8FA 100%)',
        }}
      >
        <div className="container py-3 px-4">
          <div className="d-flex align-items-center justify-content-between">
            <div>
              <span
                className="badge rounded-pill fw-bold text-uppercase mb-1"
                style={{
                  backgroundColor: portalType === 'fabrics_admin' ? '#087CE5' : '#E90064',
                  color: '#FFFFFF',
                  fontSize: '0.65rem',
                  letterSpacing: '0.08em',
                  padding: '0.25rem 0.6rem',
                }}
              >
                {portalType === 'fabrics_admin'
                  ? 'Aaradhya Fabrics • Yardage'
                  : portalType === 'silks_admin'
                  ? 'Aaradhya Silks • Pure Handloom'
                  : 'Central Super Admin'}
              </span>
              <h2
                className="fw-bolder mb-0"
                style={{
                  color: '#17233B',
                  fontSize: '1.35rem',
                  letterSpacing: '-0.3px',
                  fontFamily: "'Playfair Display', Georgia, serif",
                }}
              >
                Manage your stores. <span style={{ color: '#E90064' }}>Grow your business.</span>
              </h2>
            </div>
            <div className="d-flex align-items-center gap-1.5 text-muted small fw-medium" style={{ fontSize: '0.74rem' }}>
              <ShieldCheck size={15} style={{ color: '#19B927' }} />
              <span>Multi-Store Enterprise RBAC</span>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Main Split-Screen Container */}
      <div className="d-flex flex-grow-1 w-100 position-relative">
        {/* LEFT SECTION (45% Width on Desktop >= 992px) */}
        <div
          className="d-none d-lg-flex flex-column p-0 position-relative"
          style={{
            flex: '0 0 45%',
            width: '45%',
            maxWidth: '45%',
            minHeight: '100vh',
            borderRight: '1px solid #F0E7ED',
            overflowY: 'auto',
          }}
        >
          <LoginBranding portalType={portalType} />
        </div>

        {/* RIGHT SECTION (55% Width on Desktop, 100% on Tablet & Mobile) */}
        <div
          className="d-flex flex-column justify-content-center align-items-center flex-grow-1 p-3 p-sm-4 p-md-5 position-relative"
          style={{
            flex: '0 0 55%',
            width: '100%',
            backgroundColor: '#FAF8FA',
            backgroundImage: `
              radial-gradient(circle at 50% 10%, rgba(233, 0, 100, 0.035) 0%, transparent 60%),
              radial-gradient(circle at 90% 90%, rgba(8, 124, 229, 0.03) 0%, transparent 50%)
            `,
            minHeight: '100vh',
            overflowY: 'auto',
          }}
        >
          {/* Subtle Ambient Decorative Glows */}
          <div
            className="position-absolute top-0 end-0 opacity-40 pointer-events-none"
            style={{
              width: '240px',
              height: '240px',
              background: 'radial-gradient(circle, rgba(233, 0, 100, 0.05) 0%, transparent 70%)',
              filter: 'blur(30px)',
              pointerEvents: 'none',
            }}
          />

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, ease: [0.25, 1, 0.5, 1] }}
            className="w-100 d-flex justify-content-center py-2 z-1 my-auto"
          >
            {children}
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default AdminLoginLayout;
