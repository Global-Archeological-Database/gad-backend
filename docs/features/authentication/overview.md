---
tags: [feature, done]
status: done
type: feature
created: 2026-05-26
updated: 2026-06-10
related: [ADR-005]
---

# Authentication

## Purpose
Provides secure user authentication and authorization for the GAD platform. Uses Firebase Authentication for client-side identity management and Firebase Admin SDK for server-side token verification. Supports role-based access control (user/admin) and optional authentication for public features.

## Acceptance Criteria
- [x] Users can register with email/password via Firebase Auth (client-side)
- [x] Backend verifies Firebase ID tokens on authenticated routes
- [x] Role-based access control: `user` and `admin` roles
- [x] Admin-only endpoints protected by `requireAdmin` middleware
- [x] Optional auth for public features (chatbot) via `optionalAuth` middleware
- [x] User profiles stored in Firestore `users` collection
- [x] Profile update endpoint for display name and settings
- [x] Rate limiting on auth endpoints

## Implementation Notes
- Firebase Auth handles client-side authentication (login, register, password reset)
- Backend receives `uid` and `email` from client after Firebase Auth success (register endpoint is public — no `requireAuth` middleware)
- Token verification via `admin.auth().verifyIdToken()` in [`auth.middleware.js`](src/middleware/auth.middleware.js)
- Three middleware functions: `requireAuth`, `requireAdmin`, `optionalAuth`
- User profiles auto-created on first register with default role `user`
- See [`implementation.md`](implementation.md) for detailed middleware and auth flow documentation

## API Endpoints
- [[../../api/auth-endpoints|Auth Endpoints]]

## Open Questions
- Should password reset be handled entirely client-side via Firebase SDK, or should there be a backend endpoint?
