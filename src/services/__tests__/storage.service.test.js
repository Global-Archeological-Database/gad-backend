'use strict';

// ---------------------------------------------------------------------------
// GAD — Storage Service Tests
// ---------------------------------------------------------------------------

jest.mock('../../config/firebase.config');

const { generateSignedUploadUrl } = require('../storage.service');

const {
  mockBucket,
  mockFile,
  mockGetSignedUrl,
} = require('../../config/firebase.config').__mockFns;

beforeEach(() => {
  jest.clearAllMocks();
});

// ── generateSignedUploadUrl() ────────────────────────────────────────────────

describe('generateSignedUploadUrl()', () => {
  const uid = 'user123';
  const artifactId = 'artifact456';
  const fileName = 'photo.jpg';
  const contentType = 'image/jpeg';

  it('returns an object with uploadUrl and publicUrl', async () => {
    mockGetSignedUrl.mockResolvedValue(['https://signed.url.example.com']);

    const result = await generateSignedUploadUrl(uid, artifactId, fileName, contentType);

    // Verify bucket was accessed
    expect(mockBucket).toHaveBeenCalled();

    // Verify file path construction
    expect(mockFile).toHaveBeenCalledWith(
      `artifacts/${uid}/${artifactId}/${fileName}`
    );

    // Verify signed URL generation
    expect(mockGetSignedUrl).toHaveBeenCalledWith({
      version: 'v4',
      action: 'write',
      expires: expect.any(Number),
      contentType,
    });

    // Verify return shape
    expect(result).toHaveProperty('uploadUrl');
    expect(result).toHaveProperty('publicUrl');
    expect(result.uploadUrl).toBe('https://signed.url.example.com');
    expect(result.publicUrl).toContain('storage.googleapis.com');
    expect(result.publicUrl).toContain(`artifacts/${uid}/${artifactId}/${fileName}`);
  });

  it('handles different file types', async () => {
    mockGetSignedUrl.mockResolvedValue(['https://signed.url']);

    const result = await generateSignedUploadUrl(uid, artifactId, 'doc.pdf', 'application/pdf');

    expect(mockFile).toHaveBeenCalledWith(`artifacts/${uid}/${artifactId}/doc.pdf`);
    expect(mockGetSignedUrl).toHaveBeenCalledWith(
      expect.objectContaining({ contentType: 'application/pdf' })
    );
    expect(result.publicUrl).toContain('doc.pdf');
  });

  it('propagates errors from Cloud Storage', async () => {
    const storageError = new Error('Bucket not found');
    mockGetSignedUrl.mockRejectedValue(storageError);

    await expect(
      generateSignedUploadUrl(uid, artifactId, fileName, contentType)
    ).rejects.toThrow('Bucket not found');
  });

  it('generates a URL that expires in approximately 15 minutes', async () => {
    mockGetSignedUrl.mockResolvedValue(['https://signed.url']);
    const before = Date.now();

    await generateSignedUploadUrl(uid, artifactId, fileName, contentType);

    const { expires } = mockGetSignedUrl.mock.calls[0][0];
    const after = Date.now() + 15 * 60 * 1000;

    // The expires timestamp should be between "before + 15min" and "after + 15min"
    expect(expires).toBeGreaterThanOrEqual(before);
    expect(expires).toBeLessThanOrEqual(after + 1000); // small tolerance
  });
});
