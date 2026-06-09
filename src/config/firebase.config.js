'use strict';

// ---------------------------------------------------------------------------
// GAD — Firebase Admin SDK Configuration
// ---------------------------------------------------------------------------
// Initializes firebase-admin exactly once and exports:
//   admin, db (Firestore), auth (Firebase Auth), storage (Cloud Storage),
//   geminiModel (Google Generative AI model)
// ---------------------------------------------------------------------------

const admin = require('firebase-admin');
const { GoogleGenerativeAI } = require('@google/generative-ai');

// ---------------------------------------------------------------------------
// 1. Firebase Admin — singleton initialization
// ---------------------------------------------------------------------------
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.applicationDefault(),
    projectId: process.env.GCLOUD_PROJECT || 'global-archaeological-database',
    storageBucket: process.env.STORAGE_BUCKET || 'global-archaeological-database.firebasestorage.app',
  });
}

// ---------------------------------------------------------------------------
// 2. Service references
// ---------------------------------------------------------------------------
const db = admin.firestore();
const auth = admin.auth();
const storage = admin.storage();

// ---------------------------------------------------------------------------
// 3. Gemini AI model
// ---------------------------------------------------------------------------
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const geminiModel = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

// ---------------------------------------------------------------------------
// 4. Log successful initialization
// ---------------------------------------------------------------------------
console.log(
  JSON.stringify({
    event: 'firebase_initialized',
    projectId: process.env.GCLOUD_PROJECT || 'global-archaeological-database',
    hasGeminiKey: !!process.env.GEMINI_API_KEY,
    timestamp: new Date().toISOString(),
  })
);

// ---------------------------------------------------------------------------
// 5. Exports
// ---------------------------------------------------------------------------
module.exports = { admin, db, auth, storage, geminiModel };
