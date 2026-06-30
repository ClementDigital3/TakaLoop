import axios from 'axios';

const API = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api',
  timeout: 30000,
});

// Attach JWT token to every request
API.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('takaloop_token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle 401 globally
API.interceptors.response.use(
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

export default API;

// Auth
export const register = (data) => API.post('/auth/register', data);
export const login = (data) => API.post('/auth/login', data);
export const getMe = () => API.get('/auth/me');
export const updateProfile = (data) => API.put('/auth/update-profile', data);

// Listings
export const getListings = (params) => API.get('/listings', { params });
export const getListing = (id) => API.get(`/listings/${id}`);
export const createListing = (data) => API.post('/listings', data);
export const updateListing = (id, data) => API.put(`/listings/${id}`, data);
export const deleteListing = (id) => API.delete(`/listings/${id}`);
export const getMyListings = () => API.get('/listings/my/listings');

// Transactions
export const buyListing = (data) => API.post('/transactions', data);
export const getMyTransactions = () => API.get('/transactions/my');
export const confirmDelivery = (id) => API.post(`/transactions/${id}/confirm-delivery`);
export const raiseDispute = (id, reason) => API.post(`/transactions/${id}/raise-dispute`, { reason });

// Points
export const getLeaderboard = (params) => API.get('/points/leaderboard', { params });
export const getPointsHistory = () => API.get('/points/history');
export const redeemPoints = (data) => API.post('/points/redeem', data);
export const scanDeposit = (data) => API.post('/points/scan-deposit', data);

// Dump Reports
export const getReports = (params) => API.get('/reports', { params });
export const getReportsMap = (params) => API.get('/reports/map', { params });
export const createReport = (data) => API.post('/reports', data);
export const updateReportStatus = (id, data) => API.patch(`/reports/${id}/status`, data);
export const upvoteReport = (id) => API.post(`/reports/${id}/upvote`);

// Collection Points
export const getCollectionPoints = (params) => API.get('/collection-points', { params });

// Audit
export const runAudit = (data) => API.post('/audit', data);
export const getMyAudits = () => API.get('/audit/my');

// Impact
export const getImpact = () => API.get('/impact');

// Admin
export const adminGetUsers = (params) => API.get('/admin/users', { params });
export const adminUpdateUser = (id, data) => API.patch(`/admin/users/${id}`, data);
export const adminGetDisputes = () => API.get('/admin/disputes');
export const adminGetOverview = () => API.get('/admin/overview');
export const adminGetMarketRates = () => API.get('/admin/market-rates');
export const adminUpdateMarketRate = (category, data) => API.put(`/admin/market-rates/${category}`, data);
