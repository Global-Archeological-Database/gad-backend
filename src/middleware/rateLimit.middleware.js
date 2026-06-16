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

const WINDOW_MS = parseInt(process.env.RATE_LIMIT_WINDOW_MS, 10) || (15 * 60 * 1000);
const GENERAL_MAX = parseInt(process.env.RATE_LIMIT_GENERAL_MAX, 10) || 100;
const AI_MAX = parseInt(process.env.RATE_LIMIT_AI_MAX, 10) || 20;
const UPLOAD_MAX = parseInt(process.env.RATE_LIMIT_UPLOAD_MAX, 10) || 20;

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
  windowMs: WINDOW_MS, // 15 minutes
  max: GENERAL_MAX,
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
  windowMs: WINDOW_MS,
  max: AI_MAX,
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
  windowMs: WINDOW_MS,
  max: UPLOAD_MAX,
  standardHeaders: true,
  legacyHeaders: false,
  message: null,
  handler: jsonHandler,
  keyGenerator: defaultKeyGenerator,
});

module.exports = { generalLimiter, aiLimiter, uploadLimiter };
