import React from 'react';
import { Link } from 'react-router-dom';

const RememberMe = ({
  checked = false,
  onChange,
  onForgotPasswordClick,
  forgotPasswordPath = '/forgot-password',
}) => {
  return (
    <div className="d-flex justify-content-between align-items-center mb-3">
      <div className="form-check d-flex align-items-center gap-2 mb-0">
        <input
          id="rememberMeCheckbox"
          type="checkbox"
          className="form-check-input mt-0"
          checked={checked}
          onChange={onChange}
          style={{
            cursor: 'pointer',
            borderColor: '#CBD5E1',
            accentColor: '#E90064',
          }}
        />
        <label
          htmlFor="rememberMeCheckbox"
          className="form-check-label small text-secondary user-select-none"
          style={{ cursor: 'pointer', fontSize: '0.82rem', color: '#475569' }}
        >
          Remember me
        </label>
      </div>

      {onForgotPasswordClick ? (
        <button
          type="button"
          onClick={onForgotPasswordClick}
          className="btn btn-link p-0 small text-decoration-none fw-semibold border-0 bg-transparent"
          style={{ color: '#E90064', fontSize: '0.82rem' }}
        >
          Forgot Password?
        </button>
      ) : (
        <Link
          to={forgotPasswordPath}
          className="small text-decoration-none fw-semibold"
          style={{ color: '#E90064', fontSize: '0.82rem' }}
        >
          Forgot Password?
        </Link>
      )}
    </div>
  );
};

export default RememberMe;
