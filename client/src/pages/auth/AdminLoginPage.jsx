import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import AdminLoginLayout from '../../components/auth/AdminLoginLayout';
import LoginForm from '../../components/auth/LoginForm';
import ForgotPassword from '../../components/auth/ForgotPassword';
import { useAuth } from '../../context/AuthContext';

const AdminLoginPage = ({ initialPortalType = null }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  // Detect portal type from path or prop
  const detectPortalType = () => {
    if (initialPortalType) return initialPortalType;
    const path = location.pathname.toLowerCase();
    if (path.includes('silks')) return 'silks_admin';
    if (path.includes('fabrics')) return 'fabrics_admin';
    return 'super_admin';
  };

  const [portalType, setPortalType] = useState(detectPortalType);
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(location.state?.message || '');

  useEffect(() => {
    setPortalType(detectPortalType());
  }, [location.pathname]);

  const handleLoginSubmit = async ({ email, password, rememberMe }) => {
    setLoading(true);
    setError('');

    try {
      const data = await login(email, password);
      const user = data?.user || {};
      const role = (user.role || '').toLowerCase();
      const storeCode = (user.storeCode || '').toUpperCase();

      // Check account suspension
      if (user.isActive === false) {
        setError('Your administrative account has been deactivated. Please contact the Super Admin.');
        setLoading(false);
        return;
      }

      // Check administrative authorization
      const allowedRoles = ['super_admin', 'admin', 'sub_admin', 'silks_admin', 'fabrics_admin', 'store_manager', 'store_admin'];
      if (!allowedRoles.includes(role)) {
        setError('This portal is restricted to Super Administrators and Branch Store Managers.');
        setLoading(false);
        return;
      }

      // Redirect strictly based on authenticated backend role & store assignment
      const returnUrl = location.state?.returnUrl;
      if (returnUrl && (returnUrl.includes('/admin') || returnUrl.includes('/dashboard') || returnUrl.includes('/pos'))) {
        navigate(returnUrl);
      } else if (role === 'silks_admin' || storeCode === 'AS') {
        navigate('/silks-admin/pos');
      } else if (role === 'fabrics_admin' || storeCode === 'AF') {
        navigate('/fabrics-admin/pos');
      } else {
        navigate('/super-admin/dashboard');
      }
    } catch (err) {
      const message =
        err?.response?.data?.message ||
        err?.message ||
        'Authentication failed. Please verify your administrative credentials.';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AdminLoginLayout portalType={portalType}>
      {isForgotPassword ? (
        <ForgotPassword
          onBackToLogin={() => setIsForgotPassword(false)}
          onResetPasswordWithToken={(token) => {
            navigate(`/reset-password?token=${encodeURIComponent(token)}`);
          }}
        />
      ) : (
        <LoginForm
          portalType={portalType}
          onPortalTypeChange={(type) => setPortalType(type)}
          onSubmit={handleLoginSubmit}
          loading={loading}
          error={error}
          onForgotPasswordClick={() => setIsForgotPassword(true)}
          forgotPasswordPath="/forgot-password"
        />
      )}
    </AdminLoginLayout>
  );
};

export default AdminLoginPage;
