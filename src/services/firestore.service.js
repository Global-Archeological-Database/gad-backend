'use strict';

// ---------------------------------------------------------------------------
// GAD — Firestore Service
// ---------------------------------------------------------------------------
// Thin re-export of the Firestore client from firebase.config.js plus a small
// set of reusable query builders. Business logic belongs in controllers.
// ---------------------------------------------------------------------------

const { db, admin } = require('../config/firebase.config');

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
 * Builds a paginated artifacts query with optional filters, keyword search,
 * and sort options.
 *
 * Keyword search (q) uses Firestore `array-contains-any` on a `_searchTokens`
 * field. For this to work, artifacts must have a `_searchTokens` array field
 * populated with lowercase keywords from title, description, tags, and
 * cultural_origin. The controller handles token generation on create/update.
 *
 * Sort options:
 *   - 'newest' (default): orderBy('created_at', 'desc')
 *   - 'oldest': orderBy('created_at', 'asc')
 *   - 'views': orderBy('view_count', 'desc')
 *   - 'analysis': orderBy('ai_analysis_timestamp', 'desc')
 *
 * @param {object} options
 * @param {number} [options.limit=100] - Max results (capped at 500).
 * @param {string|null} [options.startAfter] - Document ID for cursor pagination.
 * @param {string} [options.country] - Filter by country.
 * @param {string} [options.culturalOrigin] - Filter by cultural_origin.
 * @param {string} [options.condition] - Filter by condition.
 * @param {boolean} [options.is3d] - Filter by is_3d flag.
 * @param {string} [options.uploaderId] - Filter by uploader_id.
 * @param {string} [options.q] - Keyword search (matches against _searchTokens).
 * @param {string} [options.sort] - Sort order: 'newest', 'oldest', 'views', 'analysis'.
 * @param {string} [options.materials] - Filter by material (comma-separated, uses array-contains).
 * @param {string} [options.tags] - Filter by tag (comma-separated, uses array-contains).
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
    q,
    sort = 'newest',
    materials,
    tags,
  } = options;

  const safeLimit = Math.min(Math.max(1, limit), 500);

  // Determine sort field and direction
  let orderField = 'created_at';
  let orderDir = 'desc';
  if (sort === 'oldest') {
    orderField = 'created_at';
    orderDir = 'asc';
  } else if (sort === 'views') {
    orderField = 'view_count';
    orderDir = 'desc';
  } else if (sort === 'analysis') {
    orderField = 'ai_analysis_timestamp';
    orderDir = 'desc';
  }

  let query = db.collection('artifacts').orderBy(orderField, orderDir).limit(safeLimit + 1);

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

  // Keyword search via _searchTokens array
  if (q && typeof q === 'string' && q.trim().length > 0) {
    const tokens = q.trim().toLowerCase().split(/\s+/).filter(Boolean);
    if (tokens.length > 0) {
      // Firestore array-contains-any supports up to 10 values
      const searchTokens = tokens.slice(0, 10);
      query = query.where('_searchTokens', 'array-contains-any', searchTokens);
    }
  }

  // Material filter (comma-separated, uses array-contains-any)
  if (materials && typeof materials === 'string') {
    const materialList = materials.split(',').map(m => m.trim().toLowerCase()).filter(Boolean);
    if (materialList.length > 0) {
      query = query.where('materials', 'array-contains-any', materialList.slice(0, 10));
    }
  }

  // Tags filter (comma-separated, uses array-contains-any)
  if (tags && typeof tags === 'string') {
    const tagList = tags.split(',').map(t => t.trim().toLowerCase()).filter(Boolean);
    if (tagList.length > 0) {
      query = query.where('tags', 'array-contains-any', tagList.slice(0, 10));
    }
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

/**
 * Generates search tokens from artifact text fields for keyword search.
 * Splits text into lowercase words, removes common stop words and short tokens.
 *
 * @param {object} artifactData
 * @returns {string[]}
 */
function generateSearchTokens(artifactData) {
  const stopWords = new Set([
    'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for',
    'of', 'with', 'by', 'from', 'is', 'it', 'as', 'be', 'this', 'that',
    'was', 'are', 'were', 'has', 'have', 'had', 'not', 'no', 'its',
  ]);

  const textFields = [
    artifactData.title,
    artifactData.description,
    artifactData.cultural_origin,
    artifactData.country,
    artifactData.age,
    artifactData.location,
    ...(Array.isArray(artifactData.tags) ? artifactData.tags : []),
    ...(Array.isArray(artifactData.materials) ? artifactData.materials : []),
  ];

  const tokens = new Set();
  for (const field of textFields) {
    if (field && typeof field === 'string') {
      const words = field.toLowerCase().split(/[\s,;:.!?()\[\]{}"'/\\@#$%^&*+=<>~`|]+/);
      for (const word of words) {
        if (word.length >= 2 && !stopWords.has(word) && /^[a-z0-9]/.test(word)) {
          tokens.add(word);
        }
      }
    }
  }

  return Array.from(tokens);
}

module.exports = { getDb, db, queryArtifacts, generateSearchTokens };
