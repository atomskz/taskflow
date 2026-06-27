// Minimal in-memory fixed-window rate limiter. No external store — fine for a
// single-process deployment; swap for a shared store if you scale horizontally.
import { tooManyRequests } from '../utils/errors.js';

export function createRateLimiter({ windowMs, max, message }) {
  const hits = new Map(); // key -> { count, resetAt }

  return function rateLimit(req, res, next) {
    const now = Date.now();
    const key = req.ip || req.socket?.remoteAddress || 'unknown';
    let entry = hits.get(key);

    if (!entry || now > entry.resetAt) {
      entry = { count: 0, resetAt: now + windowMs };
      hits.set(key, entry);
      // Opportunistic cleanup so the map doesn't grow unbounded.
      if (hits.size > 5000) {
        for (const [k, v] of hits) if (now > v.resetAt) hits.delete(k);
      }
    }

    entry.count += 1;
    const remaining = Math.max(0, max - entry.count);
    res.setHeader('X-RateLimit-Limit', String(max));
    res.setHeader('X-RateLimit-Remaining', String(remaining));

    if (entry.count > max) {
      const retryAfter = Math.ceil((entry.resetAt - now) / 1000);
      res.setHeader('Retry-After', String(retryAfter));
      return next(tooManyRequests(message || 'Слишком много запросов. Попробуйте позже.'));
    }
    next();
  };
}
