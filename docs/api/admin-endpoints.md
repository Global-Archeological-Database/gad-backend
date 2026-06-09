# Admin API Endpoints

**Last Updated**: 2026-06-09

## `GET /api/admin/users`
List all users. Admin-only.

**Auth**: `requireAuth` + `requireAdmin`
**Response**: `{ users: UserProfile[] }`

---

## `PUT /api/admin/users/:uid/role`
Update a user's role. Admin-only. Cannot self-demote.

**Auth**: `requireAuth` + `requireAdmin`
**Body**: `{ role: "user" | "admin" }`
**Response**: `{ message: "User role updated", uid, role }`
**Errors**:
- `400` — Invalid role
- `403` — Cannot change own role
- `404` — User not found

---

## `DELETE /api/admin/artifacts/:id`
Delete any artifact. Admin-only. Also logs storage paths for cleanup.

**Auth**: `requireAuth` + `requireAdmin`
**Response**: `{ message: "Artifact deleted by admin", id }`
**Errors**:
- `404` — Artifact not found
