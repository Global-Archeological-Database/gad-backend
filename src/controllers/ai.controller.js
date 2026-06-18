'use strict';

// ---------------------------------------------------------------------------
// GAD — AI Controller
// ---------------------------------------------------------------------------
// Handles AI-powered chatbot, artifact analysis, and similarity search.
// All endpoints require authentication and use the AI rate limiter.
// ---------------------------------------------------------------------------

const { db } = require('../config/firebase.config');
const { chat, analyzeArtifact, findSimilarArtifacts } = require('../services/gemini.service');

/**
 * POST /api/ai/chatbot
 * Authenticated + aiLimiter — conversational AI assistant.
 */
async function chatbot(req, res) {
  try {
    const { message, messages: conversationHistory } = req.body;

    // Validate message
    if (!message || typeof message !== 'string' || message.trim().length === 0) {
      return res.status(400).json({
        status: 'error',
        message: 'message is required and must be a non-empty string',
      });
    }

    if (message.length > 2000) {
      return res.status(400).json({
        status: 'error',
        message: 'message must not exceed 2000 characters',
      });
    }

    const history = Array.isArray(conversationHistory) ? conversationHistory : [];
    const responseText = await chat(history, message);

    // Build updated history
    const updatedHistory = [
      ...history,
      { role: 'user', parts: [{ text: message }] },
      { role: 'model', parts: [{ text: responseText }] },
    ];

    return res.json({
      reply: responseText,
      history: updatedHistory,
    });
  } catch (err) {
    console.error(
      JSON.stringify({
        event: 'error',
        controller: 'ai.chatbot',
        message: err.message,
        timestamp: new Date().toISOString(),
      })
    );
    return res.status(500).json({
      status: 'error',
      message: 'AI chat failed',
    });
  }
}

/**
 * POST /api/ai/analyze/:artifactId
 * Authenticated + aiLimiter — analyze an artifact using AI.
 */
async function analyze(req, res) {
  try {
    const { artifactId } = req.params;

    const doc = await db.collection('artifacts').doc(artifactId).get();

    if (!doc.exists) {
      return res.status(404).json({
        status: 'error',
        message: 'Artifact not found',
      });
    }

    const artifactData = doc.data();
    const analysisText = await analyzeArtifact(artifactData);

    // Save analysis result to Firestore
    await db.collection('artifacts').doc(artifactId).update({
      ai_analysis: analysisText,
      ai_analysis_timestamp: new Date().toISOString(),
    });

    return res.json({
      analysis: analysisText,
    });
  } catch (err) {
    console.error(
      JSON.stringify({
        event: 'error',
        controller: 'ai.analyze',
        message: err.message,
        artifactId: req.params.artifactId,
        timestamp: new Date().toISOString(),
      })
    );
    return res.status(500).json({
      status: 'error',
      message: 'AI analysis failed',
      detail: process.env.NODE_ENV === 'development' ? err.message : undefined,
    });
  }
}

/**
 * POST /api/ai/find-similar/:artifactId
 * Authenticated + aiLimiter — find artifacts similar to a given one.
 */
async function findSimilar(req, res) {
  try {
    const { artifactId } = req.params;

    // Fetch source artifact
    const sourceDoc = await db.collection('artifacts').doc(artifactId).get();

    if (!sourceDoc.exists) {
      return res.status(404).json({
        status: 'error',
        message: 'Artifact not found',
      });
    }

    const sourceData = { id: sourceDoc.id, ...sourceDoc.data() };

    // Fetch up to 100 other artifacts
    const allDocs = await db.collection('artifacts').limit(100).get();
    const candidateArtifacts = allDocs.docs
      .filter((doc) => doc.id !== artifactId)
      .map((doc) => ({ id: doc.id, ...doc.data() }));

    // Minimum database size check — need at least 2 other artifacts for meaningful comparison
    if (candidateArtifacts.length < 2) {
      return res.json({
        similar: [],
        message: 'not_enough_data',
        hint: 'The database needs more artifacts to find similarities.',
      });
    }

    // Get AI similarity results
    const responseText = await findSimilarArtifacts(sourceData, candidateArtifacts);

    // Parse the JSON array response
    let similarIndices = [];
    try {
      // Try to extract JSON array from the response
      const jsonMatch = responseText.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        similarIndices = JSON.parse(jsonMatch[0]);
      }
    } catch (parseErr) {
      console.error(
        JSON.stringify({
          event: 'warning',
          controller: 'ai.findSimilar',
          message: 'Failed to parse AI similarity response',
          rawResponse: responseText,
          error: parseErr.message,
          timestamp: new Date().toISOString(),
        })
      );
      return res.json({
        similar: [],
        message: 'parse_error',
        hint: 'The AI similarity search encountered an issue. Please try again.',
      });
    }

    // Map indices back to full artifact objects
    const similarArtifacts = similarIndices
      .filter((index) => index >= 0 && index < candidateArtifacts.length)
      .map((index) => candidateArtifacts[index]);

    return res.json({ similar: similarArtifacts });
  } catch (err) {
    console.error(
      JSON.stringify({
        event: 'error',
        controller: 'ai.findSimilar',
        message: err.message,
        artifactId: req.params.artifactId,
        timestamp: new Date().toISOString(),
      })
    );
    return res.status(500).json({
      status: 'error',
      message: 'We could not find similar artifacts right now. This may be because there are not enough related artifacts in the database yet.',
      detail: process.env.NODE_ENV === 'development' ? err.message : undefined,
    });
  }
}

module.exports = { chatbot, analyze, findSimilar };
