'use strict';

// ---------------------------------------------------------------------------
// GAD — Admin Controller
// ---------------------------------------------------------------------------
// Admin/owner operations: user management and artifact moderation.
// - listUsers and deleteArtifact require requireAuth + requireAdmin.
// - updateUserRole requires requireAuth + requireOwner (only owner can change roles).
// - listAdminRequests and approveAdmin/denyAdmin require requireAuth + requireOwner.
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
 * Owner — update a user's role.
 * Only the owner can promote users to admin or demote admins back to user.
 */
async function updateUserRole(req, res) {
  try {
    const { uid } = req.params;
    const { role } = req.body;

    // Validate role — owner can assign 'user' or 'admin' (not 'owner')
    if (!role || !['user', 'admin'].includes(role)) {
      return res.status(400).json({
        status: 'error',
        message: 'role must be either "user" or "admin"',
      });
    }

    // Prevent owner from changing their own role
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

    // Prevent demoting another owner
    const userData = userDoc.data();
    if (userData.role === 'owner') {
      return res.status(403).json({
        status: 'error',
        message: 'Cannot change the role of another owner',
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
 * GET /api/admin/users/requests
 * Owner — list users who have requested admin privileges.
 * Users with admin_requested = true are returned.
 */
async function listAdminRequests(req, res) {
  try {
    const snapshot = await db
      .collection('users')
      .where('admin_requested', '==', true)
      .get();

    const requests = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    return res.json({ requests, count: requests.length });
  } catch (err) {
    console.error(
      JSON.stringify({
        event: 'error',
        controller: 'admin.listAdminRequests',
        message: err.message,
        timestamp: new Date().toISOString(),
      })
    );
    return res.status(500).json({
      status: 'error',
      message: 'Failed to list admin requests',
    });
  }
}

/**
 * POST /api/admin/users/:uid/approve-admin
 * Owner — approve a user's admin request, promoting them to admin.
 */
async function approveAdmin(req, res) {
  try {
    const { uid } = req.params;

    const userDoc = await db.collection('users').doc(uid).get();

    if (!userDoc.exists) {
      return res.status(404).json({
        status: 'error',
        message: 'User not found',
      });
    }

    const userData = userDoc.data();

    if (!userData.admin_requested) {
      return res.status(400).json({
        status: 'error',
        message: 'This user has not requested admin privileges',
      });
    }

    await db.collection('users').doc(uid).update({
      role: 'admin',
      admin_requested: false,
      approved_by: req.user.uid,
      approved_at: admin.firestore.FieldValue.serverTimestamp(),
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
        controller: 'admin.approveAdmin',
        message: err.message,
        targetUid: req.params.uid,
        timestamp: new Date().toISOString(),
      })
    );
    return res.status(500).json({
      status: 'error',
      message: 'Failed to approve admin request',
    });
  }
}

/**
 * POST /api/admin/users/:uid/deny-admin
 * Owner — deny a user's admin request, clearing the request flag.
 */
async function denyAdmin(req, res) {
  try {
    const { uid } = req.params;

    const userDoc = await db.collection('users').doc(uid).get();

    if (!userDoc.exists) {
      return res.status(404).json({
        status: 'error',
        message: 'User not found',
      });
    }

    const userData = userDoc.data();

    if (!userData.admin_requested) {
      return res.status(400).json({
        status: 'error',
        message: 'This user has not requested admin privileges',
      });
    }

    await db.collection('users').doc(uid).update({
      admin_requested: false,
      denied_by: req.user.uid,
      denied_at: admin.firestore.FieldValue.serverTimestamp(),
      updated_at: admin.firestore.FieldValue.serverTimestamp(),
    });

    return res.json({
      success: true,
      message: 'Admin request denied',
    });
  } catch (err) {
    console.error(
      JSON.stringify({
        event: 'error',
        controller: 'admin.denyAdmin',
        message: err.message,
        targetUid: req.params.uid,
        timestamp: new Date().toISOString(),
      })
    );
    return res.status(500).json({
      status: 'error',
      message: 'Failed to deny admin request',
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

    // Delete associated files from Cloud Storage
    const data = doc.data();
    const bucket = admin.storage().bucket();
    const storagePaths = [];
    if (data.image_url) storagePaths.push(data.image_url);
    if (data.model_url) storagePaths.push(data.model_url);
    if (data.thumbnail_url) storagePaths.push(data.thumbnail_url);

    if (storagePaths.length > 0) {
      // Extract file paths from public URLs
      const filePaths = storagePaths.map((url) => {
        try {
          const urlObj = new URL(url);
          return decodeURIComponent(urlObj.pathname.split('/o/')[1] || urlObj.pathname);
        } catch {
          return url;
        }
      });

      // Delete files in parallel
      await Promise.allSettled(
        filePaths.map((filePath) => {
          const file = bucket.file(filePath);
          return file.delete().catch((err) => {
            console.error(
              JSON.stringify({
                event: 'storage_delete_failed',
                artifactId: id,
                filePath,
                message: err.message,
                timestamp: new Date().toISOString(),
              })
            );
          });
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

module.exports = { listUsers, updateUserRole, deleteArtifact, listAdminRequests, approveAdmin, denyAdmin };
