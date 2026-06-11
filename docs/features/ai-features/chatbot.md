---
tags: [feature, done]
status: done
type: feature
created: 2026-05-26
updated: 2026-06-10
related: []
---

# AI Chatbot

## Purpose
Provides an interactive archaeological AI assistant that helps users learn about artifacts, ancient civilizations, and archaeological best practices.

## Acceptance Criteria
- [x] POST /api/ai/chatbot endpoint created
- [x] Message validation (non-empty, max 2000 chars)
- [x] Conversation history support
- [x] Rate limiting (20 req/hour via aiLimiter)
- [x] Frontend chat UI integration
- [x] Public access (no auth required, per ADR-006)

## Implementation Notes
- Uses `gemini-2.5-flash` model via `@google/generative-ai` SDK
- System persona set to knowledgeable archaeological expert
- `chat()` function in [`src/services/gemini.service.js`](src/services/gemini.service.js:25) handles model interaction
- `chatbot()` controller in [`src/controllers/ai.controller.js`](src/controllers/ai.controller.js:17) handles validation and response formatting
- Route registered at `POST /api/ai/chatbot` in [`src/routes/ai.routes.js`](src/routes/ai.routes.js)
- Returns `{ reply, history }` — includes updated conversation history for client-side state management
- Public access per [ADR-006](../../decisions/ADR-006-chatbot-public-access.md)

## API Endpoints
- [[../../api/ai-endpoints|AI Endpoints]]

## Open Questions
- Should conversation history be persisted to Firestore for long-running sessions?
