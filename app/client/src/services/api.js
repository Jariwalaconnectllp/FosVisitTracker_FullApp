import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor - handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;

// Auth API
export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  getMe: () => api.get('/auth/me'),
};

// Visits API
export const visitsAPI = {
  create: (data) => {
    const formData = new FormData();
    Object.keys(data).forEach((key) => {
      if (data[key] !== null && data[key] !== undefined) {
        formData.append(key, data[key]);
      }
    });
    return api.post('/visits', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  getAll: (params) => api.get('/visits', { params }),
  getById: (id) => api.get(`/visits/${id}`),
  update: (id, data) => api.patch(`/visits/${id}`, data),
  delete: (id) => api.delete(`/visits/${id}`),
  getDashboardStats: () => api.get('/visits/dashboard-stats'),
};

// Dealers API
export const dealersAPI = {
  getAll: (params) => api.get('/dealers', { params }),
  getById: (id) => api.get(`/dealers/${id}`),
  create: (data) => api.post('/dealers', data),
  update: (id, data) => api.patch(`/dealers/${id}`, data),
  toggleActive: (id) => api.delete(`/dealers/${id}`),
  assign: (data) => api.post('/dealers/assign', data),
  unassign: (data) => api.post('/dealers/unassign', data),
};

// Targets API
export const targetsAPI = {
  getMy: (params) => api.get('/targets/my', { params }),
  getTeam: (params) => api.get('/targets/team', { params }),
  set: (data) => api.post('/targets', data),
  setBulk: (data) => api.post('/targets/bulk', data),
};

// Salesmen API
export const salesmenAPI = {
  getAll: () => api.get('/salesmen'),
  getById: (id) => api.get(`/salesmen/${id}`),
  create: (data) => api.post('/salesmen', data),
  update: (id, data) => api.patch(`/salesmen/${id}`, data),
  toggleActive: (id) => api.patch(`/salesmen/${id}/toggle-active`),
};

// Reports API
export const reportsAPI = {
  dealerVisits: (params) => api.get('/reports/dealer-visits', { params }),
  salesmanPerformance: (params) => api.get('/reports/salesman-performance', { params }),
  monthlySummary: (params) => api.get('/reports/monthly-summary', { params }),
  dealerCoverage: (params) => api.get('/reports/dealer-coverage', { params }),
  purposeAnalysis: (params) => api.get('/reports/purpose-analysis', { params }),
  bmVsSalesman: (params) => api.get('/reports/bm-vs-salesman', { params }),
};

// Notifications API
export const notificationsAPI = {
  getAll: (params) => api.get('/notifications', { params }),
  markAsRead: (id) => api.patch(`/notifications/${id}/read`),
  markAllAsRead: () => api.patch('/notifications/read-all'),
};