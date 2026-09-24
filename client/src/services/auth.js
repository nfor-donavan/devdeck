import { api } from '../api/client.js';

export const authApi = {
  login: (body) => api('/auth/login', { method: 'POST', body }),
  register: (body) => api('/auth/register', { method: 'POST', body }),
  forgot: (email) => api('/auth/forgot-password', { method: 'POST', body: { email } }),
  reset: (body) => api('/auth/reset-password', { method: 'POST', body }),
  me: () => api('/auth/me'),
  saveSettings: (body) => api('/auth/settings', { method: 'PATCH', body }),
  changePassword: (body) => api('/auth/change-password', { method: 'POST', body }),
};
