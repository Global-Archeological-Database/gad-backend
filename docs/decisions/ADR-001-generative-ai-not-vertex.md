---
tags: [decision, accepted]
status: accepted
type: adr
date: 2026-05-26
---

# ADR-001: Use Generative AI SDK (not Vertex AI)

## Context
The backend needs generative AI capabilities for chatbot, artifact analysis, and find-similar features. Two options exist: Google Generative AI SDK (direct Gemini API) and Vertex AI (GCP-managed).

## Decision
Use the `@google/generative-ai` SDK directly. Vertex AI adds unnecessary complexity for the current scale and introduces additional GCP service dependencies.

## Consequences
**Positive:** Simpler setup, fewer GCP services to manage, faster prototyping.
**Negative:** Less integration with GCP IAM and monitoring; if scale demands Vertex AI later, migration will be needed.
**Risks:** API key management must be handled securely.

## Alternatives Rejected
- Vertex AI: Too much overhead for current stage
- OpenAI API: Vendor lock-in concern; Gemini chosen for GCP alignment
