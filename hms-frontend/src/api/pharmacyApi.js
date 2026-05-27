import api from './axios';

export const getAll = () => api.get('/api/pharmacy');
export const search = (name) => api.get(`/api/pharmacy/search?name=${encodeURIComponent(name)}`);
export const getLowStock = () => api.get('/api/pharmacy/low-stock');
export const getCount = () => api.get('/api/pharmacy/count');
export const create = (data) => api.post('/api/pharmacy', data);
export const update = (id, data) => api.put(`/api/pharmacy/${id}`, data);
export const updateStock = (id, qty) => api.put(`/api/pharmacy/${id}/stock?quantity=${qty}`);
export const remove = (id) => api.delete(`/api/pharmacy/${id}`);
