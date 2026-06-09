# ADR-006: AI Chatbot Public Access

## Status
✅ Accepted

## Context
The production test report (2026-06-06) flagged that the `/api/ai/chatbot` endpoint requires authentication (`requireAuth`), meaning unauthenticated users cannot use the chatbot. The chatbot was originally designed as a logged-in user feature, but the team decided it should be publicly accessible to all visitors.

## Decision
Replace `requireAuth` with `optionalAuth` on the chatbot route:
- Unauthenticated users receive generic archaeological knowledge responses
- Authenticated users receive personalized responses (e.g., based on their saved artifacts)
- Rate limiting (20 requests/hour/IP via `aiLimiter`) provides abuse protection

## Consequences
- **Positive**: All visitors can use the chatbot without logging in
- **Positive**: Authenticated users get enhanced, personalized responses
- **Negative**: Increased API usage from public users (mitigated by rate limiting)
- **Risk**: Potential abuse (mitigated by 20 req/hour rate limit + max 2000 char message validation)

## Related
- [AI Chatbot Feature](../features/ai-features/chatbot.md)
- [AI Routes](../../src/routes/ai.routes.js)
- [Auth Middleware](../../src/middleware/auth.middleware.js)
