// src/services/api.js
import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// API endpoints
export const salesInvoiceAPI = {
  getAll: () => api.get('/sales-invoices'),
  getById: (id) => api.get(`/sales-invoices/${id}`),
  create: (data) => api.post('/sales-invoices', data),
  update: (id, data) => api.patch(`/sales-invoices/${id}`, data),
  delete: (id) => api.delete(`/sales-invoices/${id}`),
};

export const contactAPI = {
  getAll: () => api.get('/contacts'),
  getById: (id) => api.get(`/contacts/${id}`),
  create: (data) => api.post('/contacts', data),
  update: (id, data) => api.patch(`/contacts/${id}`, data),
  delete: (id) => api.delete(`/contacts/${id}`),
};

export const itemAPI = {
  getAll: () => api.get('/items'),
  getById: (id) => api.get(`/items/${id}`),
  getSaleDetails: (id) => api.get(`/items/${id}/sale-details`),
  create: (data) => api.post('/items', data),
  update: (id, data) => api.patch(`/items/${id}`, data),
  delete: (id) => api.delete(`/items/${id}`),
};

export const projectAPI = {
  getAll: () => api.get('/projects'),
  getById: (id) => api.get(`/projects/${id}`),
  create: (data) => api.post('/projects', data),
  update: (id, data) => api.patch(`/projects/${id}`, data),
  delete: (id) => api.delete(`/projects/${id}`),
};

export const chartOfAccountsAPI = {
  getAll: () => api.get('/chart-of-accounts'),
  getById: (id) => api.get(`/chart-of-accounts/${id}`),
  create: (data) => api.post('/chart-of-accounts', data),
  update: (id, data) => api.patch(`/chart-of-accounts/${id}`, data),
  delete: (id) => api.delete(`/chart-of-accounts/${id}`),
};

export const bankAccountAPI = {
  getAll: () => api.get('/bank-accounts'),
  getById: (id) => api.get(`/bank-accounts/${id}`),
  create: (data) => api.post('/bank-accounts', data),
  update: (id, data) => api.patch(`/bank-accounts/${id}`, data),
  delete: (id) => api.delete(`/bank-accounts/${id}`),
};

export default api;