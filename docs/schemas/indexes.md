# Firestore Indexes

**Last Updated**: 2026-06-09

## Composite Indexes

The following composite indexes are deployed for the `artifacts` collection:

| # | Fields | Query Purpose |
|---|--------|---------------|
| 1 | `country` ASC, `__name__` ASC | Filter by country with cursor pagination |
| 2 | `cultural_origin` ASC, `__name__` ASC | Filter by cultural origin with cursor pagination |
| 3 | `condition` ASC, `__name__` ASC | Filter by condition with cursor pagination |
| 4 | `is3d` ASC, `__name__` ASC | Filter by 3D availability with cursor pagination |
| 5 | `uploader_id` ASC, `__name__` ASC | Filter by uploader with cursor pagination |
| 6 | `created_at` DESC, `__name__` ASC | Default ordering by creation date |

## How Indexes Are Used

The `queryArtifacts()` function in `firestore.service.js` builds queries dynamically:

1. Starts with `db.collection('artifacts')`
2. Applies `.where()` filters for any provided query params: `country`, `culturalOrigin`, `condition`, `is3d`, `uploaderId`
3. Applies `.orderBy('__name__')` for cursor-based pagination
4. Applies `.startAfter(cursor)` if a cursor document is provided
5. Applies `.limit(pageSize)` (default: 50, max: 100)

**Important**: Each filter + `orderBy('__name__')` combination requires a composite index in Firestore. The indexes above cover all current filter combinations.

## Notes
- Indexes are managed via Firebase Console or `firebase.json` index configuration
- The `__name__` field is Firestore's document ID — ordering by it enables cursor pagination
- No additional indexes are needed for the `users` collection (queried only by document ID)
