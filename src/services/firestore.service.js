'use strict';

// ---------------------------------------------------------------------------
// GAD — Firestore Service
// ---------------------------------------------------------------------------
// Thin re-export of the Firestore client from firebase.config.js plus a small
// set of reusable query builders. Business logic belongs in controllers.
// ---------------------------------------------------------------------------

const { db } = require('../config/firebase.config');

/**
 * Returns the Firestore client instance.
 * Use this for all direct Firestore operations in controllers/services.
 *
 * @returns {import('firebase-admin').firestore.Firestore}
 */
function getDb() {
  return db;
}

/**
 * Builds a paginated artifacts query with optional filters.
 *
 * @param {object} options
 * @param {number} [options.limit=100] - Max results (capped at 500).
 * @param {string|null} [options.startAfter] - Document ID for cursor pagination.
 * @param {string} [options.country] - Filter by country.
 * @param {string} [options.culturalOrigin] - Filter by cultural_origin.
 * @param {string} [options.condition] - Filter by condition.
 * @param {boolean} [options.is3d] - Filter by is_3d flag.
 * @param {string} [options.uploaderId] - Filter by uploader_id.
 * @returns {Promise<{docs: import('firebase-admin').firestore.DocumentSnapshot[], lastDoc: import('firebase-admin').firestore.DocumentSnapshot|null}>}
 */
async function queryArtifacts(options = {}) {
  const {
    limit = 100,
    startAfter = null,
    country,
    culturalOrigin,
    condition,
    is3d,
    uploaderId,
  } = options;

  const safeLimit = Math.min(Math.max(1, limit), 500);

  let query = db.collection('artifacts').orderBy('__name__').limit(safeLimit + 1);

  // Apply filters
  if (country) {
    query = query.where('country', '==', country);
  }
  if (culturalOrigin) {
    query = query.where('cultural_origin', '==', culturalOrigin);
  }
  if (condition) {
    query = query.where('condition', '==', condition);
  }
  if (is3d !== undefined && is3d !== null) {
    query = query.where('is_3d', '==', is3d);
  }
  if (uploaderId) {
    query = query.where('uploader_id', '==', uploaderId);
  }

  // Apply cursor
  if (startAfter) {
    const cursorDoc = await db.collection('artifacts').doc(startAfter).get();
    if (cursorDoc.exists) {
      query = query.startAfter(cursorDoc);
    }
  }

  const snapshot = await query.get();

  const docs = snapshot.docs.slice(0, safeLimit);
  const lastDoc = snapshot.docs.length > safeLimit
    ? snapshot.docs[safeLimit - 1]
    : null;

  return { docs, lastDoc };
}

module.exports = { getDb, db, queryArtifacts };
