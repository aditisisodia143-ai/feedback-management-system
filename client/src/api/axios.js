// api/axios.js
// One axios instance for the whole app: base URL + token attached automatically.

import axios from 'axios';

const api = axios.create({
  baseURL: `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api`,
  timeout: 70000, // Render free tier can take up to ~60s to wake up
});

// Before every request: add the JWT from localStorage (if logged in)
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// After every response: if the token expired, log out and go to login
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const isAuthCall = error.config?.url?.startsWith('/auth/login');
    if (error.response?.status === 401 && !isAuthCall) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      if (window.location.pathname !== '/login') window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
