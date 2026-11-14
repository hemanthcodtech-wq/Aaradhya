import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Store, Star, ShieldCheck, MapPin, Mail, Phone, Package } from 'lucide-react';
import ProductCard from '../../components/common/ProductCard';
import axiosClient from '../../api/axiosClient';

const VendorStorePage = () => {
  const { slug } = useParams();
  const [vendor, setVendor] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchVendorData = async () => {
      setLoading(true);
      try {
        // Fetch all vendors to find the match by slug
        const res = await axiosClient.get('/admin/vendors');
        if (res.success && res.data) {
          const matched = res.data.find((v) => v.slug === slug || v._id === slug) || res.data[0];
          setVendor(matched);

          if (matched) {
            const prodRes = await axiosClient.get(`/products?vendor=${matched._id}`);
            if (prodRes.success) {
              setProducts(prodRes.data);
            }
          }
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchVendorData();
  }, [slug]);

  if (loading) {
    return (
      <div className="container py-5 text-center">
        <div className="spinner-border text-success" role="status"></div>
        <p className="mt-2 text-muted">Loading vendor storefront...</p>
      </div>
    );
  }

  if (!vendor) {
    return (
      <div className="container py-5 text-center">
        <h4>Vendor Store Not Found</h4>
        <Link to="/" className="btn btn-emerald mt-2">
          Back to Home
        </Link>
      </div>
    );
  }

  return (
    <div className="container py-4">
      {/* Vendor Store Header Banner */}
      <div className="card card-modern overflow-hidden mb-4 border-0 shadow-sm">
        <div
          style={{
            height: '180px',
            backgroundImage: `url(${vendor.banner || 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=1200&auto=format&fit=crop&q=80'})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        ></div>

        <div className="p-4 bg-white position-relative">
          <div className="d-flex flex-column flex-md-row align-items-md-end justify-content-between gap-3" style={{ marginTop: '-60px' }}>
            <div className="d-flex align-items-end gap-3">
              <img
                src={vendor.logo || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=200&auto=format&fit=crop&q=80'}
                alt={vendor.storeName}
                className="rounded-4 border-4 border-white shadow bg-white"
                style={{ width: '100px', height: '100px', objectFit: 'cover' }}
              />
              <div className="mb-1">
                <div className="d-flex align-items-center gap-2">
                  <h3 className="fw-bold mb-0 text-dark">{vendor.storeName}</h3>
                  <span className="badge badge-emerald d-flex align-items-center gap-1">
                    <ShieldCheck size={14} /> Official Verified Merchant
                  </span>
                </div>
                <div className="d-flex align-items-center gap-2 small text-muted mt-1">
                  <span className="text-warning fw-bold d-flex align-items-center gap-1">
                    <Star size={14} fill="#f59e0b" /> {vendor.rating || 4.8}
                  </span>
                  <span>({vendor.reviewCount?.toLocaleString() || 4800}+ reviews)</span>
                  <span>•</span>
                  <span><MapPin size={12} /> {vendor.pickupAddress?.city || 'Delhi Hub'}, India</span>
                </div>
              </div>
            </div>

            <div className="d-flex gap-2">
              <span className="badge bg-light text-dark border p-2 small">
                {products.length} Products Listed
              </span>
            </div>
          </div>

          <p className="text-secondary small mt-3 mb-0" style={{ maxWidth: '750px' }}>
            {vendor.description}
          </p>
        </div>
      </div>

      {/* Vendor Catalog */}
      <div className="mb-4 d-flex justify-content-between align-items-center border-bottom pb-2">
        <h5 className="fw-bold mb-0 d-flex align-items-center gap-2">
          <Package size={20} className="text-success" /> Products from {vendor.storeName}
        </h5>
        <span className="small text-muted">{products.length} items available</span>
      </div>

      {products.length === 0 ? (
        <div className="card card-modern p-5 text-center text-muted">
          No products listed by this vendor at the moment.
        </div>
      ) : (
        <div className="row g-3 row-cols-1 row-cols-sm-2 row-cols-md-3 row-cols-lg-4">
          {products.map((p) => (
            <div key={p._id} className="col">
              <ProductCard product={p} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default VendorStorePage;

