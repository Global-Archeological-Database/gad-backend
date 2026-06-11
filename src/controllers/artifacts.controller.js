'use strict';

// ---------------------------------------------------------------------------
// GAD — Artifacts Controller
// ---------------------------------------------------------------------------
// Handles CRUD operations for archaeological artifacts.
// Business logic lives here; route definitions are in src/routes/.
// ---------------------------------------------------------------------------

const { db, admin } = require('../config/firebase.config');
const { queryArtifacts } = require('../services/firestore.service');
const { generateSignedUploadUrl } = require('../services/storage.service');

// ---------------------------------------------------------------------------
// Allowed field whitelist for updates
// ---------------------------------------------------------------------------
const UPDATABLE_FIELDS = [
  'title',
  'description',
  'age',
  'materials',
  'cultural_origin',
  'condition',
  'tags',
  'location',
  'image_url',
  'model_url',
  'thumbnail_url',
  'is_3d',
];

// ---------------------------------------------------------------------------
// Validation helpers
// ---------------------------------------------------------------------------

/**
 * Validates artifact creation input.
 * Returns an array of error messages. Empty array = valid.
 *
 * @param {object} body
 * @returns {string[]}
 */
function validateCreateInput(body) {
  const errors = [];

  // title: required, 1-200 chars
  if (!body.title || typeof body.title !== 'string') {
    errors.push('title is required and must be a string');
  } else if (body.title.length < 1 || body.title.length > 200) {
    errors.push('title must be between 1 and 200 characters');
  }

  // description: required, 1-5000 chars
  if (!body.description || typeof body.description !== 'string') {
    errors.push('description is required and must be a string');
  } else if (body.description.length < 1 || body.description.length > 5000) {
    errors.push('description must be between 1 and 5000 characters');
  }

  // latitude: required, -90 to 90
  if (body.latitude === undefined || body.latitude === null) {
    errors.push('latitude is required');
  } else {
    const lat = Number(body.latitude);
    if (isNaN(lat) || lat < -90 || lat > 90) {
      errors.push('latitude must be a number between -90 and 90');
    }
  }

  // longitude: required, -180 to 180
  if (body.longitude === undefined || body.longitude === null) {
    errors.push('longitude is required');
  } else {
    const lng = Number(body.longitude);
    if (isNaN(lng) || lng < -180 || lng > 180) {
      errors.push('longitude must be a number between -180 and 180');
    }
  }

  return errors;
}

// ---------------------------------------------------------------------------
// Controllers
// ---------------------------------------------------------------------------

/**
 * GET /api/artifacts
 * Public — list artifacts with optional filters and cursor-based pagination.
 */
async function listArtifacts(req, res) {
  try {
    const limit = parseInt(req.query.limit, 10) || 100;
    const startAfter = req.query.startAfter || null;
    const country = req.query.country || null;
    const culturalOrigin = req.query.cultural_origin || null;
    const condition = req.query.condition || null;
    const is3d = req.query.is_3d !== undefined
      ? req.query.is_3d === 'true'
      : undefined;
    const uploaderId = req.query.uploader_id || null;

    const { docs, lastDoc } = await queryArtifacts({
      limit,
      startAfter,
      country,
      culturalOrigin,
      condition,
      is3d,
      uploaderId,
    });

    const artifacts = docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    res.set('Cache-Control', 'public, max-age=60');
    return res.json({
      artifacts,
      count: artifacts.length,
      nextPageToken: lastDoc ? lastDoc.id : null,
    });
  } catch (err) {
    console.error(
      JSON.stringify({
        event: 'error',
        controller: 'artifacts.listArtifacts',
        message: err.message,
        timestamp: new Date().toISOString(),
      })
    );
    return res.status(500).json({
      status: 'error',
      message: 'Failed to list artifacts',
    });
  }
}

/**
 * GET /api/artifacts/:id
 * Public — get a single artifact by ID.
 */
async function getArtifact(req, res) {
  try {
    const { id } = req.params;
    const doc = await db.collection('artifacts').doc(id).get();

    if (!doc.exists) {
      return res.status(404).json({
        status: 'error',
        message: 'Artifact not found',
      });
    }

    // Fire-and-forget view_count increment
    db.collection('artifacts')
      .doc(id)
      .update({
        view_count: admin.firestore.FieldValue.increment(1),
      })
      .catch((incrementErr) => {
        console.error(
          JSON.stringify({
            event: 'warning',
            controller: 'artifacts.getArtifact',
            message: 'Failed to increment view_count',
            artifactId: id,
            error: incrementErr.message,
            timestamp: new Date().toISOString(),
          })
        );
      });

    res.set('Cache-Control', 'public, max-age=300');
    return res.json({
      id: doc.id,
      ...doc.data(),
    });
  } catch (err) {
    console.error(
      JSON.stringify({
        event: 'error',
        controller: 'artifacts.getArtifact',
        message: err.message,
        artifactId: req.params.id,
        timestamp: new Date().toISOString(),
      })
    );
    return res.status(500).json({
      status: 'error',
      message: 'Failed to get artifact',
    });
  }
}

/**
 * POST /api/artifacts
 * Authenticated — create a new artifact.
 */
async function createArtifact(req, res) {
  try {
    const errors = validateCreateInput(req.body);
    if (errors.length > 0) {
      return res.status(400).json({
        status: 'error',
        message: 'Validation failed',
        errors,
      });
    }

    const artifactData = {
      title: req.body.title,
      description: req.body.description,
      latitude: Number(req.body.latitude),
      longitude: Number(req.body.longitude),
      location: req.body.location || null,
      age: req.body.age || null,
      materials: req.body.materials || null,
      cultural_origin: req.body.cultural_origin || null,
      condition: req.body.condition || null,
      country: req.body.country || null,
      tags: req.body.tags || [],
      image_url: req.body.image_url || null,
      model_url: req.body.model_url || null,
      thumbnail_url: req.body.thumbnail_url || null,
      is_3d: req.body.is_3d || false,
      uploader_name: req.body.uploader_name || null,
      uploader_id: req.user.uid,
      uploader_email: req.user.email,
      created_at: admin.firestore.FieldValue.serverTimestamp(),
      updated_at: admin.firestore.FieldValue.serverTimestamp(),
      view_count: 0,
      ai_analysis: null,
    };

    const docRef = await db.collection('artifacts').add(artifactData);

    const createdDoc = await docRef.get();

    return res.status(201).json({
      id: createdDoc.id,
      ...createdDoc.data(),
    });
  } catch (err) {
    console.error(
      JSON.stringify({
        event: 'error',
        controller: 'artifacts.createArtifact',
        message: err.message,
        timestamp: new Date().toISOString(),
      })
    );
    return res.status(500).json({
      status: 'error',
      message: 'Failed to create artifact',
    });
  }
}

/**
 * PUT /api/artifacts/:id
 * Authenticated — update an artifact (owner or admin only).
 */
async function updateArtifact(req, res) {
  try {
    const { id } = req.params;
    const doc = await db.collection('artifacts').doc(id).get();

    if (!doc.exists) {
      return res.status(404).json({
        status: 'error',
        message: 'Artifact not found',
      });
    }

    const existingData = doc.data();

    // Ownership check
    if (existingData.uploader_id !== req.user.uid && req.user.role !== 'admin') {
      return res.status(403).json({
        status: 'error',
        message: 'You do not have permission to update this artifact',
      });
    }

    // Whitelist updatable fields
    const updateData = {};
    for (const field of UPDATABLE_FIELDS) {
      if (req.body[field] !== undefined) {
        updateData[field] = req.body[field];
      }
    }

    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({
        status: 'error',
        message: 'No valid fields to update',
      });
    }

    updateData.updated_at = admin.firestore.FieldValue.serverTimestamp();

    await db.collection('artifacts').doc(id).update(updateData);

    const updatedDoc = await db.collection('artifacts').doc(id).get();

    return res.json({
      id: updatedDoc.id,
      ...updatedDoc.data(),
    });
  } catch (err) {
    console.error(
      JSON.stringify({
        event: 'error',
        controller: 'artifacts.updateArtifact',
        message: err.message,
        artifactId: req.params.id,
        timestamp: new Date().toISOString(),
      })
    );
    return res.status(500).json({
      status: 'error',
      message: 'Failed to update artifact',
    });
  }
}

/**
 * DELETE /api/artifacts/:id
 * Authenticated — delete an artifact (owner or admin only).
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

    const existingData = doc.data();

    // Ownership check
    if (existingData.uploader_id !== req.user.uid && req.user.role !== 'admin') {
      return res.status(403).json({
        status: 'error',
        message: 'You do not have permission to delete this artifact',
      });
    }

    // Delete associated files from Cloud Storage
    const bucket = admin.storage().bucket();
    const storagePaths = [];
    if (existingData.image_url) storagePaths.push(existingData.image_url);
    if (existingData.model_url) storagePaths.push(existingData.model_url);
    if (existingData.thumbnail_url) storagePaths.push(existingData.thumbnail_url);

    if (storagePaths.length > 0) {
      // Extract file paths from public URLs
      const filePaths = storagePaths.map((url) => {
        try {
          const urlObj = new URL(url);
          // Path format: /v0/b/{bucket}/o/{encoded-path} or just the path after bucket name
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
        controller: 'artifacts.deleteArtifact',
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

/**
 * POST /api/artifacts/:id/upload-url
 * Authenticated — generate a signed upload URL for direct client upload.
 */
async function generateUploadUrl(req, res) {
  try {
    const { id } = req.params;
    const { fileName, contentType } = req.body;

    if (!fileName || typeof fileName !== 'string') {
      return res.status(400).json({
        status: 'error',
        message: 'fileName is required',
      });
    }

    if (!contentType || typeof contentType !== 'string') {
      return res.status(400).json({
        status: 'error',
        message: 'contentType is required',
      });
    }

    const doc = await db.collection('artifacts').doc(id).get();

    if (!doc.exists) {
      return res.status(404).json({
        status: 'error',
        message: 'Artifact not found',
      });
    }

    const existingData = doc.data();

    // Ownership check
    if (existingData.uploader_id !== req.user.uid && req.user.role !== 'admin') {
      return res.status(403).json({
        status: 'error',
        message: 'You do not have permission to upload files for this artifact',
      });
    }

    const { uploadUrl, publicUrl } = await generateSignedUploadUrl(
      req.user.uid,
      id,
      fileName,
      contentType
    );

    return res.json({ uploadUrl, publicUrl });
  } catch (err) {
    console.error(
      JSON.stringify({
        event: 'error',
        controller: 'artifacts.generateUploadUrl',
        message: err.message,
        artifactId: req.params.id,
        timestamp: new Date().toISOString(),
      })
    );
    return res.status(500).json({
      status: 'error',
      message: 'Failed to generate upload URL',
    });
  }
}

module.exports = {
  listArtifacts,
  getArtifact,
  createArtifact,
  updateArtifact,
  deleteArtifact,
  generateUploadUrl,
};
