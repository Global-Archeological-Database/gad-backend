---
status: done
priority: high
---

# Maps Integration — Overview

**Status**: `done` ✅
**Last Updated**: 2026-06-09

## Overview
Interactive map explorer for browsing archaeological artifacts geographically. Uses `@vis.gl/react-google-maps` (Google Maps JavaScript API via React wrapper).

## Implementation

### Frontend: `MapExplorer.tsx`
- Full-viewport Google Map with custom map style (desaturated, water #a0c4d8, landscape #f5f0e8)
- `APIProvider` from `@vis.gl/react-google-maps` wrapping the entire component
- `ArtifactMarker` components for each artifact with custom markers
- `ArtifactInfoWindow` on selected marker
- `ArtifactDetailPanel` slide-in panel for selected artifact details
- FAB button (authenticated → opens submit form sheet, unauthenticated → redirects to /login)
- Search bar (placeholder — not yet functional)
- Default center: `{ lat: 20, lng: 0 }`, zoom: 3

### State Management
- `mapStore.ts` (Zustand): `selectedArtifactId`, `mapCenter`, `mapZoom`, `isDetailPanelOpen`

### Data Flow
1. Page loads → `useArtifacts()` hook fetches all artifacts from `GET /api/artifacts`
2. Artifacts rendered as markers on map
3. Click marker → sets `selectedArtifactId` → opens info window + detail panel
4. Detail panel shows full artifact info with `StaticMap` component

## Acceptance Criteria
- [x] Map loads with Google Maps API
- [x] Artifact markers displayed on map
- [x] Click marker shows info window
- [x] Detail panel slides in on selection
- [x] Submit button for authenticated users
- [x] Custom map styling
- [ ] Search bar functional (placeholder only)

## Environment Variables
- `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` — Google Maps API key
- `NEXT_PUBLIC_GOOGLE_MAPS_MAP_ID` — Google Maps Map ID

## Known Issues
- Search bar is a non-functional placeholder — needs implementation.

## Files
- `src/components/map/MapExplorer.tsx` — Main map component
- `src/components/map/ArtifactMarker.tsx` — Custom marker component
- `src/components/map/ArtifactInfoWindow.tsx` — Info window on marker click
- `src/components/artifacts/ArtifactDetailPanel.tsx` — Detail slide-in panel
- `src/components/artifacts/StaticMap.tsx` — Static map in detail panel
- `src/store/mapStore.ts` — Zustand store for map state
