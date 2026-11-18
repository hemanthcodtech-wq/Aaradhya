import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, ArrowLeft, ArrowRight, CheckCircle2, AlertCircle, KeyRound, ShieldCheck } from 'lucide-react';
import axiosClient from '../../api/axiosClient';
import LoginInput from './LoginInput';

const ForgotPassword = ({ onBackToLogin, onResetPasswordWithToken }) => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successData, setSuccessData] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!email.trim() || !/\S+@\S+\.\S+/.test(email)) {
      setError('Please provide a valid registered email address');
      return;
    }

    setLoading(true);
    try {
      const res = await axiosClient.post('/auth/forgot-password', { email: email.trim() });
      if (res.success) {
        setSuccessData(res.data);
      } else {
        setError(res.message || 'Unable to process reset request.');
      }
    } catch (err) {
      setError(err?.response?.data?.message || err.message || 'Password reset request failed.');
    } finally {
      setLoading(false);
    }
  };

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
      {/* 1. Header */}
      <div className="text-center mb-4">
        <div
          className="rounded-circle d-inline-flex align-items-center justify-content-center mb-3"
          style={{ width: '46px', height: '46px', backgroundColor: '#FFF0F5', color: '#E90064' }}
        >
          <KeyRound size={22} strokeWidth={2.2} />
        </div>
        <h2
          className="fw-bold mb-1"
          style={{
            color: '#17233B',
            letterSpacing: '-0.5px',
            fontSize: 'clamp(1.4rem, 2.2vw, 1.8rem)',
          }}
        >
          Forgot your password?
        </h2>
        <p className="text-secondary small mb-0" style={{ fontSize: '0.86rem' }}>
          Enter your registered email address to receive password reset instructions.
        </p>
      </div>

      {/* 2. Success Banner with Reset Token */}
      {successData ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="card border-0 rounded-4 p-4 shadow-sm mb-4"
          style={{ backgroundColor: '#F0FDF4', border: '1px solid #DCFCE7' }}
        >
          <div className="d-flex align-items-center gap-2 mb-2 text-success">
            <CheckCircle2 size={20} />
            <strong className="small" style={{ fontSize: '0.9rem' }}>Reset Instructions Sent</strong>
          </div>
          <p className="small text-secondary mb-3" style={{ fontSize: '0.82rem', lineHeight: 1.5 }}>
            A secure single-use reset token has been generated for <strong>{email}</strong>.
          </p>

          {successData.resetToken && (
            <div className="p-3 bg-white rounded-3 border mb-3">
              <span className="small text-muted fw-bold d-block mb-1" style={{ fontSize: '0.7rem' }}>
                DEMO ONE-CLICK RESET TOKEN:
              </span>
              <code className="small text-break fw-bold" style={{ color: '#E90064', fontSize: '0.78rem' }}>
                {successData.resetToken}
              </code>
            </div>
          )}

          {onResetPasswordWithToken && successData.resetToken && (
            <button
              type="button"
              className="btn btn-sm rounded-pill text-white fw-bold mb-3 shadow-sm w-100 py-2"
              style={{ backgroundColor: '#16A34A', fontSize: '0.85rem' }}
              onClick={() => onResetPasswordWithToken(successData.resetToken)}
            >
              Continue to Set New Password &rarr;
            </button>
          )}

          <div className="text-center">
            <button
              type="button"
              className="btn btn-link text-decoration-none p-0 small fw-semibold text-secondary"
              onClick={onBackToLogin}
            >
              &larr; Back to Admin Sign In
            </button>
          </div>
        </motion.div>
      ) : (
        /* 3. Forgot Password Form */
        <form onSubmit={handleSubmit}>
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -6, height: 0 }}
                animate={{ opacity: 1, y: 0, height: 'auto' }}
                exit={{ opacity: 0, y: -6, height: 0 }}
                className="alert alert-danger d-flex align-items-start gap-2 py-2 px-3 small rounded-3 mb-3 border-danger border-opacity-25"
                style={{ fontSize: '0.82rem', backgroundColor: '#FEF2F2' }}
              >
                <AlertCircle size={16} className="text-danger flex-shrink-0 mt-0.5" />
                <div className="flex-grow-1 text-danger fw-medium">{error}</div>
              </motion.div>
            )}
          </AnimatePresence>

          <LoginInput
            id="forgotEmailInput"
            label="Registered Admin Email"
            type="email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              if (error) setError('');
            }}
            placeholder="admin@aaradhya.com"
            disabled={loading}
            required
            autoFocus
          />

          <motion.button
            whileHover={{ scale: loading ? 1 : 1.015 }}
            whileTap={{ scale: loading ? 1 : 0.985 }}
            type="submit"
            disabled={loading}
            className="btn w-100 rounded-pill py-2.5 fw-bold text-white shadow-sm d-flex align-items-center justify-content-center gap-2 mb-3"
            style={{
              backgroundColor: '#E90064',
              borderColor: '#E90064',
              fontSize: '0.92rem',
              boxShadow: '0 6px 18px rgba(233, 0, 100, 0.25)',
              transition: 'all 0.2s ease',
              minHeight: '46px',
            }}
          >
            {loading ? (
              <>
                <div className="spinner-border spinner-border-sm text-white" role="status"></div>
                <span>Sending Instructions...</span>
              </>
            ) : (
              <>
                <span>Send Reset Link</span>
                <ArrowRight size={16} strokeWidth={2.4} />
              </>
            )}
          </motion.button>

          <div className="text-center pt-2">
            <button
              type="button"
              className="btn btn-link text-decoration-none small fw-semibold text-secondary d-inline-flex align-items-center gap-1.5"
              style={{ fontSize: '0.84rem' }}
              onClick={onBackToLogin}
            >
              <ArrowLeft size={14} />
              <span>Back to Sign In</span>
            </button>
          </div>
        </form>
      )}

      {/* 4. Footer */}
      <div className="mt-4 pt-3 border-top text-center text-muted small" style={{ borderColor: '#F0E7ED', fontSize: '0.74rem' }}>
        © 2026 Aaradhya Sarees & Silks. All rights reserved.
      </div>
    </div>
  );
};

export default ForgotPassword;
