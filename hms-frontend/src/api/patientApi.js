import api from './axios';

export const getAll = () => api.get('/api/patients');
export const getById = (id) => api.get(`/api/patients/${id}`);
export const search = (name) => api.get(`/api/patients/search?name=${encodeURIComponent(name)}`);
export const create = (data) => api.post('/api/patients', data);
export const update = (id, data) => api.put(`/api/patients/${id}`, data);
export const remove = (id) => api.delete(`/api/patients/${id}`);
export const getCount = () => api.get('/api/patients/count');
