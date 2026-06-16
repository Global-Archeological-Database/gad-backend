---
status: done
priority: medium
---

# AI Find Similar Artifacts

**Status**: `done` ✅
**Last Updated**: 2026-06-16

## Overview
AI-powered similarity search that finds artifacts related to a given source artifact. Uses Gemini 2.5 Flash to compare artifact metadata and return indices of similar artifacts from a candidate pool.

## Implementation

### Backend: `POST /api/ai/find-similar/:artifactId`
- **Auth**: `requireAuth` — user must be authenticated
- **Rate Limit**: `aiLimiter` (20 requests per hour)
- **Flow**:
  1. Fetch source artifact from Firestore by ID
  2. Return 404 if not found
  3. Fetch up to 100 candidate artifacts from Firestore (excluding source via JS filter — avoids `!=` composite index requirement)
  4. Return `{ similar: [], message: 'not_enough_data', hint: '...' }` if fewer than 2 candidates
  5. Build comparison prompt with source artifact fields and candidate list
  6. Call Gemini 2.5 Flash model requesting JSON array of matching indices
  7. Parse response as JSON array (with regex fallback `responseText.match(/\[[\s\S]*\]/)` for robust extraction)
  8. Return `{ similar: [], message: 'parse_error', hint: '...' }` if JSON parsing fails
  9. Map indices back to artifact objects
 10. Return similar artifacts array

### Similarity Criteria
Gemini compares artifacts based on:
- Cultural origin / civilization
- Time period / age
- Materials used
- Artifact type / category
- Geographic region
- Condition

### Response Format
```json
// Success
{ "similar": [ { "id": "string", "title": "string", ... } ] }

// Not enough data (< 2 candidates)
{ "similar": [], "message": "not_enough_data", "hint": "The database needs more artifacts to find similarities." }

// Parse error
{ "similar": [], "message": "parse_error", "hint": "The AI similarity search encountered an issue. Please try again." }
```

## Acceptance Criteria
- [x] Authenticated users can find similar artifacts
- [x] Returns ranked list of similar artifacts
- [x] Excludes the source artifact from results (JS filter, no composite index needed)
- [x] Rate limited to prevent abuse
- [x] Returns `not_enough_data` message when < 2 candidate artifacts exist
- [x] Returns `parse_error` message when AI response cannot be parsed as JSON
- [x] Frontend renders graceful empty states for both error conditions

## Files
- [`src/controllers/ai.controller.js`](src/controllers/ai.controller.js:116) — `findSimilar()` function
- [`src/services/gemini.service.js`](src/services/gemini.service.js:98) — `findSimilarArtifacts()` and `buildArtifactText()` functions
- [`src/routes/ai.routes.js`](src/routes/ai.routes.js) — Route registration
