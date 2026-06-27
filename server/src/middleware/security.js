// Security headers (a focused, dependency-free subset of what helmet sets).
// The SPA is served by nginx, so this only guards the JSON API responses.
import { config } from '../config.js';

export function securityHeaders(_req, res, next) {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('Referrer-Policy', 'no-referrer');
  res.setHeader('X-DNS-Prefetch-Control', 'off');
  res.setHeader('Cross-Origin-Resource-Policy', 'same-origin');
  // API responses are never meant to be cached by shared caches.
  res.setHeader('Cache-Control', 'no-store');
  if (config.isProd) {
    res.setHeader('Strict-Transport-Security', 'max-age=15552000; includeSubDomains');
  }
  next();
}
