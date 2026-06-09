'use strict';

// ---------------------------------------------------------------------------
// GAD — Manual Mock for firebase.config.js
// ---------------------------------------------------------------------------
// Provides fully mocked versions of admin, db, storage, and geminiModel
// so that tests never require real Firebase credentials or network access.
// ---------------------------------------------------------------------------

// ── Mock Gemini Model ────────────────────────────────────────────────────────
const mockSendMessage = jest.fn();
const mockGenerateContent = jest.fn();
const mockStartChat = jest.fn(() => ({
  sendMessage: mockSendMessage,
}));

const mockGeminiModel = {
  startChat: mockStartChat,
  generateContent: mockGenerateContent,
};

// ── Mock Firestore — chainable query builder ─────────────────────────────────
// Firestore queries use method chaining: collection().orderBy().where().limit().get()
// We create a single mockQuery object that all chain methods return.

const mockGet = jest.fn();
const mockDoc = jest.fn();
const mockWhere = jest.fn();
const mockOrderBy = jest.fn();
const mockLimit = jest.fn();
const mockStartAfter = jest.fn();

// The query object that all chain methods return (including collection)
const mockQuery = {
  doc: mockDoc,
  get: mockGet,
  where: mockWhere,
  orderBy: mockOrderBy,
  limit: mockLimit,
  startAfter: mockStartAfter,
};

// Make chain methods return the mockQuery for fluent API
mockWhere.mockReturnValue(mockQuery);
mockOrderBy.mockReturnValue(mockQuery);
mockLimit.mockReturnValue(mockQuery);
mockStartAfter.mockReturnValue(mockQuery);
mockDoc.mockReturnValue(mockQuery);

const mockCollection = jest.fn(() => mockQuery);

const mockDb = {
  collection: mockCollection,
};

// ── Mock Storage ─────────────────────────────────────────────────────────────
const mockGetSignedUrl = jest.fn();
const mockFile = jest.fn(() => ({
  getSignedUrl: mockGetSignedUrl,
}));
const mockBucket = jest.fn(() => ({
  name: 'test-bucket',
  file: mockFile,
}));
const mockStorage = {
  bucket: mockBucket,
};

// ── Mock Admin ───────────────────────────────────────────────────────────────
const mockAdmin = {
  apps: [],
  initializeApp: jest.fn(),
  credential: {
    applicationDefault: jest.fn(),
  },
  firestore: jest.fn(() => mockDb),
  storage: jest.fn(() => mockStorage),
};

module.exports = {
  admin: mockAdmin,
  db: mockDb,
  storage: mockStorage,
  geminiModel: mockGeminiModel,
  // Expose mock functions for test assertions
  __mockFns: {
    mockSendMessage,
    mockGenerateContent,
    mockStartChat,
    mockDoc,
    mockGet,
    mockWhere,
    mockOrderBy,
    mockLimit,
    mockStartAfter,
    mockCollection,
    mockGetSignedUrl,
    mockFile,
    mockBucket,
    mockQuery,
  },
};
