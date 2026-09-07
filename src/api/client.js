import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:5000/api';

export const api = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

// Request interceptor: attach Bearer token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('radora_auth_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => Promise.reject(error));

// Response interceptor: handle 401 unauth
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // If token is invalid or expired and not already logging in
      if (!error.config.url.includes('/auth/login')) {
        localStorage.removeItem('radora_auth_token');
        localStorage.removeItem('radora_auth_user');
        window.dispatchEvent(new CustomEvent('radora:unauthorized'));
      }
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authApi = {
  login: (identifier, password) => api.post('/auth/login', { identifier, password }),
  getMe: () => api.get('/auth/me'),
  getUsers: () => api.get('/auth/users'),
  getUserById: (id) => api.get(`/auth/users/${id}`),
  createUser: (data) => api.post('/auth/users', data),
  updateUser: (id, data) => api.put(`/auth/users/${id}`, data),
  changePasswordByAdmin: (id, newPassword) => api.put(`/auth/users/${id}/password`, { newPassword }),
  changeSelfPassword: (currentPassword, newPassword) => api.put('/auth/change-password', { currentPassword, newPassword }),
  deleteUser: (id) => api.delete(`/auth/users/${id}`),
};

// Projects API
export const projectApi = {
  getAll: (params) => api.get('/projects', { params }),
  getById: (id) => api.get(`/projects/${id}`),
  create: (data) => api.post('/projects', data),
  update: (id, data) => api.put(`/projects/${id}`, data),
  delete: (id) => api.delete(`/projects/${id}`),
};

// Checklists API
export const checklistApi = {
  getAll: (projectId) => api.get('/checklists', { params: { projectId } }),
  getById: (id) => api.get(`/checklists/${id}`),
  create: (data) => api.post('/checklists', data),
  update: (id, data) => api.put(`/checklists/${id}`, data),
  delete: (id) => api.delete(`/checklists/${id}`),
  updateItem: (id, sectionId, itemId, updates) =>
    api.put(`/checklists/${id}/sections/${sectionId}/items/${itemId}`, updates),
  addSection: (id, name) => api.post(`/checklists/${id}/sections`, { name }),
  addItem: (id, sectionId, itemData) =>
    api.post(`/checklists/${id}/sections/${sectionId}/items`, itemData),
  deleteItem: (id, sectionId, itemId) =>
    api.delete(`/checklists/${id}/sections/${sectionId}/items/${itemId}`),
  bulkAction: (id, action) => api.post(`/checklists/${id}/bulk`, { action }),
};

// Templates API
export const templateApi = {
  getAll: () => api.get('/templates'),
  getById: (id) => api.get(`/templates/${id}`),
  create: (data) => api.post('/templates', data),
  update: (id, data) => api.put(`/templates/${id}`, data),
  delete: (id) => api.delete(`/templates/${id}`),
  instantiate: (templateId, projectId, title) =>
    api.post(`/templates/${templateId}/instantiate`, { projectId, title }),
};

// Analytics & Health API
export const analyticsApi = {
  getStats: () => api.get('/analytics/stats'),
  resetDemo: () => api.post('/analytics/reset'),
  getHealth: () => api.get('/health'),
};

// Chat API
export const chatApi = {
  getChannels: () => api.get('/chat/channels'),
  createChannel: (data) => api.post('/chat/channels', data),
  deleteChannel: (channelId) => api.delete(`/chat/channels/${channelId}`),
  getMessages: (channel) => api.get('/chat/messages', { params: { channel } }),
  sendMessage: (channel, content) => api.post('/chat/messages', { channel, content }),
  deleteMessage: (messageId, scope = 'me') => api.delete(`/chat/messages/${messageId}`, { params: { scope } }),
};

// Activity API
export const activityApi = {
  getAll: (params) => api.get('/activity', { params }),
  getByProject: (projectId, limit = 50) => api.get('/activity', { params: { projectId, limit } }),
  getStats: () => api.get('/activity/stats'),
};

