import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const axiosClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Intercept requests to add authorization header
axiosClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('shopmart_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Intercept responses for consistent error handling and dual-access compatibility
axiosClient.interceptors.response.use(
  (response) => {
    const payload = response.data;
    if (payload && typeof payload === 'object') {
      try {
        if (payload.data && typeof payload.data === 'object') {
          if (!('success' in payload.data)) {
            Object.defineProperty(payload.data, 'success', {
              get() {
                return payload.success;
              },
              configurable: true,
              enumerable: false,
            });
          }
          if (!('data' in payload.data)) {
            Object.defineProperty(payload.data, 'data', {
              get() {
                return payload.data;
              },
              configurable: true,
              enumerable: false,
            });
          }
        }
      } catch {
        // Fallback silently if immutable
      }
    }
    return payload;
  },
  (error) => {
    const message =
      (error.response && error.response.data && error.response.data.message) ||
      error.message ||
      'An unexpected error occurred';
    return Promise.reject(new Error(message));
  }
);

export default axiosClient;

