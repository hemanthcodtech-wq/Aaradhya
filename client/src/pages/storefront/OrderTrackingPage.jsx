import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import {
  Truck,
  Search,
  CheckCircle2,
  Clock,
  Package,
  MapPin,
  Calendar,
  AlertCircle,
} from 'lucide-react';
import axiosClient from '../../api/axiosClient';

const OrderTrackingPage = () => {
  const [searchParams] = useSearchParams();
  const initialAwb = searchParams.get('awb') || 'SR789210456IN';

  const [trackingNumber, setTrackingNumber] = useState(initialAwb);
  const [trackingData, setTrackingData] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchTracking = async (code) => {
    if (!code) return;
    setLoading(true);
    try {
      const res = await axiosClient.get(`/shipping/track/${code}`);
      if (res.success) {
        setTrackingData(res.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTracking(initialAwb);
  }, [initialAwb]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (trackingNumber.trim()) {
      fetchTracking(trackingNumber.trim());
    }
  };

  return (
    <div className="container py-4">
      <div className="card card-modern p-4 mb-4 text-center mx-auto" style={{ maxWidth: '640px' }}>
        <h4 className="fw-bold mb-2">Track Your Shipment</h4>
        <p className="text-muted small mb-3">
          Enter your Order Number or Shiprocket AWB Tracking ID to see real-time updates.
        </p>

        <form onSubmit={handleSearch} className="d-flex gap-2">
          <input
            type="text"
            className="form-control"
            placeholder="e.g. SR789210456IN or ORD-589432"
            value={trackingNumber}
            onChange={(e) => setTrackingNumber(e.target.value)}
          />
          <button type="submit" className="btn btn-emerald px-4 d-flex align-items-center gap-2" disabled={loading}>
            <Search size={16} /> Track
          </button>
        </form>
      </div>

      {loading && (
        <div className="text-center py-4">
          <div className="spinner-border text-success" role="status"></div>
          <p className="small text-muted mt-2">Connecting to Shiprocket Tracking API...</p>
        </div>
      )}

      {trackingData && (
        <div className="card card-modern p-4 mx-auto" style={{ maxWidth: '780px' }}>
          <div className="d-flex flex-wrap justify-content-between align-items-center border-bottom pb-3 mb-4 gap-2">
            <div>
              <span className="badge bg-light text-muted border mb-1">
                AWB Tracking #{trackingData.awb}
              </span>
              <h5 className="fw-bold mb-0 text-success d-flex align-items-center gap-2">
                <Truck size={20} /> Status: {trackingData.currentStatus}
              </h5>
            </div>
            <div className="text-md-end small">
              <div className="text-muted">Courier Partner:</div>
              <strong className="text-dark">{trackingData.courier}</strong>
              <div className="text-muted mt-1">Expected Delivery: <strong>{trackingData.expectedDelivery}</strong></div>
            </div>
          </div>

          {/* Visual Milestone Progress */}
          <div className="position-relative my-4 px-2">
            <div className="d-flex justify-content-between text-center small position-relative z-1">
              <div className="d-flex flex-column align-items-center" style={{ width: '20%' }}>
                <div className="rounded-circle bg-success text-white p-2 mb-1 shadow-sm">
                  <CheckCircle2 size={16} />
                </div>
                <span className="fw-bold">Ordered</span>
              </div>
              <div className="d-flex flex-column align-items-center" style={{ width: '20%' }}>
                <div className="rounded-circle bg-success text-white p-2 mb-1 shadow-sm">
                  <Package size={16} />
                </div>
                <span className="fw-bold">Packed</span>
              </div>
              <div className="d-flex flex-column align-items-center" style={{ width: '20%' }}>
                <div className="rounded-circle bg-success text-white p-2 mb-1 shadow-sm">
                  <Truck size={16} />
                </div>
                <span className="fw-bold">Shipped</span>
              </div>
              <div className="d-flex flex-column align-items-center" style={{ width: '20%' }}>
                <div className="rounded-circle bg-warning text-white p-2 mb-1 shadow-sm">
                  <Clock size={16} />
                </div>
                <span className="fw-bold text-warning">Out for Delivery</span>
              </div>
              <div className="d-flex flex-column align-items-center" style={{ width: '20%' }}>
                <div className="rounded-circle bg-light text-muted p-2 mb-1 border">
                  <MapPin size={16} />
                </div>
                <span className="text-muted">Delivered</span>
              </div>
            </div>
          </div>

          {/* Detailed Timeline Events */}
          <h6 className="fw-bold mb-3 border-top pt-3">Transit Activity Log</h6>
          <div className="d-flex flex-column gap-3">
            {trackingData.events?.map((ev, i) => (
              <div key={i} className="d-flex gap-3 align-items-start">
                <div className="rounded-circle bg-light border p-2 mt-1">
                  <CheckCircle2 size={14} className="text-success" />
                </div>
                <div className="flex-grow-1">
                  <div className="fw-semibold small text-dark">{ev.status}</div>
                  <div className="text-muted small">{ev.location}</div>
                  <div className="text-muted" style={{ fontSize: '0.75rem' }}>
                    {new Date(ev.timestamp).toLocaleString()}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderTrackingPage;

