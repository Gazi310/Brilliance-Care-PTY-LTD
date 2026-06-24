// Tiny fetch wrapper around the backend API with JWT support.
const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
const TOKEN_KEY = 'bc_token';

export function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token) {
  if (token) localStorage.setItem(TOKEN_KEY, token);
  else localStorage.removeItem(TOKEN_KEY);
}

async function request(path, { method = 'GET', body, auth = false } = {}) {
  const headers = { 'Content-Type': 'application/json' };
  if (auth) {
    const token = getToken();
    if (token) headers.Authorization = `Bearer ${token}`;
  }

  let res;
  try {
    res = await fetch(`${BASE_URL}${path}`, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
    });
  } catch {
    throw new Error('Cannot reach the server. Is the backend running on port 5000?');
  }

  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.message || `Request failed (${res.status})`);
  return data;
}

export const api = {
  get: (path, auth = false) => request(path, { auth }),
  post: (path, body, auth = false) => request(path, { method: 'POST', body, auth }),
  put: (path, body, auth = false) => request(path, { method: 'PUT', body, auth }),
  patch: (path, body, auth = false) => request(path, { method: 'PATCH', body, auth }),
  del: (path, auth = false) => request(path, { method: 'DELETE', auth }),
};
