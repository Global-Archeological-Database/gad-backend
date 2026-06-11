# AI API Endpoints

**Last Updated**: 2026-06-10

## `POST /api/ai/chatbot`
Send a message to the AI chatbot. Uses Gemini 2.5 Flash with an archaeologist persona.

**Auth**: `optionalAuth` (changed from `requireAuth` per ADR-006)
**Rate Limit**: `aiLimiter` (20 requests per hour)
**Body**:
```json
{
  "messages": [{ "role": "user|model", "parts": [{ "text": "string" }] }],
  "message": "string"
}
```
**Response** (200):
```json
{
  "reply": "string — AI-generated response text",
  "history": [
    { "role": "user", "parts": [{ "text": "string" }] },
    { "role": "model", "parts": [{ "text": "string" }] }
  ]
}
```
**Errors**:
- `400` — Missing message or invalid messages format

---

## `POST /api/ai/analyze/:artifactId`
Analyze an artifact using AI. Saves analysis to Firestore.

**Auth**: `requireAuth`
**Rate Limit**: `aiLimiter` (20 requests per hour)
**Response** (200):
```json
{
  "analysis": "string — AI-generated analysis text",
  "timestamp": "ISO 8601 timestamp"
}
```
**Errors**:
- `404` — Artifact not found

---

## `POST /api/ai/find-similar/:artifactId`
Find artifacts similar to a given artifact using AI comparison.

**Auth**: `requireAuth`
**Rate Limit**: `aiLimiter` (20 requests per hour)
**Response** (200):
```json
{
  "similar": [
    { "id": "string", "title": "string", "description": "string", ... }
  ]
}
```
**Errors**:
- `404` — Artifact not found
