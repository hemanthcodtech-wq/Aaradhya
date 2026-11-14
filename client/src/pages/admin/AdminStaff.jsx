import React, { useState, useEffect } from 'react';
import { Users, Plus, ShieldCheck, Check, Key, Mail } from 'lucide-react';
import axiosClient from '../../api/axiosClient';

const AdminStaff = () => {
  const [staffList, setStaffList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    role: 'staff',
    permissions: ['orders:view', 'products:view'],
  });

  const availablePermissions = [
    { id: 'orders:view', label: 'View Orders' },
    { id: 'orders:manage', label: 'Manage & Dispatch Orders' },
    { id: 'products:view', label: 'View Products Catalog' },
    { id: 'products:approve', label: 'Approve / Reject Products' },
    { id: 'inventory:view', label: 'View Stock Inventory' },
    { id: 'inventory:manage', label: 'Adjust & Intake Stock' },
    { id: 'pos:billing', label: 'Counter POS Terminal Access' },
  ];

  const fetchStaff = async () => {
    try {
      const res = await axiosClient.get('/admin/staff');
      if (res.success) {
        setStaffList(res.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStaff();
  }, []);

  const handleTogglePerm = (permId) => {
    setForm((prev) => {
      const perms = prev.permissions.includes(permId)
        ? prev.permissions.filter((p) => p !== permId)
        : [...prev.permissions, permId];
      return { ...prev, permissions: perms };
    });
  };

  const handleCreateStaff = async (e) => {
    e.preventDefault();
    try {
      const res = await axiosClient.post('/admin/staff', form);
      if (res.success) {
        alert('Staff account created successfully!');
        setShowModal(false);
        setForm({
          name: '',
          email: '',
          password: '',
          role: 'staff',
          permissions: ['orders:view', 'products:view'],
        });
        fetchStaff();
      }
    } catch (err) {
      alert(`Error creating staff: ${err.message}`);
    }
  };

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h3 className="fw-bold mb-1">Staff Accounts & Role-Based Permissions (RBAC)</h3>
          <p className="text-muted small mb-0">Configure staff roles, access tokens, and granular module authorizations.</p>
        </div>
        <button className="btn btn-emerald btn-sm px-3 d-flex align-items-center gap-1" onClick={() => setShowModal(true)}>
          <Plus size={16} /> Add Staff Account
        </button>
      </div>

      <div className="card card-modern p-4">
        <div className="table-responsive">
          <table className="table table-modern">
            <thead>
              <tr>
                <th>Staff Member</th>
                <th>Email</th>
                <th>Role</th>
                <th>Assigned Permissions</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {staffList.map((st) => (
                <tr key={st._id}>
                  <td className="fw-bold text-dark">{st.name}</td>
                  <td>{st.email}</td>
                  <td>
                    <span className="badge bg-secondary text-uppercase">{st.role}</span>
                  </td>
                  <td>
                    <div className="d-flex flex-wrap gap-1">
                      {st.permissions?.map((p, idx) => (
                        <span key={idx} className="badge bg-light text-dark border small" style={{ fontSize: '0.7rem' }}>
                          {p}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td>
                    <span className="badge bg-success">Active</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Staff Modal */}
      {showModal && (
        <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content rounded-4 p-4">
              <h5 className="fw-bold mb-3">Create Staff Account</h5>

              <form onSubmit={handleCreateStaff}>
                <div className="mb-2">
                  <label className="form-label small fw-semibold">Staff Full Name *</label>
                  <input
                    type="text"
                    className="form-control form-control-sm"
                    required
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                  />
                </div>

                <div className="mb-2">
                  <label className="form-label small fw-semibold">Email Address *</label>
                  <input
                    type="email"
                    className="form-control form-control-sm"
                    required
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                  />
                </div>

                <div className="mb-2">
                  <label className="form-label small fw-semibold">Password *</label>
                  <input
                    type="password"
                    className="form-control form-control-sm"
                    required
                    minLength={6}
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                  />
                </div>

                <div className="mb-3">
                  <label className="form-label small fw-semibold">Assigned Role</label>
                  <select
                    className="form-select form-select-sm"
                    value={form.role}
                    onChange={(e) => setForm({ ...form, role: e.target.value })}
                  >
                    <option value="staff">Staff (Catalog & Orders)</option>
                    <option value="sub_admin">Sub-Admin (Operations)</option>
                    <option value="store_manager">Store Manager (POS & Inventory)</option>
                  </select>
                </div>

                <div className="mb-4">
                  <label className="form-label small fw-semibold">Granular Module Permissions</label>
                  <div className="d-flex flex-column gap-1 p-2 bg-light rounded border">
                    {availablePermissions.map((perm) => (
                      <div key={perm.id} className="form-check small">
                        <input
                          className="form-check-input"
                          type="checkbox"
                          id={perm.id}
                          checked={form.permissions.includes(perm.id)}
                          onChange={() => handleTogglePerm(perm.id)}
                        />
                        <label className="form-check-label" htmlFor={perm.id}>
                          {perm.label} (<code>{perm.id}</code>)
                        </label>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="d-flex justify-content-end gap-2">
                  <button type="button" className="btn btn-light btn-sm" onClick={() => setShowModal(false)}>
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-emerald btn-sm px-4">
                    Create Staff
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminStaff;

