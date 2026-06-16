'use strict';

// ---------------------------------------------------------------------------
// GAD — Cache-Control Middleware
// ---------------------------------------------------------------------------
// Sets appropriate Cache-Control headers based on route type.
// Use as route-level middleware for specific caching behaviors.
// ---------------------------------------------------------------------------

const CACHE_DURATIONS = {
  ARTIFACT_LIST: parseInt(process.env.CACHE_ARTIFACT_LIST_MS, 10) || 60,
  ARTIFACT_DETAIL: parseInt(process.env.CACHE_ARTIFACT_DETAIL_MS, 10) || 300,
  HEALTH: parseInt(process.env.CACHE_HEALTH_MS, 10) || 30,
};

/**
 * Returns a middleware that sets Cache-Control headers.
 *
 * @param {number} duration - Cache max-age in seconds. Use 0 for no-cache.
 * @returns {import('express').RequestHandler}
 */
function cacheControl(duration) {
  return (req, res, next) => {
    if (duration === 0) {
      res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate');
    } else {
      res.setHeader(
        'Cache-Control',
        `public, max-age=${duration}, stale-while-revalidate=${duration * 2}`
      );
    }
    next();
  };
}

module.exports = { cacheControl, CACHE_DURATIONS };
