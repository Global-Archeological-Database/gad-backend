# AI API Endpoints

**Last Updated**: 2026-06-09

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
**Response**: `{ reply: "string" }`
**Errors**:
- `400` — Missing message or invalid messages format

---

## `POST /api/ai/analyze/:artifactId`
Analyze an artifact using AI. Saves analysis to Firestore.

**Auth**: `requireAuth`
**Rate Limit**: `aiLimiter` (20 requests per hour)
**Response**: `{ analysis: "string", timestamp: "ISO 8601" }`
**Errors**:
- `404` — Artifact not found

---

## `POST /api/ai/find-similar/:artifactId`
Find artifacts similar to a given artifact using AI comparison.

**Auth**: `requireAuth`
**Rate Limit**: `aiLimiter` (20 requests per hour)
**Response**: `{ similar: Artifact[] }`
**Errors**:
- `404` — Artifact not found
