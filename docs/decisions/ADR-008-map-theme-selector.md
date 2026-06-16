# ADR-008: Map Theme Selector as Floating UI Control

**Status:** ✅ Accepted  
**Date:** 2026-06-16  
**Context:** Map UI/UX overhaul — Correction L session

## Decision

The map theme selector is implemented as a **floating UI control** (bottom-left overlay) rather than a shadcn Select component or a dropdown in the map toolbar.

## Rationale

1. **Map UX Priority** — Theme switching is a map-specific action that should feel native to the map interface, not like a form control. A floating overlay with visual theme previews (icon + label) is more intuitive for map users.
2. **Screen Real Estate** — The map is full-viewport; traditional dropdowns or Select components would compete with the map toolbar and search bar. A compact floating control with backdrop blur sits unobtrusively in the corner.
3. **Outside-click Dismissal** — The menu closes on outside click, which is standard map interaction behavior (clicking the map dismisses overlays).
4. **Auto Dark Mode Sync** — The selector auto-switches to Dark theme when the app's `resolvedTheme` changes to dark, ensuring consistency with the app-level theme toggle.

## Implementation

- **Location:** [`src/components/map/MapExplorer.tsx`]
- **Themes:** Streets (custom style), Terrain (`mapTypeId`), Satellite (`mapTypeId`), Dark (custom style)
- **Position:** Bottom-left, `z-10`, `mb-20` (above attribution)
- **Styling:** `bg-background/80 backdrop-blur-md`, `rounded-xl`, `shadow-warm-lg`
- **Trigger:** Button with `MapIcon` showing current theme label
- **Menu:** 4 theme options with radio-style active indicator, closes on outside click

## Consequences

- **Positive:** Cleaner map UI, intuitive theme switching, dark mode sync works automatically
- **Positive:** No dependency on shadcn Select or additional UI components
- **Neutral:** Custom implementation requires ~80 lines of component code vs. a library dropdown
- **Negative:** Not accessible via keyboard navigation in the same way as a native `<select>` — must ensure proper ARIA roles

## Related

- [`docs/features/maps-integration/overview.md`](docs/features/maps-integration/overview.md)
- [`PROJECT_STATE.md`](PROJECT_STATE.md)
