'use strict';

// ---------------------------------------------------------------------------
// GAD — AI Routes
// ---------------------------------------------------------------------------
// Defines AI-powered endpoints: chatbot, artifact analysis, and similarity search.
// All endpoints require authentication and use the AI rate limiter.
// ---------------------------------------------------------------------------

const { Router } = require('express');
const { requireAuth, optionalAuth } = require('../middleware/auth.middleware');
const { aiLimiter } = require('../middleware/rateLimit.middleware');
const {
  chatbot,
  analyze,
  findSimilar,
} = require('../controllers/ai.controller');

const router = Router();

// All AI routes require auth + AI rate limiter
router.post('/chatbot', optionalAuth, aiLimiter, chatbot);
router.post('/analyze/:artifactId', requireAuth, aiLimiter, analyze);
router.post('/find-similar/:artifactId', requireAuth, aiLimiter, findSimilar);

module.exports = router;
