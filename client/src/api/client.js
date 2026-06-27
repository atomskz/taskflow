// Thin fetch wrapper: base URL, JSON, bearer token, unified error handling.
// In dev, VITE_API_URL is empty and requests go to '/api/...' which Vite proxies
// to the backend (see vite.config.js). In prod, set VITE_API_URL to the API origin.

const BASE = (import.meta.env.VITE_API_URL || '') + '/api';

const TOKEN_KEY = 'taskflow.token';

export const getToken = () => {
  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
};

export const setToken = (token) => {
  try {
    if (token) localStorage.setItem(TOKEN_KEY, token);
    else localStorage.removeItem(TOKEN_KEY);
  } catch {
    /* ignore private-mode / quota errors */
  }
};

export const clearToken = () => setToken(null);

// Error carrying the HTTP status, a user-friendly message and optional
// per-field validation messages from the backend.
export class ApiError extends Error {
  constructor(message, status, fields) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.fields = fields || null;
  }
}

async function request(method, path, body) {
  const headers = {};
  const token = getToken();
  if (token) headers.Authorization = `Bearer ${token}`;
  if (body !== undefined) headers['Content-Type'] = 'application/json';

  let res;
  try {
    res = await fetch(BASE + path, {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  } catch {
    // Network / server-unreachable failure.
    throw new ApiError('Не удалось соединиться с сервером. Проверьте подключение.', 0);
  }

  if (res.status === 204) return null;

  let data = null;
  try {
    data = await res.json();
  } catch {
    data = null;
  }

  if (!res.ok) {
    const err = (data && data.error) || {};
    throw new ApiError(err.message || 'Произошла ошибка. Попробуйте ещё раз.', res.status, err.fields);
  }
  return data;
}

export const api = {
  get: (path) => request('GET', path),
  post: (path, body) => request('POST', path, body),
  patch: (path, body) => request('PATCH', path, body),
  delete: (path) => request('DELETE', path),
};
