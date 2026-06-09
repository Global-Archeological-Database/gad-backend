'use strict';

// ---------------------------------------------------------------------------
// GAD — Admin Routes
// ---------------------------------------------------------------------------
// Admin-only endpoints for user management and artifact moderation.
// All routes require requireAuth + requireAdmin middleware.
// ---------------------------------------------------------------------------

const { Router } = require('express');
const { requireAuth, requireAdmin } = require('../middleware/auth.middleware');
const {
  listUsers,
  updateUserRole,
  deleteArtifact,
} = require('../controllers/admin.controller');

const router = Router();

// All admin routes require auth + admin role
router.get('/users', requireAuth, requireAdmin, listUsers);
router.put('/users/:uid/role', requireAuth, requireAdmin, updateUserRole);
router.delete('/artifacts/:id', requireAuth, requireAdmin, deleteArtifact);

module.exports = router;
