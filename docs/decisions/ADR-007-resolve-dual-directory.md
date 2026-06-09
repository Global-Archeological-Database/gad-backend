# ADR-007: Resolve Dual-Directory Ambiguity

## Status
✅ Accepted

## Context

The GAD backend has a **dual-directory problem**: application code exists in two separate locations on the developer's machine.

| Directory | Path | Purpose |
|-----------|------|---------|
| **Workspace** | `~/gad-backend/` | VS Code workspace root — primary development location |
| **Firebase deployment** | `~/projects/gad-backend/` | Directory created for Firebase deployment via `firebase init` |

This duplication creates ambiguity about which directory is the canonical source of truth, introduces risk of drift between the two copies, and makes deployment configuration confusing.

---

## Current State

### Directory 1: Workspace (`~/gad-backend/`)

This is the VS Code workspace root and the active development directory. It contains:

**Application code:**
- `index.js` — Express entry point
- `src/` — Full application source (config, controllers, middleware, routes, services)
- `package.json` — Dependencies including `jest` as devDependency

**CI/CD and deployment:**
- `Dockerfile` — Multi-stage Docker build for Cloud Run
- `.github/workflows/ci-backend.yml` — CI workflow (install + test on push/PR)
- `.github/workflows/deploy-backend.yml` — CD workflow (build Docker → push to Artifact Registry → deploy to Cloud Run)

**Testing infrastructure:**
- `jest.config.js` — Jest configuration
- `src/config/__mocks__/` — Firebase mock for testing
- `src/services/__tests__/` — Service-level tests (41 total)
- `src/middleware/__tests__/` — Middleware tests

**Documentation and configuration:**
- `docs/` — Full Obsidian vault (MOC, ADRs, features, APIs, schemas, sprints, error catalog)
- `PROJECT_STATE.md` — Session tracking and known issues
- `.roo/` — Roo Code mode rules (architect, code, orchestrator)
- `.clinerules` — Roo Code project rules
- `.env` / `.env.example` — Environment configuration
- `.gad-service-account.json` — Service account key (gitignored)

### Directory 2: Firebase Deployment (`~/projects/gad-backend/`)

This directory was created by running `firebase init` in a separate location and copying application code into it. It contains:

**Application code (identical copies):**
- `index.js` — Identical to workspace version
- `src/` — All source files, byte-identical to workspace counterparts (verified by comparing `firebase.config.js`, `ai.controller.js`, `artifacts.controller.js`, `auth.middleware.js`)

**Firebase configuration (UNIQUE to this directory):**
- `firebase.json` — Firebase project configuration (Firestore, App Hosting, Storage, Emulators, Auth)
- `.firebaserc` — Project alias (`default: global-archaeological-database`)
- `apphosting.yaml` — Firebase App Hosting config (runtime: nodejs20, Cloud Run settings, secrets)
- `apphosting.emulator.yaml` — Local emulator env vars

**Firebase resource files (UNIQUE to this directory):**
- `firestore.rules` — Firestore security rules with function-based access control
- `firestore.indexes.json` — 6 composite indexes for `artifacts` collection
- `storage.rules` — Cloud Storage security rules

**Firebase agent tooling (UNIQUE to this directory):**
- `.agents/` — Firebase agent skills content (GenKit, Firestore, Hosting, etc.)
- `skills-lock.json` — Agent skills manifest (14 skills)

**Missing from this directory (compared to workspace):**
- ❌ No `Dockerfile`
- ❌ No `.github/workflows/` — No CI/CD configuration
- ❌ No test infrastructure (no `jest.config.js`, no `__tests__/` dirs)
- ❌ No `docs/` directory — No documentation
- ❌ No `.roo/` — No Roo Code mode rules
- ❌ No `PROJECT_STATE.md`

**Differences in `package.json`:**
- Firebase directory has `"test": "echo \"Error: no test specified\" && exit 1"` (no Jest)
- Workspace has `"test": "jest --passWithNoTests"` (Jest configured)

---

## Identified Problems

### 1. Source of Truth Ambiguity

There is no clear indication which directory a developer should work from. The VS Code workspace is `~/gad-backend`, but the Firebase deployment configuration lives in `~/projects/gad-backend`. A developer could inadvertently make changes in the wrong directory.

### 2. Drift Risk

Currently, all source files are identical between the two directories. However, any future development in the workspace will NOT be reflected in the Firebase directory. If someone later runs `firebase deploy` from the Firebase directory without first copying code, they would deploy a stale version.

### 3. Deployment Strategy Conflict

Two deployment mechanisms exist:

| Mechanism | Location | Method |
|-----------|----------|--------|
| **Cloud Run (GitHub Actions)** | `~/gad-backend/.github/workflows/deploy-backend.yml` | `docker build` → Artifact Registry → Cloud Run |
| **Firebase App Hosting** | `~/projects/gad-backend/firebase.json` + `apphosting.yaml` | `firebase deploy` (uses App Hosting → Cloud Run) |

Both ultimately deploy to Cloud Run, but:
- The GitHub Actions workflow is automated, triggered on push to `main`
- Firebase App Hosting requires manual `firebase deploy` from the separate directory
- Firebase App Hosting is designed for server-rendered web apps (like Next.js), not pure API backends like this Express app

### 4. Developer Friction

A developer must:
- Remember which directory to work from
- Manually sync code between directories after making changes
- Navigate between two separate directory trees for different tasks

### 5. CI/CD Pipeline Exclusion

The Firebase directory has no CI/CD pipeline. If deployment were done from this directory, there would be:
- No automated testing before deployment
- No automated build process
- No container image management

---

## Decision

### Recommendation: Consolidate on `~/gad-backend` as the Single Source of Truth

1. **Primary directory**: `~/gad-backend` — this is where all development happens, where the CI/CD pipeline operates, and where the VS Code workspace is rooted.

2. **Firebase deployment directory**: Stop using `~/projects/gad-backend` for deployment purposes. The directory can be archived or removed after migration.

3. **Deployment strategy**: Use **direct Cloud Run deployment** via GitHub Actions (Docker → Artifact Registry → Cloud Run). This is already configured, automated, and aligned with ADR-004 ("Express App Hosting — Cloud Run").

4. **Firebase resource files**: Bring Firebase configuration and resource files into the workspace so they are version-controlled alongside the code:
   - `firebase.json` — Firebase project configuration
   - `.firebaserc` — Firebase project alias
   - `firestore.rules` — Firestore security rules
   - `firestore.indexes.json` — Firestore composite indexes
   - `storage.rules` — Cloud Storage security rules

5. **App Hosting files**: Keep `apphosting.yaml` and `apphosting.emulator.yaml` in the workspace for local emulation. These don't conflict with the Cloud Run deployment — they're useful for running the Firebase emulator suite locally. However, the primary deployment path remains the GitHub Actions → Cloud Run pipeline.

6. **Firebase agent skills**: The `.agents/` and `skills-lock.json` files are Firebase CLI tooling artifacts. They can be excluded from the workspace (added to `.gitignore`) since they're not needed for backend development or deployment.

---

## Consequences

### Positive
- ✅ Single source of truth — no ambiguity about where to develop
- ✅ All Firebase configuration is version-controlled alongside application code
- ✅ CI/CD pipeline runs automated tests and deploys consistently
- ✅ No manual code copying between directories
- ✅ Developer can use `firebase deploy --only firestore:rules,firestore:indexes,storage` directly from the workspace to update Firebase resources when needed
- ✅ Firebase emulator suite works from the workspace for local testing

### Negative
- ❌ Initial migration effort to bring Firebase files into the workspace
- ❌ Need to update `.gitignore` for Firebase agent artifacts
- ❌ Historical record of dual-directory approach is lost when Firebase directory is removed

### Risks
- ⚠️ If `firebase deploy` is run from the workspace without the Firebase directory, the deploy context changes — but this is mitigated by having `firebase.json` and `.firebaserc` in the workspace root
- ⚠️ The `apphosting.yaml` references Cloud Run settings that could conflict with the Docker-based Cloud Run deployment — but in practice, the App Hosting config is only used when deploying via `firebase deploy`, which won't be the primary path

---

## Migration Plan

### Step 1: Copy Firebase Resource Files into Workspace

Copy the following files from `~/projects/gad-backend/` to `~/gad-backend/`:

```
cp ~/projects/gad-backend/firebase.json ~/gad-backend/
cp ~/projects/gad-backend/.firebaserc ~/gad-backend/
cp ~/projects/gad-backend/firestore.rules ~/gad-backend/
cp ~/projects/gad-backend/firestore.indexes.json ~/gad-backend/
cp ~/projects/gad-backend/storage.rules ~/gad-backend/
cp ~/projects/gad-backend/apphosting.yaml ~/gad-backend/
cp ~/projects/gad-backend/apphosting.emulator.yaml ~/gad-backend/
```

### Step 2: Update `.gitignore`

Add Firebase agent artifacts to `.gitignore`:

```gitignore
# Firebase agent skills (CLI tooling, not project code)
.agents/
skills-lock.json

# Firebase debug logs
firebase-debug.log*
```

### Step 3: Verify Everything Works from the Workspace

1. Run `firebase deploy --only firestore:rules,firestore:indexes,storage` from `~/gad-backend/` to verify Firebase CLI can deploy resources
2. Run `npm test` to confirm tests still pass
3. Run `node index.js` locally to confirm the server starts

### Step 4: Archive/Remove the Firebase Directory

After confirming everything works from the workspace:

```bash
# Option A: Archive (safe — keeps a backup)
mv ~/projects/gad-backend ~/projects/gad-backend-archived

# Option B: Remove (clean — no trace)
rm -rf ~/projects/gad-backend
```

### Step 5: Update Documentation

1. Update `PROJECT_STATE.md` — remove known issue #1 (dual-directory ambiguity)
2. Update `docs/sprints/YYYY-MM-DD.md` with migration log
3. Update `docs/references/useful-commands.md` if it references the Firebase directory path

### Step 6: Update `.roo/rules-orchestrator.md` (if needed)

Ensure any mode rules that reference the Firebase directory are updated to point to the workspace.

---

## Related

- [ADR-004: Express App Hosting — Cloud Run](ADR-004-express-app-hosting.md) — Original decision to deploy on Cloud Run
- [CI/CD Workflow — Backend Deploy](../../.github/workflows/deploy-backend.yml) — Cloud Run deployment via GitHub Actions
- [Dockerfile](../../Dockerfile) — Docker build for Cloud Run
- [PROJECT_STATE.md](../../PROJECT_STATE.md) — Known issue #1 documents this problem
- [Firebase Configuration](../../firebase.json) — Will be moved to workspace root

---

## Decision Log

| Date | Decision | By |
|------|----------|----|
| 2026-06-09 | Consolidate dual directories into `~/gad-backend` as single source of truth | Architect |
| 2026-06-09 | Primary deployment: GitHub Actions → Docker → Cloud Run | Architect |
| 2026-06-09 | Firebase config files tracked in workspace for resource management | Architect |
