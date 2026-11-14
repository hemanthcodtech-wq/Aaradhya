import React, { useState } from 'react';
import { Lock, Eye, EyeOff, AlertCircle } from 'lucide-react';

const PasswordInput = ({
  id = 'password',
  label = 'Password',
  value,
  onChange,
  placeholder = '••••••••',
  error,
  disabled = false,
  required = true,
  autoComplete = 'current-password',
}) => {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="mb-3 text-start">
      <div className="d-flex justify-content-between align-items-center mb-1.5">
        <label
          htmlFor={id}
          className="form-label small fw-semibold text-dark mb-0"
          style={{ fontSize: '0.82rem', color: '#17233B' }}
        >
          {label} {required && <span style={{ color: '#E90064' }}>*</span>}
        </label>
      </div>

      <div className="position-relative">
        <span
          className="position-absolute top-50 start-0 translate-middle-y ps-3 text-muted d-flex align-items-center"
          style={{ pointerEvents: 'none', color: '#94A3B8', zIndex: 3 }}
        >
          <Lock size={17} strokeWidth={1.8} />
        </span>

        <input
          id={id}
          name={id}
          type={showPassword ? 'text' : 'password'}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          disabled={disabled}
          required={required}
          autoComplete={autoComplete}
          className={`form-control rounded-3 ps-5 pe-5 py-2.5 ${error ? 'is-invalid border-danger' : ''}`}
          style={{
            borderColor: error ? '#EF4444' : '#E2E8F0',
            backgroundColor: '#FFFFFF',
            fontSize: '0.9rem',
            color: '#17233B',
            boxShadow: '0 1px 2px rgba(23, 35, 59, 0.03)',
            transition: 'border-color 0.15s ease, box-shadow 0.15s ease',
          }}
          onFocus={(e) => {
            if (!error) {
              e.target.style.borderColor = '#E90064';
              e.target.style.boxShadow = '0 0 0 3px rgba(233, 0, 100, 0.12)';
            }
          }}
          onBlur={(e) => {
            if (!error) {
              e.target.style.borderColor = '#E2E8F0';
              e.target.style.boxShadow = '0 1px 2px rgba(23, 35, 59, 0.03)';
            }
          }}
        />

        <button
          type="button"
          tabIndex={-1}
          className="btn position-absolute top-50 end-0 translate-middle-y pe-3 border-0 bg-transparent text-muted d-flex align-items-center"
          style={{ color: '#64748B', cursor: 'pointer', zIndex: 3 }}
          onClick={() => setShowPassword((prev) => !prev)}
          aria-label={showPassword ? 'Hide password' : 'Show password'}
        >
          {showPassword ? <EyeOff size={17} strokeWidth={1.8} /> : <Eye size={17} strokeWidth={1.8} />}
        </button>
      </div>

      {error && (
        <div className="d-flex align-items-center gap-1.5 text-danger small mt-1.5" style={{ fontSize: '0.76rem' }}>
          <AlertCircle size={13} className="flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
};

export default PasswordInput;
