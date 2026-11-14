import React from 'react';
import { useNavigate } from 'react-router-dom';
import AdminLoginLayout from '../../components/auth/AdminLoginLayout';
import ForgotPassword from '../../components/auth/ForgotPassword';

const ForgotPasswordPage = () => {
  const navigate = useNavigate();

  return (
    <AdminLoginLayout portalType="super_admin">
      <ForgotPassword
        onBackToLogin={() => navigate('/admin/login')}
        onResetPasswordWithToken={(token) => {
          navigate(`/reset-password?token=${encodeURIComponent(token)}`);
        }}
      />
    </AdminLoginLayout>
  );
};

export default ForgotPasswordPage;
