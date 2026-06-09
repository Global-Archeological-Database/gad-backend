'use strict';

// ---------------------------------------------------------------------------
// GAD — Gemini AI Service
// ---------------------------------------------------------------------------
// Provides AI-powered chat, artifact analysis, and similarity search
// using the Gemini 2.0 Flash model.
// ---------------------------------------------------------------------------

const { geminiModel } = require('../config/firebase.config');

/**
 * System instruction defining the archaeologist AI persona.
 * Used by the chatbot feature.
 */
const ARCHAEOLOGIST_PERSONA = `You are a knowledgeable archaeological expert assistant. You help users learn about archaeological artifacts, ancient civilizations, historical contexts, and best practices in archaeology. You provide accurate, educational information while acknowledging uncertainties when appropriate. You cite archaeological methods and theories where relevant. Keep responses informative but accessible to a general audience.`;

/**
 * Sends a chat message to the Gemini model with conversation history.
 *
 * @param {Array<{role: string, parts: {text: string}[]}>} conversationHistory
 * @param {string} userMessage - The user's latest message.
 * @returns {Promise<string>} The model's response text.
 */
async function chat(conversationHistory, userMessage) {
  const chatSession = geminiModel.startChat({
    systemInstruction: {
      role: 'user',
      parts: [{ text: ARCHAEOLOGIST_PERSONA }],
    },
    history: conversationHistory || [],
  });

  const result = await chatSession.sendMessage(userMessage);
  const response = result.response;

  return response.text();
}

/**
 * Analyzes an artifact and returns structured archaeological insights.
 *
 * @param {object} artifact - The full artifact document data.
 * @returns {Promise<string>} Analysis text from the AI.
 */
async function analyzeArtifact(artifact) {
  const prompt = buildAnalysisPrompt(artifact);

  const result = await geminiModel.generateContent(prompt);
  const response = result.response;

  return response.text();
}

/**
 * Builds a detailed analysis prompt from artifact data.
 *
 * @param {object} artifact
 * @returns {string}
 */
function buildAnalysisPrompt(artifact) {
  const fields = [
    ['Title', artifact.title],
    ['Description', artifact.description],
    ['Age / Period', artifact.age],
    ['Materials', artifact.materials],
    ['Cultural Origin', artifact.cultural_origin],
    ['Condition', artifact.condition],
    ['Location', artifact.location ? JSON.stringify(artifact.location) : null],
    ['Country', artifact.country],
    ['Tags', artifact.tags ? artifact.tags.join(', ') : null],
    ['Is 3D Model Available', artifact.is_3d ? 'Yes' : 'No'],
  ].filter(([, v]) => v != null);

  const artifactDescription = fields.map(([label, value]) => `${label}: ${value}`).join('\n');

  return `You are an expert archaeologist and art historian. Provide a detailed analysis of the following archaeological artifact.

ARTIFACT DATA:
${artifactDescription}

Please provide your analysis covering the following areas:
1. **Material Analysis** — What materials is it made from and what does that tell us?
2. **Historical Context** — What time period and culture does it belong to? What was its likely purpose?
3. **Significance** — Why is this artifact important archaeologically?
4. **Conservation Assessment** — Based on the condition data, what conservation considerations apply?
5. **Research Recommendations** — What further research or analysis would you recommend?
6. **Confidence Rating** — Rate your confidence in this analysis on a scale of 1-10, with explanation.`;
}

/**
 * Finds artifacts similar to a given source artifact using AI comparison.
 *
 * @param {object} sourceArtifact - The artifact to find similarities for.
 * @param {Array<object>} candidateArtifacts - Array of other artifact data objects to compare against.
 * @returns {Promise<string>} A JSON array of indices (as text) representing similar artifacts.
 */
async function findSimilarArtifacts(sourceArtifact, candidateArtifacts) {
  const sourceFields = [
    ['Title', sourceArtifact.title],
    ['Description', sourceArtifact.description],
    ['Age / Period', sourceArtifact.age],
    ['Materials', Array.isArray(sourceArtifact.materials) ? sourceArtifact.materials.join(', ') : sourceArtifact.materials],
    ['Cultural Origin', sourceArtifact.cultural_origin],
    ['Condition', sourceArtifact.condition],
    ['Country', sourceArtifact.country],
    ['Tags', sourceArtifact.tags ? sourceArtifact.tags.join(', ') : null],
  ].filter(([, value]) => value != null)
   .map(([key, value]) => `${key}: ${value}`)
   .join('\n');

  const sourceText = buildArtifactText(sourceArtifact);

  const candidatesText = candidateArtifacts.map((a, i) => {
    return `[${i}] ${buildArtifactText(a)}`;
  }).join('\n---\n');

  const prompt = `You are an expert archaeologist. Compare the following source artifact with the list of candidate artifacts below.

SOURCE ARTIFACT:
${sourceText}

CANDIDATE ARTIFACTS:
${candidatesText}

Identify which candidate artifacts (by their index numbers in brackets) are most similar to the source artifact based on cultural origin, time period, materials, purpose, and archaeological significance.

Return ONLY a valid JSON array of the index numbers of the most similar artifacts, ordered by similarity (most similar first). For example: [3, 7, 1]

If none are similar, return an empty array: []

Do not include any explanation or markdown formatting. Return only the JSON array.`;

  const result = await geminiModel.generateContent(prompt);
  const response = result.response;
  return response.text();
}

/**
 * Helper: builds a concise text representation of an artifact for comparison.
 *
 * @param {object} artifact
 * @returns {string}
 */
function buildArtifactText(artifact) {
  const parts = [
    `Title: ${artifact.title || 'Unknown'}`,
    `Description: ${(artifact.description || '').substring(0, 200)}`,
    artifact.age ? `Age: ${artifact.age}` : null,
    artifact.materials ? `Materials: ${Array.isArray(artifact.materials) ? artifact.materials.join(', ') : artifact.materials}` : null,
    artifact.cultural_origin ? `Cultural Origin: ${artifact.cultural_origin}` : null,
    artifact.country ? `Country: ${artifact.country}` : null,
    artifact.condition ? `Condition: ${artifact.condition}` : null,
    artifact.tags ? `Tags: ${artifact.tags.join(', ')}` : null,
  ].filter(Boolean);

  return parts.join(' | ');
}

module.exports = { chat, analyzeArtifact, findSimilarArtifacts };
