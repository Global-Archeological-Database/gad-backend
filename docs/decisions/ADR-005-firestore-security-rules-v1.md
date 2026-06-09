---
title: "ADR-005: Firestore Security Rules v1"
status: accepted
date: 2026-05-30
deciders: [Aahwaanith Sinha Roy]
---

# ADR-005: Firestore Security Rules v1

## Context

The GAD backend uses Firestore as its primary database. Access control must be enforced at the database level through security rules, independent of application-level middleware. The rules must support:

- **Artifacts**: Public read, authenticated create (with uploader binding), owner/admin update/delete
- **Users**: Owner/admin read, self-registration, self-update (with role-change protection), admin-only delete
- **Catch-all**: Deny all other access

## Decision

We adopted a **function-based ruleset** with three helper functions (`isAuth`, `isAdmin`, `isOwner`) to keep the rules DRY and maintainable.

### Key Design Choices

1. **Function encapsulation** — `isAuth()`, `isAdmin()`, `isOwner(uid)` centralise auth checks, making rule declarations concise and auditable.

2. **Artifact ownership binding** — `create` requires `request.resource.data.uploader_id == request.auth.uid`, preventing impersonation. `update`/`delete` use `isOwner(resource.data.uploader_id)` to verify against the stored owner.

3. **Role-change protection** — Users can update their own profile but cannot change their `role` field. The rule `!('role' in request.resource.data.diff(resource.data).affectedKeys())` ensures only admins can promote/demote users.

4. **Catch-all deny** — `match /{document=**} { allow read, write: if false; }` acts as a safety net, denying access to any collections not explicitly covered.

5. **No field-level validation in rules** — We deliberately avoided in-rule field validation (e.g., title length, coordinate ranges). This logic lives in the application controllers, keeping rules focused on access control only.

## Consequences

### Positive
- Rules are auditable and follow the principle of least privilege
- Role escalation is prevented at the database level
- Function-based approach is easy to extend for new collections

### Negative
- Additional `get()` call for admin checks adds minimal latency
- Schema changes (new collections) require rule updates

## Related

- [ADR-002: Firestore Schema v1](ADR-002-firestore-schema-v1.md)
- [Authentication Overview](../features/authentication/overview.md)
