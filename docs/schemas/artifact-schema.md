# Artifact Schema

**Last Updated**: 2026-06-09

## Collection: `artifacts`

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | `string` | auto | Firestore document ID (auto-generated) |
| `title` | `string` | ✅ | Artifact name/title |
| `description` | `string` | ✅ | Detailed description |
| `age` | `string` | ❌ | Time period or age (e.g., "Bronze Age, ~2000 BCE") |
| `materials` | `array<string>` | ❌ | Materials used (e.g., ["clay", "paint"]) |
| `cultural_origin` | `string` | ❌ | Civilization or culture of origin |
| `condition` | `string` | ❌ | Preservation condition (e.g., "good", "fair", "poor") |
| `latitude` | `number` | ✅ | Geographic latitude of discovery/origin |
| `longitude` | `number` | ✅ | Geographic longitude of discovery/origin |
| `country` | `string` | ❌ | Country of discovery/origin |
| `image_urls` | `array<string>` | ❌ | URLs of uploaded artifact images |
| `uploader_id` | `string` | auto | Firebase UID of the uploader |
| `uploader_email` | `string` | auto | Email of the uploader |
| `uploader_name` | `string` | auto | Display name of the uploader |
| `view_count` | `number` | auto | View counter (incremented on each GET) |
| `ai_analysis` | `string` | ❌ | Cached AI analysis result |
| `ai_analysis_timestamp` | `timestamp` | ❌ | When AI analysis was last performed |
| `created_at` | `timestamp` | auto | Document creation timestamp |
| `updated_at` | `timestamp` | auto | Document last update timestamp |

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
  "image_urls": ["https://storage.googleapis.com/..."],
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
- `latitude` and `longitude` are required at creation time (validated in `artifacts.controller.js`)
- `country` was added as an optional top-level field in the 2026-06-03 audit fix (previously only in `location` sub-object)
- `view_count` uses fire-and-forget increment (does not await the update)
- `ai_analysis` is set by the `POST /api/ai/analyze/:artifactId` endpoint
