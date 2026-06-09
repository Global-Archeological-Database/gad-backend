# Artifacts Schema Reference

**Last Updated**: 2026-06-09

> **Note**: The canonical schema documentation has moved to `docs/schemas/artifact-schema.md`. This page serves as a feature-context reference.

## Firestore Document Structure

The `artifacts` collection stores archaeological artifact records with the following structure:

### Core Fields
- `title` (string, required) — Artifact name
- `description` (string, required) — Detailed description
- `latitude` (number, required) — Geographic latitude
- `longitude` (number, required) — Geographic longitude

### Optional Metadata
- `age` (string) — Time period
- `materials` (array of strings) — Materials
- `cultural_origin` (string) — Civilization/culture
- `condition` (string) — Preservation state
- `country` (string) — Country of origin
- `image_urls` (array of strings) — Uploaded images

### Auto-Set Fields
- `uploader_id`, `uploader_email`, `uploader_name` — Set on creation
- `view_count` — Incremented on each GET
- `ai_analysis`, `ai_analysis_timestamp` — Set by AI analyzer
- `created_at`, `updated_at` — Timestamps

## Validation Rules
- `title`: 1-500 characters
- `description`: 1-5000 characters
- `latitude`: -90 to 90
- `longitude`: -180 to 180

## See Also
- [`docs/schemas/artifact-schema.md`](../schemas/artifact-schema.md) — Full schema with types and examples
- [`docs/api/artifacts-endpoints.md`](../api/artifacts-endpoints.md) — API reference
