const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

function getToken() {
  if (typeof window !== 'undefined' && window.location.pathname.startsWith('/admin')) {
    return localStorage.getItem('adminToken');
  }
  return localStorage.getItem('customerToken') || localStorage.getItem('adminToken');
}

async function request(endpoint, options = {}) {
  const token = options.token !== undefined ? options.token : getToken();
  const { token: _t, ...fetchOptions } = options;
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...fetchOptions.headers,
  };

  const res = await fetch(`${API_URL}${endpoint}`, {
    ...fetchOptions,
    headers,
    credentials: 'include',
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    const err = new Error(data.error || data.message || 'Request failed');
    err.status = res.status;
    err.details = data.details;
    throw err;
  }

  return data;
}

export const api = {
  get: (url, options) => request(url, options),
  post: (url, body, options) => request(url, { method: 'POST', body: JSON.stringify(body), ...options }),
  put: (url, body, options) => request(url, { method: 'PUT', body: JSON.stringify(body), ...options }),
  delete: (url, options) => request(url, { method: 'DELETE', ...options }),
};

export default api;
