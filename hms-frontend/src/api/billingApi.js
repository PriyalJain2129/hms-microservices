import api from './axios';

export const getAll = () => api.get('/api/billing');
export const getByPatient = (id) => api.get(`/api/billing/patient/${id}`);
export const getPending = () => api.get('/api/billing/pending');
export const getTotalRevenue = () => api.get('/api/billing/revenue/total');
export const getPendingCount = () => api.get('/api/billing/count/pending');
export const create = (data) => api.post('/api/billing', data);
export const markPaid = (id) => api.put(`/api/billing/${id}/pay`);
export const remove = (id) => api.delete(`/api/billing/${id}`);
