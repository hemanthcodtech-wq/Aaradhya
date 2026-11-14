import React, { useState, useEffect } from 'react';
import { Receipt, Search, Printer, Calendar, ArrowRight } from 'lucide-react';
import axiosClient from '../../api/axiosClient';

const PosBillsHistory = () => {
  const [bills, setBills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [modeFilter, setModeFilter] = useState('all');

  const fetchBills = async () => {
    try {
      const res = await axiosClient.get(`/pos/bills?paymentMode=${modeFilter}&search=${encodeURIComponent(search)}`);
      if (res.success) {
        setBills(res.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBills();
  }, [modeFilter]);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchBills();
  };

  return (
    <div className="p-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h3 className="fw-bold mb-1">POS Counter Billing History</h3>
          <p className="text-muted small mb-0">Review offline counter sales, customer invoices, and reprint receipts.</p>
        </div>
      </div>

      <div className="card card-modern p-4 mb-4">
        <div className="d-flex flex-wrap justify-content-between align-items-center gap-3 mb-3">
          <form onSubmit={handleSearch} className="input-group input-group-sm" style={{ maxWidth: '340px' }}>
            <span className="input-group-text bg-white"><Search size={14} /></span>
            <input
              type="text"
              className="form-control"
              placeholder="Search bill number or customer..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <button className="btn btn-outline-secondary" type="submit">Search</button>
          </form>

          <div className="d-flex align-items-center gap-2">
            <span className="small text-muted">Payment Tender:</span>
            <select
              className="form-select form-select-sm"
              value={modeFilter}
              onChange={(e) => setModeFilter(e.target.value)}
              style={{ width: '130px' }}
            >
              <option value="all">All Modes</option>
              <option value="Cash">Cash</option>
              <option value="UPI">UPI</option>
              <option value="Card">Card</option>
            </select>
          </div>
        </div>

        <div className="table-responsive">
          <table className="table table-modern">
            <thead>
              <tr>
                <th>Bill Number</th>
                <th>Date & Time</th>
                <th>Customer</th>
                <th>Items Count</th>
                <th>Subtotal</th>
                <th>GST Tax</th>
                <th>Total Paid</th>
                <th>Payment Mode</th>
                <th>Cashier</th>
                <th className="text-end">Action</th>
              </tr>
            </thead>
            <tbody>
              {bills.map((b) => (
                <tr key={b._id}>
                  <td className="fw-bold text-dark">{b.billNumber}</td>
                  <td className="text-muted small">{new Date(b.createdAt).toLocaleString()}</td>
                  <td>
                    <div className="fw-semibold small">{b.customer?.name || 'Walk-in'}</div>
                    <div className="text-muted" style={{ fontSize: '0.7rem' }}>{b.customer?.phone || '—'}</div>
                  </td>
                  <td>{b.items?.length || 1} items</td>
                  <td>₹{b.subtotal?.toLocaleString()}</td>
                  <td>₹{b.taxAmount?.toLocaleString()}</td>
                  <td className="fw-bold text-success">₹{b.totalPayable?.toLocaleString()}</td>
                  <td>
                    <span className="badge bg-light text-dark border">{b.paymentMode}</span>
                  </td>
                  <td className="text-muted small">{b.cashier?.name}</td>
                  <td className="text-end">
                    <button
                      className="btn btn-light btn-sm border d-flex align-items-center gap-1 ms-auto"
                      onClick={() => alert(`Reprinting invoice for ${b.billNumber}`)}
                    >
                      <Printer size={14} /> Reprint
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default PosBillsHistory;

