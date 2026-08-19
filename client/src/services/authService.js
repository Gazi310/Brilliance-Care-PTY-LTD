import { api, setToken } from './api.js';

export async function login(email, password) {
  const data = await api.post('/auth/login', { email, password });
  setToken(data.token);
  return data.user;
}

/**
 * Create an account.
 *
 * Takes an object rather than positional arguments because the sign-up
 * form now collects a phone number too, and `register(a, b, c, d)` at
 * four fields is the point where the next one gets passed in the wrong
 * slot. `phone` is optional — the server defaults it to ''.
 */
export async function register({ name, email, password, phone = '' }) {
  const data = await api.post('/auth/register', { name, email, password, phone });
  setToken(data.token);
  return data.user;
}

export async function fetchMe() {
  const data = await api.get('/auth/me', true);
  return data.user;
}

/**
 * Patch the signed-in customer's profile.
 *
 * Send only the keys you're changing — the server merges rather than
 * replaces, so each card on /account/profile saves on its own without
 * blanking the others.
 */
export async function updateProfile(fields) {
  const data = await api.put('/auth/profile', fields, true);
  return data.user;
}

export function logout() {
  setToken(null);
}
