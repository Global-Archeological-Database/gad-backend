---
status: done
priority: medium
---

# AI Find Similar Artifacts

**Status**: `done` ✅
**Last Updated**: 2026-06-10

## Overview
AI-powered similarity search that finds artifacts related to a given source artifact. Uses Gemini 2.5 Flash to compare artifact metadata and return indices of similar artifacts from a candidate pool.

## Implementation

### Backend: `POST /api/ai/find-similar/:artifactId`
- **Auth**: `requireAuth` — user must be authenticated
- **Rate Limit**: `aiLimiter` (20 requests per hour)
- **Flow**:
  1. Fetch source artifact from Firestore by ID
  2. Return 404 if not found
  3. Fetch up to 100 candidate artifacts from Firestore (excluding source)
  4. Build comparison prompt with source artifact fields and candidate list
  5. Call Gemini 2.5 Flash model requesting JSON array of matching indices
  6. Parse response as JSON array
  7. Map indices back to artifact objects
  8. Return similar artifacts array

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
{
  "similar": [
    { "id": "string", "title": "string", "description": "string", ... }
  ]
}
```

## Acceptance Criteria
- [x] Authenticated users can find similar artifacts
- [x] Returns ranked list of similar artifacts
- [x] Excludes the source artifact from results
- [x] Rate limited to prevent abuse

## Files
- [`src/controllers/ai.controller.js`](src/controllers/ai.controller.js:116) — `findSimilar()` function
- [`src/services/gemini.service.js`](src/services/gemini.service.js:98) — `findSimilarArtifacts()` and `buildArtifactText()` functions
- [`src/routes/ai.routes.js`](src/routes/ai.routes.js) — Route registration
