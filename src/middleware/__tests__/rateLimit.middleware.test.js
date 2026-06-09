'use strict';

// ---------------------------------------------------------------------------
// GAD — Rate Limit Middleware Tests
// ---------------------------------------------------------------------------

const rateLimit = require('express-rate-limit');

// Mock express-rate-limit so we can inspect how our limiters are configured
jest.mock('express-rate-limit', () => {
  const mockRateLimit = jest.fn((options) => {
    // Return a middleware function that carries the config for inspection
    const middleware = jest.fn((req, res, next) => next());
    middleware.options = options;
    middleware.windowMs = options.windowMs;
    middleware.max = options.max;
    middleware.standardHeaders = options.standardHeaders;
    middleware.legacyHeaders = options.legacyHeaders;
    middleware.handler = options.handler;
    middleware.skip = options.skip;
    middleware.keyGenerator = options.keyGenerator;
    return middleware;
  });
  // Attach defaultKeyGenerator as a function
  mockRateLimit.defaultKeyGenerator = jest.fn((req) => req.ip);
  return mockRateLimit;
});

const { generalLimiter, aiLimiter, uploadLimiter } = require('../rateLimit.middleware');

describe('Rate Limit Middleware', () => {
  // ── Structure & Configuration ────────────────────────────────────────────

  describe('generalLimiter', () => {
    it('has correct configuration', () => {
      expect(generalLimiter).toBeDefined();
      expect(generalLimiter.windowMs).toBe(15 * 60 * 1000);
      expect(generalLimiter.max).toBe(100);
    });

    it('has standardHeaders enabled and legacyHeaders disabled', () => {
      expect(generalLimiter.standardHeaders).toBe(true);
      expect(generalLimiter.legacyHeaders).toBe(false);
    });

    it('skips rate limiting for /health path', () => {
      const req = { path: '/health' };
      const result = generalLimiter.skip(req);
      expect(result).toBe(true);
    });

    it('does not skip rate limiting for non-health paths', () => {
      const req = { path: '/api/artifacts' };
      const result = generalLimiter.skip(req);
      expect(result).toBe(false);
    });
  });

  describe('aiLimiter', () => {
    it('has correct configuration', () => {
      expect(aiLimiter).toBeDefined();
      expect(aiLimiter.windowMs).toBe(60 * 60 * 1000);
      expect(aiLimiter.max).toBe(20);
    });

    it('has standardHeaders enabled and legacyHeaders disabled', () => {
      expect(aiLimiter.standardHeaders).toBe(true);
      expect(aiLimiter.legacyHeaders).toBe(false);
    });

    it('does not skip any paths by default', () => {
      const req = { path: '/api/ai/chatbot' };
      const result = aiLimiter.skip ? aiLimiter.skip(req) : false;
      expect(result).toBeFalsy();
    });
  });

  describe('uploadLimiter', () => {
    it('has correct configuration', () => {
      expect(uploadLimiter).toBeDefined();
      expect(uploadLimiter.windowMs).toBe(24 * 60 * 60 * 1000);
      expect(uploadLimiter.max).toBe(20);
    });

    it('has standardHeaders enabled and legacyHeaders disabled', () => {
      expect(uploadLimiter.standardHeaders).toBe(true);
      expect(uploadLimiter.legacyHeaders).toBe(false);
    });
  });

  // ── JSON Error Handler ───────────────────────────────────────────────────

  describe('JSON error handler', () => {
    it('returns 429 with JSON error response', () => {
      expect(typeof generalLimiter.handler).toBe('function');
      expect(typeof aiLimiter.handler).toBe('function');
      expect(typeof uploadLimiter.handler).toBe('function');

      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };
      const req = {};

      // Call the handler directly
      generalLimiter.handler(req, res);

      expect(res.status).toHaveBeenCalledWith(429);
      expect(res.json).toHaveBeenCalledWith({
        status: 'error',
        message: 'Too many requests. Please try again later.',
      });
    });
  });

  // ── Key Generator ────────────────────────────────────────────────────────

  describe('keyGenerator', () => {
    it('uses the default key generator (IP-based)', () => {
      expect(typeof generalLimiter.keyGenerator).toBe('function');
      expect(typeof aiLimiter.keyGenerator).toBe('function');
      expect(typeof uploadLimiter.keyGenerator).toBe('function');
    });
  });
});
