---
tags: [decision, accepted]
status: accepted
type: adr
date: 2026-05-26
---

# ADR-004: Express App Hosting — Cloud Run

## Context
The backend is an Express.js application that needs to be deployed in a scalable, cost-effective manner.

## Decision
Deploy the Express app on Google Cloud Run. It provides automatic scaling, pay-per-use pricing, and supports containerized Node.js applications natively.

## Consequences
**Positive:** Auto-scaling to zero when idle, no server management, supports custom domains.
**Negative:** Cold start latency on idle-to-active transitions. 60-minute request timeout (Cloud Run limit).
**Risks:** Container cold starts may affect real-time features.

## Alternatives Rejected
- App Engine Flexible: Less flexible, fewer configuration options
- Cloud Functions: Request size and timeout limits too restrictive for artifact operations
- Kubernetes (GKE): Overkill for a single Express service
