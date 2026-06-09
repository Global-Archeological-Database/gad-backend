# Authentication — Implementation Notes

## Auth Strategy
Uses Firebase Authentication with ID tokens. Tokens are verified server-side using `firebase-admin` SDK. User roles are stored in Firestore at `users/{uid}.role`.

## Middleware

| Function | Description |
|----------|-------------|
| `requireAuth` | Verifies Firebase ID token from `Authorization: Bearer` header. Attaches `{uid, email, role}` to `req.user`. Returns 401 JSON on failure. |
| `requireAdmin` | Checks `req.user.role === 'admin'`. Must be used after `requireAuth`. Returns 403 JSON if not admin. |
| `optionalAuth` | Same as `requireAuth` but if no token is present, sets `req.user = null` and calls `next()`. |

**Auth middleware implemented with requireAuth, requireAdmin, optionalAuth** — see [`src/middleware/auth.middleware.js`](../../../src/middleware/auth.middleware.js).

## Security Considerations
_Token expiry, refresh flows, rate limiting, etc._

## Frontend Implementation
Frontend auth store, Firebase client, Providers component implemented.

### Auth Pages (Login & Register)
- **Login page** (`src/app/login/page.tsx`): Centered card layout with warm off-white background (#FDFAF5), dark goldenrod (#B8860B) GAD branding. Uses `LoginForm` component with email/password validation via React Hook Form + Zod. Calls Firebase `signInWithEmailAndPassword` on submit, redirects to `/` on success. Links to `/register` and placeholder "Forgot password?" link.
- **Register page** (`src/app/register/page.tsx`): Same layout as login. Uses `RegisterForm` with displayName, email, password (min 8 chars, uppercase + number required), confirmPassword. Calls Firebase `createUserWithEmailAndPassword` then `authApi.register(displayName)` to create the Firestore user document, then redirects to `/`. Links to `/login`.
- **LoginForm** (`src/components/auth/LoginForm.tsx`): `'use client'`. React Hook Form + Zod schema (`email`, `password`). Handles Firebase auth errors (invalid credentials, too many requests, disabled user). Loading spinner on submit button during async operation. shadcn/ui Input + Label with field-level error display.
- **RegisterForm** (`src/components/auth/RegisterForm.tsx`): `'use client'`. React Hook Form + Zod schema with `.refine()` for password confirmation match. Calls `createUserWithEmailAndPassword` then `authApi.register(displayName)`. Same error handling and styling patterns as LoginForm.

### AuthGuard Component
- **AuthGuard** (`src/components/auth/AuthGuard.tsx`): `'use client'`. Props: `children`, `requireAdmin` (default false).
  - If `!isInitialized`: renders `LoadingSpinner` (prevents flash of redirect on initial load)
  - If `!user`: redirects to `/login` via `useEffect` + `router.replace()`
  - If `requireAdmin && user.role !== 'admin'`: redirects to `/` via `useEffect`
  - Otherwise: renders `children`
  - Returns `null` during redirect to avoid layout flash

### Auth Flow
1. User fills register form → `createUserWithEmailAndPassword` from Firebase Auth
2. After successful Firebase Auth signup → immediately call `authApi.register(displayName)` to create the Firestore users document
3. `onAuthStateChanged` in `Providers.tsx` picks up the new user and fetches their profile via `authApi.getProfile()`
4. For login: `signInWithEmailAndPassword` → `Providers.tsx` handles the rest automatically
5. `AuthGuard` protects private routes by checking auth state before rendering children
