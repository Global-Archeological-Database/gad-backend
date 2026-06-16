'use strict';

// ---------------------------------------------------------------------------
// GAD — Favorites Routes
// ---------------------------------------------------------------------------
// Defines endpoints for managing user favorites/bookmarks.
// All endpoints require authentication.
// ---------------------------------------------------------------------------

const { Router } = require('express');
const { requireAuth } = require('../middleware/auth.middleware');
const { cacheControl } = require('../middleware/cache.middleware');
const {
  addFavorite,
  removeFavorite,
  listFavorites,
  checkFavorite,
} = require('../controllers/favorites.controller');

const router = Router();

// All favorites routes require authentication — never cached
router.get('/', requireAuth, cacheControl(0), listFavorites);
router.get('/check/:artifactId', requireAuth, cacheControl(0), checkFavorite);
router.post('/:artifactId', requireAuth, cacheControl(0), addFavorite);
router.delete('/:artifactId', requireAuth, cacheControl(0), removeFavorite);

module.exports = router;
