'use strict';

// ---------------------------------------------------------------------------
// GAD — Firestore Service Tests
// ---------------------------------------------------------------------------

jest.mock('../../config/firebase.config');

const { db } = require('../../config/firebase.config');
const { getDb, queryArtifacts } = require('../firestore.service');

const {
  mockCollection,
  mockDoc,
  mockGet,
  mockOrderBy,
  mockWhere,
  mockLimit,
  mockStartAfter,
  mockQuery,
} = require('../../config/firebase.config').__mockFns;

beforeEach(() => {
  jest.clearAllMocks();
});

// ── Helpers ──────────────────────────────────────────────────────────────────

function makeDocSnapshot(id, data) {
  return {
    id,
    data: () => data,
    exists: true,
  };
}

// ── getDb() ──────────────────────────────────────────────────────────────────

describe('getDb()', () => {
  it('returns the Firestore db instance', () => {
    const result = getDb();
    expect(result).toBe(db);
  });
});

// ── queryArtifacts() ─────────────────────────────────────────────────────────

describe('queryArtifacts()', () => {
  it('returns artifacts with default limit and no filters', async () => {
    // Return 101 docs (safeLimit=100, so safeLimit+1=101 means no next page)
    const docs = Array.from({ length: 100 }, (_, i) =>
      makeDocSnapshot(`doc${i}`, { title: `Artifact ${i}` })
    );
    mockGet.mockResolvedValue({ docs });

    const result = await queryArtifacts();

    expect(mockCollection).toHaveBeenCalledWith('artifacts');
    expect(mockOrderBy).toHaveBeenCalledWith('__name__');
    expect(mockLimit).toHaveBeenCalledWith(101); // safeLimit + 1
    expect(result.docs).toHaveLength(100);
    expect(result.lastDoc).toBeNull();
  });

  it('applies country filter', async () => {
    mockGet.mockResolvedValue({ docs: [] });

    await queryArtifacts({ country: 'Italy' });

    expect(mockWhere).toHaveBeenCalledWith('country', '==', 'Italy');
  });

  it('applies culturalOrigin filter', async () => {
    mockGet.mockResolvedValue({ docs: [] });

    await queryArtifacts({ culturalOrigin: 'Roman' });

    expect(mockWhere).toHaveBeenCalledWith('cultural_origin', '==', 'Roman');
  });

  it('applies condition filter', async () => {
    mockGet.mockResolvedValue({ docs: [] });

    await queryArtifacts({ condition: 'Intact' });

    expect(mockWhere).toHaveBeenCalledWith('condition', '==', 'Intact');
  });

  it('applies is3d filter when true', async () => {
    mockGet.mockResolvedValue({ docs: [] });

    await queryArtifacts({ is3d: true });

    expect(mockWhere).toHaveBeenCalledWith('is_3d', '==', true);
  });

  it('applies is3d filter when false', async () => {
    mockGet.mockResolvedValue({ docs: [] });

    await queryArtifacts({ is3d: false });

    expect(mockWhere).toHaveBeenCalledWith('is_3d', '==', false);
  });

  it('skips is3d filter when undefined', async () => {
    mockGet.mockResolvedValue({ docs: [] });

    await queryArtifacts({});

    // where should not have been called with is_3d
    const whereCalls = mockWhere.mock.calls.filter(c => c[0] === 'is_3d');
    expect(whereCalls).toHaveLength(0);
  });

  it('applies uploaderId filter', async () => {
    mockGet.mockResolvedValue({ docs: [] });

    await queryArtifacts({ uploaderId: 'user123' });

    expect(mockWhere).toHaveBeenCalledWith('uploader_id', '==', 'user123');
  });

  it('applies cursor pagination with startAfter', async () => {
    const cursorSnapshot = makeDocSnapshot('cursorDoc', { title: 'Cursor' });
    // mockDoc().get() should resolve to the cursor snapshot
    mockGet.mockResolvedValueOnce({ docs: [] }); // for the main query
    // We need to handle the cursor doc lookup separately
    // The cursor lookup does: db.collection('artifacts').doc(startAfter).get()
    // Since mockDoc returns mockQuery, and mockQuery.get is mockGet,
    // we need to set up mockGet to return cursor snapshot first, then empty
    mockGet.mockReset();
    mockGet
      .mockResolvedValueOnce(cursorSnapshot)  // cursor doc lookup
      .mockResolvedValueOnce({ docs: [] });    // main query

    await queryArtifacts({ startAfter: 'cursorDoc' });

    expect(mockDoc).toHaveBeenCalledWith('cursorDoc');
    expect(mockStartAfter).toHaveBeenCalledWith(cursorSnapshot);
  });

  it('handles non-existent cursor document gracefully', async () => {
    const nonExistentSnapshot = { exists: false };
    mockGet
      .mockResolvedValueOnce(nonExistentSnapshot)  // cursor doc lookup
      .mockResolvedValueOnce({ docs: [] });         // main query

    // Should not throw
    await queryArtifacts({ startAfter: 'nonexistent' });

    expect(mockStartAfter).not.toHaveBeenCalled();
  });

  it('caps limit at 500', async () => {
    mockGet.mockResolvedValue({ docs: [] });

    await queryArtifacts({ limit: 1000 });

    expect(mockLimit).toHaveBeenCalledWith(501); // 500 + 1
  });

  it('enforces minimum limit of 1', async () => {
    mockGet.mockResolvedValue({ docs: [] });

    await queryArtifacts({ limit: -5 });

    expect(mockLimit).toHaveBeenCalledWith(2); // 1 + 1
  });

  it('returns lastDoc when there are more results', async () => {
    const docs = Array.from({ length: 3 }, (_, i) =>
      makeDocSnapshot(`doc${i}`, { title: `Artifact ${i}` })
    );
    // Return 4 docs when limit is 3 → indicates there's a next page
    mockGet.mockResolvedValue({ docs: [...docs, makeDocSnapshot('doc3', { title: 'Extra' })] });

    const result = await queryArtifacts({ limit: 3 });

    expect(result.docs).toHaveLength(3);
    expect(result.lastDoc).not.toBeNull();
    expect(result.lastDoc.id).toBe('doc2');
  });

  it('handles Firestore errors', async () => {
    const firestoreError = new Error('Firestore quota exceeded');
    mockGet.mockRejectedValue(firestoreError);

    await expect(queryArtifacts()).rejects.toThrow('Firestore quota exceeded');
  });
});
