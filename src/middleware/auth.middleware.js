'use strict';

// ---------------------------------------------------------------------------
// GAD — Authentication & Authorization Middleware
// ---------------------------------------------------------------------------
// Exports:
//   requireAuth   — verifies Firebase ID token, attaches req.user
//   requireAdmin  — checks req.user.role === 'admin' (admins and owners pass)
//   requireOwner  — checks req.user.role === 'owner' (only owners pass)
//   optionalAuth  — same as requireAuth but sets req.user = null if no token
// ---------------------------------------------------------------------------

const { auth, db } = require('../config/firebase.config');

/**
 * Extracts the Firebase ID token from the Authorization header.
 *
 * @param {import('express').Request} req
 * @returns {string | null}
 */
function extractToken(req) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) return null;
  return header.split('Bearer ')[1];
}

/**
 * Fetches the user's role from Firestore.
 * Defaults to 'user' if the document does not exist.
 *
 * @param {string} uid
 * @returns {Promise<string>}
 */
async function fetchUserRole(uid) {
  try {
    const doc = await db.collection('users').doc(uid).get();
    if (doc.exists) {
      return doc.data().role || 'user';
    }
    return 'user';
  } catch {
    return 'user';
  }
}

/**
 * Middleware — requires a valid Firebase ID token.
 * On success attaches { uid, email, role } to req.user.
 * Returns 401 JSON on failure.
 *
 * @type {import('express').RequestHandler}
 */
async function requireAuth(req, res, next) {
  try {
    const token = extractToken(req);
    if (!token) {
      return res.status(401).json({
        status: 'error',
        message: 'Authentication required. No token provided.',
      });
    }

    const decoded = await auth.verifyIdToken(token);
    const role = await fetchUserRole(decoded.uid);

    req.user = {
      uid: decoded.uid,
      email: decoded.email || null,
      role,
    };

    next();
  } catch (err) {
    return res.status(401).json({
      status: 'error',
      message: 'Invalid or expired token.',
      detail: process.env.NODE_ENV === 'development' ? err.message : undefined,
    });
  }
}

/**
 * Middleware — requires req.user.role === 'admin' or 'owner'.
 * MUST be used after requireAuth.
 * Returns 403 JSON if the user is not an admin or owner.
 *
 * @type {import('express').RequestHandler}
 */
function requireAdmin(req, res, next) {
  if (!req.user || (req.user.role !== 'admin' && req.user.role !== 'owner')) {
    return res.status(403).json({
      status: 'error',
      message: 'Admin access required.',
    });
  }
  next();
}

/**
 * Middleware — requires req.user.role === 'owner'.
 * MUST be used after requireAuth.
 * Returns 403 JSON if the user is not an owner.
 *
 * @type {import('express').RequestHandler}
 */
function requireOwner(req, res, next) {
  if (!req.user || req.user.role !== 'owner') {
    return res.status(403).json({
      status: 'error',
      message: 'Owner access required.',
    });
  }
  next();
}

/**
 * Middleware — optional authentication.
 * Same as requireAuth but if no token is present, sets req.user = null
 * and calls next() without error.
 *
 * @type {import('express').RequestHandler}
 */
async function optionalAuth(req, res, next) {
  try {
    const token = extractToken(req);
    if (!token) {
      req.user = null;
      return next();
    }

    const decoded = await auth.verifyIdToken(token);
    const role = await fetchUserRole(decoded.uid);

    req.user = {
      uid: decoded.uid,
      email: decoded.email || null,
      role,
    };

    next();
  } catch {
    // Token is invalid — treat as unauthenticated
    req.user = null;
    next();
  }
}

module.exports = { requireAuth, requireAdmin, requireOwner, optionalAuth };
