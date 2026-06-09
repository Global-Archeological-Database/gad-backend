# User Schema

**Last Updated**: 2026-06-09

## Collection: `users`

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `uid` | `string` | auto | Firebase UID (used as document ID) |
| `email` | `string` | ✅ | User's email address |
| `display_name` | `string` | ❌ | User's display name (set during registration) |
| `profile_picture_url` | `string` | ❌ | URL to profile picture |
| `role` | `string` | auto | User role: `"user"` or `"admin"` (default: `"user"`) |
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
  "settings": {
    "show_name_publicly": true,
    "theme": "light"
  },
  "created_at": Timestamp { seconds: 1234567890, nanoseconds: 0 },
  "updated_at": Timestamp { seconds: 1234567890, nanoseconds: 0 }
}
```

## Admin Auto-Assignment
If the user's email is `aahwaanithsinharoy@gmail.com`, the `role` is automatically set to `"admin"` during registration (see `auth.controller.js`).

## Updatable Fields
Via `PUT /api/auth/profile`:
- `display_name`
- `settings.theme`
- `settings.show_name_publicly`

Role changes are only allowed via `PUT /api/admin/users/:uid/role` (admin-only endpoint).
