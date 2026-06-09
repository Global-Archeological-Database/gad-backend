'use strict';

// ---------------------------------------------------------------------------
// GAD — Auth Routes
// ---------------------------------------------------------------------------
// Defines authentication and user profile endpoints.
// ---------------------------------------------------------------------------

const { Router } = require('express');
const { requireAuth } = require('../middleware/auth.middleware');
const {
  register,
  getProfile,
  updateProfile,
} = require('../controllers/auth.controller');

const router = Router();

// Register is public (called after Firebase Auth client-side registration)
// Profile routes require authentication
router.post('/register', register);
router.get('/profile', requireAuth, getProfile);
router.put('/profile', requireAuth, updateProfile);

module.exports = router;
