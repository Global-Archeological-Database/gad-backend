'use strict';

// ---------------------------------------------------------------------------
// GAD — Health Route
// ---------------------------------------------------------------------------
// GET / — checks Firestore connectivity and returns system status.
// ---------------------------------------------------------------------------

const { Router } = require('express');
const { cacheControl, CACHE_DURATIONS } = require('../middleware/cache.middleware');
const { db } = require('../config/firebase.config');

const router = Router();

/**
 * GET /
 * Returns health status including Firestore connectivity and environment flags.
 */
router.get('/', cacheControl(CACHE_DURATIONS.HEALTH), async (_req, res) => {
  let firestoreStatus = 'error';

  try {
    // Check Firestore connectivity
    await db.collection('_health').limit(1).get();
    firestoreStatus = 'connected';
  } catch (err) {
    console.error(
      JSON.stringify({
        event: 'health_check_failed',
        service: 'firestore',
        message: err.message,
        timestamp: new Date().toISOString(),
      })
    );
  }

  const status = firestoreStatus === 'connected' ? 'healthy' : 'degraded';

  return res.json({
    status,
    timestamp: new Date().toISOString(),
    environment: {
      hasGeminiKey: !!process.env.GEMINI_API_KEY,
      hasMapsKey: !!process.env.GOOGLE_MAPS_API_KEY,
      hasFrontendUrl: !!process.env.FRONTEND_URL,
    },
    services: {
      firestore: firestoreStatus,
    },
  });
});

module.exports = router;
