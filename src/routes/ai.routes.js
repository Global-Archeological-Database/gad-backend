'use strict';

// ---------------------------------------------------------------------------
// GAD — AI Routes
// ---------------------------------------------------------------------------
// Defines AI-powered endpoints: chatbot, artifact analysis, and similarity search.
// All endpoints require authentication and use the AI rate limiter.
// ---------------------------------------------------------------------------

const { Router } = require('express');
const { requireAuth, optionalAuth } = require('../middleware/auth.middleware');
const { cacheControl } = require('../middleware/cache.middleware');
const { aiLimiter } = require('../middleware/rateLimit.middleware');
const {
  chatbot,
  analyze,
  findSimilar,
} = require('../controllers/ai.controller');

const router = Router();

// All AI routes require auth + AI rate limiter — never cached
router.post('/chatbot', optionalAuth, cacheControl(0), aiLimiter, chatbot);
router.post('/analyze/:artifactId', requireAuth, cacheControl(0), aiLimiter, analyze);
router.post('/find-similar/:artifactId', requireAuth, cacheControl(0), aiLimiter, findSimilar);

module.exports = router;
