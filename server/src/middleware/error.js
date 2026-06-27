// Central error handler. Turns thrown ApiError (or anything else) into a
// consistent JSON shape: { error: { message, fields? } }.
import { ApiError } from '../utils/errors.js';

// eslint-disable-next-line no-unused-vars
export function errorHandler(err, _req, res, _next) {
  if (err instanceof ApiError) {
    return res.status(err.status).json({
      error: { message: err.message, ...(err.fields ? { fields: err.fields } : {}) },
    });
  }
  // Unexpected error: log server-side, return a generic message to the client.
  // eslint-disable-next-line no-console
  console.error('[error]', err);
  res.status(500).json({ error: { message: 'Внутренняя ошибка сервера' } });
}

export function notFoundHandler(_req, res) {
  res.status(404).json({ error: { message: 'Ресурс не найден' } });
}
