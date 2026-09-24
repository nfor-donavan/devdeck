import { api } from '../api/client.js';

export const resource = (name) => ({
  list: (params) => api('/' + name, { params }),
  get: (id) => api(`/${name}/${id}`),
  create: (body) => api('/' + name, { method: 'POST', body }),
  update: (id, body) => api(`/${name}/${id}`, { method: 'PATCH', body }),
  remove: (id) => api(`/${name}/${id}`, { method: 'DELETE' }),
});

export const dashboardApi = {
  get: () => api('/dashboard'),
  plan: (hours) => api('/dashboard/plan', { method: 'POST', body: { hours } }),
  apply: (items) => api('/dashboard/plan/apply', { method: 'POST', body: { items } }),
};
export const searchApi = (q) => api('/search', { params: { q } });
export const calendarApi = (from, to) => api('/calendar', { params: { from, to } });
export const analyticsApi = (days) => api('/analytics', { params: { days } });
export const activityApi = (params) => api('/activity', { params });
export const notificationsApi = {
  list: (params) => api('/notifications', { params }),
  read: (id, read = true) => api('/notifications/' + id, { method: 'PATCH', body: { read } }),
  readAll: () => api('/notifications/read-all', { method: 'POST' }),
  remove: (id) => api('/notifications/' + id, { method: 'DELETE' }),
};
