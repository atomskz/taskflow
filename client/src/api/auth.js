// Auth API: register / login / current user / logout. Tokens are persisted by
// the client wrapper; these helpers store the token on success.
import { api, setToken, clearToken, getToken } from './client.js';

export async function register({ name, email, password }) {
  const { token, user } = await api.post('/auth/register', { name, email, password });
  setToken(token);
  return user;
}

export async function login({ email, password }) {
  const { token, user } = await api.post('/auth/login', { email, password });
  setToken(token);
  return user;
}

export async function getCurrentUser() {
  const { user } = await api.get('/auth/me');
  return user;
}

export async function logout() {
  try {
    await api.post('/auth/logout');
  } catch {
    /* logout is best-effort; we clear the local token regardless */
  }
  clearToken();
}

export const hasToken = () => !!getToken();
