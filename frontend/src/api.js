import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  withCredentials: true,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('session_id');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export function getErrorMessage(err, defaultMessage = 'An error occurred. Please try again.') {
  if (err.response?.data?.detail) {
    const detail = err.response.data.detail;
    if (typeof detail === 'string') {
      return detail;
    }
    if (Array.isArray(detail)) {
      return detail.map((item) => item.msg || JSON.stringify(item)).join('; ');
    }
    if (typeof detail === 'object') {
      return detail.message || JSON.stringify(detail);
    }
  }
  if (err.code === 'ERR_NETWORK' || !err.response) {
    return 'Cannot connect to backend server. Please make sure the backend is running on port 8000.';
  }
  return defaultMessage;
}

export default api;
