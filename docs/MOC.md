# GAD — Map of Content

→ [[../PROJECT_STATE|PROJECT_STATE]] (current session state)

## Features
- [[features/authentication/overview|Authentication]]
- [[features/artifacts/overview|Artifacts CRUD]]
- [[features/ai-features/chatbot|AI Chatbot]]
- [[features/maps-integration/overview|Maps Integration]]

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

## Production
- **Frontend:** [the-gad.org](https://the-gad.org)
- **Backend API:** [api.the-gad.org](https://api.the-gad.org)

```dataview
TABLE status, updated AS "Last Updated"
FROM "features"
SORT status ASC
```
