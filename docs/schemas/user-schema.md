# User Schema

**Last Updated**: 2026-06-13

## Collection: `users`

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `uid` | `string` | auto | Firebase UID (used as document ID) |
| `email` | `string` | ✅ | User's email address |
| `display_name` | `string` | ❌ | User's display name (set during registration) |
| `profile_picture_url` | `string` | ❌ | URL to profile picture |
| `role` | `string` | auto | User role: `"user"`, `"admin"`, or `"owner"` (default: `"user"`) |
| `admin_requested` | `boolean` | ❌ | Whether the user has requested admin privileges |
| `approved_by` | `string` | ❌ | UID of the owner who approved admin request |
| `approved_at` | `timestamp` | ❌ | When the admin request was approved |
| `denied_by` | `string` | ❌ | UID of the owner who denied admin request |
| `denied_at` | `timestamp` | ❌ | When the admin request was denied |
| `settings` | `map` | auto | User preferences |
| `settings.show_name_publicly` | `boolean` | auto | Whether to show name on artifacts (default: `true`) |
| `settings.theme` | `string` | auto | UI theme preference (default: `"light"`) |
| `created_at` | `timestamp` | auto | Account creation timestamp |
| `updated_at` | `timestamp` | auto | Last profile update timestamp |

## Example Document
```json
{
  "uid": "firebase-uid-123",
  "email": "user@example.com",
  "display_name": "John Doe",
  "profile_picture_url": null,
  "role": "user",
  "admin_requested": false,
  "settings": {
    "show_name_publicly": true,
    "theme": "light"
  },
  "created_at": Timestamp { seconds: 1234567890, nanoseconds: 0 },
  "updated_at": Timestamp { seconds: 1234567890, nanoseconds: 0 }
}
```

## Owner Auto-Assignment
If the user's email is `globalarcheologicaldatabase@gmail.com` (or the value of `OWNER_EMAIL` env var), the `role` is automatically set to `"owner"` during registration (see [`auth.controller.js`](../../src/controllers/auth.controller.js:44)).

## Admin Request Flow
Users can request admin privileges by setting `admin_requested: true` on their profile. The owner can then:
- **Approve**: Sets `role` to `"admin"`, clears `admin_requested`, records `approved_by` and `approved_at`
- **Deny**: Clears `admin_requested`, records `denied_by` and `denied_at`

See [`admin.controller.js`](../../src/controllers/admin.controller.js:154) for the approval/denial logic.

## Updatable Fields
Via `PUT /api/auth/profile`:
- `display_name`
- `settings.theme`
- `settings.show_name_publicly`

Role changes are only allowed via `PUT /api/admin/users/:uid/role` (owner-only endpoint).
