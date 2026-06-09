'use strict';

// ---------------------------------------------------------------------------
// GAD — Artifacts Routes
// ---------------------------------------------------------------------------
// Defines RESTful endpoints for archaeological artifact CRUD operations.
// ---------------------------------------------------------------------------

const { Router } = require('express');
const { requireAuth } = require('../middleware/auth.middleware');
const {
  listArtifacts,
  getArtifact,
  createArtifact,
  updateArtifact,
  deleteArtifact,
  generateUploadUrl,
} = require('../controllers/artifacts.controller');

const router = Router();

// Public routes
router.get('/', listArtifacts);
router.get('/:id', getArtifact);

// Authenticated routes
router.post('/', requireAuth, createArtifact);
router.put('/:id', requireAuth, updateArtifact);
router.delete('/:id', requireAuth, deleteArtifact);
router.post('/:id/upload-url', requireAuth, generateUploadUrl);

module.exports = router;
