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
  const token = typeof window !== 'undefined' 
    ? (localStorage.getItem('vertex_token') || localStorage.getItem('vx_token'))
    : null;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => Promise.reject(error)
);

export default api;
