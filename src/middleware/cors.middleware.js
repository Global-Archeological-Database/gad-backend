'use strict';

// ---------------------------------------------------------------------------
// GAD — CORS Middleware
// ---------------------------------------------------------------------------
// Strict origin allow-list. Logs blocked origins as warnings.
// ---------------------------------------------------------------------------

const cors = require('cors');

const DEFAULT_ORIGINS = [
  'http://localhost:3000',
  'http://localhost:3001',
];

const ALLOWED_ORIGINS = process.env.CORS_ORIGINS
  ? process.env.CORS_ORIGINS.split(',').map(o => o.trim()).filter(Boolean)
  : DEFAULT_ORIGINS;

/**
 * Checks whether an origin is allowed.
 * Accepts exact matches, origins ending with `.vercel.app`, and falsy values
 * (same-origin requests, e.g. curl or server-to-server).
 *
 * @param {string | undefined} origin
 * @returns {boolean}
 */
function isOriginAllowed(origin) {
  if (!origin) return true; // same-origin / non-browser request
  if (ALLOWED_ORIGINS.includes(origin)) return true;
  if (origin.endsWith('.vercel.app')) return true;
  return false;
}

const corsMiddleware = cors({
  origin(origin, callback) {
    if (isOriginAllowed(origin)) {
      callback(null, true);
    } else {
      console.warn(
        JSON.stringify({
          event: 'cors_blocked',
          origin,
          timestamp: new Date().toISOString(),
        })
      );
      callback(null, false);
    }
  },
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: [
    'Content-Type',
    'Authorization',
    'X-Requested-With',
    'Accept',
    'Origin',
  ],
  credentials: true,
  maxAge: 86400,
});

module.exports = corsMiddleware;
