# Auth API Endpoints

**Last Updated**: 2026-06-09

## `POST /api/auth/register`
Register a new user profile after Firebase Auth client-side registration.

**Auth**: Public (no token required)
**Body**: `{ displayName: "string" }`
**Response** (201): `{ message: "User registered", uid, email }`
**Errors**:
- `409` — User already registered

---

## `GET /api/auth/profile`
Get the authenticated user's profile.

**Auth**: `requireAuth`
**Response**: `{ user: UserProfile }`
**Errors**:
- `404` — User profile not found

---

## `PUT /api/auth/profile`
Update the authenticated user's profile.

**Auth**: `requireAuth`
**Body**: `{ display_name?, profile_picture_url?, settings?: { theme?, show_name_publicly? } }`
**Response**: `{ message: "Profile updated", user: UserProfile }`
**Errors**:
- `400` — No updatable fields provided
- `404` — User not found
