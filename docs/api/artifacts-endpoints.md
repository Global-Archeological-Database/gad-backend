# Artifacts API Endpoints

**Last Updated**: 2026-06-10

## `GET /api/artifacts`
_List artifacts (public). — ✅ Frontend integrated_

**Query Parameters:**
- `limit` (number, default 50, max 500) — max results
- `startAfter` (string) — cursor document ID for pagination
- `country` (string) — filter by country
- `cultural_origin` (string) — filter by cultural origin
- `condition` (string) — filter by condition
- `is_3d` (boolean) — filter by 3D availability
- `uploader_id` (string) — filter by uploader

**Response (200):**
```json
{
  "artifacts": [
    {
      "id": "string",
      "title": "string",
      "description": "string",
      "age": "string",
      "materials": ["string"],
      "cultural_origin": "string",
      "condition": "string",
      "latitude": number,
      "longitude": number,
      "country": "string",
      "is_3d": boolean,
      "tags": ["string"],
      "location": { "region": "string", "site": "string" },
      "image_url": "string",
      "model_url": "string",
      "thumbnail_url": "string",
      "uploader_id": "string",
      "uploader_email": "string",
      "uploader_name": "string",
      "view_count": number,
      "ai_analysis": "string",
      "ai_analysis_timestamp": Timestamp,
      "created_at": Timestamp,
      "updated_at": Timestamp
    }
  ],
  "count": number,
  "nextPageToken": "string|null"
}
```
**Cache-Control:** `public, max-age=60`

---

## `POST /api/artifacts`
_Create artifact (authenticated)._

**Auth:** `requireAuth`

**Body:**
- `title` (string, required, 1-200 chars)
- `description` (string, required, 1-5000 chars)
- `latitude` (number, required, -90 to 90)
- `longitude` (number, required, -180 to 180)
- Plus optional fields: `age`, `materials`, `cultural_origin`, `condition`, `country`, `tags`, `image_url`, `model_url`, `thumbnail_url`, `is_3d`, `location`

**Response:** `201 Created` with full artifact document

---

## `GET /api/artifacts/:id`
_Get artifact by ID (public). — ✅ Frontend integrated (SSR with revalidate: 120)_

**Response (200):** Full artifact document
**Response (404):** `{ "error": "Artifact not found" }`
**Cache-Control:** `public, max-age=300`

---

## `PUT /api/artifacts/:id`
_Update artifact (authenticated, owner or admin only)._

**Auth:** `requireAuth` + ownership or admin check

**Updatable Fields:** `title`, `description`, `age`, `materials`, `cultural_origin`, `condition`, `tags`, `location`, `image_url`, `model_url`, `thumbnail_url`, `is_3d`

**Response (200):** Updated artifact document
**Errors:**
- `400` — No updatable fields provided
- `403` — Not authorized (not owner or admin)
- `404` — Artifact not found

---

## `DELETE /api/artifacts/:id`
_Delete artifact (authenticated, owner or admin only). Also deletes associated files from Cloud Storage._

**Auth:** `requireAuth` + ownership or admin check

**Response (200):**
```json
{
  "success": true,
  "deletedId": "string"
}
```
**Errors:**
- `403` — Not authorized (not owner or admin)
- `404` — Artifact not found

---

## `POST /api/artifacts/:id/upload-url`
_Generate signed upload URL (authenticated, owner or admin only)._

**Auth:** `requireAuth` + ownership or admin check

**Body:** `{ fileName: string, contentType: string }`

**Response (200):**
```json
{
  "uploadUrl": "string — signed V4 URL (expires in 15 minutes)",
  "publicUrl": "string — public GCS URL"
}
```
**Errors:**
- `400` — Missing `fileName` or `contentType`
- `403` — Not authorized (not owner or admin)
- `404` — Artifact not found
