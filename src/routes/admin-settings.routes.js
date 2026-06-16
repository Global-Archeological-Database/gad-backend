'use strict';

// ---------------------------------------------------------------------------
// GAD — Admin Settings Routes
// ---------------------------------------------------------------------------
// Owner-only endpoints for managing site-wide settings.
// Logo upload uses multer for multipart/form-data parsing.
// ---------------------------------------------------------------------------

const { Router } = require('express');
const multer = require('multer');
const { requireAuth, requireOwner } = require('../middleware/auth.middleware');
const { cacheControl } = require('../middleware/cache.middleware');
const {
  getSettings,
  updateSettings,
  uploadLogo,
} = require('../controllers/admin-settings.controller');

const router = Router();

// Multer configuration — store uploaded files in memory as buffers
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 2 * 1024 * 1024, // 2MB
  },
});

// All settings routes require auth + owner role — never cached
router.get('/', requireAuth, requireOwner, cacheControl(0), getSettings);
router.put('/', requireAuth, requireOwner, cacheControl(0), updateSettings);
router.post('/logo', requireAuth, requireOwner, cacheControl(0), upload.single('logo'), uploadLogo);

module.exports = router;
