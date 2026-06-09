# Artifacts API Reference

**Last Updated**: 2026-06-09

## Overview
RESTful API for archaeological artifact CRUD operations. All endpoints are prefixed with `/api/artifacts`.

## Endpoints

### `GET /api/artifacts`
List artifacts with optional filtering and cursor-based pagination.

**Auth**: Public
**Cache**: 60 seconds (client-side via TanStack Query `staleTime: 60000`)
**Query Parameters**:
| Param | Type | Description |
|-------|------|-------------|
| `limit` | `number` | Max results (default: 50, max: 100) |
| `cursor` | `string` | Document ID for pagination |
| `country` | `string` | Filter by country |
| `culturalOrigin` | `string` | Filter by cultural origin |
| `condition` | `string` | Filter by condition |
| `is3d` | `boolean` | Filter by 3D availability |
| `uploaderId` | `string` | Filter by uploader |

**Response**: `{ artifacts: Artifact[], count: number, nextCursor: string | null }`

### `POST /api/artifacts`
Create a new artifact.

**Auth**: `requireAuth`
**Body**: `CreateArtifactPayload` (title, description, latitude, longitude required)
**Response** (201): `{ message: "Artifact created", id: string }`

### `GET /api/artifacts/:id`
Get a single artifact by ID. Increments view_count (fire-and-forget).

**Auth**: Public
**Cache**: 300 seconds (client-side via TanStack Query `staleTime: 120000`)
**Response**: `{ artifact: Artifact }`

### `PUT /api/artifacts/:id`
Update an artifact. Owner or admin only.

**Auth**: `requireAuth`
**Body**: Partial artifact fields (whitelisted: title, description, age, materials, cultural_origin, condition, latitude, longitude, country, image_urls)
**Response**: `{ message: "Artifact updated", id: string }`

### `DELETE /api/artifacts/:id`
Delete an artifact. Owner or admin only.

**Auth**: `requireAuth`
**Response**: `{ message: "Artifact deleted", id: string }`

### `POST /api/artifacts/:id/upload-url`
Generate a signed V4 URL for direct client-to-GCS upload.

**Auth**: `requireAuth` (owner or admin)
**Body**: `{ fileName: string, contentType: string }`
**Response**: `{ uploadUrl: string, publicUrl: string }`
**Expiry**: 15 minutes

## Rate Limiting
- General endpoints: 100 requests per 15 minutes per IP
- Upload URL generation: 20 requests per day per IP

## Error Responses
All errors return: `{ error: string, details?: any }`
- `400` — Validation error
- `401` — Authentication required
- `403` — Permission denied
- `404` — Artifact not found
- `429` — Rate limit exceeded
- `500` — Internal server error
