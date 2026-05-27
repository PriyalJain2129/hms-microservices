import api from './axios';

export const getAll = () => api.get('/api/doctors');
export const getById = (id) => api.get(`/api/doctors/${id}`);
export const getByDepartment = (dept) => api.get(`/api/doctors/department/${encodeURIComponent(dept)}`);
export const getAvailable = () => api.get('/api/doctors/available');
export const create = (data) => api.post('/api/doctors', data);
export const update = (id, data) => api.put(`/api/doctors/${id}`, data);
export const remove = (id) => api.delete(`/api/doctors/${id}`);
export const getCount = () => api.get('/api/doctors/count');
export const search = (name) => api.get(`/api/doctors/search?name=${encodeURIComponent(name)}`);
