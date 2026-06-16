'use strict';

// ---------------------------------------------------------------------------
// GAD — Gemini Service Tests
// ---------------------------------------------------------------------------

jest.mock('../../config/firebase.config');

const { geminiModel } = require('../../config/firebase.config');
const { chat, analyzeArtifact, findSimilarArtifacts } = require('../gemini.service');

// Grab the mock functions from the mock module
const {
  mockSendMessage,
  mockGenerateContent,
  mockStartChat,
} = require('../../config/firebase.config').__mockFns;

beforeEach(() => {
  jest.clearAllMocks();
});

// ── Mock response helpers ────────────────────────────────────────────────────

function makeGeminiResponse(text) {
  return {
    response: {
      text: () => text,
    },
  };
}

// ── chat() ───────────────────────────────────────────────────────────────────

describe('chat()', () => {
  it('starts a chat session with system instruction and history', async () => {
    mockSendMessage.mockResolvedValue(makeGeminiResponse('Hello, Alex!'));

    const history = [
      { role: 'user', parts: [{ text: 'My name is Alex' }] },
      { role: 'model', parts: [{ text: 'Nice to meet you, Alex!' }] },
    ];
    const reply = await chat(history, 'What is my name?');

    expect(mockStartChat).toHaveBeenCalledWith({
      systemInstruction: {
        role: 'user',
        parts: [{ text: expect.stringContaining('archaeological') }],
      },
      history,
    });
    expect(mockSendMessage).toHaveBeenCalledWith('What is my name?');
    expect(reply).toBe('Hello, Alex!');
  });

  it('handles empty conversation history', async () => {
    mockSendMessage.mockResolvedValue(makeGeminiResponse('Hello!'));

    const reply = await chat([], 'Say hello');

    expect(mockStartChat).toHaveBeenCalledWith({
      systemInstruction: expect.any(Object),
      history: [],
    });
    expect(reply).toBe('Hello!');
  });

  it('handles null/undefined history gracefully (coerced to empty array)', async () => {
    mockSendMessage.mockResolvedValue(makeGeminiResponse('Hi there!'));

    const reply = await chat(null, 'Hi');

    // The service uses: history: conversationHistory || []
    // So null becomes []
    expect(mockStartChat).toHaveBeenCalledWith(
      expect.objectContaining({ history: [] })
    );
    expect(reply).toBe('Hi there!');
  });

  it('propagates errors from the Gemini API', async () => {
    const apiError = new Error('API quota exceeded');
    mockSendMessage.mockRejectedValue(apiError);

    await expect(chat([], 'Hello')).rejects.toThrow('API quota exceeded');
  });
});

// ── analyzeArtifact() ────────────────────────────────────────────────────────

describe('analyzeArtifact()', () => {
  const sampleArtifact = {
    title: 'Roman Amphora',
    description: 'A large ceramic vessel used for transporting wine.',
    age: '1st Century CE',
    materials: ['Ceramic', 'Clay'],
    cultural_origin: 'Roman',
    condition: 'Intact with minor chips',
    location: { lat: 41.9, lng: 12.5 },
    country: 'Italy',
    tags: ['pottery', 'wine', 'trade'],
    is_3d: false,
  };

  it('generates content with a properly constructed analysis prompt', async () => {
    mockGenerateContent.mockResolvedValue(makeGeminiResponse('Material Analysis:\n\nThe artifact is made of...'));

    const result = await analyzeArtifact(sampleArtifact);

    // Verify the prompt includes key artifact fields
    const promptArg = mockGenerateContent.mock.calls[0][0];
    expect(promptArg).toContain('Roman Amphora');
    expect(promptArg).toContain('1st Century CE');
    expect(promptArg).toContain('Ceramic');
    expect(promptArg).toContain('Roman');
    expect(promptArg).toContain('Italy');
    expect(promptArg).toContain('Material Analysis');
    expect(promptArg).toContain('Historical Context');
    expect(promptArg).toContain('Conservation Assessment');
    // Verify markdown formatting is forbidden in the prompt
    expect(promptArg).toContain('Never use markdown formatting');

    expect(result).toBe('Material Analysis:\n\nThe artifact is made of...');
  });

  it('handles artifacts with minimal fields', async () => {
    mockGenerateContent.mockResolvedValue(makeGeminiResponse('Minimal analysis'));

    const minimalArtifact = {
      title: 'Unknown Artifact',
      description: 'A mysterious object.',
    };

    const result = await analyzeArtifact(minimalArtifact);

    const promptArg = mockGenerateContent.mock.calls[0][0];
    expect(promptArg).toContain('Unknown Artifact');
    expect(promptArg).not.toContain('undefined');
    expect(result).toBe('Minimal analysis');
  });

  it('propagates errors from the Gemini API', async () => {
    const apiError = new Error('Model not available');
    mockGenerateContent.mockRejectedValue(apiError);

    await expect(analyzeArtifact(sampleArtifact)).rejects.toThrow('Model not available');
  });
});

// ── findSimilarArtifacts() ───────────────────────────────────────────────────

describe('findSimilarArtifacts()', () => {
  const sourceArtifact = {
    title: 'Greek Kylix',
    description: 'A wide-bowled drinking cup with two handles.',
    age: '5th Century BCE',
    materials: ['Ceramic'],
    cultural_origin: 'Greek',
    condition: 'Reconstructed from fragments',
    country: 'Greece',
    tags: ['pottery', 'drinking', 'symposium'],
  };

  const candidates = [
    {
      title: 'Roman Plate',
      description: 'A ceramic dinner plate.',
      age: '1st Century CE',
      materials: ['Ceramic'],
      cultural_origin: 'Roman',
      country: 'Italy',
    },
    {
      title: 'Greek Amphora',
      description: 'A storage jar for oil and wine.',
      age: '5th Century BCE',
      materials: ['Ceramic'],
      cultural_origin: 'Greek',
      country: 'Greece',
    },
  ];

  it('constructs a prompt with source and candidate artifacts', async () => {
    mockGenerateContent.mockResolvedValue(makeGeminiResponse('[1]'));

    const result = await findSimilarArtifacts(sourceArtifact, candidates);

    const promptArg = mockGenerateContent.mock.calls[0][0];
    expect(promptArg).toContain('Greek Kylix');
    expect(promptArg).toContain('Roman Plate');
    expect(promptArg).toContain('Greek Amphora');
    expect(promptArg).toContain('[0]');
    expect(promptArg).toContain('[1]');
    expect(promptArg).toContain('Return ONLY a valid JSON array');

    expect(result).toBe('[1]');
  });

  it('returns empty array when no candidates are provided', async () => {
    mockGenerateContent.mockResolvedValue(makeGeminiResponse('[]'));

    const result = await findSimilarArtifacts(sourceArtifact, []);

    const promptArg = mockGenerateContent.mock.calls[0][0];
    expect(promptArg).toContain('CANDIDATE ARTIFACTS');
    expect(result).toBe('[]');
  });

  it('handles artifacts with missing optional fields', async () => {
    mockGenerateContent.mockResolvedValue(makeGeminiResponse('[]'));

    const minimalSource = { title: 'X', description: 'Y' };
    const result = await findSimilarArtifacts(minimalSource, []);

    const promptArg = mockGenerateContent.mock.calls[0][0];
    expect(promptArg).toContain('Title: X');
    expect(promptArg).toContain('Description: Y');
    expect(result).toBe('[]');
  });

  it('propagates errors from the Gemini API', async () => {
    const apiError = new Error('Rate limit exceeded');
    mockGenerateContent.mockRejectedValue(apiError);

    await expect(findSimilarArtifacts(sourceArtifact, candidates)).rejects.toThrow('Rate limit exceeded');
  });
});
