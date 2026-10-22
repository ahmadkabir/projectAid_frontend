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
  getDocumentPreview: (id, params) => api.get(`/projects/${id}/document-preview`, { params }),
  // Same preview rendered as a watermarked PDF (page numbers in the footer).
  documentPreviewPdf: (id, params) =>
    api.get(`/projects/${id}/document-preview.pdf`, { params, responseType: 'blob' }),
  create: (formData) => api.post('/projects', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  update: (id, formData) => api.put(`/projects/${id}`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  updateStatus: (id, status) => api.patch(`/projects/${id}/status`, { status }),
  uploadDocumentation: (id, formData) => api.post(`/projects/${id}/documentation`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  uploadSoftware: (id, formData) => api.post(`/projects/${id}/software`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  archiveSoftware: (id) => api.delete(`/projects/${id}/software`),
  // Direct-to-R2 uploads: the API only signs and records metadata.
  presignUpload: (id, payload) => api.post(`/projects/${id}/files/presign`, payload),
  completeUpload: (id, payload) => api.post(`/projects/${id}/files/complete`, payload),
  getFiles: (id, params) => api.get(`/projects/${id}/files`, { params }),
  delete: (id) => api.delete(`/projects/${id}`),
  getCategories: () => api.get('/projects/categories'),
  createCategory: (data) => api.post('/projects/categories', data)
};

/**
 * Upload one file straight to private object storage (Cloudflare R2).
 *
 * 1. Ask the API for a short-lived presigned PUT URL and storage key.
 * 2. PUT the bytes directly to R2 with XHR so real progress can be reported
 *    (axios does not expose upload progress for browser requests).
 * 3. Ask the API to verify the object and record it as the current file.
 *
 * Resolves with `{ file, message }`; rejects with the API error so callers can
 * show `error.response?.data?.message`.
 */
export const uploadProjectFile = ({ projectId, category, file, onProgress }) => {
  if (!file) return Promise.reject(new Error('No file selected'));

  const metadata = {
    category,
    fileName: file.name,
    mimeType: file.type || 'application/octet-stream',
    size: file.size
  };

  return projectsAPI
    .presignUpload(projectId, metadata)
    .then(async ({ data }) => {
      const upload = data.upload;

      // Local deployments: no object storage is configured, so send the file
      // through the classic authenticated multipart endpoint instead.
      if (upload.mode === 'multipart') {
        if (onProgress) onProgress(10);
        const formData = new FormData();
        let response;
        if (category === 'documentation') {
          formData.append('documentationFile', file);
          response = await projectsAPI.uploadDocumentation(projectId, formData);
        } else {
          formData.append('hasSoftware', 'true');
          formData.append(category === 'software' ? 'softwareInstaller' : 'softwareGuide', file);
          response = await projectsAPI.uploadSoftware(projectId, formData);
        }
        if (onProgress) onProgress(100);
        return response.data;
      }

      return new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();

        xhr.open('PUT', upload.uploadUrl, true);
        Object.entries(upload.headers || {}).forEach(([name, value]) => {
          xhr.setRequestHeader(name, value);
        });

        xhr.upload.onprogress = (event) => {
          if (event.lengthComputable && onProgress) {
            onProgress(Math.min(99, Math.round((event.loaded / event.total) * 100)));
          }
        };

        xhr.onload = async () => {
          if (xhr.status < 200 || xhr.status >= 300) {
            reject(new Error(`Upload failed (${xhr.status}). Check the storage CORS configuration.`));
            return;
          }
          if (onProgress) onProgress(100);
          try {
            const completed = await projectsAPI.completeUpload(projectId, {
              ...metadata,
              storageKey: upload.storageKey
            });
            resolve(completed.data);
          } catch (error) {
            reject(error);
          }
        };

        xhr.onerror = () =>
          reject(new Error('Network error while uploading. Check the storage CORS configuration.'));
        xhr.onabort = () => reject(new Error('Upload cancelled'));

        xhr.send(file);
      });
    });
};

// Private file downloads. Files never have a public URL: the backend checks the
// session and the purchase before streaming (or redirecting to a signed URL).
export const filesAPI = {
  download: (fileId) => api.get(`/files/${fileId}/download`, { responseType: 'blob' }),
  // Watermarked PDF rendering: inline for the in-app viewer, `download=1` for
  // an attachment. Entitlement is enforced by the backend.
  pdf: (fileId, params) => api.get(`/files/${fileId}/pdf`, { params, responseType: 'blob' })
};

const pdfFileName = (title) => {
  const base = String(title || 'document')
    .replace(/[^\w\s-]+/g, '')
    .trim()
    .replace(/\s+/g, '_')
    .slice(0, 80);
  return `${base || 'document'}.pdf`;
};

/**
 * Download the watermarked PDF version of a purchased document.
 */
export const downloadWatermarkedPdf = async (file, title) => {
  if (!file?.id) {
    toast.error('This file is not available');
    return;
  }

  try {
    const response = await filesAPI.pdf(file.id, { download: 1 });
    const url = window.URL.createObjectURL(new Blob([response.data], { type: 'application/pdf' }));
    const link = document.createElement('a');
    link.href = url;
    link.download = pdfFileName(title);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  } catch (error) {
    toast.error(error.response?.data?.message || 'Unable to download this document');
  }
};

/**
 * Fetch the watermarked PDF as an object URL for the in-app viewer.
 * The caller owns the URL and must revoke it.
 */
export const fetchWatermarkedPdfUrl = async (file) => {
  if (!file?.id) {
    toast.error('This file is not available');
    return null;
  }

  try {
    const response = await filesAPI.pdf(file.id);
    return window.URL.createObjectURL(new Blob([response.data], { type: 'application/pdf' }));
  } catch (error) {
    toast.error(error.response?.data?.message || 'Unable to open this document');
    return null;
  }
};

/**
 * Download a project file through the authenticated API and save it with its
 * original name.
 */
export const downloadProjectFile = async (file) => {
  if (!file?.id) {
    toast.error('This file is not available');
    return;
  }

  try {
    const response = await filesAPI.download(file.id);
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.download = file.originalName || file.fileName || 'download';
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  } catch (error) {
    toast.error(error.response?.data?.message || 'Unable to download this file');
  }
};

// Orders API
export const ordersAPI = {
  create: (data) => api.post('/orders', data),
  initializePayment: (orderId) => api.post(`/orders/${orderId}/pay`),
  verifyPayment: (reference) => api.get('/orders/payment-status', { params: { reference } }),
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
