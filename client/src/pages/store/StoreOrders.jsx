import React, { useState, useEffect } from 'react';
import {
  ShoppingCart,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  Truck,
  Package,
  Eye,
  Printer,
  X,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  Send,
  User,
  MapPin,
  Calendar,
} from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import axiosClient from '../../api/axiosClient';
import { printFulfillmentSlip } from '../../utils/printUtility';

const StoreOrders = () => {
  const store = useStore();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [page, setPage] = useState(1);
  const itemsPerPage = 8;

  // Selected Order Modal
  const [selectedSuborder, setSelectedSuborder] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Dispatch Action Modal
  const [isDispatchModalOpen, setIsDispatchModalOpen] = useState(false);
  const [dispatchTarget, setDispatchTarget] = useState(null);
  const [courierName, setCourierName] = useState('Blue Dart Express');
  const [trackingNumber, setTrackingNumber] = useState('');
  const [updatingStatus, setUpdatingStatus] = useState(false);

  useEffect(() => {
    fetchStoreOrders();
  }, [store.activeStore]);

  const fetchStoreOrders = async () => {
    setLoading(true);
    try {
      const res = await axiosClient.get(`/orders/store/${store.activeStore}`);
      if (res.data?.success && res.data.data?.length > 0) {
        setOrders(res.data.data);
      } else {
        setOrders(getFallbackOrders());
      }
    } catch {
      setOrders(getFallbackOrders());
    } finally {
      setLoading(false);
    }
  };

  const getFallbackOrders = () =>
    store.isSilks
      ? [
          {
            _id: 'ord_as_01',
            suborderNumber: 'AS-ORD-488764',
            parentOrderId: 'ORD-488764',
            parentOrderNumber: 'ORD-488764',
            createdAt: '2026-11-13T10:30:00Z',
            customerName: 'Pooja Venkatesh',
            customerEmail: 'customer@aaradhya.com',
            customerPhone: '+91 98765 43210',
            status: 'confirmed',
            totalAmount: 19999,
            paymentMethod: 'Razorpay UPI',
            paymentStatus: 'paid',
            courier: '',
            trackingNumber: '',
            shippingAddress: {
              fullName: 'Pooja Venkatesh',
              addressLine1: 'Villa 14, Palm Meadows',
              city: 'Bengaluru',
              state: 'Karnataka',
              pincode: '560066',
            },
            items: [
              {
                productId: 'AS-000001',
                name: 'Pure Kanjeevaram Bridal Silk Saree (Crimson Red)',
                quantity: 1,
                price: 19999,
                hsn: '5007',
              },
            ],
          },
          {
            _id: 'ord_as_02',
            suborderNumber: 'AS-ORD-000108',
            parentOrderId: 'ORD-2026-000108',
            parentOrderNumber: 'ORD-2026-000108',
            createdAt: '2026-11-14T08:15:00Z',
            customerName: 'Ananya Reddy',
            customerEmail: 'ananya.reddy@gmail.com',
            customerPhone: '+91 98480 12345',
            status: 'shipped',
            totalAmount: 24748,
            paymentMethod: 'Razorpay Netbanking',
            paymentStatus: 'paid',
            courier: 'Blue Dart Express',
            trackingNumber: 'BD-84729104',
            shippingAddress: {
              fullName: 'Ananya Reddy',
              addressLine1: 'Flat 402, Banjara Hills Rd 12',
              city: 'Hyderabad',
              state: 'Telangana',
              pincode: '500034',
            },
            items: [
              {
                productId: 'AS-000108',
                name: 'Banarasi Katan Silk Royal Saree',
                quantity: 1,
                price: 24748,
                hsn: '5007',
              },
            ],
          },
        ]
      : [
          {
            _id: 'ord_af_01',
            suborderNumber: 'AF-ORD-488764',
            parentOrderId: 'ORD-488764',
            parentOrderNumber: 'ORD-488764',
            createdAt: '2026-11-13T10:30:00Z',
            customerName: 'Pooja Venkatesh',
            customerEmail: 'customer@aaradhya.com',
            customerPhone: '+91 98765 43210',
            status: 'packed',
            totalAmount: 2750,
            paymentMethod: 'Razorpay UPI',
            paymentStatus: 'paid',
            courier: '',
            trackingNumber: '',
            shippingAddress: {
              fullName: 'Pooja Venkatesh',
              addressLine1: 'Villa 14, Palm Meadows',
              city: 'Bengaluru',
              state: 'Karnataka',
              pincode: '560066',
            },
            items: [
              {
                productId: 'AF-000001',
                name: 'Pure Mulmul 60s Organic Cotton Yardage',
                quantity: 5,
                price: 550,
                hsn: '5208',
              },
            ],
          },
        ];

  const handleUpdateStatus = async (suborderNumber, nextStatus, courier = '', tracking = '') => {
    setUpdatingStatus(true);
    try {
      await axiosClient.put(`/orders/suborders/${suborderNumber}/status`, {
        status: nextStatus,
        courier,
        trackingNumber: tracking,
        storeCode: store.activeStore,
      });
      // Local optimistic update
      setOrders((prev) =>
        prev.map((o) =>
          o.suborderNumber === suborderNumber
            ? { ...o, status: nextStatus, courier: courier || o.courier, trackingNumber: tracking || o.trackingNumber }
            : o
        )
      );
      if (selectedSuborder?.suborderNumber === suborderNumber) {
        setSelectedSuborder((prev) => ({
          ...prev,
          status: nextStatus,
          courier: courier || prev.courier,
          trackingNumber: tracking || prev.trackingNumber,
        }));
      }
    } catch {
      // Local fallback update
      setOrders((prev) =>
        prev.map((o) =>
          o.suborderNumber === suborderNumber
            ? { ...o, status: nextStatus, courier: courier || o.courier, trackingNumber: tracking || o.trackingNumber }
            : o
        )
      );
    } finally {
      setUpdatingStatus(false);
      setIsDispatchModalOpen(false);
    }
  };

  const filteredOrders = orders.filter((o) => {
    const matchesSearch =
      (o.suborderNumber || '').toLowerCase().includes(search.toLowerCase()) ||
      (o.customerName || '').toLowerCase().includes(search.toLowerCase()) ||
      (o.customerEmail || '').toLowerCase().includes(search.toLowerCase()) ||
      (o.parentOrderNumber || '').toLowerCase().includes(search.toLowerCase());

    const matchesStatus = statusFilter === 'all' || o.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const totalPages = Math.ceil(filteredOrders.length / itemsPerPage) || 1;
  const paginatedOrders = filteredOrders.slice((page - 1) * itemsPerPage, page * itemsPerPage);

  return (
    <div className="store-orders-page pb-5">
      {/* Header */}
      <div className="d-flex flex-wrap align-items-center justify-content-between gap-3 mb-4">
        <div>
          <div className="d-flex align-items-center gap-2 mb-1">
            <span
              className="badge rounded-pill fw-bold text-uppercase px-2.5 py-1"
              style={{ backgroundColor: store.badgeBg, color: store.badgeText, border: `1px solid ${store.badgeBorder}`, fontSize: '0.72rem' }}
            >
              Store {store.storeCode} Suborders
            </span>
            <span className="text-muted small">• Independent Store Fulfillment</span>
          </div>
          <h4 className="fw-bold text-dark mb-0">{store.storeName} Online Orders</h4>
        </div>

        <button onClick={fetchStoreOrders} className="btn btn-sm btn-light border text-muted shadow-sm">
          <RefreshCw size={14} className={loading ? 'spin' : ''} />
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="card border-0 shadow-sm rounded-3 p-3 bg-white mb-4">
        <div className="row g-2 align-items-center">
          <div className="col-12 col-md-6">
            <div className="input-group input-group-sm">
              <span className="input-group-text bg-light border-end-0">
                <Search size={15} className="text-muted" />
              </span>
              <input
                type="text"
                className="form-control border-start-0 bg-light"
                placeholder={`Search suborder (#${store.storeCode}-ORD-*), customer, or order ID...`}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>

          <div className="col-12 col-md-6 d-flex justify-content-md-end gap-1 flex-wrap">
            {['all', 'confirmed', 'packed', 'shipped', 'delivered'].map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`btn btn-sm rounded-pill px-3 py-1 text-capitalize ${
                  statusFilter === st ? 'btn-dark' : 'btn-light border text-muted'
                }`}
                style={{ fontSize: '0.74rem' }}
              >
                {st}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Orders Table Card */}
      <div className="card border-0 shadow-sm rounded-3 bg-white overflow-hidden">
        <div className="table-responsive">
          <table className="table table-hover align-middle mb-0" style={{ fontSize: '0.82rem' }}>
            <thead className="table-light">
              <tr>
                <th className="border-0 text-muted fw-semibold ps-3">Suborder ID</th>
                <th className="border-0 text-muted fw-semibold">Parent Order</th>
                <th className="border-0 text-muted fw-semibold">Customer</th>
                <th className="border-0 text-muted fw-semibold">Store Items</th>
                <th className="border-0 text-muted fw-semibold text-end">Subtotal</th>
                <th className="border-0 text-muted fw-semibold text-center">Fulfillment Status</th>
                <th className="border-0 text-muted fw-semibold">Courier / Tracking</th>
                <th className="border-0 text-muted fw-semibold text-end pe-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="8" className="text-center py-5">
                    <div className="spinner-border spinner-border-sm text-primary mb-2" style={{ color: store.primaryColor }} />
                    <div className="text-muted small">Loading {store.storeName} suborders...</div>
                  </td>
                </tr>
              ) : paginatedOrders.length === 0 ? (
                <tr>
                  <td colSpan="8" className="text-center py-5 text-muted">
                    <ShoppingCart size={36} className="text-muted opacity-50 mb-2" />
                    <div>No orders match your filter criteria.</div>
                  </td>
                </tr>
              ) : (
                paginatedOrders.map((o) => {
                  return (
                    <tr key={o.suborderNumber}>
                      <td className="ps-3">
                        <span className="fw-bold font-monospace" style={{ color: store.primaryColor }}>
                          #{o.suborderNumber}
                        </span>
                      </td>
                      <td>
                        <span className="font-monospace text-muted small">#{o.parentOrderNumber || o.parentOrderId}</span>
                      </td>
                      <td>
                        <div className="fw-semibold text-dark">{o.customerName}</div>
                        <div className="text-muted small" style={{ fontSize: '0.7rem' }}>
                          {o.customerEmail}
                        </div>
                      </td>
                      <td>
                        <div className="fw-semibold text-dark">{o.items?.length || 0} items</div>
                        <div className="text-muted text-truncate" style={{ maxWidth: '200px', fontSize: '0.72rem' }}>
                          {(o.items || []).map((i) => `${i.name} (x${i.quantity})`).join(', ')}
                        </div>
                      </td>
                      <td className="text-end fw-bold text-dark">₹{Number(o.totalAmount).toLocaleString()}</td>
                      <td className="text-center">
                        <span
                          className={`badge rounded-pill text-capitalize px-2.5 py-1 ${
                            o.status === 'delivered'
                              ? 'bg-success text-white'
                              : o.status === 'shipped'
                              ? 'bg-primary text-white'
                              : o.status === 'packed'
                              ? 'bg-info-subtle text-info border'
                              : 'bg-warning text-dark'
                          }`}
                          style={{ fontSize: '0.72rem' }}
                        >
                          {o.status || 'pending'}
                        </span>
                      </td>
                      <td>
                        {o.trackingNumber ? (
                          <div className="small">
                            <span className="fw-semibold text-dark d-block" style={{ fontSize: '0.74rem' }}>
                              {o.courier}
                            </span>
                            <span className="font-monospace text-muted" style={{ fontSize: '0.7rem' }}>
                              {o.trackingNumber}
                            </span>
                          </div>
                        ) : (
                          <span className="text-muted small">Not Dispatched</span>
                        )}
                      </td>
                      <td className="text-end pe-3">
                        <div className="d-inline-flex align-items-center gap-1">
                          <button
                            onClick={() => {
                              setSelectedSuborder(o);
                              setIsModalOpen(true);
                            }}
                            className="btn btn-sm btn-light border p-1.5 text-dark"
                            title="View Slip"
                          >
                            <Eye size={14} />
                          </button>

                          {/* Fulfillment Quick Button */}
                          {o.status === 'confirmed' && (
                            <button
                              onClick={() => handleUpdateStatus(o.suborderNumber, 'packed')}
                              className="btn btn-sm btn-info-subtle border text-info px-2 py-1 fw-semibold small"
                              style={{ fontSize: '0.72rem' }}
                            >
                              Pack Item
                            </button>
                          )}
                          {o.status === 'packed' && (
                            <button
                              onClick={() => {
                                setDispatchTarget(o);
                                setTrackingNumber(`BD-${Math.floor(10000000 + Math.random() * 90000000)}`);
                                setIsDispatchModalOpen(true);
                              }}
                              className="btn btn-sm text-white px-2 py-1 fw-semibold small shadow-sm"
                              style={{ backgroundColor: store.primaryColor, fontSize: '0.72rem' }}
                            >
                              Dispatch &rarr;
                            </button>
                          )}
                          {o.status === 'shipped' && (
                            <button
                              onClick={() => handleUpdateStatus(o.suborderNumber, 'delivered')}
                              className="btn btn-sm btn-success px-2 py-1 fw-semibold small"
                              style={{ fontSize: '0.72rem' }}
                            >
                              Delivered ✓
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Order Packing Slip Modal */}
      {isModalOpen && selectedSuborder && (
        <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1050 }}>
          <div className="modal-dialog modal-md modal-dialog-centered">
            <div className="modal-content border-0 shadow-lg rounded-3">
              <div className="modal-header border-0 pb-0 pt-3 px-4">
                <div>
                  <h5 className="modal-title fw-bold text-dark">Store Fulfillment Slip</h5>
                  <span className="text-muted small">
                    #{selectedSuborder.suborderNumber} • Parent #{selectedSuborder.parentOrderNumber}
                  </span>
                </div>
                <button type="button" className="btn-close" onClick={() => setIsModalOpen(false)} />
              </div>

              <div className="modal-body px-4 py-3">
                {/* Shipping Details */}
                <div className="p-3 rounded-2 bg-light mb-3">
                  <div className="fw-bold text-dark small mb-1 d-flex align-items-center gap-1.5">
                    <MapPin size={14} className="text-danger" />
                    Delivery Address
                  </div>
                  <div className="fw-semibold text-dark small">{selectedSuborder.shippingAddress?.fullName}</div>
                  <div className="text-muted small">
                    {selectedSuborder.shippingAddress?.addressLine1}, {selectedSuborder.shippingAddress?.city},{' '}
                    {selectedSuborder.shippingAddress?.state} - {selectedSuborder.shippingAddress?.pincode}
                  </div>
                  <div className="text-muted small mt-1">Phone: {selectedSuborder.customerPhone}</div>
                </div>

                {/* Line Items */}
                <div className="table-responsive mb-3">
                  <table className="table table-sm align-middle mb-0" style={{ fontSize: '0.78rem' }}>
                    <thead className="table-light">
                      <tr>
                        <th className="border-0">Item</th>
                        <th className="border-0 text-center">Qty</th>
                        <th className="border-0 text-end">Price</th>
                        <th className="border-0 text-end">Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(selectedSuborder.items || []).map((item, idx) => (
                        <tr key={idx}>
                          <td>
                            <div className="fw-semibold text-dark">{item.name}</div>
                            <span className="text-muted font-monospace" style={{ fontSize: '0.68rem' }}>
                              HSN: {item.hsn || '5007'}
                            </span>
                          </td>
                          <td className="text-center fw-bold">{item.quantity}</td>
                          <td className="text-end">₹{Number(item.price).toLocaleString()}</td>
                          <td className="text-end fw-bold">₹{Number(item.price * item.quantity).toLocaleString()}</td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot>
                      <tr>
                        <td colSpan="3" className="fw-bold text-end border-0">
                          Subtotal:
                        </td>
                        <td className="fw-bold text-end border-0 fs-6" style={{ color: store.primaryColor }}>
                          ₹{Number(selectedSuborder.totalAmount).toLocaleString()}
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>

                {selectedSuborder.trackingNumber && (
                  <div className="p-2.5 rounded bg-primary-subtle text-primary border small mb-2">
                    <div className="fw-bold">Courier: {selectedSuborder.courier}</div>
                    <div>AWB Tracking #: {selectedSuborder.trackingNumber}</div>
                  </div>
                )}
              </div>

              <div className="modal-footer border-0 pt-0 px-4 pb-3">
                <button type="button" className="btn btn-sm btn-light border px-3" onClick={() => setIsModalOpen(false)}>
                  Close
                </button>
                <button
                  type="button"
                  onClick={() => printFulfillmentSlip({ order: selectedSuborder, store })}
                  className="btn btn-sm btn-dark px-3.5 py-1.5 d-inline-flex align-items-center gap-1.5 fw-semibold shadow-sm"
                >
                  <Printer size={14} />
                  Print Packing Slip
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Courier Dispatch Modal */}
      {isDispatchModalOpen && dispatchTarget && (
        <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1050 }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-0 shadow-lg rounded-3">
              <div className="modal-header border-0 pb-0 pt-3 px-4">
                <h5 className="modal-title fw-bold text-dark">Dispatch Suborder #{dispatchTarget.suborderNumber}</h5>
                <button type="button" className="btn-close" onClick={() => setIsDispatchModalOpen(false)} />
              </div>
              <div className="modal-body px-4 py-3">
                <div className="mb-3">
                  <label className="form-label small fw-semibold text-dark">Logistics Courier Partner *</label>
                  <select
                    className="form-select form-select-sm"
                    value={courierName}
                    onChange={(e) => setCourierName(e.target.value)}
                  >
                    <option value="Blue Dart Express">Blue Dart Express</option>
                    <option value="Delhivery Logistics">Delhivery Logistics</option>
                    <option value="DTDC Courier">DTDC Courier</option>
                    <option value="Professional Couriers">Professional Couriers</option>
                    <option value="Store Direct Express">Store Direct Express Runner</option>
                  </select>
                </div>
                <div className="mb-3">
                  <label className="form-label small fw-semibold text-dark">Tracking / AWB Waybill # *</label>
                  <input
                    type="text"
                    required
                    className="form-control form-control-sm font-monospace"
                    value={trackingNumber}
                    onChange={(e) => setTrackingNumber(e.target.value)}
                  />
                </div>
              </div>
              <div className="modal-footer border-0 pt-0 px-4 pb-3">
                <button
                  type="button"
                  className="btn btn-sm btn-light border px-3"
                  onClick={() => setIsDispatchModalOpen(false)}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={updatingStatus}
                  onClick={() => handleUpdateStatus(dispatchTarget.suborderNumber, 'shipped', courierName, trackingNumber)}
                  className="btn btn-sm text-white px-4 fw-semibold shadow-sm"
                  style={{ backgroundColor: store.primaryColor }}
                >
                  {updatingStatus ? 'Dispatching...' : 'Confirm Dispatch'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StoreOrders;
