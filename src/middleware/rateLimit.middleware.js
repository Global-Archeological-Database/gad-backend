'use strict';

// ---------------------------------------------------------------------------
// GAD — Rate Limiting Middleware
// ---------------------------------------------------------------------------
// Uses express-rate-limit to provide three limiters:
//   generalLimiter — 100 req / 15 min per IP (skips /health)
//   aiLimiter      —  20 req /  1 hour per IP
//   uploadLimiter  —  20 req /  1 day per IP
// All limiters return JSON error messages (never HTML).
// ---------------------------------------------------------------------------

const rateLimit = require('express-rate-limit');
const { defaultKeyGenerator } = rateLimit;

/**
 * Shared handler that returns a JSON error response when the limit is exceeded.
 *
 * @type {import('express-rate-limit').RateLimitRequestHandler['handler']}
 */
const jsonHandler = (_req, res) => {
  res.status(429).json({
    status: 'error',
    message: 'Too many requests. Please try again later.',
  });
};

/**
 * General limiter — 100 requests per 15 minutes per IP.
 * Skips rate-limiting for the /health endpoint.
 */
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: null, // use custom handler
  handler: jsonHandler,
  skip: (req) => req.path === '/health',
  keyGenerator: defaultKeyGenerator,
});

/**
 * AI limiter — 20 requests per hour per IP.
 * Intended for /api/ai/* endpoints.
 */
const aiLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: null,
  handler: jsonHandler,
  keyGenerator: defaultKeyGenerator,
});

/**
 * Upload limiter — 20 requests per day per IP.
 * Intended for artifact file uploads.
 */
const uploadLimiter = rateLimit({
  windowMs: 24 * 60 * 60 * 1000, // 1 day
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: null,
  handler: jsonHandler,
  keyGenerator: defaultKeyGenerator,
});

module.exports = { generalLimiter, aiLimiter, uploadLimiter };
