# Error Catalog

**Last Updated**: 2026-06-09

A living catalog of errors encountered during development, their root causes, fixes applied, and any residual concerns.

---

## Error: Google Maps Not Loading in Production (FALSE ALARM)

- **Status**: Resolved — was never broken
- **First Seen**: 2026-06-06 (reported as issue)
- **Resolved**: 2026-06-09 (verified working)
- **Root Cause**: **False alarm.** The map was rendering correctly all along. The issue was reported during initial deployment testing but was likely caused by:
  - A temporary Vercel deployment that hadn't fully propagated
  - Or a browser cache issue on the tester's machine
  - Or the env vars were added to Vercel *after* the initial deploy, and a subsequent deploy (triggered by later commits) picked them up
- **Verification**: User confirmed on 2026-06-09 that the map renders correctly at https://the-gad.org with markers, InfoWindows, and full interactivity. No console errors.
- **Related**: `docs/features/maps-integration/overview.md`

---

## Error: `age.toLowerCase` on null/undefined in ArtifactMarker

- **Status**: Fixed
- **First Seen**: 2026-06-03
- **Root Cause**: `age` field can be `null` or `undefined` in Firestore, but `ArtifactMarker.tsx` called `age.toLowerCase()` without null check
- **Fix Applied**: Added optional chaining: `age?.toLowerCase()`
- **Files**: `src/components/map/ArtifactMarker.tsx`

---

## Error: Auth Register Requires Auth

- **Status**: Fixed
- **First Seen**: 2026-06-03
- **Root Cause**: `POST /api/auth/register` was behind `requireAuth` middleware, but registration happens after Firebase client-side auth — the Firebase ID token should be sufficient
- **Fix Applied**: Removed `requireAuth` from register route
- **Files**: `src/routes/auth.routes.js`

---

## Error: Auth Login Route Not Found

- **Status**: Fixed
- **First Seen**: 2026-06-03
- **Root Cause**: No login endpoint exists — login is handled entirely client-side via Firebase Auth
- **Fix Applied**: N/A (by design — login is client-side only)
- **Note**: This is not an error, but was initially confusing. The frontend uses `signInWithEmailAndPassword` directly.

---

## Error: Chatbot Requires Auth

- **Status**: Fixed
- **First Seen**: 2026-06-03
- **Root Cause**: Chatbot endpoint used `requireAuth` middleware, preventing unauthenticated users from using the chatbot
- **Fix Applied**: Changed to `optionalAuth` middleware — authenticated users get personalized responses, unauthenticated users can still chat
- **ADR**: ADR-006-chatbot-public-access
- **Files**: `src/routes/ai.routes.js`, `src/middleware/auth.middleware.js`

---

## Error: Missing Security Headers

- **Status**: Fixed
- **First Seen**: 2026-06-06
- **Root Cause**: Next.js config lacked security headers (CSP, XFO, XCTO, etc.)
- **Fix Applied**: Added `async headers()` to `next.config.ts` with comprehensive security headers
- **Files**: `next.config.ts`

---

## Error: Orphaned Providers.tsx Component

- **Status**: Unresolved
- **First Seen**: 2026-06-09
- **Root Cause**: `src/components/layout/Providers.tsx` exists but is not imported anywhere. It has its own `onAuthStateChanged` listener and imports from `@/lib/queryClient` (which doesn't exist — `queryClient` is in `lib/queryClient.ts`). The actual layout uses `src/lib/providers.tsx` instead.
- **Fix Applied**: None yet — needs to be deleted
- **Files**: `src/components/layout/Providers.tsx`

---

## Error: Stale Orchestrator Rules

- **Status**: Unresolved
- **First Seen**: 2026-06-09
- **Root Cause**: `.roo/rules-orchestrator.md` contains outdated information claiming the backend needs restructuring and no frontend exists
- **Fix Applied**: None yet — needs content update
- **Files**: `.roo/rules-orchestrator.md`

---

## Error: Schema Docs Don't Match Actual Schema

- **Status**: Unresolved
- **First Seen**: 2026-06-09
- **Root Cause**: Schema documentation was written during initial planning and never updated to reflect actual Firestore schema
- **Fix Applied**: Documentation updated in 2026-06-09 audit session
- **Files**: `docs/schemas/artifact-schema.md`, `docs/schemas/user-schema.md`, `docs/schemas/indexes.md`

---

## Error: `getFieldKey()` Uses Unreliable Object Key Ordering

- **Status**: Unresolved
- **First Seen**: 2026-06-09
- **Root Cause**: `gemini.service.js` uses `Object.keys(artifact)[index]` to map indices back to field names, which depends on JavaScript object key ordering — this is fragile and may produce incorrect results
- **Fix Applied**: None yet — needs explicit field mapping
- **Files**: `src/services/gemini.service.js`

---

## Error: Jest Manual Mock Resolution for Nested Modules

- **Status**: Resolved
- **First Seen**: 2026-06-09
- **Root Cause**: Jest's manual mock resolution requires the mock file to be in a `__mocks__` directory adjacent to the module being mocked. For `jest.mock('../../config/firebase.config')` called from `src/services/__tests__/`, the mock must be at `src/config/__mocks__/firebase.config.js`, not `src/__mocks__/firebase.config.js`.
- **Fix Applied**: Moved mock to `src/config/__mocks__/firebase.config.js` and deleted `src/__mocks__/firebase.config.js` to avoid duplicate warning.
- **Files**: `src/config/__mocks__/firebase.config.js`

---

## Error: Firestore Fluent API Chaining in Tests

- **Status**: Resolved
- **First Seen**: 2026-06-09
- **Root Cause**: Firestore's query builder uses fluent API chaining: `db.collection('artifacts').orderBy('__name__').where(...).limit(n).get()`. Each chain method must return the same query object for subsequent calls. Initial mock returned new objects per method, breaking the chain.
- **Fix Applied**: Created a single `mockQuery` object and made all chain methods (`mockWhere`, `mockOrderBy`, `mockLimit`, `mockStartAfter`, `mockDoc`) return `mockQuery`.
- **Files**: `src/config/__mocks__/firebase.config.js`

---

## Error: `express-rate-limit` v8 Middleware Config Exposure

- **Status**: Resolved
- **First Seen**: 2026-06-09
- **Root Cause**: `express-rate-limit` v8 returns middleware functions, not config objects. Properties like `windowMs`, `max`, `standardHeaders` are not exposed on the returned middleware, so tests couldn't assert config values.
- **Fix Applied**: Mocked `express-rate-limit` module itself with `jest.mock()`, creating a factory function that returns middleware functions with attached config properties for test assertions.
- **Files**: `src/middleware/__tests__/rateLimit.middleware.test.js`

---

## Error: `useMutation` Passes Context as Second Argument

- **Status**: Resolved
- **First Seen**: 2026-06-09
- **Root Cause**: TanStack Query's `useMutation` passes a mutation context object (`{ client, meta, mutationKey }`) as the second argument to the mutation function. The test assertion `toHaveBeenCalledWith(payload)` failed because the actual call was `mutationFn(payload, { client, meta, mutationKey })`.
- **Fix Applied**: Changed assertion to `toHaveBeenCalledWith(payload, expect.any(Object))`.
- **Files**: `src/hooks/__tests__/useArtifacts.test.tsx`
