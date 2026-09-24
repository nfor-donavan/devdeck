const BASE = import.meta.env.VITE_API_URL || '/api';

export const getToken = () => localStorage.getItem('dd-token');
export const setToken = (t) => (t ? localStorage.setItem('dd-token', t) : localStorage.removeItem('dd-token'));

export async function api(path, { method = 'GET', body, params } = {}) {
  const qs = params
    ? '?' + new URLSearchParams(Object.entries(params).filter(([, v]) => v !== undefined && v !== null && v !== ''))
    : '';
  const res = await fetch(BASE + path + qs, {
    method,
    headers: { 'Content-Type': 'application/json', ...(getToken() ? { Authorization: 'Bearer ' + getToken() } : {}) },
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = res.status === 204 ? null : await res.json().catch(() => null);
  if (!res.ok) {
    if (res.status === 401 && getToken()) {
      setToken(null);
      window.dispatchEvent(new Event('dd-logout'));
    }
    throw new Error(data?.error || 'Request failed');
  }
  return data;
}

// Tell every mounted list/page to reload after something was created or changed.
export const refreshAll = () => window.dispatchEvent(new Event('dd-refresh'));
