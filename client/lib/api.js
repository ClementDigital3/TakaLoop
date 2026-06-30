import axios from 'axios';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api',
  timeout: 30000,
});

api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('takaloop_token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401 && typeof window !== 'undefined') {
      localStorage.removeItem('takaloop_token');
      localStorage.removeItem('takaloop_user');
      window.location.href = '/auth/login';
    }
    return Promise.reject(err);
  }
);

export default api;

export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  getMe: () => api.get('/auth/me'),
  updateProfile: (data) => api.patch('/auth/me', data),
};
export const listingsAPI = {
  getAll: (params) => api.get('/listings', { params }),
  getMine: () => api.get('/listings/mine'),
  getOne: (id) => api.get(`/listings/${id}`),
  create: (data) => api.post('/listings', data, { headers: { 'Content-Type': 'multipart/form-data' } }),
  update: (id, data) => api.patch(`/listings/${id}`, data),
  delete: (id) => api.delete(`/listings/${id}`),
};
export const transactionsAPI = {
  initiate: (data) => api.post('/transactions', data),
  getMine: () => api.get('/transactions/mine'),
  confirm: (id) => api.patch(`/transactions/${id}/confirm`),
  dispute: (id, reason) => api.post(`/transactions/${id}/dispute`, { reason }),
};
export const pointsAPI = {
  getMine: () => api.get('/points/mine'),
  award: (data) => api.post('/points/award', data),
  redeem: (data) => api.post('/points/redeem', data),
  getLeaderboard: (params) => api.get('/points/leaderboard', { params }),
};
export const reportsAPI = {
  create: (data) => api.post('/reports', data, { headers: { 'Content-Type': 'multipart/form-data' } }),
  getAll: (params) => api.get('/reports', { params }),
  getMine: () => api.get('/reports/mine'),
  updateStatus: (id, data) => api.patch(`/reports/${id}/status`, data),
  upvote: (id) => api.patch(`/reports/${id}/upvote`),
};
export const auditAPI = {
  create: (data) => api.post('/audit', data),
  getMine: () => api.get('/audit/mine'),
  getOne: (id) => api.get(`/audit/${id}`),
};
export const collectionAPI = {
  getAll: (params) => api.get('/collection-points', { params }),
  getOne: (id) => api.get(`/collection-points/${id}`),
  create: (data) => api.post('/collection-points', data),
};
export const impactAPI = {
  getPublic: () => api.get('/impact'),
  getCounty: (county) => api.get(`/impact/county/${county}`),
};
export const pricingAPI = {
  getAll: () => api.get('/pricing'),
  set: (data) => api.post('/pricing', data),
};
export const carbonAPI = {
  getMine: () => api.get('/carbon/mine'),
  getLeaderboard: () => api.get('/carbon/leaderboard'),
};
export const adminAPI = {
  getDashboard: () => api.get('/admin/dashboard'),
  getUsers: (params) => api.get('/admin/users', { params }),
  verifyUser: (id, badge) => api.patch(`/admin/users/${id}/verify`, { badge }),
  getDisputes: () => api.get('/admin/disputes'),
  resolveDispute: (id, data) => api.patch(`/admin/disputes/${id}/resolve`, data),
};
