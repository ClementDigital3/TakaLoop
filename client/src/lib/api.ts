import axios from 'axios';

const API = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || '/api',
  withCredentials: true,
});

API.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('takaloop_token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

API.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401 && typeof window !== 'undefined') {
      localStorage.removeItem('takaloop_token');
      localStorage.removeItem('takaloop_user');
      window.location.href = '/auth';
    }
    return Promise.reject(err);
  }
);

export default API;

// Auth
export const authAPI = {
  register: (data: any) => API.post('/auth/register', data),
  login: (data: any) => API.post('/auth/login', data),
  getMe: () => API.get('/auth/me'),
  updateProfile: (data: any) => API.patch('/auth/profile', data),
};

// Listings
export const listingsAPI = {
  getAll: (params?: any) => API.get('/listings', { params }),
  getOne: (id: string) => API.get(`/listings/${id}`),
  create: (data: any) => API.post('/listings', data),
  update: (id: string, data: any) => API.patch(`/listings/${id}`, data),
  delete: (id: string) => API.delete(`/listings/${id}`),
  getMy: () => API.get('/listings/my'),
};

// Transactions
export const transactionsAPI = {
  initiate: (data: any) => API.post('/transactions/initiate', data),
  confirmDelivery: (id: string) => API.patch(`/transactions/${id}/confirm`),
  raiseDispute: (id: string, reason: string) => API.patch(`/transactions/${id}/dispute`, { reason }),
  getMy: () => API.get('/transactions/my'),
};

// Points
export const pointsAPI = {
  getMyPoints: () => API.get('/points/my'),
  redeem: (data: any) => API.post('/points/redeem', data),
  awardDeposit: (data: any) => API.post('/points/award/deposit', data),
};

// Reports
export const reportsAPI = {
  create: (data: any) => API.post('/reports', data),
  getAll: (params?: any) => API.get('/reports', { params }),
  getMy: () => API.get('/reports/my'),
  updateStatus: (id: string, data: any) => API.patch(`/reports/${id}/status`, data),
  upvote: (id: string) => API.patch(`/reports/${id}/upvote`),
};

// Audit
export const auditAPI = {
  create: (data: any) => API.post('/audit', data),
  getMy: () => API.get('/audit/my'),
  getOne: (id: string) => API.get(`/audit/${id}`),
};

// Collection Points
export const collectionPointsAPI = {
  getAll: (params?: any) => API.get('/collection-points', { params }),
  getOne: (id: string) => API.get(`/collection-points/${id}`),
  create: (data: any) => API.post('/collection-points', data),
};

// Impact
export const impactAPI = {
  getStats: () => API.get('/impact'),
};

// Admin
export const adminAPI = {
  getStats: () => API.get('/admin/stats'),
  getUsers: (params?: any) => API.get('/admin/users', { params }),
  updateUser: (id: string, data: any) => API.patch(`/admin/users/${id}`, data),
  updatePricing: (data: any) => API.post('/admin/pricing', data),
  getDisputes: () => API.get('/admin/disputes'),
  resolveDispute: (id: string, data: any) => API.patch(`/admin/disputes/${id}/resolve`, data),
};

// Pricing
export const pricingAPI = {
  getAll: () => API.get('/pricing'),
};

// Leaderboard
export const leaderboardAPI = {
  get: () => API.get('/users/leaderboard'),
};
