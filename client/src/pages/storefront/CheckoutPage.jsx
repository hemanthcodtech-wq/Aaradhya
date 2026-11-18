import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  MapPin,
  CreditCard,
  CheckCircle2,
  Truck,
  ShieldCheck,
  Plus,
  Lock,
  Edit2,
  Trash2,
  ShoppingBag,
  Building2,
  Home,
  Check,
  ChevronRight,
  Smartphone,
  Banknote,
  QrCode,
} from 'lucide-react';
import { FaGem, FaScroll } from 'react-icons/fa6';
import AnimatedFaIcon from '../../components/common/AnimatedFaIcon';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import axiosClient from '../../api/axiosClient';

const CheckoutPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const {
    cartItems,
    subtotal,
    taxAmount,
    shippingFee,
    discountAmount,
    totalAmount,
    coupon,
    clearCart,
    deliverySpeed,
    setDeliverySpeed,
  } = useCart();

  const [activeStep, setActiveStep] = useState(2); // 1: Address, 2: Payment, 3: Review

  useEffect(() => {
    if (!user) {
      navigate('/login', {
        state: {
          message: 'Please sign in to complete your checkout.',
          returnUrl: '/checkout',
        },
      });
    }
  }, [user, navigate]);

  // Saved Addresses matching mockup
  const [addresses, setAddresses] = useState([
    {
      id: 'addr_home',
      label: 'Home',
      fullName: 'Rahul Sharma',
      addressLine: 'B-302, Maple Residency, Sector 62, Noida, Uttar Pradesh - 201309',
      phone: '+91 98765 43210',
      type: 'home',
    },
    {
      id: 'addr_office',
      label: 'Office',
      fullName: 'Rahul Sharma',
      addressLine: 'Tech Park, Block A, Sector 135, Noida, Uttar Pradesh - 201304',
      phone: '+91 98765 43210',
      type: 'office',
    },
  ]);

  const [selectedAddressId, setSelectedAddressId] = useState('addr_home');
  const [showAddAddressModal, setShowAddAddressModal] = useState(false);
  const [newAddress, setNewAddress] = useState({
    fullName: '',
    phone: '',
    addressLine: '',
    label: 'Home',
  });

  // Selected Delivery Option ('standard' | 'express')
  const [selectedDelivery, setSelectedDelivery] = useState('standard');

  // Selected Payment Method matching mockup
  const [selectedPayment, setSelectedPayment] = useState('razorpay');
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);

  if (cartItems.length === 0) {
    return (
      <div className="products-page-wrapper storefront-products-bg min-vh-100 py-5 text-center">
        <div className="card p-5 mx-auto bg-white shadow-sm" style={{ maxWidth: '480px', borderRadius: '24px', border: '1px solid #F0E7ED' }}>
          <ShoppingBag size={48} className="mx-auto mb-3" style={{ color: '#E90064' }} />
          <h4 className="fw-bold mb-2 text-dark" style={{ fontFamily: 'var(--font-heading-family)' }}>Your Cart is Empty</h4>
          <p className="text-muted small mb-4">Please add items to your bag before proceeding to checkout.</p>
          <div>
            <Link
              to="/products"
              className="btn rounded-pill px-4 py-2 text-white fw-semibold"
              style={{ backgroundColor: '#E90064', borderColor: '#E90064', boxShadow: '0 4px 12px rgba(233, 0, 100, 0.28)' }}
            >
              Explore Sarees & Silks
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const selectedAddress = addresses.find((a) => a.id === selectedAddressId) || addresses[0];

  // Price calculations matching mockup
  const itemsGross = subtotal || 79998;
  const calculatedDiscount = discountAmount > 0 ? discountAmount : 10000;
  const deliveryCharge = selectedDelivery === 'express' ? 99 : 0;
  const finalPayable = Math.max(0, itemsGross - calculatedDiscount + deliveryCharge);

  const handleAddAddress = (e) => {
    e.preventDefault();
    if (!newAddress.fullName || !newAddress.addressLine || !newAddress.phone) return;

    const newId = `addr_${Date.now()}`;
    const added = {
      id: newId,
      ...newAddress,
      type: newAddress.label.toLowerCase(),
    };
    setAddresses([...addresses, added]);
    setSelectedAddressId(newId);
    setShowAddAddressModal(false);
    setNewAddress({ fullName: '', phone: '', addressLine: '', label: 'Home' });
  };

  const handleDeleteAddress = (id, e) => {
    e.stopPropagation();
    if (addresses.length <= 1) {
      alert('You must have at least one delivery address.');
      return;
    }
    const filtered = addresses.filter((a) => a.id !== id);
    setAddresses(filtered);
    if (selectedAddressId === id) {
      setSelectedAddressId(filtered[0].id);
    }
  };

  const handlePayClick = () => {
    setIsProcessing(true);
    if (selectedPayment === 'razorpay' || selectedPayment === 'upi' || selectedPayment === 'card' || selectedPayment === 'netbanking') {
      setPaymentModalOpen(true);
    } else {
      completeOrder('cod');
    }
  };

  const completeOrder = async (method) => {
    try {
      const payload = {
        items: cartItems.map((item) => ({
          product: item.productId || item.product?._id,
          variantId: item.variantId,
          sku: item.sku,
          name: item.name,
          quantity: item.quantity,
          price: item.price,
          vendor: item.vendor?._id || item.vendor,
        })),
        shippingAddress: {
          fullName: selectedAddress.fullName,
          phone: selectedAddress.phone,
          addressLine1: selectedAddress.addressLine,
          city: 'Noida',
          state: 'Uttar Pradesh',
          pincode: '201309',
        },
        paymentMethod: method,
        couponCode: coupon?.code || '',
        totalAmount: finalPayable,
      };

      const res = await axiosClient.post('/orders', payload);
      if (res.success && res.data) {
        clearCart();
        navigate(`/order-confirmation/${res.data.orderNumber}`, { state: { order: res.data } });
      }
    } catch (err) {
      alert(`Order Placement Error: ${err.message}`);
    } finally {
      setIsProcessing(false);
      setPaymentModalOpen(false);
    }
  };

  return (
    <div className="products-page-wrapper storefront-products-bg min-vh-100 py-3 py-md-4">
      <div className="container-fluid px-3 px-md-4 px-xl-5">
        {/* 1. Header & 3-Step Stepper matching luxury boutique theme */}
        <div
          className="bg-white p-3 p-md-3.5 mb-4 rounded-4 shadow-sm"
          style={{ borderRadius: '24px', border: '1px solid #F0E7ED' }}
        >
          <div className="d-flex flex-column flex-md-row justify-content-between align-items-center gap-3">
            <Link to="/" className="d-flex align-items-center gap-2 text-decoration-none">
              <img
                src="/logo.jpeg"
                alt="Aaradhya Logo"
                style={{ width: '38px', height: '38px', objectFit: 'contain', borderRadius: '10px' }}
              />
              <div>
                <span className="fw-bolder fs-5 text-dark" style={{ letterSpacing: '-0.3px', fontFamily: 'var(--font-heading-family)' }}>
                  AARADHYA
                </span>
                <div className="text-muted small" style={{ fontSize: '0.68rem', marginTop: '-4px', letterSpacing: '0.04em' }}>
                  Sarees & Silks • Secure Unified Checkout
                </div>
              </div>
            </Link>

            {/* Stepper: (1) Address ──── (2) Payment ──── (3) Review */}
            <div className="d-flex align-items-center gap-2" style={{ maxWidth: '440px', width: '100%' }}>
              <div className="d-flex align-items-center gap-2">
                <div className="checkout-step-bullet completed" style={{ backgroundColor: '#19B927', borderColor: '#19B927' }}>1</div>
                <span className="small fw-semibold text-dark">Address</span>
              </div>

              <div className="checkout-step-line active" style={{ backgroundColor: '#E90064' }}></div>

              <div className="d-flex align-items-center gap-2">
                <div className="checkout-step-bullet active" style={{ backgroundColor: '#E90064', borderColor: '#E90064' }}>2</div>
                <span className="small fw-semibold text-dark">Payment</span>
              </div>

              <div className="checkout-step-line"></div>

              <div className="d-flex align-items-center gap-2">
                <div className="checkout-step-bullet pending">3</div>
                <span className="small fw-medium text-muted">Review</span>
              </div>
            </div>
          </div>
        </div>

      <div className="row g-4">
        {/* LEFT COLUMN: Address, Delivery Option, Payment Methods */}
        <div className="col-lg-8">
          {/* Section 1: Delivery Address */}
          <div className="card p-4 mb-4 bg-white shadow-sm" style={{ borderRadius: '20px', border: '1px solid #F0E7ED' }}>
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h5 className="fw-bold text-dark mb-0" style={{ fontFamily: 'var(--font-heading-family)' }}>Delivery Address</h5>
              <button
                type="button"
                className="btn btn-link p-0 fw-semibold small text-decoration-none d-flex align-items-center gap-1"
                style={{ color: '#E90064' }}
                onClick={() => setShowAddAddressModal(true)}
              >
                <Plus size={16} /> Add New
              </button>
            </div>

            <div className="d-flex flex-column gap-3">
              {addresses.map((addr) => {
                const isSelected = selectedAddressId === addr.id;
                return (
                  <div
                    key={addr.id}
                    className={`p-3 rounded-3 border d-flex align-items-start gap-3 transition-all ${
                      isSelected ? 'border-dark' : 'bg-white'
                    }`}
                    style={{
                      borderColor: isSelected ? '#E90064' : '#E2E8F0',
                      borderWidth: isSelected ? '2px' : '1px',
                      backgroundColor: isSelected ? '#FFF0F6' : '#FFFFFF',
                      cursor: 'pointer',
                      borderRadius: '14px',
                    }}
                    onClick={() => setSelectedAddressId(addr.id)}
                  >
                    <input
                      type="radio"
                      className="form-check-input mt-1 flex-shrink-0"
                      name="addressRadio"
                      checked={isSelected}
                      onChange={() => setSelectedAddressId(addr.id)}
                      style={{ accentColor: '#E90064' }}
                    />

                    <div className="flex-grow-1">
                      <div className="d-flex align-items-center gap-2 mb-1">
                        <strong className="text-dark small">
                          {addr.fullName} <span className="text-secondary fw-normal">({addr.label})</span>
                        </strong>
                      </div>
                      <p className="text-muted small mb-1" style={{ fontSize: '0.82rem', lineHeight: '1.4' }}>
                        {addr.addressLine}
                      </p>
                      <div className="text-muted small" style={{ fontSize: '0.78rem' }}>
                        {addr.phone}
                      </div>
                    </div>

                    <div className="d-flex align-items-center gap-2">
                      <button
                        type="button"
                        className="btn btn-link btn-sm text-secondary p-0"
                        title="Edit address"
                        onClick={(e) => {
                          e.stopPropagation();
                          alert('Edit address dialog opened');
                        }}
                      >
                        <Edit2 size={15} />
                      </button>
                      <button
                        type="button"
                        className="btn btn-link btn-sm text-danger p-0"
                        title="Delete address"
                        onClick={(e) => handleDeleteAddress(addr.id, e)}
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Section 2: Delivery Options matching reference mockup */}
          <div className="card p-4 mb-4 bg-white shadow-sm" style={{ borderRadius: '20px', border: '1px solid #F0E7ED' }}>
            <h5 className="fw-bold text-dark mb-3" style={{ fontFamily: 'var(--font-heading-family)' }}>Delivery Options</h5>

            <div className="d-flex flex-column gap-2">
              <label
                className={`p-3 rounded-3 border d-flex align-items-center justify-content-between cursor-pointer`}
                style={{
                  borderColor: selectedDelivery === 'standard' ? '#E90064' : '#E2E8F0',
                  borderWidth: selectedDelivery === 'standard' ? '2px' : '1px',
                  backgroundColor: selectedDelivery === 'standard' ? '#FFF0F6' : '#FFFFFF',
                  cursor: 'pointer',
                  borderRadius: '14px',
                }}
              >
                <div className="d-flex align-items-center gap-3">
                  <input
                    type="radio"
                    className="form-check-input"
                    name="deliveryOption"
                    checked={selectedDelivery === 'standard'}
                    onChange={() => setSelectedDelivery('standard')}
                    style={{ accentColor: '#E90064' }}
                  />
                  <div>
                    <span className="fw-semibold text-dark small">Standard Delivery (3–5 days)</span>
                  </div>
                </div>
                <span className="badge bg-success bg-opacity-10 text-success fw-bold px-2 py-1">FREE</span>
              </label>

              <label
                className={`p-3 rounded-3 border d-flex align-items-center justify-content-between cursor-pointer`}
                style={{
                  borderColor: selectedDelivery === 'express' ? '#E90064' : '#E2E8F0',
                  borderWidth: selectedDelivery === 'express' ? '2px' : '1px',
                  backgroundColor: selectedDelivery === 'express' ? '#FFF0F6' : '#FFFFFF',
                  cursor: 'pointer',
                  borderRadius: '14px',
                }}
              >
                <div className="d-flex align-items-center gap-3">
                  <input
                    type="radio"
                    className="form-check-input"
                    name="deliveryOption"
                    checked={selectedDelivery === 'express'}
                    onChange={() => setSelectedDelivery('express')}
                    style={{ accentColor: '#E90064' }}
                  />
                  <div>
                    <span className="fw-semibold text-dark small">Express Delivery (1–2 days)</span>
                  </div>
                </div>
                <span className="fw-bold text-dark small">₹99</span>
              </label>
            </div>
          </div>

          {/* Section 3: Payment Method matching reference mockup */}
          <div className="card p-4 mb-4 bg-white shadow-sm" style={{ borderRadius: '20px', border: '1px solid #F0E7ED' }}>
            <h5 className="fw-bold text-dark mb-3" style={{ fontFamily: 'var(--font-heading-family)' }}>Payment Method</h5>

            <div className="d-flex flex-column gap-2">
              {/* Razorpay All-in-one */}
              <label
                className={`p-3 rounded-3 border d-flex align-items-center justify-content-between cursor-pointer`}
                style={{
                  borderColor: selectedPayment === 'razorpay' ? '#E90064' : '#E2E8F0',
                  borderWidth: selectedPayment === 'razorpay' ? '2px' : '1px',
                  backgroundColor: selectedPayment === 'razorpay' ? '#FFF0F6' : '#FFFFFF',
                  cursor: 'pointer',
                  borderRadius: '14px',
                }}
              >
                <div className="d-flex align-items-center gap-3">
                  <input
                    type="radio"
                    className="form-check-input"
                    name="paymentMethod"
                    checked={selectedPayment === 'razorpay'}
                    onChange={() => setSelectedPayment('razorpay')}
                    style={{ accentColor: '#E90064' }}
                  />
                  <div>
                    <span className="fw-semibold text-dark small">
                      Razorpay (UPI, Cards, NetBanking, Wallets)
                    </span>
                  </div>
                </div>
                <span className="badge text-white px-2.5 py-1 small fw-bold" style={{ backgroundColor: '#0C2340', borderRadius: '6px' }}>
                  Razorpay
                </span>
              </label>

              {/* Instant UPI */}
              <label
                className={`p-3 rounded-3 border d-flex align-items-center justify-content-between cursor-pointer`}
                style={{
                  borderColor: selectedPayment === 'upi' ? '#E90064' : '#E2E8F0',
                  borderWidth: selectedPayment === 'upi' ? '2px' : '1px',
                  backgroundColor: selectedPayment === 'upi' ? '#FFF0F6' : '#FFFFFF',
                  cursor: 'pointer',
                  borderRadius: '14px',
                }}
              >
                <div className="d-flex align-items-center gap-3">
                  <input
                    type="radio"
                    className="form-check-input"
                    name="paymentMethod"
                    checked={selectedPayment === 'upi'}
                    onChange={() => setSelectedPayment('upi')}
                    style={{ accentColor: '#E90064' }}
                  />
                  <div>
                    <span className="fw-semibold text-dark small">
                      UPI (Google Pay, PhonePe, Paytm)
                    </span>
                  </div>
                </div>
                <QrCode size={18} className="text-secondary" />
              </label>

              {/* Credit / Debit Card */}
              <label
                className={`p-3 rounded-3 border d-flex align-items-center justify-content-between cursor-pointer`}
                style={{
                  borderColor: selectedPayment === 'card' ? '#E90064' : '#E2E8F0',
                  borderWidth: selectedPayment === 'card' ? '2px' : '1px',
                  backgroundColor: selectedPayment === 'card' ? '#FFF0F6' : '#FFFFFF',
                  cursor: 'pointer',
                  borderRadius: '14px',
                }}
              >
                <div className="d-flex align-items-center gap-3">
                  <input
                    type="radio"
                    className="form-check-input"
                    name="paymentMethod"
                    checked={selectedPayment === 'card'}
                    onChange={() => setSelectedPayment('card')}
                    style={{ accentColor: '#E90064' }}
                  />
                  <div>
                    <span className="fw-semibold text-dark small">Credit / Debit Card</span>
                  </div>
                </div>
                <CreditCard size={18} className="text-secondary" />
              </label>

              {/* Net Banking */}
              <label
                className={`p-3 rounded-3 border d-flex align-items-center justify-content-between cursor-pointer`}
                style={{
                  borderColor: selectedPayment === 'netbanking' ? '#E90064' : '#E2E8F0',
                  borderWidth: selectedPayment === 'netbanking' ? '2px' : '1px',
                  backgroundColor: selectedPayment === 'netbanking' ? '#FFF0F6' : '#FFFFFF',
                  cursor: 'pointer',
                  borderRadius: '14px',
                }}
              >
                <div className="d-flex align-items-center gap-3">
                  <input
                    type="radio"
                    className="form-check-input"
                    name="paymentMethod"
                    checked={selectedPayment === 'netbanking'}
                    onChange={() => setSelectedPayment('netbanking')}
                    style={{ accentColor: '#E90064' }}
                  />
                  <div>
                    <span className="fw-semibold text-dark small">Net Banking</span>
                  </div>
                </div>
                <Building2 size={18} className="text-secondary" />
              </label>

              {/* Cash on Delivery (COD) */}
              <label
                className={`p-3 rounded-3 border d-flex align-items-center justify-content-between cursor-pointer`}
                style={{
                  borderColor: selectedPayment === 'cod' ? '#E90064' : '#E2E8F0',
                  borderWidth: selectedPayment === 'cod' ? '2px' : '1px',
                  backgroundColor: selectedPayment === 'cod' ? '#FFF0F6' : '#FFFFFF',
                  cursor: 'pointer',
                  borderRadius: '14px',
                }}
              >
                <div className="d-flex align-items-center gap-3">
                  <input
                    type="radio"
                    className="form-check-input"
                    name="paymentMethod"
                    checked={selectedPayment === 'cod'}
                    onChange={() => setSelectedPayment('cod')}
                    style={{ accentColor: '#E90064' }}
                  />
                  <div>
                    <span className="fw-semibold text-dark small">Cash on Delivery (COD)</span>
                  </div>
                </div>
                <Banknote size={18} className="text-secondary" />
              </label>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Order Summary matching reference mockup */}
        <div className="col-lg-4">
          <div className="card p-4 sticky-top bg-white shadow-sm" style={{ top: '80px', zIndex: 10, borderRadius: '20px', border: '1px solid #F0E7ED' }}>
            <h5 className="fw-bold text-dark mb-3" style={{ fontFamily: 'var(--font-heading-family)' }}>Order Summary</h5>

            <div className="d-flex flex-column gap-2 mb-3">
              <div className="d-flex justify-content-between text-muted small">
                <span>Items ({cartItems.reduce((acc, i) => acc + i.quantity, 0)})</span>
                <span className="text-dark fw-semibold">₹{itemsGross.toLocaleString()}</span>
              </div>

              <div className="d-flex justify-content-between small">
                <span className="text-muted">Discount</span>
                <span className="text-success fw-bold">-₹{calculatedDiscount.toLocaleString()}</span>
              </div>

              <div className="d-flex justify-content-between small">
                <span className="text-muted">Delivery</span>
                <span className={deliveryCharge === 0 ? 'text-success fw-bold' : 'text-dark fw-semibold'}>
                  {deliveryCharge === 0 ? 'FREE' : `₹${deliveryCharge}`}
                </span>
              </div>
            </div>

            {/* Two-Store Split Preview */}
            <div className="p-2.5 rounded-3 bg-light border mb-3 small" style={{ borderRadius: '12px' }}>
              <div className="fw-bold text-dark mb-1" style={{ fontSize: '0.74rem' }}>
                Store-Wise Dispatch Split:
              </div>
              <div className="d-flex justify-content-between align-items-center text-muted" style={{ fontSize: '0.72rem' }}>
                <span className="d-inline-flex align-items-center gap-1.5">
                  <AnimatedFaIcon icon={FaGem} size={11} color="#E90064" animation="pulse" />
                  <span>Aaradhya Silks</span>
                </span>
                <span className="badge badge-silks" style={{ fontSize: '0.62rem' }}>Suborder AS</span>
              </div>
              <div className="d-flex justify-content-between align-items-center text-muted mt-1" style={{ fontSize: '0.72rem' }}>
                <span className="d-inline-flex align-items-center gap-1.5">
                  <AnimatedFaIcon icon={FaScroll} size={11} color="#19B927" animation="float" />
                  <span>Aaradhya Fabrics</span>
                </span>
                <span className="badge badge-fabrics" style={{ fontSize: '0.62rem' }}>Suborder AF</span>
              </div>
            </div>

            <div className="border-top pt-3 mb-3" style={{ borderColor: '#F0E7ED' }}>
              <div className="d-flex justify-content-between align-items-baseline mb-2">
                <span className="fs-5 fw-bold text-dark" style={{ fontFamily: 'var(--font-heading-family)' }}>Total Amount</span>
                <span className="fs-3 fw-bold" style={{ color: '#E90064', letterSpacing: '-0.5px' }}>
                  ₹{finalPayable.toLocaleString()}
                </span>
              </div>

              {/* Savings Alert Banner matching reference mockup */}
              <div className="p-2 rounded-3 bg-success bg-opacity-10 text-success small fw-semibold text-center mb-3">
                <Check size={14} className="me-1" /> You save ₹{calculatedDiscount.toLocaleString()} on this order
              </div>
            </div>

            {/* Pay Button matching reference mockup */}
            <button
              className="btn w-100 py-3 fw-bold d-flex align-items-center justify-content-center gap-2 rounded-pill shadow-sm text-white"
              style={{
                backgroundColor: '#E90064',
                borderColor: '#E90064',
                fontSize: '0.98rem',
                letterSpacing: '0.04em',
                boxShadow: '0 4px 14px rgba(233, 0, 100, 0.35)',
              }}
              onClick={handlePayClick}
              disabled={isProcessing}
            >
              <Lock size={17} />
              {selectedPayment === 'cod'
                ? `Place COD Order • ₹${finalPayable.toLocaleString()}`
                : `Pay ₹${finalPayable.toLocaleString()} • Complete Order`}
            </button>

            {/* Trust Footer matching reference */}
            <div className="mt-3 text-center text-muted small d-flex align-items-center justify-content-center gap-1" style={{ fontSize: '0.78rem' }}>
              <ShieldCheck size={16} className="text-success" />
              <span>100% Secure Checkout • Verified Sarees & Silks</span>
            </div>
          </div>
        </div>
      </div>
    </div>

      {/* Add New Address Modal */}
      {showAddAddressModal && (
        <div
          className="modal fade show d-block"
          style={{ backgroundColor: 'rgba(15, 23, 42, 0.65)', backdropFilter: 'blur(3px)', zIndex: 1060 }}
        >
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content rounded-4 border-0 shadow-lg">
              <div className="modal-header border-bottom py-3 px-4">
                <h5 className="modal-title fw-bold">Add Delivery Address</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowAddAddressModal(false)}
                ></button>
              </div>
              <form onSubmit={handleAddAddress}>
                <div className="modal-body p-4">
                  <div className="mb-3">
                    <label className="form-label small fw-semibold">Full Name *</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="e.g. Rahul Sharma"
                      required
                      value={newAddress.fullName}
                      onChange={(e) => setNewAddress({ ...newAddress, fullName: e.target.value })}
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label small fw-semibold">Mobile Number *</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="+91 98765 43210"
                      required
                      value={newAddress.phone}
                      onChange={(e) => setNewAddress({ ...newAddress, phone: e.target.value })}
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label small fw-semibold">Full Address (House, Street, Area, City, Pincode) *</label>
                    <textarea
                      className="form-control"
                      rows="3"
                      placeholder="House/Flat No, Apartment, Sector, City, State - Pincode"
                      required
                      value={newAddress.addressLine}
                      onChange={(e) => setNewAddress({ ...newAddress, addressLine: e.target.value })}
                    ></textarea>
                  </div>
                  <div className="mb-2">
                    <label className="form-label small fw-semibold">Address Tag</label>
                    <div className="d-flex gap-2">
                      {['Home', 'Office', 'Other'].map((tag) => (
                        <button
                          key={tag}
                          type="button"
                          className={`btn btn-sm ${newAddress.label === tag ? 'text-white' : 'btn-light border'}`}
                          style={newAddress.label === tag ? { backgroundColor: '#E90064', borderColor: '#E90064' } : {}}
                          onClick={() => setNewAddress({ ...newAddress, label: tag })}
                        >
                          {tag}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="modal-footer border-top px-4 py-3" style={{ borderColor: '#F0E7ED' }}>
                  <button
                    type="button"
                    className="btn btn-light rounded-pill px-3"
                    onClick={() => setShowAddAddressModal(false)}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn rounded-pill px-4 fw-semibold text-white"
                    style={{ backgroundColor: '#E90064', borderColor: '#E90064', boxShadow: '0 4px 12px rgba(233, 0, 100, 0.28)' }}
                  >
                    Save & Use Address
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Simulated Razorpay Modal */}
      {paymentModalOpen && (
        <div
          className="modal fade show d-block"
          style={{ backgroundColor: 'rgba(15, 23, 42, 0.75)', backdropFilter: 'blur(4px)', zIndex: 1070 }}
        >
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content rounded-4 border-0 shadow-lg overflow-hidden">
              <div className="p-3 text-white d-flex justify-content-between align-items-center" style={{ backgroundColor: '#0C2340' }}>
                <div className="d-flex align-items-center gap-2">
                  <div className="bg-primary text-white p-1 rounded" style={{ backgroundColor: '#E90064' }}>
                    <CreditCard size={18} />
                  </div>
                  <strong>Razorpay Trusted Payment</strong>
                </div>
                <span className="badge bg-success">₹{finalPayable.toLocaleString()}</span>
              </div>
              <div className="p-4 text-center">
                <h5 className="fw-bold mb-2">Simulating Secure Payment Authorization</h5>
                <p className="text-muted small mb-4">
                  Merchant: <strong>Aaradhya Sarees & Silks Pvt. Ltd.</strong>
                  <br />
                  Order Amount: <strong>₹{finalPayable.toLocaleString()}</strong>
                </p>
                <div className="spinner-border text-danger mb-3" role="status" style={{ color: '#E90064' }}></div>
                <div className="d-flex justify-content-center gap-2 mt-2">
                  <button
                    className="btn btn-success fw-semibold px-4 rounded-pill"
                    onClick={() => completeOrder('razorpay')}
                  >
                    Authorize Payment (Success)
                  </button>
                  <button
                    className="btn btn-outline-danger px-3 rounded-pill"
                    onClick={() => {
                      setPaymentModalOpen(false);
                      setIsProcessing(false);
                    }}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CheckoutPage;
