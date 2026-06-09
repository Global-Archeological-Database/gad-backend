'use strict';

// ---------------------------------------------------------------------------
// GAD — Jest Configuration
// ---------------------------------------------------------------------------
// Tests are co-located in __tests__/ directories alongside source files.
// Mocks for firebase-admin and @google/generative-ai are in src/__mocks__/.
// ---------------------------------------------------------------------------

module.exports = {
  testEnvironment: 'node',
  roots: ['<rootDir>/src'],
  testMatch: [
    '**/__tests__/**/*.test.js',
  ],
  clearMocks: true,
  restoreMocks: true,
  // Prevent accidental network calls or file-system writes
  testPathIgnorePatterns: ['/node_modules/'],
};
