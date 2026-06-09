---
tags: [feature, done]
status: done
type: feature
created: 2026-05-26
updated: 2026-06-03
related:
  - ../../api/admin-endpoints
  - ../../api/auth-endpoints
---

# Admin Panel

## Purpose
Provides administrators with user management (role assignment) and artifact moderation (delete any artifact). Also provides users with a personal dashboard showing their own artifacts, profile settings, and account statistics.

## Acceptance Criteria
- [x] Dashboard shows the logged-in user's artifacts with Edit and Delete overlays
- [x] Delete on dashboard removes the artifact with confirmation dialog
- [x] Admin page shows all users with role management (Select dropdown)
- [x] Admin can delete any artifact with confirmation dialog
- [x] Non-admin navigating to /admin is redirected to /
- [x] Profile settings form with display_name and show_name_publicly toggle
- [x] Account stats: total artifacts, artifacts with AI analysis

## Implementation Notes
- Dashboard at `/dashboard` wrapped in `AuthGuard` (requireAdmin: false)
- Admin panel at `/admin` wrapped in `AuthGuard` (requireAdmin: true)
- Both pages are `'use client'` components using TanStack Query for data fetching
- Delete operations use shadcn `AlertDialog` for confirmation
- Edit opens the existing `ArtifactSubmitForm` via Sheet (reused component)
- Profile settings use `authApi.updateProfile()` with `settings.show_name_publicly`
- Admin role management uses `adminApi.updateRole()` — self-role-change disabled
- Admin artifact deletion uses `adminApi.deleteArtifact()`
- Client-side role check is a convenience UI only; all admin API calls are verified server-side

## Files
- `src/app/dashboard/page.tsx` — User dashboard
- `src/app/admin/page.tsx` — Admin panel with Users and All Artifacts tabs
- `src/components/ui/alert-dialog.tsx` — AlertDialog component (created)
- `src/components/ui/switch.tsx` — Switch component (created)

## API Endpoints
- [[../../api/admin-endpoints|Admin Endpoints]]
- [[../../api/auth-endpoints|Auth Endpoints]]
