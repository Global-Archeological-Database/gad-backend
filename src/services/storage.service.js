'use strict';

// ---------------------------------------------------------------------------
// GAD — Cloud Storage Service
// ---------------------------------------------------------------------------
// Provides signed-URL generation for direct client uploads.
// ---------------------------------------------------------------------------

const { admin, storage } = require('../config/firebase.config');

/**
 * Generates a V4 signed upload URL for direct client-to-Storage uploads.
 *
 * The file will be stored at: artifacts/{uid}/{artifactId}/{fileName}
 *
 * @param {string} uid - The authenticated user's UID.
 * @param {string} artifactId - The artifact's Firestore document ID.
 * @param {string} fileName - The original file name to store.
 * @param {string} contentType - The MIME type of the file.
 * @returns {Promise<{uploadUrl: string, publicUrl: string}>}
 */
async function generateSignedUploadUrl(uid, artifactId, fileName, contentType) {
  const bucket = storage.bucket();
  const filePath = `artifacts/${uid}/${artifactId}/${fileName}`;
  const file = bucket.file(filePath);

  const expiresAt = Date.now() + 15 * 60 * 1000; // 15 minutes

  const [uploadUrl] = await file.getSignedUrl({
    version: 'v4',
    action: 'write',
    expires: expiresAt,
    contentType,
  });

  const publicUrl = `https://storage.googleapis.com/${bucket.name}/${filePath}`;

  return { uploadUrl, publicUrl };
}

module.exports = { generateSignedUploadUrl };
