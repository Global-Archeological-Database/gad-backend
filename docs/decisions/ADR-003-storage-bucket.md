---
tags: [decision, accepted]
status: accepted
type: adr
date: 2026-05-26
---

# ADR-003: Cloud Storage for Artifact Files

## Context
Artifacts may include file attachments (images, PDFs, etc.) that need durable, scalable storage.

## Decision
Use Google Cloud Storage buckets for file storage. Firestore stores only metadata and the storage path reference.

## Consequences
**Positive:** Cost-effective, scalable, CDN-ready via Cloud CDN or signed URLs.
**Negative:** Additional latency for file retrieval; signed URL generation adds complexity.
**Risks:** Public bucket exposure if IAM misconfigured.

## Alternatives Rejected
- Firestore (direct base64 storage): Bad for performance and cost at scale
- Local filesystem: Not viable for serverless deployment
