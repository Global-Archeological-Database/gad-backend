# Artifacts API Endpoints

## `GET /api/artifacts`
_List artifacts (public). — ✅ Frontend integrated_

**Query Parameters:**
- `limit` (number, default 100, max 500) — max results
- `startAfter` (string) — cursor document ID for pagination
- `country` (string) — filter by country
- `cultural_origin` (string) — filter by cultural origin
- `condition` (string) — filter by condition
- `is_3d` (boolean) — filter by 3D availability
- `uploader_id` (string) — filter by uploader

**Response:** `{ artifacts: [...], count: number, nextPageToken: string|null }`
**Cache-Control:** `public, max-age=60`

## `POST /api/artifacts`
_Create artifact (authenticated)._

**Auth:** `requireAuth`

**Body:**
- `title` (string, required, 1-200 chars)
- `description` (string, required, 1-5000 chars)
- `latitude` (number, required, -90 to 90)
- `longitude` (number, required, -180 to 180)
- Plus optional fields: age, materials, cultural_origin, condition, country, tags, image_url, model_url, thumbnail_url, is_3d, location

**Response:** `201 Created` with full artifact document

## `GET /api/artifacts/:id`
_Get artifact by ID (public). — ✅ Frontend integrated (SSR with revalidate: 120)_

**Response:** Full artifact document or `404`
**Cache-Control:** `public, max-age=300`

## `PUT /api/artifacts/:id`
_Update artifact (authenticated, owner or admin only)._

**Auth:** `requireAuth` + ownership or admin check

**Updatable Fields:** title, description, age, materials, cultural_origin, condition, tags, location, image_url, model_url, thumbnail_url, is_3d

**Response:** Updated artifact document

## `DELETE /api/artifacts/:id`
_Delete artifact (authenticated, owner or admin only)._

**Auth:** `requireAuth` + ownership or admin check

**Response:** `{ success: true, deletedId: string }`

## `POST /api/artifacts/:id/upload-url`
_Generate signed upload URL (authenticated, owner or admin only)._

**Auth:** `requireAuth` + ownership or admin check

**Body:** `{ fileName: string, contentType: string }`

**Response:** `{ uploadUrl: string, publicUrl: string }` (URL expires in 15 minutes)
