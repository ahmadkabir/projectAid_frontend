import axios from 'axios';
import toast from 'react-hot-toast';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Don't redirect on login/register endpoints - let them handle their own errors
    const isAuthEndpoint = error.config?.url?.includes('/auth/login') || 
                          error.config?.url?.includes('/auth/register');
    
    if (error.response?.status === 401 && !isAuthEndpoint) {
      // The session check (auth/me) runs on every page load. A 401 there only
      // means the stored token is stale: AuthContext clears it and the visitor
      // continues as a guest, so public pages (project details, catalog,
      // preview) stay readable instead of throwing the user to /login.
      const isSessionProbe = error.config?.url?.includes('/auth/me');

      if (!isSessionProbe && window.location.pathname !== '/login') {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
        toast.error('Session expired. Please login again.');
      }
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  getMe: () => api.get('/auth/me'),
  verifyEmail: (token) => api.post('/auth/verify-email', { token }),
  resendVerification: (email) => api.post('/auth/resend-verification', { email })
};

// Projects API
export const projectsAPI = {
  getAll: (params) => api.get('/projects', { params }),
  getById: (id) => api.get(`/projects/${id}`),
  getDocumentPreview: (id) => api.get(`/projects/${id}/document-preview`),
  create: (formData) => api.post('/projects', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  update: (id, formData) => api.put(`/projects/${id}`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  delete: (id) => api.delete(`/projects/${id}`),
  getCategories: () => api.get('/projects/categories'),
  createCategory: (data) => api.post('/projects/categories', data)
};

// Orders API
export const ordersAPI = {
  create: (data) => api.post('/orders', data),
  processPayment: (orderId, data) => api.post(`/orders/${orderId}/payment`, data),
  getUserOrders: () => api.get('/orders'),
  getAllOrders: (params) => api.get('/orders/all', { params }),
  getById: (id) => api.get(`/orders/${id}`)
};

// Support API
export const supportAPI = {
  create: (data) => api.post('/support', data),
  getUserRequests: () => api.get('/support'),
  getAllRequests: () => api.get('/support/all'),
  getById: (id) => api.get(`/support/${id}`),
  update: (id, data) => api.put(`/support/${id}`, data)
};

// Users API
export const usersAPI = {
  getProfile: () => api.get('/users/profile'),
  updateProfile: (data) => api.put('/users/profile', data),
  changePassword: (data) => api.put('/users/profile/password', data),
  uploadProfileImage: (formData) => api.put('/users/profile/avatar', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  getAll: () => api.get('/users'),
  getById: (id) => api.get(`/users/${id}`),
  update: (id, data) => api.put(`/users/${id}`, data),
  delete: (id) => api.delete(`/users/${id}`)
};

// Full URL for a user's avatar filename, or null when none is set
export const getAvatarUrl = (profileImage) =>
  profileImage
    ? `${API_URL.replace('/api', '')}/uploads/avatars/${profileImage}`
    : null;

// Analytics API (Admin only)
export const analyticsAPI = {
  getDashboard: (params) => api.get('/analytics/dashboard', { params }),
  getRevenue: (params) => api.get('/analytics/revenue', { params }),
  getOrders: (params) => api.get('/analytics/orders', { params }),
  getProjects: (params) => api.get('/analytics/projects', { params }),
  getSupport: (params) => api.get('/analytics/support', { params })
};

// Document API (Admin only)
export const documentAPI = {
  generate: (projectId) => api.post(`/admin/projects/${projectId}/generate-doc`),
  get: (projectId) => api.get(`/admin/projects/${projectId}/document`),
  save: (projectId, content) => api.put(`/admin/projects/${projectId}/document`, { content }),
  saveFile: (projectId, payload) => api.post(`/admin/projects/${projectId}/save-document`, payload)
};

export default api;
