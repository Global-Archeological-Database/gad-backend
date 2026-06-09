'use strict';

// ---------------------------------------------------------------------------
// GAD — Auth Controller
// ---------------------------------------------------------------------------
// Handles user registration and profile management.
// ---------------------------------------------------------------------------

const { db, admin } = require('../config/firebase.config');

/**
 * Allowed fields for profile updates.
 */
const ALLOWED_PROFILE_FIELDS = ['display_name', 'settings.theme', 'settings.show_name_publicly'];

/**
 * POST /api/auth/register
 * Authenticated — creates a user document in Firestore after Firebase Auth registration.
 */
async function register(req, res) {
  try {
    const { uid, email } = req.user;

    // Check if user document already exists
    const existingDoc = await db.collection('users').doc(uid).get();
    if (existingDoc.exists) {
      return res.status(409).json({
        status: 'error',
        message: 'User already registered',
      });
    }

    // Determine role
    const role = email === 'aahwaanithsinharoy@gmail.com' ? 'admin' : 'user';

    const userData = {
      uid,
      email,
      display_name: req.body.displayName || null,
      role,
      created_at: admin.firestore.FieldValue.serverTimestamp(),
      updated_at: admin.firestore.FieldValue.serverTimestamp(),
      settings: {
        theme: 'light',
        show_name_publicly: true,
      },
    };

    await db.collection('users').doc(uid).set(userData);

    const createdDoc = await db.collection('users').doc(uid).get();

    return res.status(201).json({
      id: createdDoc.id,
      ...createdDoc.data(),
    });
  } catch (err) {
    console.error(
      JSON.stringify({
        event: 'error',
        controller: 'auth.register',
        message: err.message,
        uid: req.user.uid,
        timestamp: new Date().toISOString(),
      })
    );
    return res.status(500).json({
      status: 'error',
      message: 'Failed to register user',
    });
  }
}

/**
 * GET /api/auth/profile
 * Authenticated — returns the current user's profile.
 */
async function getProfile(req, res) {
  try {
    const { uid } = req.user;
    const doc = await db.collection('users').doc(uid).get();

    if (!doc.exists) {
      return res.status(404).json({
        status: 'error',
        message: 'User profile not found. Please register first.',
      });
    }

    return res.json({
      id: doc.id,
      ...doc.data(),
    });
  } catch (err) {
    console.error(
      JSON.stringify({
        event: 'error',
        controller: 'auth.getProfile',
        message: err.message,
        uid: req.user.uid,
        timestamp: new Date().toISOString(),
      })
    );
    return res.status(500).json({
      status: 'error',
      message: 'Failed to get profile',
    });
  }
}

/**
 * PUT /api/auth/profile
 * Authenticated — updates the current user's profile.
 */
async function updateProfile(req, res) {
  try {
    const { uid } = req.user;

    // Check user exists
    const existingDoc = await db.collection('users').doc(uid).get();
    if (!existingDoc.exists) {
      return res.status(404).json({
        status: 'error',
        message: 'User profile not found. Please register first.',
      });
    }

    // Build update object from allowed fields
    const updateData = {};

    if (req.body.display_name !== undefined) {
      updateData.display_name = req.body.display_name;
    }

    if (req.body.settings) {
      if (req.body.settings.theme !== undefined) {
        updateData['settings.theme'] = req.body.settings.theme;
      }
      if (req.body.settings.show_name_publicly !== undefined) {
        updateData['settings.show_name_publicly'] = req.body.settings.show_name_publicly;
      }
    }

    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({
        status: 'error',
        message: 'No valid fields to update. Allowed: display_name, settings.theme, settings.show_name_publicly',
      });
    }

    updateData.updated_at = admin.firestore.FieldValue.serverTimestamp();

    await db.collection('users').doc(uid).update(updateData);

    const updatedDoc = await db.collection('users').doc(uid).get();

    return res.json({
      id: updatedDoc.id,
      ...updatedDoc.data(),
    });
  } catch (err) {
    console.error(
      JSON.stringify({
        event: 'error',
        controller: 'auth.updateProfile',
        message: err.message,
        uid: req.user.uid,
        timestamp: new Date().toISOString(),
      })
    );
    return res.status(500).json({
      status: 'error',
      message: 'Failed to update profile',
    });
  }
}

module.exports = { register, getProfile, updateProfile };
