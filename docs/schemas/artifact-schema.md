# Artifact Schema

**Last Updated**: 2026-06-10

## Collection: `artifacts`

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | `string` | auto | Firestore document ID (auto-generated) |
| `title` | `string` | ✅ | Artifact name/title (1-200 chars) |
| `description` | `string` | ✅ | Detailed description (1-5000 chars) |
| `age` | `string` | ❌ | Time period or age (e.g., "Bronze Age, ~2000 BCE") |
| `materials` | `array<string>` | ❌ | Materials used (e.g., ["clay", "paint"]) |
| `cultural_origin` | `string` | ❌ | Civilization or culture of origin |
| `condition` | `string` | ❌ | Preservation condition (e.g., "good", "fair", "poor") |
| `latitude` | `number` | ✅ | Geographic latitude of discovery/origin (-90 to 90) |
| `longitude` | `number` | ✅ | Geographic longitude of discovery/origin (-180 to 180) |
| `country` | `string` | ❌ | Country of discovery/origin |
| `is_3d` | `boolean` | ❌ | Whether a 3D model is available (default: false) |
| `tags` | `array<string>` | ❌ | User-defined tags for categorization |
| `location` | `map` | ❌ | Optional location sub-object (e.g., `{ "region": "string", "site": "string" }`) |
| `image_url` | `string` | ❌ | URL of uploaded artifact image |
| `model_url` | `string` | ❌ | URL of uploaded 3D model (GLB/GLTF) |
| `thumbnail_url` | `string` | ❌ | URL of generated thumbnail |
| `uploader_id` | `string` | auto | Firebase UID of the uploader |
| `uploader_email` | `string` | auto | Email of the uploader |
| `uploader_name` | `string` | auto | Display name of the uploader |
| `view_count` | `number` | auto | View counter (incremented on each GET) |
| `ai_analysis` | `string` | ❌ | Cached AI analysis result |
| `ai_analysis_timestamp` | `timestamp` | ❌ | When AI analysis was last performed |
| `created_at` | `timestamp` | auto | Document creation timestamp (set by Firestore) |
| `updated_at` | `timestamp` | auto | Document last update timestamp (set by Firestore) |

## Example Document

```json
{
  "id": "abc123def456",
  "title": "Neolithic Pottery Fragment",
  "description": "A decorated pottery shard from the Neolithic period...",
  "age": "Neolithic, ~4000 BCE",
  "materials": ["clay", "ochre pigment"],
  "cultural_origin": "Danubian culture",
  "condition": "fair",
  "latitude": 48.8566,
  "longitude": 2.3522,
  "country": "France",
  "is_3d": false,
  "tags": ["pottery", "neolithic", "decorated"],
  "location": {
    "region": "Île-de-France",
    "site": "Seine River Valley"
  },
  "image_url": "https://storage.googleapis.com/gad-artifacts/artifacts/uid123/abc123/photo.jpg",
  "model_url": null,
  "thumbnail_url": "https://storage.googleapis.com/gad-artifacts/artifacts/uid123/abc123/thumb.jpg",
  "uploader_id": "firebase-uid-123",
  "uploader_email": "user@example.com",
  "uploader_name": "John Doe",
  "view_count": 42,
  "ai_analysis": "This artifact is a significant example of...",
  "ai_analysis_timestamp": Timestamp { seconds: 1234567890, nanoseconds: 0 },
  "created_at": Timestamp { ... },
  "updated_at": Timestamp { ... }
}
```

## Notes
- `latitude` and `longitude` are required at creation time (validated in [`src/controllers/artifacts.controller.js`](src/controllers/artifacts.controller.js:81))
- `country` is an optional top-level field (not nested under `location`)
- `view_count` uses fire-and-forget increment (does not await the update)
- `ai_analysis` is set by the `POST /api/ai/analyze/:artifactId` endpoint
- `image_url`, `model_url`, and `thumbnail_url` are individual nullable string fields (not an array)
- `created_at` and `updated_at` are managed by Firestore's server timestamps
