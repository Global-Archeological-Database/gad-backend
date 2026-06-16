---
tags: [feature, done]
status: done
type: feature
created: 2026-05-26
updated: 2026-06-13
related:
  - ../../api/admin-endpoints
  - ../../api/auth-endpoints
  - ../../schemas/user-schema
---

# Admin Panel

## Purpose
Provides administrators with user management (role assignment) and artifact moderation (delete any artifact). Also provides users with a personal dashboard showing their own artifacts, profile settings, and account statistics.

The **owner** (super admin) has additional capabilities: approving/denying admin requests, uploading a site logo, and changing site settings.

## Role Hierarchy
| Role | Capabilities |
|------|-------------|
| `user` | Submit artifacts, view own dashboard |
| `admin` | List all users, delete any artifact |
| `owner` | All admin capabilities + manage roles, approve/deny admin requests, change site settings (logo, site name) |

## Acceptance Criteria
- [x] Dashboard shows the logged-in user's artifacts with Edit and Delete overlays
- [x] Delete on dashboard removes the artifact with confirmation dialog
- [x] Admin page shows all users with role management (Select dropdown)
- [x] Admin can delete any artifact with confirmation dialog
- [x] Non-admin navigating to /admin is redirected to /
- [x] Profile settings form with display_name and show_name_publicly toggle
- [x] Account stats: total artifacts, artifacts with AI analysis
- [x] Owner can upload a site logo (PNG/JPEG/WebP/SVG, max 2MB)
- [x] Owner can change the site name
- [x] Owner can approve/deny admin requests from users
- [x] Owner role is shown with a crown icon in the users table
- [x] Role management Select is disabled for non-owner users

## Implementation Notes
- Dashboard at `/dashboard` wrapped in `AuthGuard` (requireAdmin: false)
- Admin panel at `/admin` wrapped in `AuthGuard` (requireAdmin: true) — passes for both `admin` and `owner`
- Both pages are `'use client'` components using TanStack Query for data fetching
- Delete operations use shadcn `AlertDialog` for confirmation
- Edit opens the existing `ArtifactSubmitForm` via Sheet (reused component)
- Profile settings use `authApi.updateProfile()` with `settings.show_name_publicly`
- Admin role management uses `adminApi.updateRole()` — self-role-change disabled, owner-only
- Admin artifact deletion uses `adminApi.deleteArtifact()`
- Client-side role check is a convenience UI only; all admin API calls are verified server-side
- Owner-only tabs (Settings, Requests) are conditionally rendered based on `currentUser?.role === 'owner'`
- Logo upload uses multer with memoryStorage, stored in Cloud Storage at `admin/logo/{timestamp}_{filename}`
- Site settings are stored in Firestore collection `admin_settings` with document id `'site'`
- Admin requests use the `admin_requested` boolean field on user documents

## Files
- `src/app/dashboard/page.tsx` — User dashboard
- `src/app/admin/page.tsx` — Admin panel with Users, All Artifacts, Requests (owner), and Settings (owner) tabs
- `src/components/ui/alert-dialog.tsx` — AlertDialog component (created)
- `src/components/ui/switch.tsx` — Switch component (created)
- `src/controllers/admin-settings.controller.js` — Settings CRUD and logo upload logic
- `src/routes/admin-settings.routes.js` — Settings API routes

## API Endpoints
- [[../../api/admin-endpoints|Admin Endpoints]]
- [[../../api/auth-endpoints|Auth Endpoints]]
- [[../../schemas/user-schema|User Schema]]
