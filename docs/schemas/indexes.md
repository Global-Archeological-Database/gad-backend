# Firestore Indexes

**Last Updated**: 2026-06-10

## Composite Indexes

The following composite indexes are deployed for the `artifacts` collection:

| # | Fields | Query Purpose |
|---|--------|---------------|
| 1 | `country` ASC, `created_at` DESC | Filter by country, ordered by creation date |
| 2 | `cultural_origin` ASC, `created_at` DESC | Filter by cultural origin, ordered by creation date |
| 3 | `condition` ASC, `created_at` DESC | Filter by condition, ordered by creation date |
| 4 | `is_3d` ASC, `created_at` DESC | Filter by 3D availability, ordered by creation date |
| 5 | `uploader_id` ASC, `created_at` DESC | Filter by uploader, ordered by creation date |
| 6 | `materials` ASC, `created_at` DESC | Array-contains filter by material, ordered by creation date |
| 7 | `tags` ASC, `created_at` DESC | Array-contains filter by tag, ordered by creation date |

## How Indexes Are Used

The [`queryArtifacts()`](src/services/firestore.service.js:35) function in [`src/services/firestore.service.js`](src/services/firestore.service.js) builds queries dynamically:

1. Starts with `db.collection('artifacts')`
2. Applies `.where()` filters for any provided query params: `country`, `culturalOrigin`, `condition`, `is3d`, `uploaderId`, `materials`, `tags`
3. Applies `.orderBy('created_at', 'desc')` for consistent ordering and cursor-based pagination
4. Applies `.startAfter(cursor)` if a cursor document is provided
5. Applies `.limit(pageSize)` (default: 50, max: 500)

**Important**: Each filter + `orderBy('created_at', 'desc')` combination requires a composite index in Firestore. The indexes above cover all current filter combinations.

## Notes
- Indexes are managed via [`firestore.indexes.json`](firestore.indexes.json) and deployed with `firebase deploy --only firestore:indexes`
- The `__name__` field is **not** used in ordering — all queries order by `created_at DESC` for consistency with deployed indexes
- No additional indexes are needed for the `users` collection (queried only by document ID)
- Array indexes (`materials`, `tags`) use `ARRAY_CONTAINS` queries, which require the field to be indexed as `ASCENDING`
