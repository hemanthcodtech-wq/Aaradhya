import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowRight,
  AlertCircle,
  ShieldCheck,
  Sparkles,
  CheckCircle2,
  Lock,
  Mail,
  Store,
  Layers,
} from 'lucide-react';
import LoginInput from './LoginInput';
import PasswordInput from './PasswordInput';
import RememberMe from './RememberMe';

const SEEDED_PRESETS = [
  {
    roleId: 'super_admin',
    label: 'Super Admin',
    email: 'admin@aaradhya.com',
    password: 'admin123',
    badge: 'ALL',
    color: '#E90064',
    target: '/super-admin/dashboard',
  },
  {
    roleId: 'silks_admin',
    label: 'Silks Admin',
    email: 'silks@aaradhya.com',
    password: 'silks123',
    badge: 'STORE AS',
    color: '#E90064',
    target: '/silks-admin/dashboard',
  },
  {
    roleId: 'fabrics_admin',
    label: 'Fabrics Admin',
    email: 'fabrics@aaradhya.com',
    password: 'fabrics123',
    badge: 'STORE AF',
    color: '#087CE5',
    target: '/fabrics-admin/dashboard',
  },
];

const LoginForm = ({
  portalType = 'super_admin',
  onPortalTypeChange,
  onSubmit,
  loading = false,
  error = '',
  onForgotPasswordClick,
  forgotPasswordPath = '/forgot-password',
}) => {
  const initialPreset = SEEDED_PRESETS.find((p) => p.roleId === portalType) || SEEDED_PRESETS[0];

  const [email, setEmail] = useState(initialPreset.email);
  const [password, setPassword] = useState(initialPreset.password);
  const [rememberMe, setRememberMe] = useState(true);
  const [validationErrors, setValidationErrors] = useState({});

  // Sync inputs when portalType changes from route or prop
  useEffect(() => {
    const matched = SEEDED_PRESETS.find((p) => p.roleId === portalType);
    if (matched) {
      setEmail(matched.email);
      setPassword(matched.password);
      setValidationErrors({});
    }
  }, [portalType]);

  const validate = () => {
    const errors = {};
    if (!email.trim()) {
      errors.email = 'Email address is required';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      errors.email = 'Please provide a valid email address';
    }

    if (!password) {
      errors.password = 'Password is required';
    } else if (password.length < 6) {
      errors.password = 'Password must be at least 6 characters';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;
    onSubmit({ email: email.trim(), password, rememberMe });
  };

  const handleSelectPreset = (preset) => {
    setEmail(preset.email);
    setPassword(preset.password);
    setValidationErrors({});
    if (onPortalTypeChange) {
      onPortalTypeChange(preset.roleId);
    }
  };

  const activeMeta = SEEDED_PRESETS.find((p) => p.roleId === portalType) || SEEDED_PRESETS[0];

  return (
    <div
      className="w-100 bg-white rounded-4 shadow-sm border p-4 p-sm-4 p-md-5"
      style={{
        maxWidth: '480px',
        borderColor: '#F0E7ED',
        boxShadow: '0 20px 50px rgba(23, 35, 59, 0.07), 0 2px 6px rgba(233, 0, 100, 0.02)',
        borderRadius: '24px',
        backgroundColor: '#FFFFFF',
      }}
    >
      {/* 1. Header with Welcome Back */}
      <div className="text-center mb-3.5">
        <div
          className="d-inline-flex align-items-center justify-content-center p-2 rounded-circle mb-2"
          style={{
            backgroundColor: '#FFF0F5',
            color: activeMeta.color,
            width: '42px',
            height: '42px',
          }}
        >
          <Lock size={20} strokeWidth={2.2} />
        </div>

        <h2
          className="fw-bold mb-1"
          style={{
            color: '#17233B',
            letterSpacing: '-0.5px',
            fontSize: 'clamp(1.45rem, 2.2vw, 1.85rem)',
          }}
        >
          Welcome Back
        </h2>

        <p className="text-secondary small mb-2" style={{ fontSize: '0.86rem' }}>
          Sign in to access your administrative dashboard.
        </p>

        {/* Current Active Context Indicator */}
        <span
          className="badge rounded-pill fw-semibold py-1 px-3 d-inline-flex align-items-center gap-1.5"
          style={{
            backgroundColor: portalType === 'fabrics_admin' ? '#F0F7FF' : '#FFF0F5',
            color: activeMeta.color,
            border: `1px solid ${portalType === 'fabrics_admin' ? '#BFDBFE' : '#FCE7F1'}`,
            fontSize: '0.72rem',
          }}
        >
          <span
            className="rounded-circle d-inline-block"
            style={{ width: '6px', height: '6px', backgroundColor: activeMeta.color }}
          />
          <span>Accessing: {activeMeta.label}</span>
        </span>
      </div>

      {/* 2. Three Administrative Roles Selector Pill Bar */}
      <div className="mb-3.5">
        <div className="d-flex justify-content-between align-items-center mb-1.5">
          <span className="small fw-semibold text-muted" style={{ fontSize: '0.7rem', letterSpacing: '0.04em' }}>
            DEMO SEEDED CREDENTIALS
          </span>
          <span className="badge rounded-pill bg-light text-dark border py-0.5 px-2" style={{ fontSize: '0.62rem' }}>
            MongoDB Atlas
          </span>
        </div>

        <div className="row g-1.5">
          {SEEDED_PRESETS.map((preset) => {
            const isSelected = portalType === preset.roleId;
            return (
              <div key={preset.roleId} className="col-4">
                <button
                  type="button"
                  className={`btn btn-sm w-100 p-2 rounded-3 text-start transition-all position-relative ${
                    isSelected ? 'shadow-sm' : 'border bg-white text-secondary'
                  }`}
                  style={{
                    backgroundColor: isSelected ? (preset.roleId === 'fabrics_admin' ? '#F0F7FF' : '#FFF0F5') : '#FFFFFF',
                    borderColor: isSelected ? preset.color : '#E2E8F0',
                    borderWidth: isSelected ? '1.5px' : '1px',
                    transition: 'all 0.18s ease',
                  }}
                  onClick={() => handleSelectPreset(preset)}
                >
                  <div className="d-flex align-items-center justify-content-between mb-0.5">
                    <span
                      className="badge rounded-pill"
                      style={{
                        backgroundColor: preset.color,
                        color: '#FFFFFF',
                        fontSize: '0.58rem',
                        padding: '0.15rem 0.38rem',
                      }}
                    >
                      {preset.badge}
                    </span>
                    {isSelected && <CheckCircle2 size={12} style={{ color: preset.color }} />}
                  </div>
                  <div
                    className="fw-bold text-truncate"
                    style={{ fontSize: '0.73rem', color: isSelected ? '#17233B' : '#475569' }}
                  >
                    {preset.label}
                  </div>
                  <div className="text-muted text-truncate" style={{ fontSize: '0.62rem' }}>
                    {preset.email.split('@')[0]}
                  </div>
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* 3. Global Error Message Banner */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -6, height: 0 }}
            animate={{ opacity: 1, y: 0, height: 'auto' }}
            exit={{ opacity: 0, y: -6, height: 0 }}
            className="alert alert-danger d-flex align-items-start gap-2 py-2 px-3 small rounded-3 mb-3 border-danger border-opacity-25 shadow-2xs"
            style={{ fontSize: '0.82rem', backgroundColor: '#FEF2F2' }}
          >
            <AlertCircle size={16} className="text-danger flex-shrink-0 mt-0.5" />
            <div className="flex-grow-1 text-danger fw-medium">{error}</div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 4. Login Form */}
      <form onSubmit={handleFormSubmit} noValidate>
        <LoginInput
          id="adminEmailInput"
          label="Email Address"
          type="email"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            if (validationErrors.email) setValidationErrors((prev) => ({ ...prev, email: null }));
          }}
          placeholder="admin@aaradhya.com"
          error={validationErrors.email}
          disabled={loading}
          required
        />

        <PasswordInput
          id="adminPasswordInput"
          label="Password"
          value={password}
          onChange={(e) => {
            setPassword(e.target.value);
            if (validationErrors.password) setValidationErrors((prev) => ({ ...prev, password: null }));
          }}
          placeholder="••••••••"
          error={validationErrors.password}
          disabled={loading}
          required
        />

        <RememberMe
          checked={rememberMe}
          onChange={(e) => setRememberMe(e.target.checked)}
          onForgotPasswordClick={onForgotPasswordClick}
          forgotPasswordPath={forgotPasswordPath}
        />

        <motion.button
          whileHover={{ scale: loading ? 1 : 1.015 }}
          whileTap={{ scale: loading ? 1 : 0.985 }}
          type="submit"
          disabled={loading}
          className="btn w-100 rounded-pill py-2.5 fw-bold text-white shadow-sm d-flex align-items-center justify-content-center gap-2"
          style={{
            backgroundColor: '#E90064',
            borderColor: '#E90064',
            fontSize: '0.92rem',
            letterSpacing: '0.01em',
            boxShadow: '0 6px 18px rgba(233, 0, 100, 0.25)',
            transition: 'all 0.2s ease',
            minHeight: '46px',
          }}
        >
          {loading ? (
            <>
              <div className="spinner-border spinner-border-sm text-white" role="status"></div>
              <span>Verifying Credentials...</span>
            </>
          ) : (
            <>
              <span>Sign In to Dashboard</span>
              <ArrowRight size={16} strokeWidth={2.4} />
            </>
          )}
        </motion.button>
      </form>

      {/* 5. Customer Storefront Link & Security Footer */}
      <div className="mt-4 pt-3 border-top text-center" style={{ borderColor: '#F0E7ED' }}>
        <a
          href="/"
          className="small text-decoration-none fw-semibold d-inline-flex align-items-center gap-1.5 mb-2.5"
          style={{ color: '#17233B', fontSize: '0.82rem' }}
        >
          <span>&larr; Return to Customer Storefront</span>
        </a>

        <div className="d-flex align-items-center justify-content-center gap-1.5 text-muted small mb-1" style={{ fontSize: '0.72rem' }}>
          <ShieldCheck size={13} style={{ color: '#19B927' }} />
          <span>256-bit SSL Encrypted • Single Sign-On</span>
        </div>

        <div className="text-muted small" style={{ fontSize: '0.72rem' }}>
          © 2026 Aaradhya Sarees & Silks. All rights reserved.
        </div>
      </div>
    </div>
  );
};

export default LoginForm;
