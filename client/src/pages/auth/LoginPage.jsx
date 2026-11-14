import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Lock, Mail, ArrowRight, ShieldCheck, AlertCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const LoginPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const redirectMessage = location.state?.message || null;
  const returnUrl = location.state?.returnUrl || null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const data = await login(email, password);
      const userRole = data?.user?.role || '';
      const storeCode = (data?.user?.storeCode || '').toUpperCase();

      // Navigate based on user role or returnUrl
      if (returnUrl && (userRole === 'customer' || !userRole)) {
        navigate(returnUrl);
      } else if (userRole === 'silks_admin' || storeCode === 'AS') {
        navigate('/silks/admin');
      } else if (userRole === 'fabrics_admin' || storeCode === 'AF') {
        navigate('/fabrics/admin');
      } else if (userRole === 'vendor' || userRole === 'store_admin') {
        navigate('/silks/admin');
      } else if (userRole === 'store_manager' || userRole === 'pos') {
        navigate('/pos');
      } else if (userRole === 'super_admin' || userRole === 'sub_admin' || userRole === 'admin') {
        navigate('/admin');
      } else {
        navigate('/');
      }
    } catch (err) {
      setError(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const fillDemo = (eMail, pWord) => {
    setEmail(eMail);
    setPassword(pWord);
  };

  return (
    <div className="container py-5 d-flex align-items-center justify-content-center min-vh-75">
      <div
        className="card p-4 p-md-5 w-100 shadow-lg border-0 rounded-4"
        style={{ maxWidth: '490px', backgroundColor: '#FFFFFF', border: '1px solid #F0E7ED' }}
      >
        <div className="text-center mb-4">
          <img
            src="/logo.jpeg"
            alt="Aaradhya Fashion & Fabrics"
            style={{ width: '64px', height: '64px', objectFit: 'contain' }}
            className="mb-2"
          />
          <h3 className="fw-bolder mb-1 text-dark" style={{ letterSpacing: '-0.3px', color: '#17233B' }}>
            AARADHYA
          </h3>
          <p className="small text-secondary mb-0" style={{ fontSize: '0.82rem' }}>
            Fashion & Fabrics • Centralized Platform Login
          </p>
        </div>

        {/* Action Prompt Banner (e.g. Add to cart / wishlist required login) */}
        {redirectMessage && (
          <div
            className="alert d-flex align-items-center gap-2 py-2.5 px-3 small rounded-3 mb-3 text-dark"
            style={{ backgroundColor: '#FFF0F5', border: '1px solid #FBCFE8' }}
          >
            <AlertCircle size={17} style={{ color: '#E90064', flexShrink: 0 }} />
            <span style={{ fontSize: '0.82rem', fontWeight: 500 }}>{redirectMessage}</span>
          </div>
        )}

        {error && <div className="alert alert-danger py-2 small mb-3">{error}</div>}

        <form onSubmit={handleSubmit} className="mb-4">
          <div className="mb-3">
            <label className="form-label small fw-semibold text-dark">Email Address *</label>
            <div className="input-group">
              <span className="input-group-text bg-light text-muted border-end-0">
                <Mail size={16} />
              </span>
              <input
                type="email"
                className="form-control border-start-0 ps-0"
                required
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>

          <div className="mb-4">
            <div className="d-flex justify-content-between">
              <label className="form-label small fw-semibold text-dark">Password *</label>
            </div>
            <div className="input-group">
              <span className="input-group-text bg-light text-muted border-end-0">
                <Lock size={16} />
              </span>
              <input
                type="password"
                className="form-control border-start-0 ps-0"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <button
            type="submit"
            className="btn w-100 py-2.5 fw-bold d-flex align-items-center justify-content-center gap-2 rounded-pill text-white shadow-sm"
            style={{ backgroundColor: '#E90064', borderColor: '#E90064' }}
            disabled={loading}
          >
            {loading ? 'Authenticating...' : 'Sign In'} <ArrowRight size={16} />
          </button>
        </form>

        {/* 1-Click Demo Accounts for seamless role testing */}
        <div className="border-top pt-3 mb-3">
          <div className="text-muted small text-center mb-2 fw-semibold" style={{ fontSize: '0.72rem', letterSpacing: '0.04em' }}>
            DEMO ACCOUNTS (1-CLICK FILL):
          </div>
          <div className="row g-2">
            <div className="col-6">
              <button
                type="button"
                className="btn btn-light btn-sm w-100 border text-start small p-2 rounded-3"
                onClick={() => fillDemo('customer@example.com', 'customer123')}
              >
                <div className="fw-bold" style={{ color: '#16A34A', fontSize: '0.75rem' }}>Customer</div>
                <div className="text-muted text-truncate" style={{ fontSize: '0.62rem' }}>customer@example.com</div>
              </button>
            </div>
            <div className="col-6">
              <button
                type="button"
                className="btn btn-light btn-sm w-100 border text-start small p-2 rounded-3"
                onClick={() => fillDemo('admin@shopmart.com', 'admin123')}
              >
                <div className="fw-bold" style={{ color: '#E90064', fontSize: '0.75rem' }}>Super Admin</div>
                <div className="text-muted text-truncate" style={{ fontSize: '0.62rem' }}>admin@shopmart.com</div>
              </button>
            </div>
            <div className="col-6">
              <button
                type="button"
                className="btn btn-light btn-sm w-100 border text-start small p-2 rounded-3"
                onClick={() => fillDemo('pos@shopmart.com', 'pos123')}
              >
                <div className="fw-bold text-dark" style={{ fontSize: '0.75rem' }}>Counter POS</div>
                <div className="text-muted text-truncate" style={{ fontSize: '0.62rem' }}>pos@shopmart.com</div>
              </button>
            </div>
            <div className="col-6">
              <button
                type="button"
                className="btn btn-light btn-sm w-100 border text-start small p-2 rounded-3"
                onClick={() => fillDemo('vendor@technova.com', 'vendor123')}
              >
                <div className="fw-bold" style={{ color: '#087CE5', fontSize: '0.75rem' }}>Store Admin</div>
                <div className="text-muted text-truncate" style={{ fontSize: '0.62rem' }}>Store A / Store B</div>
              </button>
            </div>
          </div>
        </div>

        <div className="text-center small text-muted">
          Don't have an account?{' '}
          <Link to="/register" className="fw-bold text-decoration-none" style={{ color: '#E90064' }}>
            Create an Account
          </Link>
        </div>

        <div className="text-center mt-3 pt-3 border-top small">
          <Link to="/admin/login" className="fw-semibold text-decoration-none d-inline-flex align-items-center gap-1.5" style={{ color: '#17233B' }}>
            <ShieldCheck size={15} style={{ color: '#E90064' }} />
            <span>Store & Super Admin Portal Login &rarr;</span>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
