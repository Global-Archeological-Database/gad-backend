'use strict';

// ---------------------------------------------------------------------------
// GAD — Favorites Controller
// ---------------------------------------------------------------------------
// Handles user favorites/bookmarks for artifacts.
// Favorites are stored as an array of artifact IDs on the user document.
// ---------------------------------------------------------------------------

const { db, admin } = require('../config/firebase.config');

/**
 * POST /api/favorites/:artifactId
 * Authenticated — add an artifact to the user's favorites.
 */
async function addFavorite(req, res) {
  try {
    const { artifactId } = req.params;
    const { uid } = req.user;

    // Verify artifact exists
    const artifactDoc = await db.collection('artifacts').doc(artifactId).get();
    if (!artifactDoc.exists) {
      return res.status(404).json({
        status: 'error',
        message: 'Artifact not found',
      });
    }

    // Add to favorites array (using arrayUnion to avoid duplicates)
    await db.collection('users').doc(uid).update({
      favorites: admin.firestore.FieldValue.arrayUnion(artifactId),
      updated_at: admin.firestore.FieldValue.serverTimestamp(),
    });

    return res.json({
      success: true,
      artifactId,
      favorited: true,
    });
  } catch (err) {
    console.error(
      JSON.stringify({
        event: 'error',
        controller: 'favorites.addFavorite',
        message: err.message,
        uid: req.user.uid,
        artifactId: req.params.artifactId,
        timestamp: new Date().toISOString(),
      })
    );
    return res.status(500).json({
      status: 'error',
      message: 'Failed to add favorite',
    });
  }
}

/**
 * DELETE /api/favorites/:artifactId
 * Authenticated — remove an artifact from the user's favorites.
 */
async function removeFavorite(req, res) {
  try {
    const { artifactId } = req.params;
    const { uid } = req.user;

    await db.collection('users').doc(uid).update({
      favorites: admin.firestore.FieldValue.arrayRemove(artifactId),
      updated_at: admin.firestore.FieldValue.serverTimestamp(),
    });

    return res.json({
      success: true,
      artifactId,
      favorited: false,
    });
  } catch (err) {
    console.error(
      JSON.stringify({
        event: 'error',
        controller: 'favorites.removeFavorite',
        message: err.message,
        uid: req.user.uid,
        artifactId: req.params.artifactId,
        timestamp: new Date().toISOString(),
      })
    );
    return res.status(500).json({
      status: 'error',
      message: 'Failed to remove favorite',
    });
  }
}

/**
 * GET /api/favorites
 * Authenticated — list the user's favorited artifacts with full artifact data.
 */
async function listFavorites(req, res) {
  try {
    const { uid } = req.user;

    const userDoc = await db.collection('users').doc(uid).get();
    if (!userDoc.exists) {
      return res.status(404).json({
        status: 'error',
        message: 'User not found',
      });
    }

    const userData = userDoc.data();
    const favoriteIds = userData.favorites || [];

    if (favoriteIds.length === 0) {
      return res.json({
        artifacts: [],
        count: 0,
      });
    }

    // Firestore 'in' queries support up to 30 values
    const batchSize = 30;
    const batches = [];
    for (let i = 0; i < favoriteIds.length; i += batchSize) {
      batches.push(favoriteIds.slice(i, i + batchSize));
    }

    const allArtifacts = [];
    for (const batch of batches) {
      const snapshot = await db
        .collection('artifacts')
        .where(admin.firestore.FieldPath.documentId(), 'in', batch)
        .get();
      snapshot.forEach((doc) => {
        allArtifacts.push({
          id: doc.id,
          ...doc.data(),
        });
      });
    }

    return res.json({
      artifacts: allArtifacts,
      count: allArtifacts.length,
    });
  } catch (err) {
    console.error(
      JSON.stringify({
        event: 'error',
        controller: 'favorites.listFavorites',
        message: err.message,
        uid: req.user.uid,
        timestamp: new Date().toISOString(),
      })
    );
    return res.status(500).json({
      status: 'error',
      message: 'Failed to list favorites',
    });
  }
}

/**
 * GET /api/favorites/check/:artifactId
 * Authenticated — check if an artifact is favorited by the current user.
 */
async function checkFavorite(req, res) {
  try {
    const { artifactId } = req.params;
    const { uid } = req.user;

    const userDoc = await db.collection('users').doc(uid).get();
    if (!userDoc.exists) {
      return res.json({ favorited: false });
    }

    const favorites = userDoc.data().favorites || [];
    return res.json({
      favorited: favorites.includes(artifactId),
    });
  } catch (err) {
    console.error(
      JSON.stringify({
        event: 'error',
        controller: 'favorites.checkFavorite',
        message: err.message,
        uid: req.user.uid,
        artifactId: req.params.artifactId,
        timestamp: new Date().toISOString(),
      })
    );
    return res.status(500).json({
      status: 'error',
      message: 'Failed to check favorite status',
    });
  }
}

module.exports = { addFavorite, removeFavorite, listFavorites, checkFavorite };
