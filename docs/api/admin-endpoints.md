# Admin API Endpoints

**Last Updated**: 2026-06-13

## Role Hierarchy
- **`user`** — Standard user, can submit artifacts
- **`admin`** — Can list users and delete any artifact
- **`owner`** — Super admin, can manage roles, approve/deny admin requests, and change site settings

---

## `GET /api/admin/users`
List all users. Admin or owner.

**Auth**: `requireAuth` + `requireAdmin` (passes for both `admin` and `owner`)
**Response** (200):
```json
{
  "users": [
    {
      "uid": "firebase-uid-123",
      "email": "user@example.com",
      "display_name": "John Doe",
      "role": "user",
      "admin_requested": false,
      "settings": { "theme": "light", "show_name_publicly": true },
      "created_at": Timestamp,
      "updated_at": Timestamp
    }
  ]
}
```

---

## `PUT /api/admin/users/:uid/role`
Update a user's role. Owner-only. Cannot self-demote or demote another owner.

**Auth**: `requireAuth` + `requireOwner`
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
- `403` — Cannot change own role or cannot demote another owner
- `404` — User not found

---

## `DELETE /api/admin/artifacts/:id`
Delete any artifact. Admin or owner. Also deletes associated files from Cloud Storage.

**Auth**: `requireAuth` + `requireAdmin` (passes for both `admin` and `owner`)
**Response** (200):
```json
{
  "success": true,
  "deletedId": "artifact-id-123"
}
```
**Errors**:
- `404` — Artifact not found

---

## `GET /api/admin/users/requests`
List users who have requested admin privileges. Owner-only.

**Auth**: `requireAuth` + `requireOwner`
**Response** (200):
```json
{
  "requests": [
    {
      "uid": "firebase-uid-456",
      "email": "user@example.com",
      "display_name": "Jane Doe",
      "role": "user",
      "admin_requested": true,
      "created_at": Timestamp
    }
  ]
}
```

---

## `POST /api/admin/users/:uid/approve-admin`
Approve a user's admin request. Owner-only.

**Auth**: `requireAuth` + `requireOwner`
**Response** (200):
```json
{
  "success": true,
  "message": "User approved as admin.",
  "uid": "firebase-uid-456"
}
```
**Errors**:
- `400` — User has not requested admin privileges
- `404` — User not found

---

## `POST /api/admin/users/:uid/deny-admin`
Deny a user's admin request. Owner-only.

**Auth**: `requireAuth` + `requireOwner`
**Response** (200):
```json
{
  "success": true,
  "message": "Admin request denied.",
  "uid": "firebase-uid-456"
}
```
**Errors**:
- `400` — User has not requested admin privileges
- `404` — User not found

---

## `GET /api/admin/settings`
Get site settings (logo URL, site name). Owner-only.

**Auth**: `requireAuth` + `requireOwner`
**Response** (200):
```json
{
  "settings": {
    "id": "site",
    "logo_url": "https://storage.googleapis.com/...",
    "site_name": "GAD",
    "updated_at": Timestamp,
    "updated_by": "owner-uid"
  }
}
```

---

## `PUT /api/admin/settings`
Update site settings. Owner-only.

**Auth**: `requireAuth` + `requireOwner`
**Body**: `{ "site_name": "New Site Name" }`
**Response** (200):
```json
{
  "success": true,
  "settings": {
    "id": "site",
    "logo_url": null,
    "site_name": "New Site Name",
    "updated_at": Timestamp,
    "updated_by": "owner-uid"
  }
}
```

---

## `POST /api/admin/settings/logo`
Upload a site logo image. Owner-only. Accepts multipart/form-data with field name `logo`.

**Auth**: `requireAuth` + `requireOwner`
**Content-Type**: `multipart/form-data`
**Body**: `logo` (file) — PNG, JPEG, WebP, or SVG, max 2MB
**Response** (200):
```json
{
  "success": true,
  "logo_url": "https://storage.googleapis.com/..."
}
```
**Errors**:
- `400` — No file uploaded, invalid file type, or file too large
