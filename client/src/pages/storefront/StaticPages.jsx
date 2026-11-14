import React, { useState } from 'react';
import { Mail, Phone, MapPin, CheckCircle, Send } from 'lucide-react';

export const AboutUsPage = () => (
  <div className="container py-5">
    <div className="card card-modern p-4 p-md-5 mx-auto" style={{ maxWidth: '850px' }}>
      <h2 className="fw-bold mb-3 text-dark">About ShopMart Multi-Vendor</h2>
      <p className="lead text-muted mb-4">
        Connecting authentic manufacturers, premier brands, and neighborhood retail store owners with millions of digital consumers across India.
      </p>
      <div className="border-top pt-3 text-secondary d-flex flex-column gap-3">
        <p>
          Founded in 2026, ShopMart is engineered on modern architecture integrating omnichannel commerce: unifying digital customer storefronts, independent merchant vendor management, and offline point-of-sale (POS) store billing with synchronized real-time inventory.
        </p>
        <p>
          Our mission is to empower both online sellers and offline store managers with automated logistics via Shiprocket, instant digital settlements with Razorpay, and enterprise-grade stock concurrency controls.
        </p>
      </div>
    </div>
  </div>
);

export const ContactUsPage = () => {
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
    setForm({ name: '', email: '', subject: '', message: '' });
  };

  return (
    <div className="container py-5">
      <div className="row g-4 justify-content-center">
        <div className="col-lg-5">
          <div className="card card-modern p-4 h-100">
            <h4 className="fw-bold mb-3">Get in Touch</h4>
            <p className="text-muted small mb-4">Have questions about an order, seller onboarding, or store POS?</p>

            <div className="d-flex flex-column gap-3 small">
              <div className="d-flex align-items-center gap-3">
                <div className="rounded-circle bg-light p-2 text-success"><Phone size={18} /></div>
                <div>
                  <div className="fw-bold">Helpline (Toll-Free)</div>
                  <div className="text-muted">+91 98765 43210 (9 AM - 9 PM)</div>
                </div>
              </div>

              <div className="d-flex align-items-center gap-3">
                <div className="rounded-circle bg-light p-2 text-success"><Mail size={18} /></div>
                <div>
                  <div className="fw-bold">Email Support</div>
                  <div className="text-muted">support@shopmart.com</div>
                </div>
              </div>

              <div className="d-flex align-items-center gap-3">
                <div className="rounded-circle bg-light p-2 text-success"><MapPin size={18} /></div>
                <div>
                  <div className="fw-bold">Headquarters</div>
                  <div className="text-muted">Tower 4, Tech Boulevard, Sector 127, Noida, Uttar Pradesh, India</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="col-lg-6">
          <div className="card card-modern p-4">
            <h4 className="fw-bold mb-3">Send Us a Message</h4>
            {submitted ? (
              <div className="alert alert-success d-flex align-items-center gap-2 py-3">
                <CheckCircle size={20} />
                <span>Thank you! We have received your inquiry and our team will get back to you within 24 hours.</span>
              </div>
            ) : (
              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label className="form-label small fw-semibold">Your Name *</label>
                  <input
                    type="text"
                    className="form-control"
                    required
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label small fw-semibold">Email Address *</label>
                  <input
                    type="email"
                    className="form-control"
                    required
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label small fw-semibold">Subject</label>
                  <input
                    type="text"
                    className="form-control"
                    value={form.subject}
                    onChange={(e) => setForm({ ...form, subject: e.target.value })}
                  />
                </div>
                <div className="mb-4">
                  <label className="form-label small fw-semibold">Message *</label>
                  <textarea
                    className="form-control"
                    rows="4"
                    required
                    value={form.message}
                    onChange={(e) => setForm({ ...form, message: e.target.value })}
                  ></textarea>
                </div>
                <button type="submit" className="btn btn-emerald px-4 py-2 fw-semibold d-flex align-items-center gap-2">
                  <Send size={16} /> Send Message
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export const PoliciesPage = ({ title, type }) => (
  <div className="container py-5">
    <div className="card card-modern p-4 p-md-5 mx-auto" style={{ maxWidth: '850px' }}>
      <h3 className="fw-bold mb-3 text-dark">{title}</h3>
      <div className="text-secondary small d-flex flex-column gap-3 border-top pt-3">
        <p>
          At ShopMart Multi-Vendor, we take customer satisfaction, data security, and fair merchant trade very seriously.
        </p>
        <h6>1. Returns & Replacement Policy</h6>
        <p>
          Customers can request a replacement or full refund within 7 days of package delivery for eligible products in their original packaging with barcode tags intact.
        </p>
        <h6>2. Security & Payments</h6>
        <p>
          All electronic transactions are processed through Razorpay's PCI-DSS compliant secure payment gateway. We never store credit card CVVs or net banking passwords.
        </p>
        <h6>3. Shipping & Delivery Commitments</h6>
        <p>
          Deliveries are managed through Shiprocket's tier-1 courier network (BlueDart, Delhivery, Express). Orders above ₹999 qualify for standard free delivery.
        </p>
      </div>
    </div>
  </div>
);

