import React from 'react';
import { Link } from 'react-router-dom';
import {
  ShieldCheck,
  Truck,
  RotateCcw,
  Sparkles,
  ArrowRight,
  Heart,
  Award,
  Layers,
  MapPin,
  ExternalLink,
  CheckCircle2,
} from 'lucide-react';

const AboutPage = () => {
  const stats = [
    { label: 'Years of Heritage', value: '25+' },
    { label: 'Happy Families Dressed', value: '100,000+' },
    { label: 'Handcrafted Designs', value: '5,000+' },
    { label: 'Silk Mark Authenticity', value: '100%' },
  ];

  const pillars = [
    {
      icon: Award,
      title: 'Silk Mark Certified Purity',
      desc: 'Every Kanjeevaram and Banarasi silk saree is authorized with genuine Silk Mark India certification, guaranteeing pure mulberry silk and authentic zari work.',
    },
    {
      icon: Layers,
      title: 'Master Artisan Weaving',
      desc: 'We work directly with traditional handloom weavers across Kanchipuram, Varanasi, Chanderi, and Pochampally to sustain timeless heritage crafts.',
    },
    {
      icon: Sparkles,
      title: 'Artisan Running Fabrics',
      desc: 'Explore India’s richest repository of unstitched dress materials, pure linen, organza, raw silk, and embroidered fabrics for bespoke tailoring.',
    },
    {
      icon: ShieldCheck,
      title: 'Zero-Middleman Value',
      desc: 'By sourcing directly from master artisans, we bring you bridal silks, celebratory kurtis, and designer fabrics at honest, uninflated prices.',
    },
  ];

  return (
    <div className="bg-white pb-5">
      {/* 1. Hero Section in Aaradhya Navy & Magenta */}
      <section
        className="py-5 text-white position-relative overflow-hidden"
        style={{
          background: 'linear-gradient(135deg, #17233B 0%, #1e2e4d 60%, #E90064 100%)',
        }}
      >
        <div className="container py-4 text-center">
          <span
            className="badge px-3 py-1.5 rounded-pill mb-3 fw-bold text-uppercase"
            style={{ backgroundColor: 'rgba(255, 255, 255, 0.15)', color: '#B8E000', fontSize: '0.78rem', letterSpacing: '0.08em' }}
          >
            <Sparkles size={13} className="me-1" /> The Aaradhya Legacy
          </span>
          <h1 className="display-4 fw-bolder mb-3" style={{ letterSpacing: '-0.8px', lineHeight: 1.15 }}>
            Celebrating Handwoven Silks & <br className="d-none d-md-block" />
            <span style={{ color: '#B8E000' }}>Artisan Designer Fabrics</span>
          </h1>
          <p className="lead text-light opacity-90 mx-auto mb-4" style={{ maxWidth: '680px', fontSize: '1.05rem', lineHeight: 1.6 }}>
            Aaradhya brings together centuries of Indian textile artistry with contemporary fashion, dressing weddings, celebrations, and everyday moments with unparalleled elegance.
          </p>
          <div className="d-flex justify-content-center gap-3 flex-wrap">
            <Link
              to="/products"
              className="btn px-4 py-2.5 rounded-pill fw-semibold text-white shadow-sm"
              style={{ backgroundColor: '#E90064', borderColor: '#E90064' }}
            >
              Explore Collection <ArrowRight size={16} className="ms-1" />
            </Link>
            <a
              href="https://share.google/d6NkzFRJkiSUfGle4"
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-outline-light px-4 py-2.5 rounded-pill fw-semibold d-inline-flex align-items-center gap-1.5"
            >
              <MapPin size={16} /> Visit Our Boutique
            </a>
          </div>
        </div>
      </section>

      {/* 2. Key Stats Bar */}
      <section className="container mt-n4 position-relative" style={{ marginTop: '-32px', zIndex: 10 }}>
        <div className="card border-0 shadow-lg p-4 rounded-4 bg-white" style={{ border: '1px solid #F0E7ED' }}>
          <div className="row g-3 text-center">
            {stats.map((s, idx) => (
              <div key={idx} className="col-6 col-md-3">
                <div className="fs-2 fw-bolder" style={{ color: '#E90064', letterSpacing: '-0.5px' }}>
                  {s.value}
                </div>
                <div className="text-secondary small fw-semibold">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 3. Our Story Section */}
      <section className="container py-5 my-3">
        <div className="row align-items-center g-5">
          <div className="col-lg-6">
            <span className="small text-uppercase fw-bold" style={{ color: '#19B927', letterSpacing: '0.1em' }}>
              OUR HERITAGE
            </span>
            <h2 className="display-6 fw-bolder mb-3 text-dark" style={{ color: '#17233B', lineHeight: 1.2 }}>
              A Symphony of Pure Silk & Creative Craftsmanship
            </h2>
            <p className="text-secondary" style={{ lineHeight: 1.7, fontSize: '0.96rem' }}>
              Founded with a passion for authentic Indian textiles, <strong>AARADHYA – Sarees & Silks</strong> curates the finest bridal weaves, heirloom silk sarees, and premium unstitched dress materials from handloom clusters across India.
            </p>
            <p className="text-secondary" style={{ lineHeight: 1.7, fontSize: '0.96rem' }}>
              Whether you are looking for an exquisite royal Kanjeevaram silk saree for your wedding day, contemporary festive kurtis, or unstitched running fabrics for a bespoke couture outfit, Aaradhya brings your style vision to life with timeless craftsmanship.
            </p>

            <div className="d-flex flex-column gap-2 mt-4">
              <div className="d-flex align-items-center gap-2">
                <CheckCircle2 size={18} style={{ color: '#19B927' }} />
                <span className="small fw-semibold text-dark">Silk Mark India certified pure silks</span>
              </div>
              <div className="d-flex align-items-center gap-2">
                <CheckCircle2 size={18} style={{ color: '#19B927' }} />
                <span className="small fw-semibold text-dark">Over 1,000+ vibrant colour palettes in unstitched fabrics</span>
              </div>
              <div className="d-flex align-items-center gap-2">
                <CheckCircle2 size={18} style={{ color: '#19B927' }} />
                <span className="small fw-semibold text-dark">Customized meterage cutting and pan-India safe dispatch</span>
              </div>
            </div>
          </div>

          <div className="col-lg-6">
            <div className="row g-3">
              <div className="col-6">
                <img
                  src="https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=600&auto=format&fit=crop&q=80"
                  alt="Aaradhya Silk Sarees"
                  className="img-fluid rounded-4 shadow-sm w-100"
                  style={{ height: '260px', objectFit: 'cover' }}
                />
              </div>
              <div className="col-6">
                <img
                  src="https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=600&auto=format&fit=crop&q=80"
                  alt="Aaradhya Designer Fabrics"
                  className="img-fluid rounded-4 shadow-sm w-100"
                  style={{ height: '260px', objectFit: 'cover' }}
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Pillars of Excellence */}
      <section className="py-5" style={{ backgroundColor: '#FFFCFE', borderTop: '1px solid #F0E7ED', borderBottom: '1px solid #F0E7ED' }}>
        <div className="container">
          <div className="text-center mb-5">
            <span className="small text-uppercase fw-bold" style={{ color: '#E90064', letterSpacing: '0.1em' }}>
              WHY CHOOSE AARADHYA
            </span>
            <h2 className="display-6 fw-bolder text-dark" style={{ color: '#17233B' }}>
              Crafted with Integrity, Worn with Pride
            </h2>
          </div>

          <div className="row g-4">
            {pillars.map((p, idx) => {
              const IconComp = p.icon;
              return (
                <div key={idx} className="col-12 col-md-6 col-lg-3">
                  <div className="card border-0 shadow-sm rounded-4 p-4 h-100 bg-white" style={{ border: '1px solid #F0E7ED' }}>
                    <div
                      className="rounded-circle d-flex align-items-center justify-content-center mb-3"
                      style={{ width: '48px', height: '48px', backgroundColor: 'rgba(233, 0, 100, 0.1)', color: '#E90064' }}
                    >
                      <IconComp size={24} />
                    </div>
                    <h5 className="fw-bold text-dark mb-2" style={{ fontSize: '1.05rem' }}>{p.title}</h5>
                    <p className="text-secondary small mb-0" style={{ lineHeight: 1.6 }}>{p.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 5. Official Social Media & Location Hub */}
      <section className="container py-5">
        <div className="card border-0 rounded-4 p-4 p-md-5 text-white shadow" style={{ backgroundColor: '#17233B' }}>
          <div className="row align-items-center g-4">
            <div className="col-lg-7">
              <span className="badge px-3 py-1.5 rounded-pill mb-2 fw-bold text-uppercase" style={{ backgroundColor: '#B8E000', color: '#17233B', fontSize: '0.72rem' }}>
                CONNECT WITH US
              </span>
              <h2 className="display-6 fw-bolder mb-3">Join the Aaradhya Community</h2>
              <p className="text-light opacity-80 small mb-4" style={{ maxWidth: '500px', lineHeight: 1.6 }}>
                Follow our official Instagram pages for live saree showcases, new fabric unboxings, festive styling inspirations, and exclusive bridal customer reviews.
              </p>

              <div className="d-flex flex-wrap gap-3">
                {/* Silks Instagram */}
                <a
                  href="https://www.instagram.com/aaradhya_silks_kphb?vrfl=MWQ4OG5lNnFpY3Bzbg=="
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn px-4 py-2.5 rounded-pill fw-semibold text-white d-inline-flex align-items-center gap-2 shadow-sm"
                  style={{ backgroundColor: '#E90064' }}
                >
                  <span>@aaradhya_silks_kphb</span>
                  <ExternalLink size={15} />
                </a>

                {/* Fabrics Instagram */}
                <a
                  href="https://www.instagram.com/aaradhya_fabrics?xtok=cTN3aXVtZnFnY2ls"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-outline-light px-4 py-2.5 rounded-pill fw-semibold d-inline-flex align-items-center gap-2"
                >
                  <span>@aaradhya_fabrics</span>
                  <ExternalLink size={15} />
                </a>

                {/* Google Maps Store Link */}
                <a
                  href="https://share.google/d6NkzFRJkiSUfGle4"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn px-4 py-2.5 rounded-pill fw-semibold text-dark d-inline-flex align-items-center gap-2 shadow-sm"
                  style={{ backgroundColor: '#B8E000' }}
                >
                  <MapPin size={15} />
                  <span>AARADHYA KANCHI SILKS (Google Maps)</span>
                </a>
              </div>
            </div>

            <div className="col-lg-5 text-center">
              <div className="p-3 bg-white rounded-4 shadow-sm text-dark d-inline-block w-100" style={{ maxWidth: '340px' }}>
                <img
                  src="/logo.jpeg"
                  alt="Aaradhya"
                  className="rounded-3 mb-2"
                  style={{ height: '60px', width: 'auto', objectFit: 'contain' }}
                />
                <h5 className="fw-bolder mb-1" style={{ color: '#E90064' }}>AARADHYA</h5>
                <span className="small text-muted fw-bold d-block mb-3">SAREES & SILKS</span>
                <p className="small text-secondary mb-3">
                  Visit our flagship boutique in KPHB Colony, Hyderabad and experience pure handloom textiles firsthand.
                </p>
                <Link to="/contact" className="btn btn-dark btn-sm rounded-pill px-4 py-1.5 w-100 fw-semibold">
                  Contact Customer Care
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default AboutPage;
