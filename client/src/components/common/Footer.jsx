import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Mail,
  Phone,
  MapPin,
  Send,
  CheckCircle2,
  ExternalLink,
} from 'lucide-react';

const InstagramIcon = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect width="20" height="20" x="2" y="2" rx="5" ry="5"></rect>
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5"></line>
  </svg>
);

const Footer = () => {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (email.trim()) {
      setSubscribed(true);
      setEmail('');
    }
  };

  return (
    <footer className="mt-5 border-top bg-white" style={{ borderColor: '#F0E7ED' }}>
      <div className="container py-5">
        <div className="row g-4 justify-content-between">
          {/* 1. Brand Info matching reference image */}
          <div className="col-lg-3 col-md-6">
            <Link to="/" className="d-flex align-items-center gap-2 text-decoration-none mb-3">
              <img
                src="/logo.jpeg"
                alt="AARADHYA"
                className="rounded-2"
                style={{ height: '46px', width: 'auto', objectFit: 'contain' }}
              />
              <div className="d-flex flex-column">
                <span
                  className="fw-bolder"
                  style={{
                    color: '#E90064',
                    fontSize: '1.35rem',
                    letterSpacing: '0.04em',
                    lineHeight: 1,
                  }}
                >
                  AARADHYA
                </span>
                <span
                  className="fw-bold"
                  style={{
                    fontSize: '0.62rem',
                    letterSpacing: '0.18em',
                    textTransform: 'uppercase',
                    color: '#17233B',
                  }}
                >
                  Fashion & Fabrics
                </span>
              </div>
            </Link>

            <p
              className="fw-semibold mb-3"
              style={{
                color: '#17233B',
                fontSize: '0.95rem',
                fontFamily: 'serif',
                fontStyle: 'italic',
              }}
            >
              Dress Better. Live Happier.
            </p>

            <p className="text-secondary small" style={{ lineHeight: 1.6, fontSize: '0.84rem' }}>
              Your premier destination for handwoven silk sarees, bridal ensembles, designer kurtis, and pure artisan fabrics.
            </p>

            <div className="mt-3">
              <a
                href="https://share.google/d6NkzFRJkiSUfGle4"
                target="_blank"
                rel="noopener noreferrer"
                className="text-decoration-none small fw-semibold d-inline-flex align-items-center gap-1.5"
                style={{ color: '#19B927' }}
              >
                <MapPin size={15} />
                <span>Aaradhya Kanchi Silks, KPHB</span>
                <ExternalLink size={12} />
              </a>
            </div>
          </div>

          {/* 2. Quick Links */}
          <div className="col-lg-2 col-6">
            <h6 className="fw-bold mb-3 text-dark" style={{ fontSize: '0.92rem' }}>Quick Links</h6>
            <ul className="list-unstyled small d-flex flex-column gap-2 mb-0">
              <li><Link to="/" className="text-secondary text-decoration-none hover-underline">Home</Link></li>
              <li><Link to="/about" className="text-secondary text-decoration-none hover-underline">About Us</Link></li>
              <li><Link to="/products" className="text-secondary text-decoration-none hover-underline">All Collections</Link></li>
              <li><Link to="/orders/track" className="text-secondary text-decoration-none hover-underline">FAQs & Tracking</Link></li>
              <li><Link to="/contact" className="text-secondary text-decoration-none hover-underline">Contact Us</Link></li>
            </ul>
          </div>

          {/* 3. Customer Care */}
          <div className="col-lg-2 col-6">
            <h6 className="fw-bold mb-3 text-dark" style={{ fontSize: '0.92rem' }}>Customer Care</h6>
            <ul className="list-unstyled small d-flex flex-column gap-2 mb-0">
              <li><Link to="/terms" className="text-secondary text-decoration-none hover-underline">Shipping Policy</Link></li>
              <li><Link to="/returns" className="text-secondary text-decoration-none hover-underline">Return Policy</Link></li>
              <li><Link to="/privacy" className="text-secondary text-decoration-none hover-underline">Privacy Policy</Link></li>
              <li><Link to="/terms" className="text-secondary text-decoration-none hover-underline">Terms & Conditions</Link></li>
              <li><Link to="/orders/track" className="text-secondary text-decoration-none hover-underline">Track My Order</Link></li>
            </ul>
          </div>

          {/* 4. Get In Touch & Socials */}
          <div className="col-lg-2 col-md-6">
            <h6 className="fw-bold mb-3 text-dark" style={{ fontSize: '0.92rem' }}>Get In Touch</h6>
            <div className="d-flex flex-column gap-2 small text-secondary mb-3">
              <div className="d-flex align-items-center gap-2">
                <Mail size={15} style={{ color: '#E90064' }} />
                <span className="text-truncate">support@aaradhya.com</span>
              </div>
              <div className="d-flex align-items-center gap-2">
                <Phone size={15} style={{ color: '#E90064' }} />
                <span>+91 98765 43210</span>
              </div>
            </div>

            {/* Social Icons matching image */}
            <div className="d-flex align-items-center gap-2">
              {/* Silks Instagram */}
              <a
                href="https://www.instagram.com/aaradhya_silks_kphb?vrfl=MWQ4OG5lNnFpY3Bzbg=="
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-circle d-flex align-items-center justify-content-center text-white"
                style={{ width: '32px', height: '32px', backgroundColor: '#E90064' }}
                title="Aaradhya Silks Instagram"
              >
                <InstagramIcon size={16} />
              </a>

              {/* Fabrics Instagram */}
              <a
                href="https://www.instagram.com/aaradhya_fabrics?xtok=cTN3aXVtZnFnY2ls"
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-circle d-flex align-items-center justify-content-center text-white"
                style={{ width: '32px', height: '32px', backgroundColor: '#087CE5' }}
                title="Aaradhya Fabrics Instagram"
              >
                <InstagramIcon size={16} />
              </a>

              {/* Google Maps Location */}
              <a
                href="https://share.google/d6NkzFRJkiSUfGle4"
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-circle d-flex align-items-center justify-content-center text-white"
                style={{ width: '32px', height: '32px', backgroundColor: '#19B927' }}
                title="AARADHYA KANCHI SILKS on Google Maps"
              >
                <MapPin size={16} />
              </a>
            </div>
          </div>

          {/* 5. Subscribe to Newsletter */}
          <div className="col-lg-3 col-md-6">
            <h6 className="fw-bold mb-2 text-dark" style={{ fontSize: '0.92rem' }}>Subscribe to Our Newsletter</h6>
            <p className="text-secondary small mb-3" style={{ fontSize: '0.82rem' }}>
              Get the latest offers & updates directly in your inbox.
            </p>

            {subscribed ? (
              <div className="alert alert-success d-flex align-items-center gap-2 py-2 px-3 small mb-0 rounded-pill">
                <CheckCircle2 size={16} />
                <span>Thank you for subscribing!</span>
              </div>
            ) : (
              <form onSubmit={handleSubscribe} className="d-flex flex-column gap-2">
                <input
                  type="email"
                  className="form-control rounded-pill px-3 py-2 small"
                  placeholder="Enter your email address"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  style={{ fontSize: '0.85rem', borderColor: '#F0E7ED' }}
                />
                <button
                  type="submit"
                  className="btn text-white rounded-pill px-4 py-2 fw-semibold small shadow-sm d-flex align-items-center justify-content-center gap-1.5"
                  style={{ backgroundColor: '#E90064', borderColor: '#E90064', fontSize: '0.88rem' }}
                >
                  <span>Subscribe</span>
                  <Send size={14} />
                </button>
              </form>
            )}
          </div>
        </div>

        {/* 6. Copyright Bottom Bar */}
        <div className="border-top mt-4 pt-3 d-flex flex-column flex-sm-row justify-content-between align-items-center gap-2 small text-muted" style={{ borderColor: '#F0E7ED', fontSize: '0.78rem' }}>
          <div>
            © {new Date().getFullYear()} <strong>AARADHYA – Fashion & Fabrics</strong>. All Rights Reserved.
          </div>
          <div>
            Made with <span style={{ color: '#E90064' }}>❤️</span> in India
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
