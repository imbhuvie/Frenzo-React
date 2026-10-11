import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000,
});

// Attach JWT token to every request if available
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('frenzo_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle 401 globally — clear stale auth state
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && localStorage.getItem('frenzo_token')) {
      localStorage.removeItem('frenzo_token');
      localStorage.removeItem('frenzo_user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
