import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Lock, Mail, User, Phone, ArrowRight } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const RegisterPage = () => {
  const navigate = useNavigate();
  const { register } = useAuth();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await register({
        name,
        email,
        password,
        phone,
        role: 'customer',
      });
      navigate('/');
    } catch (err) {
      setError(err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container py-4 py-md-5 d-flex align-items-center justify-content-center min-vh-75 px-3">
      <div
        className="card border-0 rounded-4 shadow-sm w-100 bg-white"
        style={{
          maxWidth: '450px',
          padding: 'clamp(1.5rem, 4vw, 2.5rem)',
          border: '1px solid #F0E7ED',
          borderRadius: '24px',
        }}
      >
        {/* Brand Header */}
        <div className="text-center mb-4">
          <Link to="/" className="d-inline-flex align-items-center justify-content-center mb-2 text-decoration-none">
            <img
              src="/logo.jpeg"
              alt="Aaradhya"
              className="rounded-3 shadow-2xs"
              style={{ width: '52px', height: '52px', objectFit: 'contain' }}
            />
          </Link>
          <h3 className="fw-bolder mb-1 text-dark" style={{ letterSpacing: '-0.3px', color: '#17233B' }}>
            Create Account
          </h3>
          <p className="text-secondary small mb-0">
            Join Aaradhya Fashion & Fabrics today
          </p>
        </div>

        {error && (
          <div className="alert alert-danger py-2 small mb-3 rounded-3" style={{ fontSize: '0.82rem' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mb-3">
          <div className="mb-3">
            <label className="form-label small fw-semibold text-dark mb-1">Your Full Name *</label>
            <div className="input-group">
              <span className="input-group-text bg-light border-end-0 text-muted" style={{ borderColor: '#E2E8F0' }}>
                <User size={16} />
              </span>
              <input
                type="text"
                className="form-control border-start-0 ps-1"
                style={{ borderColor: '#E2E8F0', fontSize: '0.9rem' }}
                required
                placeholder="Rahul Sharma"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
          </div>

          <div className="mb-3">
            <label className="form-label small fw-semibold text-dark mb-1">Email Address *</label>
            <div className="input-group">
              <span className="input-group-text bg-light border-end-0 text-muted" style={{ borderColor: '#E2E8F0' }}>
                <Mail size={16} />
              </span>
              <input
                type="email"
                className="form-control border-start-0 ps-1"
                style={{ borderColor: '#E2E8F0', fontSize: '0.9rem' }}
                required
                placeholder="name@domain.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>

          <div className="mb-3">
            <label className="form-label small fw-semibold text-dark mb-1">Mobile Phone *</label>
            <div className="input-group">
              <span className="input-group-text bg-light border-end-0 text-muted" style={{ borderColor: '#E2E8F0' }}>
                <Phone size={16} />
              </span>
              <input
                type="tel"
                className="form-control border-start-0 ps-1"
                style={{ borderColor: '#E2E8F0', fontSize: '0.9rem' }}
                required
                placeholder="+91 98765 11001"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </div>
          </div>

          <div className="mb-4">
            <label className="form-label small fw-semibold text-dark mb-1">Create Password *</label>
            <div className="input-group">
              <span className="input-group-text bg-light border-end-0 text-muted" style={{ borderColor: '#E2E8F0' }}>
                <Lock size={16} />
              </span>
              <input
                type="password"
                className="form-control border-start-0 ps-1"
                style={{ borderColor: '#E2E8F0', fontSize: '0.9rem' }}
                required
                minLength={6}
                placeholder="At least 6 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <button
            type="submit"
            className="btn w-100 py-2.5 fw-bold rounded-pill text-white d-flex align-items-center justify-content-center gap-2 shadow-sm"
            style={{ backgroundColor: '#E90064', borderColor: '#E90064', fontSize: '0.92rem' }}
            disabled={loading}
          >
            <span>{loading ? 'Creating Account...' : 'Create Free Account'}</span>
            <ArrowRight size={16} />
          </button>
        </form>

        <div className="text-center small text-muted pt-2 border-top">
          Already have an account?{' '}
          <Link to="/login" className="fw-bold text-decoration-none" style={{ color: '#E90064' }}>
            Sign In
          </Link>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
