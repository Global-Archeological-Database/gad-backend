---
status: done
priority: medium
---

# AI Artifact Analyzer

**Status**: `done` ✅
**Last Updated**: 2026-06-09

## Overview
AI-powered artifact analysis using Gemini 2.5 Flash. Analyzes artifact metadata (title, description, cultural origin, materials, age, condition) and returns structured analysis with historical context, significance assessment, and preservation recommendations.

## Implementation

### Backend: `POST /api/ai/analyze/:artifactId`
- **Auth**: `requireAuth` — user must be authenticated
- **Rate Limit**: `aiLimiter` (20 requests per hour)
- **Flow**:
  1. Fetch artifact from Firestore by ID
  2. Return 404 if not found
  3. Build analysis prompt with artifact fields (title, description, cultural_origin, materials, age, condition, country)
  4. Call Gemini 2.5 Flash model via `@google/generative-ai` SDK
  5. Save analysis result to Firestore artifact doc (`ai_analysis`, `ai_analysis_timestamp`)
  6. Return `{ analysis, timestamp }`

### Prompt
The `buildAnalysisPrompt()` function constructs a detailed prompt asking Gemini to:
- Provide historical context and significance
- Assess preservation condition
- Offer recommendations for further research
- Identify similar known artifacts or archaeological parallels

### Response Format
```json
{
  "analysis": "string — AI-generated analysis text",
  "timestamp": "ISO 8601 timestamp"
}
```

## Acceptance Criteria
- [x] Authenticated users can analyze any artifact
- [x] Analysis saved to Firestore artifact document
- [x] Subsequent requests return cached analysis if available (handled client-side)
- [x] Rate limited to prevent abuse

## Files
- `src/controllers/ai.controller.js` — `analyze()` function
- `src/services/gemini.service.js` — `analyzeArtifact()` and `buildAnalysisPrompt()` functions
- `src/routes/ai.routes.js` — Route registration
- `src/middleware/rateLimit.middleware.js` — AI rate limiter
