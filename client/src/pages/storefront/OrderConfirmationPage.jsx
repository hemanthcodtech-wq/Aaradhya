import React from 'react';
import { useParams, useLocation, Link } from 'react-router-dom';
import { CheckCircle, Truck, Package, ArrowRight, Printer } from 'lucide-react';

const OrderConfirmationPage = () => {
  const { orderNumber } = useParams();
  const location = useLocation();
  const order = location.state?.order;

  return (
    <div className="container py-5">
      <div className="card card-modern p-4 p-md-5 mx-auto text-center" style={{ maxWidth: '680px' }}>
        <div
          className="rounded-circle d-flex align-items-center justify-content-center mx-auto mb-3"
          style={{ width: '80px', height: '80px', backgroundColor: 'var(--light-green)', color: 'var(--primary)' }}
        >
          <CheckCircle size={48} />
        </div>

        <h2 className="fw-bold mb-2">Order Confirmed!</h2>
        <p className="text-muted mb-4">
          Thank you for shopping with us! Your order <strong>#{orderNumber}</strong> has been received and is now being packed by our verified merchants.
        </p>

        <div className="p-3 bg-light rounded-3 text-start mb-4 border">
          <div className="row g-2 small">
            <div className="col-6">
              <span className="text-muted d-block">Order Number:</span>
              <strong className="text-dark">#{orderNumber}</strong>
            </div>
            <div className="col-6">
              <span className="text-muted d-block">Payment Method:</span>
              <strong className="text-dark text-uppercase">{order?.paymentMethod || 'Razorpay Online'}</strong>
            </div>
            <div className="col-6">
              <span className="text-muted d-block">Estimated Delivery:</span>
              <strong className="text-success">Within 2 - 4 Business Days</strong>
            </div>
            <div className="col-6">
              <span className="text-muted d-block">Delivery Courier:</span>
              <strong>Shiprocket Express Logistics</strong>
            </div>
          </div>
        </div>

        <div className="d-flex flex-wrap justify-content-center gap-3">
          <Link to={`/orders/track?awb=${orderNumber}`} className="btn btn-emerald px-4 py-2 d-flex align-items-center gap-2">
            <Truck size={18} /> Track Delivery Status
          </Link>
          <Link to="/customer/orders" className="btn btn-outline-secondary px-4 py-2">
            View All My Orders
          </Link>
          <Link to="/" className="btn btn-light border px-4 py-2">
            Continue Shopping
          </Link>
        </div>
      </div>
    </div>
  );
};

export default OrderConfirmationPage;

