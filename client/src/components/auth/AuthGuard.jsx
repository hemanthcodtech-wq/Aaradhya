import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { ShieldAlert } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

/**
 * AuthGuard - Enforces strict server-validated role and store-specific access.
 *
 * @param {Array} allowedRoles - List of authorized roles (e.g. ['super_admin', 'silks_admin', 'fabrics_admin'])
 * @param {string} requiredStoreCode - Optional specific store code (e.g. 'AS' or 'AF')
 */
const AuthGuard = ({
  children,
  allowedRoles = ['super_admin', 'admin', 'sub_admin', 'silks_admin', 'fabrics_admin', 'store_manager', 'store_admin'],
  requiredStoreCode = null,
}) => {
  const location = useLocation();
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="d-flex align-items-center justify-content-center min-vh-100 bg-light">
        <div className="text-center p-4">
          <div className="spinner-border text-danger mb-3" style={{ color: '#E90064', width: '2.5rem', height: '2.5rem' }} role="status"></div>
          <div className="fw-semibold small text-muted">Verifying Administrator Authorization...</div>
        </div>
      </div>
    );
  }

  // 1. Unauthenticated or Customer -> Redirect to Admin Login
  if (!user || user.role === 'customer') {
    return (
      <Navigate
        to="/admin/login"
        state={{
          returnUrl: location.pathname,
          message: 'Please authenticate with valid administrator credentials to access this dashboard.',
        }}
        replace
      />
    );
  }

  const role = (user.role || '').toLowerCase();
  const userStore = (user.storeCode || '').toUpperCase();

  // Super Admin has universal access to all dashboards
  const isSuperAdmin = role === 'super_admin' || role === 'admin' || role === 'sub_admin';
  if (isSuperAdmin) {
    return children;
  }

  // 2. Check Role Authorization
  const hasRoleAccess = allowedRoles.some((r) => r.toLowerCase() === role);
  if (!hasRoleAccess) {
    return (
      <Navigate
        to="/admin/login"
        state={{
          message: `Access denied. Your account role (${role}) is not authorized for this dashboard.`,
        }}
        replace
      />
    );
  }

  // 3. Check Store-Specific Authorization (e.g. Silks vs Fabrics isolation)
  if (requiredStoreCode) {
    const requiredCode = requiredStoreCode.toUpperCase();

    // Silks Admin trying to access Fabrics, or vice-versa
    if (userStore && userStore !== requiredCode) {
      const redirectPath = userStore === 'AS' ? '/silks-admin/dashboard' : '/fabrics-admin/dashboard';
      return (
        <Navigate
          to={redirectPath}
          state={{
            message: `Access restricted. Your account is assigned to Store ${userStore}. Redirected to your authorized dashboard.`,
          }}
          replace
        />
      );
    }
  }

  return children;
};

export default AuthGuard;
