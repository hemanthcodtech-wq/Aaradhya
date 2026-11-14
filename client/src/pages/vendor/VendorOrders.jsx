import React, { useState, useEffect } from 'react';
import {
  ShoppingCart,
  Truck,
  Package,
  CheckCircle,
  FileText,
  Printer,
  Clock,
  ExternalLink,
} from 'lucide-react';
import axiosClient from '../../api/axiosClient';

const VendorOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingSku, setUpdatingSku] = useState(null);

  const fetchOrders = async () => {
    try {
      const res = await axiosClient.get('/orders/vendor/list');
      if (res.success) {
        setOrders(res.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleUpdateStatus = async (orderId, sku, nextStatus, courier = 'BlueDart Express') => {
    setUpdatingSku(`${orderId}_${sku}`);
    try {
      const res = await axiosClient.put(`/orders/${orderId}/items/${sku}/status`, {
        status: nextStatus,
        courierName: courier,
      });
      if (res.success) {
        fetchOrders();
      }
    } catch (err) {
      alert(`Error updating item status: ${err.message}`);
    } finally {
      setUpdatingSku(null);
    }
  };

  if (loading) {
    return (
      <div className="p-4 text-center">
        <div className="spinner-border text-success" role="status"></div>
        <p className="small text-muted mt-2">Loading merchant orders...</p>
      </div>
    );
  }

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h3 className="fw-bold mb-1">Order Fulfillment & Shipping</h3>
          <p className="text-muted small mb-0">Accept orders, generate Shiprocket AWBs, and print courier packing manifests.</p>
        </div>
        <button className="btn btn-outline-secondary btn-sm px-3" onClick={fetchOrders}>
          Refresh Orders
        </button>
      </div>

      {orders.length === 0 ? (
        <div className="card card-modern p-5 text-center text-muted">
          No orders waiting for fulfillment right now.
        </div>
      ) : (
        <div className="d-flex flex-column gap-3">
          {orders.map((ord) => (
            <div key={ord._id} className="card card-modern p-4">
              <div className="d-flex flex-wrap justify-content-between align-items-center border-bottom pb-3 mb-3 gap-2">
                <div>
                  <div className="d-flex align-items-center gap-2">
                    <span className="fw-bold fs-6">Order #{ord.orderNumber}</span>
                    <span className="badge bg-light text-dark border">
                      Placed: {new Date(ord.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="text-muted small mt-1">
                    Ship to: <strong>{ord.shippingAddress?.fullName}</strong> ({ord.shippingAddress?.city}, {ord.shippingAddress?.state} - {ord.shippingAddress?.pincode})
                  </div>
                </div>

                <div className="text-end">
                  <div className="text-muted small">Your Net Earnings (After Comm.):</div>
                  <div className="fs-5 fw-bold text-success">
                    ₹{ord.vendorTotalEarnings?.toLocaleString()}
                  </div>
                </div>
              </div>

              {/* Vendor specific items list */}
              <div className="d-flex flex-column gap-3">
                {ord.vendorSpecificItems?.map((item, idx) => (
                  <div key={idx} className="p-3 rounded-3 bg-light border d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3">
                    <div className="d-flex align-items-center gap-3">
                      <img
                        src={item.image || 'https://via.placeholder.com/60'}
                        alt={item.name}
                        style={{ width: '56px', height: '56px', objectFit: 'cover', borderRadius: '6px' }}
                      />
                      <div>
                        <div className="fw-bold small text-dark">{item.name}</div>
                        <div className="text-muted small" style={{ fontSize: '0.75rem' }}>
                          SKU: <strong>{item.sku}</strong> • Qty: <strong>{item.quantity}</strong> • Unit Price: ₹{item.price?.toLocaleString()}
                        </div>
                        <div className="d-flex align-items-center gap-2 mt-1">
                          <span className="badge bg-secondary" style={{ fontSize: '0.65rem' }}>
                            Status: {item.vendorStatus?.toUpperCase()}
                          </span>
                          {item.shipment?.awb && (
                            <span className="badge bg-info text-white" style={{ fontSize: '0.65rem' }}>
                              AWB: {item.shipment.awb} ({item.shipment.courierName})
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Fulfillment Buttons */}
                    <div className="d-flex flex-wrap align-items-center gap-2">
                      {item.vendorStatus === 'pending' && (
                        <button
                          className="btn btn-primary btn-sm px-3"
                          onClick={() => handleUpdateStatus(ord._id, item.sku, 'accepted')}
                          disabled={updatingSku === `${ord._id}_${item.sku}`}
                        >
                          Accept Order
                        </button>
                      )}

                      {item.vendorStatus === 'accepted' && (
                        <button
                          className="btn btn-warning btn-sm fw-bold px-3 d-flex align-items-center gap-1"
                          onClick={() => handleUpdateStatus(ord._id, item.sku, 'packed', 'BlueDart Express')}
                          disabled={updatingSku === `${ord._id}_${item.sku}`}
                        >
                          <Package size={14} /> Pack & Generate AWB
                        </button>
                      )}

                      {item.vendorStatus === 'packed' && (
                        <>
                          <button
                            className="btn btn-outline-dark btn-sm d-flex align-items-center gap-1"
                            onClick={() => alert(`Simulated Label Download:\n\nShiprocket Shipping Label for AWB #${item.shipment?.awb}\nRecipient: ${ord.shippingAddress?.fullName}\nBarcode: |||||||||||||||||||||`)}
                          >
                            <Printer size={14} /> Print Label
                          </button>
                          <button
                            className="btn btn-success btn-sm px-3 d-flex align-items-center gap-1"
                            onClick={() => handleUpdateStatus(ord._id, item.sku, 'shipped')}
                            disabled={updatingSku === `${ord._id}_${item.sku}`}
                          >
                            <Truck size={14} /> Hand Over to Courier
                          </button>
                        </>
                      )}

                      {item.vendorStatus === 'shipped' && (
                        <span className="badge bg-success bg-opacity-10 text-success p-2 d-flex align-items-center gap-1">
                          <CheckCircle size={14} /> In Transit via Shiprocket
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default VendorOrders;

