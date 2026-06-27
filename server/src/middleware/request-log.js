// Structured access log: one line per request with method, path, status and
// duration. Skips the health check to avoid noise from container probes.
import { logger } from '../utils/logger.js';

export function requestLog(req, res, next) {
  if (req.path === '/api/health') return next();
  const start = process.hrtime.bigint();
  res.on('finish', () => {
    const ms = Number(process.hrtime.bigint() - start) / 1e6;
    logger.info('request', {
      method: req.method,
      path: req.originalUrl,
      status: res.statusCode,
      durationMs: Math.round(ms * 10) / 10,
    });
  });
  next();
}
