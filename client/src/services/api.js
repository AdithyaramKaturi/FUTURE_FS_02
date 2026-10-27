import axios from 'axios';

// Get API base URL from environment or fallback to relative /api (uses Vite proxy)
const baseURL = import.meta.env.VITE_API_BASE_URL || '/api';

export const api = axios.create({
  baseURL,
  withCredentials: true, // Send and receive HTTP-only cookies
  headers: {
    'Content-Type': 'application/json'
  }
});

// Response interceptor for consistent error extraction
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const errorResponse = error.response?.data || {};
    const message =
      errorResponse.message ||
      error.message ||
      'An unexpected network or server error occurred.';

    return Promise.reject({
      status: error.response?.status,
      message,
      errors: errorResponse.errors || []
    });
  }
);

export default api;
