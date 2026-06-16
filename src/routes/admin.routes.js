'use strict';

// ---------------------------------------------------------------------------
// GAD — Admin Routes
// ---------------------------------------------------------------------------
// Admin/owner endpoints for user management and artifact moderation.
// - listUsers and deleteArtifact: requireAuth + requireAdmin
// - updateUserRole: requireAuth + requireOwner (only owner can change roles)
// - listAdminRequests, approveAdmin, denyAdmin: requireAuth + requireOwner
// ---------------------------------------------------------------------------

const { Router } = require('express');
const { requireAuth, requireAdmin, requireOwner } = require('../middleware/auth.middleware');
const { cacheControl } = require('../middleware/cache.middleware');
const {
  listUsers,
  updateUserRole,
  deleteArtifact,
  listAdminRequests,
  approveAdmin,
  denyAdmin,
} = require('../controllers/admin.controller');

const router = Router();

// Admin-level routes (admins and owners) — never cached
router.get('/users', requireAuth, requireAdmin, cacheControl(0), listUsers);
router.delete('/artifacts/:id', requireAuth, requireAdmin, cacheControl(0), deleteArtifact);

// Owner-only routes — never cached
router.put('/users/:uid/role', requireAuth, requireOwner, cacheControl(0), updateUserRole);
router.get('/users/requests', requireAuth, requireOwner, cacheControl(0), listAdminRequests);
router.post('/users/:uid/approve-admin', requireAuth, requireOwner, cacheControl(0), approveAdmin);
router.post('/users/:uid/deny-admin', requireAuth, requireOwner, cacheControl(0), denyAdmin);

module.exports = router;
