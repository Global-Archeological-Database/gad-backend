'use strict';

// ---------------------------------------------------------------------------
// GAD — Artifacts Routes
// ---------------------------------------------------------------------------
// Defines RESTful endpoints for archaeological artifact CRUD operations.
// ---------------------------------------------------------------------------

const { Router } = require('express');
const { requireAuth } = require('../middleware/auth.middleware');
const { cacheControl, CACHE_DURATIONS } = require('../middleware/cache.middleware');
const {
  listArtifacts,
  getArtifact,
  createArtifact,
  updateArtifact,
  deleteArtifact,
  generateUploadUrl,
} = require('../controllers/artifacts.controller');

const router = Router();

// Public routes — cached
router.get('/', cacheControl(CACHE_DURATIONS.ARTIFACT_LIST), listArtifacts);
router.get('/:id', cacheControl(CACHE_DURATIONS.ARTIFACT_DETAIL), getArtifact);

// Authenticated routes — never cached
router.post('/', requireAuth, cacheControl(0), createArtifact);
router.put('/:id', requireAuth, cacheControl(0), updateArtifact);
router.delete('/:id', requireAuth, cacheControl(0), deleteArtifact);
router.post('/:id/upload-url', requireAuth, cacheControl(0), generateUploadUrl);

module.exports = router;
