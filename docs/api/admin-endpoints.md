# Admin API Endpoints

**Last Updated**: 2026-06-10

## `GET /api/admin/users`
List all users. Admin-only.

**Auth**: `requireAuth` + `requireAdmin`
**Response** (200):
```json
{
  "users": [
    {
      "uid": "firebase-uid-123",
      "email": "user@example.com",
      "display_name": "John Doe",
      "role": "user",
      "settings": { "theme": "light", "show_name_publicly": true },
      "created_at": Timestamp,
      "updated_at": Timestamp
    }
  ]
}
```

---

## `PUT /api/admin/users/:uid/role`
Update a user's role. Admin-only. Cannot self-demote.

**Auth**: `requireAuth` + `requireAdmin`
**Body**: `{ role: "user" | "admin" }`
**Response** (200):
```json
{
  "uid": "firebase-uid-123",
  "email": "user@example.com",
  "display_name": "John Doe",
  "role": "admin",
  "settings": { "theme": "light", "show_name_publicly": true },
  "created_at": Timestamp,
  "updated_at": Timestamp
}
```
**Errors**:
- `400` — Invalid role (must be "user" or "admin")
- `403` — Cannot change own role
- `404` — User not found

---

## `DELETE /api/admin/artifacts/:id`
Delete any artifact. Admin-only. Also deletes associated files from Cloud Storage.

**Auth**: `requireAuth` + `requireAdmin`
**Response** (200):
```json
{
  "success": true,
  "deletedId": "artifact-id-123"
}
```
**Errors**:
- `404` — Artifact not found
