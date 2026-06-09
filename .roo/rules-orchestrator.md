# GAD — Orchestrator Mode Rules

## Project
- **GAD (Global Archaeological Database)** — A full-stack web application for browsing, submitting, and analyzing archaeological artifacts.
- **Stack**: Next.js 16 / React 19 / Tailwind CSS v3 / shadcn/ui / TanStack Query / Zustand / Firebase Auth / Express.js / Google Cloud Run / Gemini AI / Firestore / Google Cloud Storage
- **Documentation**: Obsidian vault at `docs/` — always check docs before planning

## Architecture (FINAL — DO NOT DEVIATE)

### Backend (Express.js — DEPLOYED on Cloud Run)
- `index.js` — Entry point, Express 5, Firebase Admin init, route registration
- `src/config/` — Firebase Admin config (singleton)
- `src/middleware/` — Auth (requireAuth, requireAdmin, optionalAuth), CORS, rate limiting
- `src/controllers/` — Business logic: artifacts, auth, ai, admin
- `src/services/` — Firestore queries, Gemini AI, Cloud Storage signed URLs
- `src/routes/` — Route definitions: health, artifacts, auth, ai, admin
- **Deployed at**: `https://api.the-gad.org`

### Frontend (Next.js 16 App Router — DEPLOYED on Vercel)
- `src/app/` — Pages: home (map), artifacts (list/detail), submit, login, register, dashboard, admin
- `src/components/` — UI components: map, artifacts, auth, ai (chatbot), layout, shared, shadcn/ui
- `src/lib/` — API client, Firebase config, QueryClient, utilities
- `src/hooks/` — TanStack Query hooks for artifacts CRUD
- `src/store/` — Zustand stores: auth, ui, map
- `src/types/` — TypeScript interfaces: artifact, user, api
- **Deployed at**: `https://the-gad.org`

## Project IDs
- **Firebase Project**: `gad-454016`
- **Cloud Run Service**: `gad-backend` (us-central1)
- **Storage Bucket**: `gad-454016.firebasestorage.app`
- **Frontend Domain**: `the-gad.org` (Vercel)

## Current Status
- ✅ Backend: Fully built and deployed to Cloud Run (api.the-gad.org)
- ✅ Frontend: Fully built and deployed to Vercel (the-gad.org)
- ✅ Maps integration: Implemented with @vis.gl/react-google-maps
- ✅ Auth system: Firebase Auth with Email/Password, admin auto-assignment
- ✅ AI features: Chatbot (public), artifact analysis, find-similar
- ✅ Admin panel: User management, artifact moderation
- ✅ Dashboard: User's submitted artifacts
- ❌ Google Maps not working in production (env vars not set in Vercel)
- ❌ No test suite
- ❌ No CI/CD pipeline

## Engineering Tenets (ENFORCE THESE)
1. **Single Responsibility** — Each function does one thing. Controllers call services, services do the work.
2. **Async/Await** — No raw promises. Always use try/catch with meaningful error responses.
3. **JSDoc** — Document all public functions with JSDoc comments.
4. **Consistent Patterns** — Follow existing patterns in the codebase. Don't invent new styles.
5. **Documentation First** — Update docs when making changes. Log decisions as ADRs.

## Your Role as Orchestrator
- You delegate subtasks to specialized modes (Code, Architect, Debug, Ask).
- You do NOT write code directly.
- You do NOT plan architecture — delegate to Architect mode.
- You synthesize results and update PROJECT_STATE.md after each session.
- You ensure documentation stays in sync with code.
