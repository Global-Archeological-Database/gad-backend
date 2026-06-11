# Auth API Endpoints

**Last Updated**: 2026-06-10

## `POST /api/auth/register`
Register a new user profile after Firebase Auth client-side registration.

**Auth**: Public (no token required — `uid` and `email` sent in request body after Firebase client-side auth)
**Body**: `{ uid: "string", email: "string", displayName?: "string" }`
**Response** (201):
```json
{
  "uid": "firebase-uid-123",
  "email": "user@example.com",
  "display_name": "John Doe",
  "role": "user",
  "settings": { "theme": "light", "show_name_publicly": true },
  "created_at": Timestamp,
  "updated_at": Timestamp
}
```
**Errors**:
- `400` — Missing `uid` or `email` in request body
- `409` — User already registered

---

## `GET /api/auth/profile`
Get the authenticated user's profile.

**Auth**: `requireAuth`
**Response** (200):
```json
{
  "uid": "firebase-uid-123",
  "email": "user@example.com",
  "display_name": "John Doe",
  "role": "user",
  "settings": { "theme": "light", "show_name_publicly": true },
  "created_at": Timestamp,
  "updated_at": Timestamp
}
```
**Errors**:
- `404` — User profile not found

---

## `PUT /api/auth/profile`
Update the authenticated user's profile.

**Auth**: `requireAuth`
**Body**: `{ display_name?, profile_picture_url?, settings?: { theme?, show_name_publicly? } }`
**Response** (200):
```json
{
  "uid": "firebase-uid-123",
  "email": "user@example.com",
  "display_name": "Updated Name",
  "role": "user",
  "settings": { "theme": "dark", "show_name_publicly": false },
  "created_at": Timestamp,
  "updated_at": Timestamp
}
```
**Errors**:
- `400` — No updatable fields provided
- `404` — User not found
