---
tags: [decision, accepted]
status: accepted
type: adr
date: 2026-05-26
---

# ADR-002: Firestore Schema v1

## Context
The application requires a NoSQL document store for artifacts, users, and application data.

## Decision
Use Firestore with the schema documented in [[schemas/artifact-schema]] and [[schemas/user-schema]]. Collections are denormalized where read performance is prioritized over write normalization.

## Consequences
**Positive:** Serverless scaling, real-time listeners available, tight GCP integration.
**Negative:** No JOINs — requires application-level aggregation. Schema enforcement is application-side only.
**Risks:** Denormalization can lead to data inconsistency if not carefully managed.

## Alternatives Rejected
- MongoDB Atlas: Additional service to manage
- PostgreSQL (via Cloud SQL): Relational overhead not needed for document-centric data
