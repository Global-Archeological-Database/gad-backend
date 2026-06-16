'use strict';

// ---------------------------------------------------------------------------
// GAD — Auth Routes
// ---------------------------------------------------------------------------
// Defines authentication and user profile endpoints.
// ---------------------------------------------------------------------------

const { Router } = require('express');
const { requireAuth } = require('../middleware/auth.middleware');
const { cacheControl } = require('../middleware/cache.middleware');
const {
  register,
  getProfile,
  updateProfile,
} = require('../controllers/auth.controller');

const router = Router();

// Register is public (called after Firebase Auth client-side registration)
// Profile routes require authentication
// All auth routes are uncacheable (no-store)
router.post('/register', cacheControl(0), register);
router.get('/profile', requireAuth, cacheControl(0), getProfile);
router.put('/profile', requireAuth, cacheControl(0), updateProfile);

module.exports = router;
