---
tags: [feature, done]
status: done
type: feature
created: 2026-05-26
updated: 2026-06-03
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

## Implementation Notes
- Uses `gemini-2.0-flash-exp` model via `@google/generative-ai` SDK
- System persona set to knowledgeable archaeological expert
- `chat()` function in `src/services/gemini.service.js` handles model interaction
- `chatbot()` controller in `src/controllers/ai.controller.js` handles validation and response formatting
- Route registered at `POST /api/ai/chatbot` in `src/routes/ai.routes.js`

## API Endpoints
- [[../../api/ai-endpoints|AI Endpoints]]

## Open Questions
- Should conversation history be persisted to Firestore for long-running sessions?
