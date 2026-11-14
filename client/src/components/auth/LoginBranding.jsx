import React from 'react';
import { motion } from 'framer-motion';
import {
  ShieldCheck,
  Sparkles,
  Store,
  Layers,
  BarChart3,
  Receipt,
  Scissors,
  Gem,
  CheckCircle2,
} from 'lucide-react';

const LoginBranding = ({ portalType = 'super_admin' }) => {
  const portalMeta = {
    super_admin: {
      title: 'Aaradhya Super Admin',
      badge: 'CENTRAL AUTHORITY',
      color: '#E90064',
      bgLight: '#FFF0F5',
      subtitle: 'Manage your entire business from one place.',
      highlights: [
        { title: 'Combined Store Analytics', desc: 'Real-time sales & branch comparisons', icon: BarChart3 },
        { title: 'Silks & Fabrics Catalog', desc: 'Centralized products & staff control', icon: Layers },
        { title: 'Centralized Orders & POS', desc: 'Counter billing & express dispatch', icon: Receipt },
        { title: 'Store Wallets & Security', desc: 'Multi-store settlements & audit logs', icon: ShieldCheck },
      ],
      editorialImage: 'https://images.unsplash.com/photo-1609357605129-26f69add5d6e?w=1000&auto=format&fit=crop&q=85',
      imagePosition: 'center 18%',
      floatingRole: '👑 Central Enterprise Hub',
    },
    silks_admin: {
      title: 'Aaradhya Silks',
      badge: 'STORE AS • PURE HANDLOOM',
      color: '#E90064',
      bgLight: '#FFF0F5',
      subtitle: 'Manage your Silks store operations.',
      highlights: [
        { title: 'Live Order Dispatch Pipeline', desc: 'Customer tracking & express delivery', icon: Store },
        { title: 'Pure Silk Sarees & Stock', desc: 'Kanchipuram, Banarasi & Silk Mark', icon: Gem },
        { title: 'Counter POS & Barcodes', desc: 'Express in-store thermal checkout', icon: Receipt },
        { title: 'Store Wallet & Settlement', desc: 'Daily branch revenue & margin logs', icon: BarChart3 },
      ],
      editorialImage: 'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?w=1000&auto=format&fit=crop&q=85',
      imagePosition: 'center 30%',
      floatingRole: '✨ Pure Handloom Silks Branch',
    },
    fabrics_admin: {
      title: 'Aaradhya Fabrics',
      badge: 'STORE AF • RUNNING YARDAGE',
      color: '#087CE5',
      bgLight: '#F0F7FF',
      subtitle: 'Manage your Fabrics store operations.',
      highlights: [
        { title: 'Cut Yardage Order Staging', desc: 'Meter-by-meter live dispatch system', icon: Scissors },
        { title: 'Unstitched Suits & Linen', desc: 'Artisan hand-block cotton stock', icon: Layers },
        { title: 'Counter POS & Meter Tags', desc: 'Instant yardage billing & barcodes', icon: Receipt },
        { title: 'Store Wallet & Payouts', desc: 'Merchant commission & revenue audits', icon: BarChart3 },
      ],
      editorialImage: 'https://images.unsplash.com/photo-1594223274512-ad4803739b7c?w=1000&auto=format&fit=crop&q=85',
      imagePosition: 'center center',
      floatingRole: '✂️ Running Fabrics Yardage Branch',
    },
  };

  const meta = portalMeta[portalType] || portalMeta.super_admin;

  return (
    <div
      className="d-flex flex-column justify-content-between p-4 p-xl-5 position-relative w-100"
      style={{
        minHeight: '100%',
        backgroundColor: '#FFFCFE',
        backgroundImage: `
          radial-gradient(circle at 10% 12%, rgba(233, 0, 100, 0.05) 0%, transparent 40%),
          radial-gradient(circle at 90% 80%, rgba(8, 124, 229, 0.04) 0%, transparent 40%),
          radial-gradient(circle at 50% 50%, rgba(184, 224, 0, 0.03) 0%, transparent 55%)
        `,
      }}
    >
      {/* 1. Subtle Decorative Leaf Shapes Inspired by Aaradhya Logo */}
      <svg
        className="position-absolute top-0 end-0 opacity-20 pointer-events-none"
        width="220"
        height="220"
        viewBox="0 0 200 200"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{ pointerEvents: 'none', transform: 'translate(20%, -20%)' }}
      >
        <path
          d="M100 10C150 10 190 50 190 100C190 150 150 190 100 190C50 190 10 150 10 100C10 50 50 10 100 10Z"
          fill="#FFF0F5"
        />
        <path
          d="M60 140C60 95.8172 95.8172 60 140 60C140 104.183 104.183 140 60 140Z"
          fill="#B8E000"
          fillOpacity="0.45"
        />
        <path
          d="M140 60C140 104.183 104.183 140 60 140C60 95.8172 95.8172 60 140 60Z"
          fill="#19B927"
          fillOpacity="0.35"
        />
      </svg>

      <svg
        className="position-absolute bottom-0 start-0 opacity-20 pointer-events-none"
        width="240"
        height="240"
        viewBox="0 0 200 200"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{ pointerEvents: 'none', transform: 'translate(-25%, 25%)' }}
      >
        <path
          d="M100 20C144.183 20 180 55.8172 180 100C180 144.183 144.183 180 100 180C55.8172 180 20 144.183 20 100C20 55.8172 55.8172 20 100 20Z"
          fill="#FFF0F5"
        />
        <path
          d="M70 130C70 96.8629 96.8629 70 130 70C130 103.137 103.137 130 70 130Z"
          fill="#E90064"
          fillOpacity="0.25"
        />
      </svg>

      {/* 2. Top Header with Original Logo & Brand Title */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="d-flex align-items-center justify-content-between z-1 mb-3"
      >
        <div className="d-flex align-items-center gap-2.5">
          <img
            src="/logo.jpeg"
            alt="Aaradhya Logo"
            className="rounded-3 shadow-2xs border"
            style={{ width: '44px', height: '44px', objectFit: 'contain', backgroundColor: '#FFFFFF', borderColor: '#F0E7ED' }}
          />
          <div>
            <div
              className="fw-bolder"
              style={{
                color: '#E90064',
                fontSize: '1.35rem',
                letterSpacing: '0.04em',
                lineHeight: 1.05,
              }}
            >
              AARADHYA
            </div>
            <div
              className="fw-bold"
              style={{
                fontSize: '0.62rem',
                letterSpacing: '0.2em',
                textTransform: 'uppercase',
                color: '#17233B',
              }}
            >
              Fashion & Fabrics
            </div>
          </div>
        </div>

        <span
          className="badge rounded-pill fw-semibold py-1 px-2.5 d-none d-xl-inline-flex align-items-center gap-1"
          style={{
            backgroundColor: '#FFF0F5',
            color: '#E90064',
            border: '1px solid #FCE7F1',
            fontSize: '0.7rem',
          }}
        >
          <Sparkles size={11} />
          <span>v2.0 • Enterprise</span>
        </span>
      </motion.div>

      {/* 3. Middle Section: Fashion Editorial Showcase & Promotional Headings */}
      <div className="z-1 mb-3">
        {/* Premium Fashion Editorial Image Card */}
        <motion.div
          key={portalType}
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4 }}
          className="position-relative overflow-hidden rounded-4 mb-3 shadow-sm border"
          style={{
            height: '215px',
            backgroundColor: '#F8F6F8',
            borderColor: '#F0E7ED',
          }}
        >
          <img
            src={meta.editorialImage}
            alt={meta.title}
            className="w-100 h-100"
            style={{
              objectFit: 'cover',
              objectPosition: meta.imagePosition || 'center 20%',
              display: 'block',
            }}
          />

          {/* Top-Left Floating Role Pill */}
          <div className="position-absolute top-0 start-0 p-2.5">
            <span
              className="badge rounded-pill fw-bold shadow-sm d-inline-flex align-items-center gap-1.5"
              style={{
                backgroundColor: 'rgba(23, 35, 59, 0.78)',
                backdropFilter: 'blur(8px)',
                color: '#FFFFFF',
                fontSize: '0.7rem',
                letterSpacing: '0.03em',
                padding: '0.3rem 0.65rem',
                border: '1px solid rgba(255, 255, 255, 0.2)',
              }}
            >
              <span>{meta.floatingRole}</span>
            </span>
          </div>

          {/* Bottom-Right Authenticity Pill (No heavy dark overlays blocking image) */}
          <div className="position-absolute bottom-0 end-0 p-2.5">
            <span
              className="badge rounded-pill fw-semibold shadow-sm d-inline-flex align-items-center gap-1"
              style={{
                backgroundColor: 'rgba(255, 255, 255, 0.9)',
                backdropFilter: 'blur(8px)',
                color: '#17233B',
                fontSize: '0.66rem',
                padding: '0.25rem 0.6rem',
                border: '1px solid rgba(240, 231, 237, 0.9)',
              }}
            >
              <ShieldCheck size={12} style={{ color: '#16A34A' }} />
              <span>100% Silk Mark Certified</span>
            </span>
          </div>
        </motion.div>

        {/* Elegant Promotional Headings Requested in Prompt */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.08 }}
        >
          <div
            className="small fw-bold text-uppercase mb-1"
            style={{ color: '#E90064', letterSpacing: '0.14em', fontSize: '0.72rem' }}
          >
            Welcome to Aaradhya
          </div>

          <h2
            className="fw-bold mb-1.5"
            style={{
              color: '#17233B',
              letterSpacing: '-0.4px',
              fontSize: 'clamp(1.3rem, 1.8vw, 1.62rem)',
              lineHeight: 1.22,
              fontFamily: "'Playfair Display', Georgia, serif",
            }}
          >
            Manage your stores.{' '}
            <span style={{ color: '#E90064', fontStyle: 'italic' }}>Grow your business.</span>
          </h2>

          <p
            className="text-secondary small mb-3"
            style={{ fontSize: '0.84rem', lineHeight: 1.48, maxWidth: '460px' }}
          >
            Your centralized workspace for products, orders, inventory and business analytics.
          </p>

          {/* Contextual Feature Highlights in Compact 2x2 Matrix */}
          <div className="row g-2">
            {meta.highlights.map((item, idx) => {
              const Icon = item.icon;
              return (
                <div key={idx} className="col-12 col-xl-6">
                  <div
                    className="p-2 rounded-3 d-flex align-items-start gap-2 h-100 transition-all border"
                    style={{
                      backgroundColor: '#FFFFFF',
                      borderColor: '#F0E7ED',
                      boxShadow: '0 1px 2px rgba(23, 35, 59, 0.02)',
                    }}
                  >
                    <div
                      className="rounded-circle d-flex align-items-center justify-content-center flex-shrink-0 mt-0.5"
                      style={{
                        width: '24px',
                        height: '24px',
                        backgroundColor: '#FFF0F5',
                        color: meta.color,
                      }}
                    >
                      <Icon size={12} strokeWidth={2.2} />
                    </div>
                    <div className="overflow-hidden">
                      <div
                        className="fw-bold text-truncate text-dark"
                        style={{ fontSize: '0.76rem', color: '#17233B', lineHeight: 1.2 }}
                      >
                        {item.title}
                      </div>
                      <div
                        className="text-muted small text-truncate"
                        style={{ fontSize: '0.66rem', lineHeight: 1.2 }}
                      >
                        {item.desc}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div>
      </div>

      {/* 4. Bottom Trust & Live Status Bar */}
      <div
        className="z-1 pt-2.5 border-top d-flex align-items-center justify-content-between text-muted small mt-auto"
        style={{ borderColor: '#F0E7ED', fontSize: '0.72rem' }}
      >
        <div className="d-flex align-items-center gap-2">
          <span
            className="rounded-circle d-inline-block"
            style={{
              width: '8px',
              height: '8px',
              backgroundColor: '#16A34A',
              boxShadow: '0 0 0 3px rgba(22, 163, 74, 0.2)',
              animation: 'pulse 2s infinite',
            }}
          />
          <span className="fw-medium text-dark" style={{ fontSize: '0.72rem' }}>
            Connected to MongoDB Atlas
          </span>
        </div>

        <div className="d-flex align-items-center gap-1.5 text-muted">
          <ShieldCheck size={13} style={{ color: '#19B927' }} />
          <span>Multi-Store Enterprise RBAC</span>
        </div>
      </div>
    </div>
  );
};

export default LoginBranding;
