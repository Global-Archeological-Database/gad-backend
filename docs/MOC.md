# GAD — Map of Content

→ [[../PROJECT_STATE|PROJECT_STATE]] (current session state)

## Features
- [[features/authentication/overview|Authentication]]
- [[features/artifacts/overview|Artifacts CRUD]]
- [[features/ai-features/chatbot|AI Chatbot]]
- [[features/maps-integration/overview|Maps Integration]] — Map Explorer, markers, theme selector

## DevOps
- [[../.github/workflows/ci-backend|Backend CI Workflow]]
- [[../.github/workflows/deploy-backend|Backend CD Workflow (Cloud Run)]]
- [[../../../../../projects/gad-frontend/.github/workflows/ci-frontend|Frontend CI Workflow]]
- [[../Dockerfile|Backend Dockerfile]]

## UI / Frontend
- [[../../../projects/gad-frontend/PROJECT_STATE.md|Header & Navigation]] — Scroll-aware header, responsive nav, auth-aware UI (Prompt 02)

## Reference
- [[api/artifacts-endpoints|Artifacts API]]
- [[schemas/artifact-schema|Artifact Schema]]
- [[errors/error-catalog|Error Catalog]]

## Architecture Decisions
- [[decisions/ADR-001-generative-ai-not-vertex|ADR-001: Generative AI SDK (not Vertex)]]
- [[decisions/ADR-002-firestore-schema-v1|ADR-002: Firestore Schema v1]]
- [[decisions/ADR-003-storage-bucket|ADR-003: Cloud Storage]]
- [[decisions/ADR-004-express-app-hosting|ADR-004: Express on Cloud Run]]
- [[decisions/ADR-005-firestore-security-rules-v1|ADR-005: Security Rules v1]]
- [[decisions/ADR-006-chatbot-public-access|ADR-006: Chatbot Public Access]]
- [[decisions/ADR-007-resolve-dual-directory|ADR-007: Dual-Directory Consolidation]]
- [[decisions/ADR-008-map-theme-selector|ADR-008: Map Theme Selector]]

## Production
- **Frontend:** [the-gad.org](https://the-gad.org)
- **Backend API:** [api.the-gad.org](https://api.the-gad.org)

```dataview
TABLE status, updated AS "Last Updated"
FROM "features"
SORT status ASC
```
