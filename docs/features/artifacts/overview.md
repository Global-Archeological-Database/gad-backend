---
tags: [feature, done]
status: complete
type: feature
created: 2026-05-26
updated: 2026-06-02
related: [maps-integration]
---

# Artifacts CRUD

## Purpose
Allows users to browse, create, edit, and delete archaeological artifact records with metadata, images, and geolocation.

## Acceptance Criteria
- [x] Backend CRUD API with Firestore persistence
- [x] Frontend TanStack Query hooks for data fetching and mutations
- [x] Map explorer with artifact markers visible on the map
- [x] InfoWindow on marker click showing artifact summary
- [x] Detail panel sliding in from the right with full metadata
- [x] Gallery page (`/artifacts`) with responsive grid, filters (country, condition, type), and TanStack Query
- [x] Detail page (`/artifacts/[id]`) with SSR, `generateMetadata`, JSON-LD structured data, static map, tags, condition badges
- [x] Loading skeletons for both gallery and detail pages
- [x] Submission form with 3-step sheet (Location → Details → Media), map location picker, file upload with progress

## Implementation Notes
- Backend: Express.js controllers in `src/controllers/artifacts.controller.js`
- Frontend hooks: `src/hooks/useArtifacts.ts` — `useArtifacts()`, `useArtifact()`, `useCreateArtifact()`, `useUpdateArtifact()`, `useDeleteArtifact()`
- Map explorer implemented. Markers visible. Detail panel slides in.
- Gallery page (`src/app/artifacts/page.tsx`) — client component with TanStack Query, filter bar, ArtifactGrid
- Detail page (`src/app/artifacts/[id]/page.tsx`) — server component with `generateMetadata`, `fetch()` with `next: { revalidate: 120 }`
- Static map rendered via `StaticMap` client component to avoid server component event handler restrictions
- Firestore timestamps (`{_seconds, _nanoseconds}`) handled in `formatDate` and JSON-LD serialization
- **Submission form** (`src/components/artifacts/ArtifactSubmitForm.tsx`): 3-step sheet form opened via `isSubmitFormOpen` in `uiStore`. Step 1 uses `LocationPicker` (Google Maps click + reverse geocoding). Step 2 uses React Hook Form + Zod v4 for title, description, cultural_origin, age, condition, materials, tags. Step 3 uses `ImageUploader` for image and 3D model upload with XHR progress tracking. Submit flow: `create` → upload files via signed URL → `update` with URLs → invalidate queries → navigate to new artifact.
- **TagInput** (`src/components/shared/TagInput.tsx`): Reusable chip input for materials and tags fields.
- **LocationPicker** (`src/components/shared/LocationPicker.tsx`): Google Maps `AdvancedMarker` click handler with `google.maps.Geocoder` reverse geocoding, debounced coordinate inputs.
- **ImageUploader** (`src/components/shared/ImageUploader.tsx`): Drag-and-drop zone, file validation (50MB max, image/model types), XHR upload with progress bar, auto-upload when `artifactId` becomes available.
- FAB button on map opens the submission form via `setIsSubmitFormOpen(true)`.
- `/submit` route protected by `AuthGuard` — opens form on mount.

## API Endpoints
- [[../../api/artifacts-endpoints|Artifacts API]]

## Open Questions
