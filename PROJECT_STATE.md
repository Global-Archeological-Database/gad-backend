# GAD — Project State

> **Single source of truth for current session state and project progress.**
> Last updated: 2026-06-09 (Session 3: Dual-Directory Consolidation)

---

## Project Overview

**GAD (Global Archaeological Database)** is a full-stack application that provides:
- Artifact CRUD management
- AI-powered chatbot, artifact analysis, and similarity search
- Maps integration with interactive map explorer
- Admin panel
- User authentication and authorization

**Stack:** Next.js 16 / React 19 / Tailwind CSS v3 / shadcn/ui / TanStack Query / Zustand / Firebase / Express.js / Google Cloud Run / Gemini AI

---

## Current Session

| Item | Status |
|------|--------|
| Project scaffolding | ✅ Complete |
| Obsidian vault structure | ✅ Complete |
| ADRs | ✅ Created (ADR-001 through ADR-007) |
| Feature documentation | ✅ Updated (2026-06-09 audit) |
| API documentation | ✅ Updated (2026-06-09 audit) |
| Schema documentation | ✅ Updated (2026-06-09 audit) |
| Firebase configuration | ✅ Complete (project ID, emulators, storage, auth, App Hosting) |
| Backend Express server | ✅ **Deployed to production** |
| Firestore security rules | ✅ **Deployed with function-based access control** |
| Firestore indexes | ✅ **6 composite indexes deployed** |
| App Hosting configuration | ✅ **Configured with secrets and runtime settings** |
| Frontend Vercel deployment | ✅ **Production at https://the-gad.org** |
| Production verification | ✅ **All 3 curl tests passing** |
| **Map Explorer page** | ✅ **Full-viewport map with markers, InfoWindow, detail panel, search** |
| Auth pages (Login/Register) | ✅ Complete |
| **Artifact Gallery page** | ✅ **Responsive grid with filters, TanStack Query, skeleton loading** |
| **Artifact Detail page** | ✅ **SSR with generateMetadata, JSON-LD, static map, condition badges** |
| **Artifact Submission Form** | ✅ **Multi-step sheet with location picker, file upload, progress bars** |
| **Auth state sync** | ✅ **Firebase onAuthStateChanged → Zustand store via AuthProvider** |
| **Header navigation** | ✅ **Submit Artifact, Login, Register buttons all linked; logout functional** |
| **FAB button visibility** | ✅ **Visible to all users; redirects to /login if unauthenticated** |
| **Dashboard page** | ✅ **User dashboard with artifacts, profile settings, account stats** |
| **Admin panel** | ✅ **User management (role assignment) and artifact moderation** |
| **Production bug fixes** | ✅ **6 issues fixed from production test report** |
| **Full codebase audit** | ✅ **2026-06-09: All docs, source, and config audited; 15 issues identified** |
| **Documentation overhaul** | ✅ **All stale docs updated; new docs created; TODO lists in sprint log** |
| **Map search** | ✅ **Debounced search wired to backend `?q=` API with loading/empty states** |
| **Test suite (backend)** | ✅ **Jest configured; 41 tests across 4 files (gemini, firestore, storage, rateLimit)** |
| **Test suite (frontend)** | ✅ **Vitest configured; 26 tests across 4 files (authStore, mapStore, uiStore, useArtifacts)** |

---

## Completed Implementation

### Backend (12 files)
- `src/services/firestore.service.js` — Firestore query builder with pagination and filters
- `src/services/storage.service.js` — Signed upload URL generation
- `src/services/gemini.service.js` — Gemini AI integration (chat, analyze, find-similar)
- `src/controllers/artifacts.controller.js` — CRUD + upload URL generation
- `src/controllers/auth.controller.js` — Register, get/update profile
- `src/controllers/ai.controller.js` — Chatbot, analysis, similarity search
- `src/controllers/admin.controller.js` — User management, admin operations
- `src/routes/health.routes.js`, `artifacts.routes.js`, `auth.routes.js`, `ai.routes.js`, `admin.routes.js`

### Frontend — Artifact Gallery & Detail Pages (6 new files)
- `src/components/artifacts/ArtifactCard.tsx` — Card with aspect-square image, 3D/condition badges, hover effects, Link to detail
- `src/components/artifacts/ArtifactGrid.tsx` — Responsive grid (1/2/3/4 cols), 12 skeleton cards when loading, empty state
- `src/components/artifacts/StaticMap.tsx` — Client component wrapping `<img>` with `onError` fallback for server component compatibility
- `src/app/artifacts/page.tsx` — Client page with TanStack Query, filter bar (country text, condition select, type toggle), ArtifactGrid
- `src/app/artifacts/[id]/page.tsx` — Server component with `generateMetadata`, `fetch()` + `revalidate: 120`, two-column layout, JSON-LD structured data
- `src/app/artifacts/[id]/loading.tsx` — Skeleton layout matching detail page structure

### Frontend — Map Explorer (6 new files)
- `src/hooks/useArtifacts.ts` — TanStack Query hooks with query key factory (`artifactKeys`)
- `src/components/map/ArtifactMarker.tsx` — Google Maps AdvancedMarker with color-coded pins by artifact age
- `src/components/map/ArtifactInfoWindow.tsx` — InfoWindow showing artifact summary with thumbnail
- `src/components/artifacts/ArtifactDetailPanel.tsx` — Sliding panel (480px) with full metadata, AI sections
- `src/components/map/MapExplorer.tsx` — Main map component with APIProvider, search bar, FAB, detail panel
- `src/app/page.tsx` — Server component wrapper rendering MapExplorer

### Frontend — Auth System (6 new files)
- `src/components/auth/AuthProvider.tsx` — Firebase `onAuthStateChanged` listener that syncs auth state to Zustand store, fetches user profile from backend
- `src/components/auth/LoginForm.tsx` — React Hook Form + Zod login form with Firebase `signInWithEmailAndPassword`, immediate store update on success
- `src/components/auth/RegisterForm.tsx` — React Hook Form + Zod registration form with password validation, Firebase `createUserWithEmailAndPassword`, and `authApi.register()` for Firestore document creation
- `src/components/auth/AuthGuard.tsx` — Route guard component that redirects unauthenticated users to `/login` and non-admin users from admin routes to `/`
- `src/app/login/page.tsx` — Centered card layout with GAD branding, links to register and forgot password
- `src/app/register/page.tsx` — Centered card layout with GAD branding, link to login

### Frontend — Artifact Submission Form (5 new files)
- `src/components/shared/TagInput.tsx` — Chip input with warm palette colors, Enter/comma to add, X to remove, maxTags support
- `src/components/shared/LocationPicker.tsx` — Google Maps click-to-locate with reverse geocoding, debounced coordinate inputs
- `src/components/shared/ImageUploader.tsx` — Drag-and-drop zone, file validation, XHR upload with progress tracking, auto-upload when artifactId becomes available
- `src/components/artifacts/ArtifactSubmitForm.tsx` — 3-step sheet form (Location → Details → Media) with Zod validation, create → upload → update flow
- `src/app/submit/page.tsx` — AuthGuard wrapper that opens the submit form on mount

### Key Features
- **Age-based marker colors**: Before 500 CE (#B8860B), 500-1500 CE (#722F37), 1500-1900 CE (#2D5A27), After 1900 CE (#4A6FA5), Unknown (#888780)
- **Custom map style**: Desaturated 20%, water #a0c4d8, landscape #f5f0e8, roads simplified, POIs hidden
- **Detail panel**: Framer Motion slide-in animation, full-size image, all metadata fields, AI Analysis and Find Similar sections (conditional on auth)
- **Floating search bar**: Pill-shaped, elevated shadow, top-center of map
- **FAB button**: "+" button bottom-right, visible to all users — opens submission form if authenticated, redirects to `/login` if not
- **Submission form**: 3-step sheet (Location → Details → Media) with map picker, React Hook Form + Zod v4 validation, drag-and-drop file upload with progress bars, signed URL upload flow, toast notifications via sonner
- **Auth state sync**: Firebase `onAuthStateChanged` listener in `AuthProvider` keeps Zustand store in sync; Header, FAB, and AuthGuard reactively update
- **AI Chatbot**: Floating widget (bottom-right FAB) with Sheet-based UI, message history, typing indicator, works for both authenticated and anonymous users

---

## Next Planned Task

**Search functionality in MapExplorer** — ✅ Complete (2026-06-09).

See [`docs/sprints/2026-06-09.md`](docs/sprints/2026-06-09.md) for the full prioritized TODO list.

**Immediate next steps:**
1. **P1**: Remove orphaned `components/layout/Providers.tsx`
2. **P2**: Fix `getFieldKey()` bug in `gemini.service.js`
3. **P3**: ~~Set up CI/CD pipeline (GitHub Actions)~~ ✅ **Complete (2026-06-09)**

---

## Active Decisions
- ADR-001: Using `@google/generative-ai` SDK (not Vertex AI)
- ADR-002: Firestore schema v1 with denormalized collections
- ADR-003: Google Cloud Storage for artifact files
- ADR-004: Express app on Cloud Run
- ADR-005: Firestore Security Rules v1 with function-based access control
- ADR-006: AI Chatbot public access with `optionalAuth`
- ADR-007: Consolidate on `~/gad-backend` as single source of truth; Firebase resource files tracked in workspace, Firebase agent artifacts gitignored

---

## Known Issues
1. ~~**Dual-directory ambiguity:** VS Code workspace is `~/gad-backend` but Firebase project root is `~/projects/gad-backend`. App code was copied to Firebase project root for deployment. Consider consolidating to a single directory.~~ ✅ **Resolved 2026-06-09 — consolidated to `~/gad-backend` as single source of truth. See ADR-007.**
2. **Stale orchestrator rule:** ~~`.roo/rules-orchestrator.md` states "Backend Express server exists but needs restructuring" — this is false.~~ ✅ **Fixed in 2026-06-09 audit session.**
3. **Local dev credentials:** `GOOGLE_APPLICATION_CREDENTIALS` must point to `.gad-service-account.json` for local Firestore/Auth access.
4. **Java not installed:** Firebase emulators require Java. Install Java or use production project for local testing.
5. ~~**Google Maps not rendering in production:**~~ ✅ **Resolved — was a false alarm. Map renders correctly on the-gad.org. Verified 2026-06-09.**
6. **Orphaned Providers file:** `@/components/layout/Providers.tsx` has an `onAuthStateChanged` listener but is not imported anywhere — the layout uses `@/lib/providers.tsx` instead. Consider removing or repurposing.
7. ~~**Search bar non-functional:** The search bar in `MapExplorer.tsx` is a placeholder with no search logic.~~ ✅ **Resolved 2026-06-09 — wired to backend `?q=` search with debouncing, loading/empty states.**
8. **`getFieldKey()` bug in gemini.service.js:** Uses `Object.keys(artifact)[index]` which is fragile and depends on unreliable JS object key ordering.
9. ~~**No test suite:** `npm test` just echoes "Error: no test specified".~~ ✅ **Resolved 2026-06-09 — Jest (backend) and Vitest (frontend) test suites added. 41 backend tests + 26 frontend tests all passing.**
10. ~~**No CI/CD pipeline:** No GitHub Actions or Cloud Build configuration.~~ ✅ **Resolved 2026-06-09 — CI/CD workflows created for both packages.**
11. **Backend .env contains real API keys:** Security concern if committed to git.

---

## Session History
| Date | Summary |
|------|---------|
| 2026-05-26 | Project initialized. Obsidian vault structure created. ADRs written. |
| 2026-05-30 | Full backend audit completed. Dual-directory setup discovered. |
| 2026-05-30 | **All backend routes, controllers, and services implemented (12 files).** |
| 2026-05-30 | **Backend secured and deployed to production.** |
| 2026-06-02 | **Frontend Phase 6 setup complete. Tailwind v4→v3 downgrade, shadcn/ui initialized.** |
| 2026-06-02 | **Frontend foundation complete. Header renders.** |
| 2026-06-02 | **Map Explorer page complete. Markers, InfoWindow, detail panel implemented.** |
| 2026-06-02 | **Auth pages complete and tested. User can register and login. AuthGuard implemented.** |
| 2026-06-02 | **Artifact submission form complete with location picker and file upload.** |
| 2026-06-03 | **Auth state sync, header navigation, and FAB visibility fixed.** |
| 2026-06-03 | **Full codebase audit: 6 integration bugs fixed, zero compilation errors.** |
| 2026-06-06 | **Frontend deployed to Vercel at https://the-gad.org** |
| 2026-06-06 | **Production bug fixes: 6 issues fixed from production test report** |
| 2026-06-09 | **Full codebase audit & documentation overhaul: 15 issues identified, all stale docs updated** |
| 2026-06-09 | **Map search implemented: debounced search wired to backend `?q=` API with loading/empty states** |
| 2026-06-09 | **Test suite added: Jest (backend, 41 tests) + Vitest (frontend, 26 tests) — all passing** |
| 2026-06-09 | **CI/CD pipeline created: Dockerfile, CI workflows (both repos), CD workflow (Cloud Run)** |
| 2026-06-09 | **Dual-directory consolidation: Firebase resource files copied to workspace, `.gitignore` updated, Firebase directory archived, ADR-007 created** |

## Session: 2026-06-09 — Full Codebase Audit & Documentation Overhaul
- **Duration**: 1 session
- **Focus**: Comprehensive audit of all features, UI, UX, documentation, and configuration
- **Scope**: All backend source (12 files), all frontend source (~30 files), all Obsidian docs (26+ files), config files, rules files
- **Issues Identified (15 total)**:
  - ~~**CRITICAL**: Google Maps not working in production (env vars confirmed present in Vercel — root cause unknown)~~ ✅ **Resolved 2026-06-09 — false alarm, map works fine**
  - **HIGH**: Stale orchestrator rules file (✅ fixed this session)
  - **HIGH**: 3 stale feature docs (maps-integration, analyzer, find-similar — all said "todo" but implemented)
  - **HIGH**: Schema docs don't match actual Firestore schema (✅ fixed this session)
  - **HIGH**: API docs missing endpoints (✅ fixed this session)
  - **MEDIUM**: Orphaned Providers.tsx file
  - **MEDIUM**: AI Chatbot UI exists but no feature doc (✅ created this session)
  - **MEDIUM**: 2 placeholder docs (artifacts/api.md, artifacts/schema.md — ✅ fixed this session)
  - **MEDIUM**: Error catalog is sparse (✅ expanded this session)
  - **LOW**: No test suite
  - **LOW**: No CI/CD pipeline
  - **LOW**: Search bar non-functional
  - **LOW**: Backend .env contains real API keys
  - **LOW**: `getFieldKey()` bug in gemini.service.js
  - **LOW**: Dual-directory ambiguity
- **Documentation Updated**:
  - `docs/sprints/2026-06-09.md` (created — full audit log + prioritized TODO list)
  - `docs/features/maps-integration/overview.md` (status → done, added implementation details)
  - `docs/features/ai-features/analyzer.md` (status → done, added implementation details)
  - `docs/features/ai-features/find-similar.md` (status → done, added implementation details)
  - `docs/schemas/artifact-schema.md` (complete rewrite with all actual fields)
  - `docs/schemas/user-schema.md` (complete rewrite with all actual fields)
  - `docs/schemas/indexes.md` (updated from 3 to 6 indexes)
  - `docs/api/admin-endpoints.md` (added missing endpoints)
  - `docs/api/ai-endpoints.md` (fixed auth requirement for chatbot)
  - `docs/api/auth-endpoints.md` (added missing endpoints)
  - `docs/features/artifacts/api.md` (replaced placeholder with real content)
  - `docs/features/artifacts/schema.md` (replaced placeholder with real content)
  - `docs/features/ai-features/chatbot-ui.md` (created — frontend chatbot widget doc)
  - `docs/errors/error-catalog.md` (expanded with all known issues)
  - `.roo/rules-orchestrator.md` (complete rewrite to reflect actual project state)
  - `PROJECT_STATE.md` (this file — updated session entry, known issues, next steps)
  - **Pending Investigation**: ~~Google Maps not rendering in production — env vars confirmed present in Vercel, root cause unknown~~ ✅ **Resolved — false alarm, map renders correctly**

## Session: 2026-06-09 — Test Suite Implementation
- **Duration**: 1 session
- **Focus**: Add Jest (backend) and Vitest (frontend) test suites with comprehensive test coverage
- **Backend (Jest, 41 tests)**:
 - Installed `jest` as dev dependency
 - Created `jest.config.js` with `testEnvironment: 'node'`, `clearMocks: true`, `restoreMocks: true`
 - Created manual mock at `src/config/__mocks__/firebase.config.js` — mocks firebase-admin, Firestore (chainable query builder), Storage (signed URLs), and Gemini AI model
 - **`src/services/__tests__/gemini.service.test.js`** (8 tests) — `chat()` with history/null/empty/errors, `analyzeArtifact()` with full/minimal artifacts, `findSimilarArtifacts()` with candidates/empty/errors
 - **`src/services/__tests__/firestore.service.test.js`** (14 tests) — `getDb()`, `queryArtifacts()` with default params, country/culturalOrigin/condition/is3d/uploaderId filters, cursor pagination, non-existent cursor, limit capping (500 max, 1 min), lastDoc detection, Firestore errors
 - **`src/services/__tests__/storage.service.test.js`** (4 tests) — `generateSignedUploadUrl()` returns correct shape, handles different file types, propagates errors, generates ~15min expiry
 - **`src/middleware/__tests__/rateLimit.middleware.test.js`** (15 tests) — generalLimiter (100/15min, /health skip), aiLimiter (20/hour), uploadLimiter (20/day), standardHeaders/legacyHeaders, JSON error handler (429), keyGenerator
- **Frontend (Vitest, 26 tests)**:
 - Installed `vitest`, `@testing-library/react`, `@testing-library/jest-dom`, `@testing-library/user-event`, `jsdom`
 - Created `vitest.config.ts` with jsdom environment, globals, path alias for `@/`
 - Created `src/__tests__/setup.ts` importing `@testing-library/jest-dom/vitest`
 - Created `src/__tests__/test-utils.tsx` — `createTestQueryClient()` and `renderWithProviders()` utilities
 - **`src/store/__tests__/authStore.test.ts`** (6 tests) — default state, setUser, setUser(null), setLoading, setInitialized, partial state preservation
 - **`src/store/__tests__/mapStore.test.ts`** (7 tests) — default state, setSelectedArtifactId, clear selection, setMapCenter, setMapZoom, setIsDetailPanelOpen, partial state preservation
 - **`src/store/__tests__/uiStore.test.ts`** (4 tests) — default state, setIsChatOpen, setIsSubmitFormOpen, partial state preservation
 - **`src/hooks/__tests__/useArtifacts.test.tsx`** (9 tests) — `useArtifacts()` with/without filters, error handling; `useArtifact()` by id, null id (disabled), error handling; `useCreateArtifact()` with query invalidation; `useUpdateArtifact()` with cache update + invalidation; `useDeleteArtifact()` with cache removal + invalidation
- **Key challenges resolved**:
 - Firestore fluent API chaining (`.collection().orderBy().where().limit().get()`) required a single `mockQuery` object returned by all chain methods
 - `express-rate-limit` v8 returns middleware functions, not config objects — mocked the module itself
 - `useMutation` passes a second argument (mutation context) to the mutation function — fixed assertion with `expect.any(Object)`
- **Verified**: `npm test` passes for both packages — 41 backend tests + 26 frontend tests, all green
- **Updated**: `PROJECT_STATE.md` — resolved known issue #9 (no test suite), updated next steps
- **Pending Investigation**: ~~Google Maps not rendering in production — env vars confirmed present in Vercel, root cause unknown~~ ✅ **Resolved — false alarm, map renders correctly**

## Session: 2026-06-06 — Production Bug Fixes
- **Duration**: 1 session
- **Focus**: Fix 6 issues found in comprehensive production test report
- **Issues Fixed**:
  - **Issue 2 (HIGH)**: Removed `requireAuth` from `POST /api/auth/register` — registration now public
  - **Issue 3 (CRITICAL)**: Updated auth endpoints documentation — login is client-side Firebase Auth (no backend endpoint)
  - **Issue 4 (MEDIUM)**: Changed chatbot from `requireAuth` to `optionalAuth` — public access with rate limiting
  - **Issue 6 (MEDIUM)**: Added security headers (CSP, XFO, XCTO, Referrer-Policy, Permissions-Policy) to `next.config.ts` — build verified
  - **Issue 1 (HIGH)**: Documented that Google Maps env vars need to be in Vercel (later confirmed they were already present — root cause is elsewhere)
- **Skipped**:
  - **Issue 5 (MEDIUM)**: Artifacts SSR refactor (shows "0 artifacts" in SSR) — deferred to future. The artifacts gallery page is a client component that fetches data via TanStack Query. A server-component wrapper would be needed for SSR data fetching.
- **Verified**:
  - Backend: `node -c` syntax checks passed on all modified files
  - Frontend: `npm run build` succeeded with zero errors, all 9 routes generated
- **Pending Investigation**: ~~Google Maps not rendering in production — env vars confirmed present in Vercel, root cause unknown~~ ✅ **Resolved — false alarm, map renders correctly**

## Session: 2026-06-02 — Map Explorer Implementation
- **Duration**: 1 session
- **Focus**: Build the Map Explorer home page — the primary interface of the entire application
- **Completed**:
  - Installed `@vis.gl/react-google-maps`, `@types/google.maps`, `framer-motion`
  - Created `src/hooks/useArtifacts.ts` — 5 TanStack Query hooks with query key factory
  - Created `src/components/map/ArtifactMarker.tsx` — AdvancedMarker with age-based color coding
  - Created `src/components/map/ArtifactInfoWindow.tsx` — InfoWindow with thumbnail and action buttons
  - Created `src/components/artifacts/ArtifactDetailPanel.tsx` — Framer Motion sliding panel with full metadata
  - Created `src/components/map/MapExplorer.tsx` — Full-viewport map with search bar, FAB, detail panel
  - Updated `src/app/page.tsx` — Server component wrapper with metadata
  - Added `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` to `.env.local`
  - Updated Obsidian docs: artifacts overview and PROJECT_STATE.md
  - Verified: zero TypeScript errors, dev server compiles successfully
- **Next**: Auth pages (Login/Register)

## Session: 2026-06-02 — Auth System Implementation
- **Duration**: 1 session
- **Focus**: Build the authentication system — login page, register page, and AuthGuard component
- **Completed**:
  - Created `src/components/auth/LoginForm.tsx` — React Hook Form + Zod login form with Firebase auth
  - Created `src/components/auth/RegisterForm.tsx` — React Hook Form + Zod registration form with password confirmation, Firebase auth, and backend registration API call
  - Created `src/components/auth/AuthGuard.tsx` — Route guard with loading state, redirect logic, and admin check
  - Created `src/app/login/page.tsx` — Centered card layout with GAD branding
  - Created `src/app/register/page.tsx` — Centered card layout with GAD branding
  - Installed `react-hook-form`, `@hookform/resolvers` dependencies
  - Used `standardSchemaResolver` for Zod v4 compatibility
  - Updated Obsidian docs: authentication implementation and PROJECT_STATE.md
- **Next**: Artifact gallery page

## Session: 2026-06-02 — Artifact Submission Form Implementation
- **Duration**: 1 session
- **Focus**: Build the artifact submission form — the most complex UI component in the project
- **Completed**:
  - Created `src/components/shared/TagInput.tsx` — Chip input with warm palette colors, Enter/comma to add, X to remove, maxTags support
  - Created `src/components/shared/LocationPicker.tsx` — Google Maps click-to-locate with reverse geocoding, debounced coordinate inputs, read-only location fields
  - Created `src/components/shared/ImageUploader.tsx` — Drag-and-drop zone, file validation (50MB, image/model types), XHR upload with progress tracking, auto-upload when artifactId becomes available
  - Created `src/components/artifacts/ArtifactSubmitForm.tsx` — 3-step sheet form (Location → Details → Media) with custom step indicator, React Hook Form + Zod v4 validation, create → upload → update flow, toast notifications
  - Created `src/app/submit/page.tsx` — AuthGuard wrapper that opens the submit form on mount
  - Modified `src/components/map/MapExplorer.tsx` — Wired FAB button to `setIsSubmitFormOpen(true)`, added `<ArtifactSubmitForm />` component
  - Modified `src/app/layout.tsx` — Added `<Toaster>` from sonner for toast notifications
  - Installed `sonner` dependency
  - Fixed TypeScript issues: `CreateArtifactPayload` type alignment (removed `uploader_id`/`uploader_email`, added `uploader_name: null`), `@base-ui/react` Select `onValueChange` signature
  - Verified: zero TypeScript errors, build compiles successfully
- **Next**: Dashboard + Admin Panel

## Session: 2026-06-03 — Dashboard & Admin Panel Implementation
- **Duration**: 1 session
- **Focus**: Build the user dashboard and admin panel with full CRUD capabilities
- **Completed**:
  - Created `src/components/ui/alert-dialog.tsx` — shadcn AlertDialog component using `@base-ui/react/dialog`
  - Created `src/components/ui/switch.tsx` — shadcn Switch component using `@base-ui/react/switch`
  - Updated `src/lib/api.ts` — Extended `authApi.updateProfile` to accept `settings` payload
  - Created `src/app/dashboard/page.tsx` — User dashboard with:
    - Welcome heading with user's display_name
    - "My Artifacts" section with Edit (pencil) and Delete (trash) overlay buttons on hover
    - Edit button opens ArtifactSubmitForm via Sheet (reused component)
    - Delete button shows AlertDialog confirmation before calling `artifactsApi.delete(id)`
    - Profile Settings section with display_name text input and show_name_publicly Switch toggle
    - Account stats cards: total artifacts, with AI analysis, pending analysis
  - Created `src/app/admin/page.tsx` — Admin panel with:
    - Two tabs (Users + All Artifacts) using shadcn Tabs
    - Users tab: HTML table with email, display_name, role badge, created_at, role Select dropdown
    - Role dropdown disabled for the logged-in user (self-role-change prevention)
    - All Artifacts tab: ArtifactGrid-style cards with red Delete overlay
    - Delete shows AlertDialog, calls `adminApi.deleteArtifact(id)`
    - Total artifact count displayed above the grid
  - Updated `docs/features/admin-panel/overview.md` — status → done, added acceptance criteria and implementation notes
  - Updated `PROJECT_STATE.md` — added dashboard/admin to completed items, updated next task to AI chatbot UI
- **Verified**: Both pages compile with zero TypeScript errors
- **Next**: AI Chatbot UI

## Session: 2026-06-03 — Auth State Sync & Navigation Fixes
- **Duration**: 1 session
- **Focus**: Fix two critical UX issues — auth state not propagating to UI, and missing buttons for artifact submission
- **Completed**:
  - Created `src/components/auth/AuthProvider.tsx` — Firebase `onAuthStateChanged` listener that syncs auth state to Zustand store, fetches user profile from backend API, handles initialization lifecycle
  - Added `AuthProvider` to root layout wrapping Header and page content
  - Fixed `LoginForm.tsx` — now calls `setUser()` immediately after successful sign-in so the UI updates before redirect
  - Fixed `Header.tsx` — "Submit Artifact" button now links to `/submit` (AuthGuard-protected); "Register" button now links to `/register`; added logout handler via `signOut()`; Dashboard and Admin dropdown items use `router.push()`; removed unsupported `asChild` prop for `@base-ui/react` compatibility
  - Fixed `MapExplorer.tsx` — FAB button now visible to all users; authenticated users open the submission form, unauthenticated users are redirected to `/login`; added `title` tooltip
  - Verified: zero TypeScript errors, dev server compiles successfully
- **Next**: Dashboard + Admin Panel

## Session: 2026-06-03 — Full Codebase Audit & Integration Bug Fixes
- **Duration**: 1 session
- **Focus**: Read all documentation and source code, verify everything works correctly, fix integration bugs
- **Completed**:
  - Read all Obsidian docs (MOC, ADRs, feature docs, API docs, schemas, sprint logs, error catalog)
  - Read all 12 backend source files (config, services, controllers, routes, middleware, index.js)
  - Read all ~30 frontend source files (pages, components, stores, hooks, types, API client, utils, CSS)
  - **Fixed 6 integration bugs**:
    1. **HTTP Method Mismatch** — Frontend used `PATCH` for 3 endpoints, backend uses `PUT`. Fixed in `src/lib/api.ts`.
    2. **Wrong AI Chat Endpoint** — Frontend called `/api/ai/chat`, backend route is `/api/ai/chatbot`. Fixed in `src/lib/api.ts`.
    3. **Missing HTTP Method on `findSimilar`** — Frontend used default `GET`, backend expects `POST`. Fixed in `src/lib/api.ts`.
    4. **Artifact Creation Would Fail** — Backend `validateCreateInput` requires top-level `latitude`/`longitude`, but frontend only sent them inside `location.coordinates`. Fixed in `ArtifactSubmitForm.tsx`.
    5. **Artifact Schema Mismatch** — Backend stores `latitude`/`longitude`/`country` at top level in Firestore, but frontend `Artifact` type only had them inside `location`. Added optional top-level fields to type; updated 5 components with fallback logic.
    6. **Missing `uploader_name` in Backend** — Frontend sends `uploader_name` in payload, but backend `createArtifact` didn't include it in Firestore document. Fixed in `artifacts.controller.js`.
  - **Verified no duplicate UI elements**: Each button, map, and settings panel appears exactly once
  - **Verified no duplicate auth listeners at runtime**: `@/components/layout/Providers.tsx` is orphaned/unused
  - **Verified backend compiles**: All 12 source files pass `node -c` syntax check
  - **Verified frontend compiles**: Next.js production build succeeds with zero TypeScript errors, all 10 routes generated
  - Updated `docs/sprints/2026-06-03.md` with session log
  - Updated `PROJECT_STATE.md` with session entry and known issue
- **Next**: AI Chatbot UI

## Session: 2026-06-06 — Frontend Production Deployment
- **Duration**: 1 session
- **Focus**: Deploy frontend to Vercel and verify production
- **Completed**:
  - Pre-deployment checks passed (build, TypeScript, .gitignore, API URL verified)
  - Git initialized and pushed to GitHub (Global-Archeological-Database/gad-frontend)
  - Auto-deployed via Vercel GitHub integration
  - Production deployment triggered with `vercel --prod`
  - Production verification: homepage, login, gallery, artifact detail SSR, backend health — all ✅
  - Firebase Auth authorized domains confirmed
- **URLs**: Frontend https://the-gad.org | Backend https://api.the-gad.org

## Session: 2026-06-09 — CI/CD Pipeline Setup
- **Duration**: 1 session
- **Focus**: Create CI/CD configuration files for both backend and frontend packages
- **Files Created**:
  - **Backend** (`/Users/aahwaanithsinharoy/gad-backend/`):
    - [`Dockerfile`](Dockerfile) — Multi-stage build using `node:22-alpine`, installs deps with `npm ci`, runs as non-root `gad` user, exposes port 8080
    - [`.github/workflows/ci-backend.yml`](.github/workflows/ci-backend.yml) — CI workflow: `npm ci` → `npm test` on push/PR to `main`
    - [`.github/workflows/deploy-backend.yml`](.github/workflows/deploy-backend.yml) — CD workflow: build Docker image → push to Artifact Registry → deploy to Cloud Run on push to `main`
  - **Frontend** (`/Users/aahwaanithsinharoy/projects/gad-frontend/`):
    - [`.github/workflows/ci-frontend.yml`](.github/workflows/ci-frontend.yml) — CI workflow: `npm ci` → `npm run build` → `npm test` on push/PR to `main`
- **Key Decisions**:
  - Backend CD uses GitHub Actions with `google-github-actions/deploy-cloudrun` (not Cloud Build), keeping all config in one place
  - Secrets are referenced via GitHub Secrets (`${{ secrets.GCP_SERVICE_ACCOUNT_KEY }}`) — no hardcoded credentials
  - Frontend CD is handled by Vercel's native GitHub integration (already connected); no additional workflow needed
  - Artifact Registry chosen over Container Registry (GCR is deprecated)
- **Required GitHub Secrets** (backend repo):
  - `GCP_PROJECT_ID` — Google Cloud project ID
  - `GCP_SERVICE_ACCOUNT_KEY` — JSON key for a service account with Artifact Registry Writer, Cloud Run Admin, and Service Account User roles
  - `GEMINI_API_KEY` — Gemini API key (stored in Secret Manager, referenced at deploy time)
  - `GOOGLE_APPLICATION_CREDENTIALS` — Service account key for Firestore access (stored in Secret Manager)
- **Required GitHub Secrets** (frontend repo):
  - `NEXT_PUBLIC_API_URL` — Backend API URL (`https://api.the-gad.org`)
- **Pending**: User needs to add the secrets above to each GitHub repo's Settings → Secrets and variables → Actions
