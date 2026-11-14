import React, { useState } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Lock, ArrowRight, CheckCircle2, AlertCircle, ShieldCheck } from 'lucide-react';
import axiosClient from '../../api/axiosClient';
import AdminLoginLayout from '../../components/auth/AdminLoginLayout';
import PasswordInput from '../../components/auth/PasswordInput';

const ResetPasswordPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token') || '';

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!token) {
      setError('Password reset token is missing from URL.');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);
    try {
      const res = await axiosClient.post('/auth/reset-password', {
        token,
        password,
      });

      if (res.success) {
        setSuccess(true);
      } else {
        setError(res.message || 'Password reset failed.');
      }
    } catch (err) {
      setError(err?.response?.data?.message || err.message || 'Invalid or expired password reset token.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AdminLoginLayout portalType="super_admin">
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
        <div className="text-center mb-4">
          <div
            className="rounded-circle d-inline-flex align-items-center justify-content-center mb-3"
            style={{ width: '46px', height: '46px', backgroundColor: '#FFF0F5', color: '#E90064' }}
          >
            <ShieldCheck size={24} strokeWidth={2.2} />
          </div>
          <h2
            className="fw-bold mb-1"
            style={{
              color: '#17233B',
              letterSpacing: '-0.5px',
              fontSize: 'clamp(1.4rem, 2.2vw, 1.8rem)',
            }}
          >
            Create New Password
          </h2>
          <p className="text-secondary small mb-0" style={{ fontSize: '0.86rem' }}>
            Set a secure new password for your administrative account.
          </p>
        </div>

        {success ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="card border-0 rounded-4 p-4 shadow-sm text-center"
            style={{ backgroundColor: '#F0FDF4', border: '1px solid #DCFCE7' }}
          >
            <CheckCircle2 size={38} className="text-success mx-auto mb-2" />
            <h5 className="fw-bold text-dark mb-1">Password Reset Complete!</h5>
            <p className="small text-secondary mb-3">
              Your password has been successfully updated in MongoDB. You may now sign in with your new credentials.
            </p>
            <button
              type="button"
              className="btn rounded-pill text-white fw-bold shadow-sm w-100 py-2.5"
              style={{ backgroundColor: '#E90064', fontSize: '0.9rem' }}
              onClick={() => navigate('/admin/login')}
            >
              Sign In to Admin Portal &rarr;
            </button>
          </motion.div>
        ) : (
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

            <PasswordInput
              id="newPasswordInput"
              label="New Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="At least 6 characters"
              disabled={loading}
              required
            />

            <PasswordInput
              id="confirmPasswordInput"
              label="Confirm New Password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Re-enter password"
              disabled={loading}
              required
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
                  <span>Updating Password in MongoDB...</span>
                </>
              ) : (
                <>
                  <span>Save New Password</span>
                  <ArrowRight size={16} strokeWidth={2.4} />
                </>
              )}
            </motion.button>

            <div className="text-center pt-2">
              <Link to="/admin/login" className="small text-decoration-none fw-semibold text-secondary">
                &larr; Cancel and Return to Sign In
              </Link>
            </div>
          </form>
        )}
      </div>
    </AdminLoginLayout>
  );
};

export default ResetPasswordPage;
