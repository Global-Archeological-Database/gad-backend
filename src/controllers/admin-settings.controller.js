'use strict';

// ---------------------------------------------------------------------------
// GAD — Admin Settings Controller
// ---------------------------------------------------------------------------
// Owner-only operations for managing site-wide settings (logo, site name, etc).
// Settings are stored in Firestore under admin_settings/{id}.
// ---------------------------------------------------------------------------

const { db, admin } = require('../config/firebase.config');

const SETTINGS_DOC_ID = 'site';
const MAX_LOGO_SIZE = parseInt(process.env.MAX_LOGO_SIZE, 10) || (2 * 1024 * 1024);

/**
 * GET /api/admin/settings
 * Owner — retrieve site settings.
 */
async function getSettings(req, res) {
  try {
    const doc = await db.collection('admin_settings').doc(SETTINGS_DOC_ID).get();

    if (!doc.exists) {
      // Return defaults if no settings document exists yet
      return res.json({
        id: SETTINGS_DOC_ID,
        logo_url: null,
        site_name: 'Global Archaeological Database',
        updated_at: null,
        updated_by: null,
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
        controller: 'admin-settings.getSettings',
        message: err.message,
        timestamp: new Date().toISOString(),
      })
    );
    return res.status(500).json({
      status: 'error',
      message: 'Failed to retrieve settings',
    });
  }
}

/**
 * PUT /api/admin/settings
 * Owner — update site settings (site_name, etc).
 */
async function updateSettings(req, res) {
  try {
    const { site_name } = req.body;

    if (!site_name || typeof site_name !== 'string' || site_name.trim().length === 0) {
      return res.status(400).json({
        status: 'error',
        message: 'site_name is required and must be a non-empty string',
      });
    }

    const updateData = {
      site_name: site_name.trim(),
      updated_at: admin.firestore.FieldValue.serverTimestamp(),
      updated_by: req.user.uid,
    };

    await db.collection('admin_settings').doc(SETTINGS_DOC_ID).set(updateData, { merge: true });

    const updatedDoc = await db.collection('admin_settings').doc(SETTINGS_DOC_ID).get();

    return res.json({
      id: updatedDoc.id,
      ...updatedDoc.data(),
    });
  } catch (err) {
    console.error(
      JSON.stringify({
        event: 'error',
        controller: 'admin-settings.updateSettings',
        message: err.message,
        timestamp: new Date().toISOString(),
      })
    );
    return res.status(500).json({
      status: 'error',
      message: 'Failed to update settings',
    });
  }
}

/**
 * POST /api/admin/settings/logo
 * Owner — upload a logo image to Cloud Storage and update logo_url in settings.
 *
 * Expects multipart/form-data with a field named "logo" containing the image file.
 */
async function uploadLogo(req, res) {
  try {
    if (!req.file) {
      return res.status(400).json({
        status: 'error',
        message: 'No file uploaded. Provide a "logo" field with an image file.',
      });
    }

    const file = req.file;

    // Validate file type
    const allowedMimeTypes = ['image/png', 'image/jpeg', 'image/webp', 'image/svg+xml'];
    if (!allowedMimeTypes.includes(file.mimetype)) {
      return res.status(400).json({
        status: 'error',
        message: `Invalid file type. Allowed: ${allowedMimeTypes.join(', ')}`,
      });
    }

    // Validate file size (max 2MB)
    if (file.size > MAX_LOGO_SIZE) {
      return res.status(400).json({
        status: 'error',
        message: 'File too large. Maximum size is 2MB.',
      });
    }

    const bucket = admin.storage().bucket();
    const filePath = `admin/logo/${Date.now()}_${file.originalname}`;
    const cloudFile = bucket.file(filePath);

    // Upload the file buffer
    await cloudFile.save(file.buffer, {
      metadata: {
        contentType: file.mimetype,
        metadata: {
          uploadedBy: req.user.uid,
          uploadedAt: new Date().toISOString(),
        },
      },
    });

    // Make the file publicly readable
    await cloudFile.makePublic();

    const publicUrl = `https://storage.googleapis.com/${bucket.name}/${filePath}`;

    // Update Firestore settings with the new logo URL
    const updateData = {
      logo_url: publicUrl,
      updated_at: admin.firestore.FieldValue.serverTimestamp(),
      updated_by: req.user.uid,
    };

    await db.collection('admin_settings').doc(SETTINGS_DOC_ID).set(updateData, { merge: true });

    return res.json({
      success: true,
      logo_url: publicUrl,
    });
  } catch (err) {
    console.error(
      JSON.stringify({
        event: 'error',
        controller: 'admin-settings.uploadLogo',
        message: err.message,
        timestamp: new Date().toISOString(),
      })
    );
    return res.status(500).json({
      status: 'error',
      message: 'Failed to upload logo',
    });
  }
}

module.exports = { getSettings, updateSettings, uploadLogo };
