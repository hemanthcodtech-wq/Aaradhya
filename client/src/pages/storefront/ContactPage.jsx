import React, { useState } from 'react';
import {
  Phone,
  Mail,
  MapPin,
  Clock,
  Send,
  CheckCircle2,
  ExternalLink,
  HelpCircle,
  MessageSquare,
  ShieldCheck,
} from 'lucide-react';
import { FaGem, FaScroll } from 'react-icons/fa6';
import AnimatedFaIcon from '../../components/common/AnimatedFaIcon';

const InstagramIcon = ({ size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect width="20" height="20" x="2" y="2" rx="5" ry="5"></rect>
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5"></line>
  </svg>
);

const ContactPage = () => {
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: '',
  });

  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.message) return;
    setSubmitted(true);
    setForm({
      name: '',
      email: '',
      phone: '',
      subject: '',
      message: '',
    });
  };

  return (
    <div className="bg-white pb-5">
      {/* 1. Header Banner */}
      <section
        className="py-5 text-white text-center position-relative"
        style={{
          background: 'linear-gradient(135deg, #17233B 0%, #1e2e4d 60%, #E90064 100%)',
        }}
      >
        <div className="container py-3">
          <span className="badge px-3 py-1.5 rounded-pill mb-2 fw-bold text-uppercase" style={{ backgroundColor: 'rgba(255,255,255,0.15)', color: '#B8E000' }}>
            Aaradhya Customer Care
          </span>
          <h1 className="display-5 fw-bolder mb-2" style={{ letterSpacing: '-0.5px' }}>
            We'd Love to Hear From You
          </h1>
          <p className="lead text-light opacity-85 mx-auto mb-0" style={{ maxWidth: '620px', fontSize: '1rem' }}>
            Have questions about silk sarees, running fabric measurements, wedding orders, or tracking an existing shipment? We are here to assist you every day.
          </p>
        </div>
      </section>

      <div className="container mt-n4 position-relative" style={{ marginTop: '-32px', zIndex: 10 }}>
        {/* 2. Quick Contact Highlights */}
        <div className="row g-3 mb-5">
          {/* Phone */}
          <div className="col-12 col-sm-6 col-lg-3">
            <div className="card border-0 shadow-sm p-4 h-100 bg-white rounded-4" style={{ border: '1px solid #F0E7ED' }}>
              <div
                className="rounded-circle d-flex align-items-center justify-content-center mb-3"
                style={{ width: '44px', height: '44px', backgroundColor: '#FFF0F5', color: '#E90064' }}
              >
                <Phone size={22} />
              </div>
              <h6 className="fw-bold text-dark mb-1">Customer Helpline</h6>
              <div className="fw-bold small mb-1" style={{ color: '#E90064' }}>+91 98765 43210</div>
              <div className="text-secondary small">+91 98765 11001</div>
              <div className="text-muted small mt-1" style={{ fontSize: '0.72rem' }}>10:00 AM – 9:30 PM (All Days)</div>
            </div>
          </div>

          {/* Email */}
          <div className="col-12 col-sm-6 col-lg-3">
            <div className="card border-0 shadow-sm p-4 h-100 bg-white rounded-4" style={{ border: '1px solid #F0E7ED' }}>
              <div
                className="rounded-circle d-flex align-items-center justify-content-center mb-3"
                style={{ width: '44px', height: '44px', backgroundColor: '#EFF6FF', color: '#087CE5' }}
              >
                <Mail size={22} />
              </div>
              <h6 className="fw-bold text-dark mb-1">Email Support</h6>
              <div className="fw-bold small mb-1 text-primary">support@aaradhya.com</div>
              <div className="text-secondary small">care@aaradhya.com</div>
              <div className="text-muted small mt-1" style={{ fontSize: '0.72rem' }}>Fast response within 2 hours</div>
            </div>
          </div>

          {/* Store Location */}
          <div className="col-12 col-sm-6 col-lg-3">
            <div className="card border-0 shadow-sm p-4 h-100 bg-white rounded-4" style={{ border: '1px solid #F0E7ED' }}>
              <div
                className="rounded-circle d-flex align-items-center justify-content-center mb-3"
                style={{ width: '44px', height: '44px', backgroundColor: '#F0FDF4', color: '#19B927' }}
              >
                <MapPin size={22} />
              </div>
              <h6 className="fw-bold text-dark mb-1">Flagship Store</h6>
              <div className="fw-semibold small text-dark mb-1">AARADHYA KANCHI SILKS</div>
              <div className="text-secondary small">KPHB Colony, Hyderabad</div>
              <a
                href="https://share.google/d6NkzFRJkiSUfGle4"
                target="_blank"
                rel="noopener noreferrer"
                className="text-success small fw-semibold text-decoration-none d-inline-flex align-items-center gap-1 mt-1"
                style={{ fontSize: '0.75rem' }}
              >
                <span>View Google Map</span> <ExternalLink size={12} />
              </a>
            </div>
          </div>

          {/* Official Social Media */}
          <div className="col-12 col-sm-6 col-lg-3">
            <div className="card border-0 shadow-sm p-4 h-100 bg-white rounded-4" style={{ border: '1px solid #F0E7ED' }}>
              <div
                className="rounded-circle d-flex align-items-center justify-content-center mb-3"
                style={{ width: '44px', height: '44px', backgroundColor: '#FEF9C3', color: '#CA8A04' }}
              >
                <InstagramIcon size={22} />
              </div>
              <h6 className="fw-bold text-dark mb-1">Official Instagram</h6>
              <a
                href="https://www.instagram.com/aaradhya_silks_kphb?vrfl=MWQ4OG5lNnFpY3Bzbg=="
                target="_blank"
                rel="noopener noreferrer"
                className="text-decoration-none small fw-semibold d-block text-truncate mb-1"
                style={{ color: '#E90064', fontSize: '0.78rem' }}
              >
                @aaradhya_silks_kphb
              </a>
              <a
                href="https://www.instagram.com/aaradhya_fabrics?xtok=cTN3aXVtZnFnY2ls"
                target="_blank"
                rel="noopener noreferrer"
                className="text-decoration-none small fw-semibold d-block text-truncate"
                style={{ color: '#087CE5', fontSize: '0.78rem' }}
              >
                @aaradhya_fabrics
              </a>
              <div className="text-muted small mt-1" style={{ fontSize: '0.72rem' }}>Live shows & daily drops</div>
            </div>
          </div>
        </div>

        {/* 3. Inquiry Form & Store Location Card */}
        <div className="row g-4">
          {/* Left: Message Inquiry Form */}
          <div className="col-lg-7">
            <div className="card border-0 shadow-sm p-4 p-md-5 rounded-4 bg-white" style={{ border: '1px solid #F0E7ED' }}>
              <div className="d-flex align-items-center gap-2 mb-2">
                <MessageSquare size={20} style={{ color: '#E90064' }} />
                <h4 className="fw-bolder mb-0 text-dark">Send us a Message</h4>
              </div>
              <p className="text-secondary small mb-4">
                Fill in the details below and our customer service specialist will connect with you promptly.
              </p>

              {submitted ? (
                <div className="alert alert-success rounded-3 p-4 d-flex align-items-center gap-3">
                  <CheckCircle2 size={32} className="text-success flex-shrink-0" />
                  <div>
                    <h6 className="fw-bold mb-1">Thank you for contacting Aaradhya!</h6>
                    <p className="small mb-0 text-muted">
                      Your message has been received. Our team will get back to you within 2 hours.
                    </p>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSubmit}>
                  <div className="row g-3">
                    <div className="col-md-6">
                      <label className="form-label small fw-semibold text-dark">Your Name *</label>
                      <input
                        type="text"
                        className="form-control rounded-3"
                        placeholder="e.g. Ananya Sharma"
                        required
                        value={form.name}
                        onChange={(e) => setForm({ ...form, name: e.target.value })}
                      />
                    </div>

                    <div className="col-md-6">
                      <label className="form-label small fw-semibold text-dark">Email Address *</label>
                      <input
                        type="email"
                        className="form-control rounded-3"
                        placeholder="e.g. ananya@example.com"
                        required
                        value={form.email}
                        onChange={(e) => setForm({ ...form, email: e.target.value })}
                      />
                    </div>

                    <div className="col-md-6">
                      <label className="form-label small fw-semibold text-dark">Phone Number</label>
                      <input
                        type="tel"
                        className="form-control rounded-3"
                        placeholder="e.g. +91 98765 43210"
                        value={form.phone}
                        onChange={(e) => setForm({ ...form, phone: e.target.value })}
                      />
                    </div>

                    <div className="col-md-6">
                      <label className="form-label small fw-semibold text-dark">Subject</label>
                      <input
                        type="text"
                        className="form-control rounded-3"
                        placeholder="e.g. Saree Inquiry / Fabric meterage"
                        value={form.subject}
                        onChange={(e) => setForm({ ...form, subject: e.target.value })}
                      />
                    </div>

                    <div className="col-12">
                      <label className="form-label small fw-semibold text-dark">Message *</label>
                      <textarea
                        className="form-control rounded-3"
                        rows={4}
                        placeholder="Tell us what you're looking for or how we can help you..."
                        required
                        value={form.message}
                        onChange={(e) => setForm({ ...form, message: e.target.value })}
                      />
                    </div>

                    <div className="col-12 mt-4">
                      <button
                        type="submit"
                        className="btn px-4 py-2.5 rounded-pill fw-semibold text-white d-inline-flex align-items-center gap-2 shadow-sm"
                        style={{ backgroundColor: '#E90064', borderColor: '#E90064' }}
                      >
                        <Send size={16} />
                        <span>Send Message</span>
                      </button>
                    </div>
                  </div>
                </form>
              )}
            </div>
          </div>

          {/* Right: Visit Our Flagship Store & Map Link */}
          <div className="col-lg-5">
            <div className="card border-0 shadow-sm p-4 p-md-5 rounded-4 bg-white h-100" style={{ border: '1px solid #F0E7ED' }}>
              <div className="d-flex align-items-center gap-2 mb-2">
                <MapPin size={20} style={{ color: '#19B927' }} />
                <h4 className="fw-bolder mb-0 text-dark">Visit Our Store</h4>
              </div>
              <p className="text-secondary small mb-4">
                Immerse yourself in thousands of pure silk sarees, exclusive wedding sets, and vibrant handloom fabrics.
              </p>

              <div className="p-3 rounded-3 mb-4" style={{ backgroundColor: '#FFFCFE', border: '1px solid #F0E7ED' }}>
                <h6 className="fw-bold mb-1" style={{ color: '#E90064' }}>AARADHYA KANCHI SILKS</h6>
                <p className="small text-secondary mb-2">
                  Road No. 1, KPHB Colony, Kukatpally, Hyderabad, Telangana – 500072
                </p>
                <div className="d-flex align-items-center gap-2 text-muted small">
                  <Clock size={14} />
                  <span>Open 7 Days: 10:00 AM – 9:30 PM</span>
                </div>
              </div>

              {/* Direct Google Maps Action Card */}
              <div className="card border-0 rounded-4 overflow-hidden shadow-sm mb-4" style={{ backgroundColor: '#17233B', color: '#FFFFFF' }}>
                <div className="p-4">
                  <div className="d-flex align-items-center justify-content-between mb-2">
                    <span className="badge" style={{ backgroundColor: '#B8E000', color: '#17233B' }}>
                      GOOGLE MAPS NAVIGATION
                    </span>
                    <MapPin size={18} style={{ color: '#B8E000' }} />
                  </div>
                  <h6 className="fw-bold text-white mb-2">Find Aaradhya Kanchi Silks on Google Maps</h6>
                  <p className="small text-light opacity-80 mb-3">
                    One-click live GPS directions right to our store entrance with dedicated customer parking.
                  </p>
                  <a
                    href="https://share.google/d6NkzFRJkiSUfGle4"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-sm rounded-pill px-3 py-2 fw-semibold text-white d-inline-flex align-items-center gap-2 w-100 justify-content-center shadow-sm"
                    style={{ backgroundColor: '#E90064' }}
                  >
                    <span>Open in Google Maps</span>
                    <ExternalLink size={14} />
                  </a>
                </div>
              </div>

              {/* Social Channels Callout */}
              <div>
                <h6 className="fw-bold small text-dark mb-2">Follow Us on Instagram</h6>
                <div className="d-flex flex-column gap-2">
                  <a
                    href="https://www.instagram.com/aaradhya_silks_kphb?vrfl=MWQ4OG5lNnFpY3Bzbg=="
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-light btn-sm text-start border rounded-3 p-2 d-flex justify-content-between align-items-center text-decoration-none text-dark"
                  >
                    <span className="fw-semibold small d-inline-flex align-items-center gap-1.5">
                      <AnimatedFaIcon icon={FaGem} size={13} color="#E90064" animation="pulse" />
                      <span>Aaradhya Silks KPHB</span>
                    </span>
                    <ExternalLink size={14} className="text-muted" />
                  </a>
                  <a
                    href="https://www.instagram.com/aaradhya_fabrics?xtok=cTN3aXVtZnFnY2ls"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-light btn-sm text-start border rounded-3 p-2 d-flex justify-content-between align-items-center text-decoration-none text-dark"
                  >
                    <span className="fw-semibold small d-inline-flex align-items-center gap-1.5">
                      <AnimatedFaIcon icon={FaScroll} size={13} color="#19B927" animation="float" />
                      <span>Aaradhya Fabrics</span>
                    </span>
                    <ExternalLink size={14} className="text-muted" />
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactPage;
