import axios from 'axios';

const rawBackend = (typeof import.meta !== 'undefined' && ((import.meta as any).env?.VITE_API_URL || (import.meta as any).env?.VITE_BACKEND_URL)) || '';
const baseURL = rawBackend 
  ? (rawBackend.endsWith('/api') ? rawBackend : `${rawBackend.replace(/\/$/, '')}/api`) 
  : '/api';

const api = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('vertex_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // If unauthorized and not on login page, remove expired token
      if (!window.location.pathname.includes('/login')) {
        localStorage.removeItem('vertex_token');
      }
    }
    return Promise.reject(error);
  }
);

export default api;
