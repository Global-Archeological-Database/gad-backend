'use strict';

// ---------------------------------------------------------------------------
// GAD — Admin Controller
// ---------------------------------------------------------------------------
// Admin-only operations: user management and artifact moderation.
// All endpoints require requireAuth + requireAdmin middleware.
// ---------------------------------------------------------------------------

const { db, admin } = require('../config/firebase.config');

/**
 * GET /api/admin/users
 * Admin — list all users.
 */
async function listUsers(req, res) {
  try {
    const snapshot = await db.collection('users').get();

    const users = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    return res.json({ users, count: users.length });
  } catch (err) {
    console.error(
      JSON.stringify({
        event: 'error',
        controller: 'admin.listUsers',
        message: err.message,
        timestamp: new Date().toISOString(),
      })
    );
    return res.status(500).json({
      status: 'error',
      message: 'Failed to list users',
    });
  }
}

/**
 * PUT /api/admin/users/:uid/role
 * Admin — update a user's role.
 */
async function updateUserRole(req, res) {
  try {
    const { uid } = req.params;
    const { role } = req.body;

    // Validate role
    if (!role || !['user', 'admin'].includes(role)) {
      return res.status(400).json({
        status: 'error',
        message: 'role must be either "user" or "admin"',
      });
    }

    // Prevent admin from demoting themselves
    if (uid === req.user.uid) {
      return res.status(403).json({
        status: 'error',
        message: 'You cannot change your own role',
      });
    }

    const userDoc = await db.collection('users').doc(uid).get();

    if (!userDoc.exists) {
      return res.status(404).json({
        status: 'error',
        message: 'User not found',
      });
    }

    await db.collection('users').doc(uid).update({
      role,
      updated_at: admin.firestore.FieldValue.serverTimestamp(),
    });

    const updatedDoc = await db.collection('users').doc(uid).get();

    return res.json({
      id: updatedDoc.id,
      ...updatedDoc.data(),
    });
  } catch (err) {
    console.error(
      JSON.stringify({
        event: 'error',
        controller: 'admin.updateUserRole',
        message: err.message,
        targetUid: req.params.uid,
        timestamp: new Date().toISOString(),
      })
    );
    return res.status(500).json({
      status: 'error',
      message: 'Failed to update user role',
    });
  }
}

/**
 * DELETE /api/admin/artifacts/:id
 * Admin — delete any artifact regardless of ownership.
 */
async function deleteArtifact(req, res) {
  try {
    const { id } = req.params;

    const doc = await db.collection('artifacts').doc(id).get();

    if (!doc.exists) {
      return res.status(404).json({
        status: 'error',
        message: 'Artifact not found',
      });
    }

    // Log storage paths for cleanup
    const data = doc.data();
    const storagePaths = [];
    if (data.image_url) storagePaths.push(data.image_url);
    if (data.model_url) storagePaths.push(data.model_url);
    if (data.thumbnail_url) storagePaths.push(data.thumbnail_url);

    if (storagePaths.length > 0) {
      console.log(
        JSON.stringify({
          event: 'storage_cleanup_pending',
          artifactId: id,
          storagePaths,
          timestamp: new Date().toISOString(),
        })
      );
    }

    await db.collection('artifacts').doc(id).delete();

    return res.json({
      success: true,
      deletedId: id,
    });
  } catch (err) {
    console.error(
      JSON.stringify({
        event: 'error',
        controller: 'admin.deleteArtifact',
        message: err.message,
        artifactId: req.params.id,
        timestamp: new Date().toISOString(),
      })
    );
    return res.status(500).json({
      status: 'error',
      message: 'Failed to delete artifact',
    });
  }
}

module.exports = { listUsers, updateUserRole, deleteArtifact };
