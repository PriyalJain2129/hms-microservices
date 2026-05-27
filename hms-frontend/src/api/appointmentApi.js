import api from './axios';

export const getAll = () => api.get('/api/appointments');
export const getByPatient = (id) => api.get(`/api/appointments/patient/${id}`);
export const getByDoctor = (id) => api.get(`/api/appointments/doctor/${id}`);
export const getToday = () => api.get('/api/appointments/today');
export const getCount = () => api.get('/api/appointments/count');
export const getTodayCount = () => api.get('/api/appointments/count/today');
export const create = (data) => api.post('/api/appointments', data);
export const updateStatus = (id, status) => api.put(`/api/appointments/${id}/status?status=${encodeURIComponent(status)}`);
export const remove = (id) => api.delete(`/api/appointments/${id}`);
