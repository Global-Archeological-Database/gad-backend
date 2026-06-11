# Artifacts Schema Reference

**Last Updated**: 2026-06-10

## Firestore Document Structure

### Core Fields
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `title` | `string` | ✅ | Artifact name (1-200 chars) |
| `description` | `string` | ✅ | Detailed description |
| `latitude` | `number` | ✅ | Geographic latitude of discovery/origin |
| `longitude` | `number` | ✅ | Geographic longitude of discovery/origin |

### Optional Metadata
| Field | Type | Description |
|-------|------|-------------|
| `age` | `string` | Time period or age (e.g., "Bronze Age, ~2000 BCE") |
| `materials` | `array<string>` | Materials used (e.g., ["clay", "paint"]) |
| `cultural_origin` | `string` | Civilization or culture of origin |
| `condition` | `string` | Preservation condition (e.g., "good", "fair", "poor") |
| `country` | `string` | Country of discovery/origin |
| `tags` | `array<string>` | User-defined tags |
| `location` | `map` | Location sub-object (may contain `country`, `region`, etc.) |
| `image_url` | `string` | URL of uploaded artifact image |
| `model_url` | `string` | URL of uploaded 3D model |
| `thumbnail_url` | `string` | URL of uploaded thumbnail |
| `is_3d` | `boolean` | Whether artifact has a 3D model |
| `uploader_name` | `string` | Display name of the uploader |

### Auto-Set Fields
| Field | Type | Description |
|-------|------|-------------|
| `uploader_id` | `string` | Firebase UID of the uploader (set from auth) |
| `uploader_email` | `string` | Email of the uploader (set from auth) |
| `view_count` | `number` | View counter (incremented on each GET) |
| `ai_analysis` | `string` | Cached AI analysis result |
| `ai_analysis_timestamp` | `timestamp` | When AI analysis was last performed |
| `created_at` | `timestamp` | Document creation timestamp (server timestamp) |
| `updated_at` | `timestamp` | Document last update timestamp (server timestamp) |

## Validation Rules
- `title`: Required, 1-200 characters
- `description`: Required, minimum 10 characters
- `latitude`: Required, must be a valid number
- `longitude`: Required, must be a valid number
- `image_url`, `model_url`, `thumbnail_url`: Optional, nullable strings

## See Also
- [[docs/schemas/artifact-schema.md|Full Artifact Schema]]
- [[docs/features/artifacts/api.md|Artifacts API Reference]]
