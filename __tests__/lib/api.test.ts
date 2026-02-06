import fetchMock from 'jest-fetch-mock';
import {
  isRateLimitError,
  formatResetDate,
  getAuthHeader,
  generateRecipe,
  askClarification,
} from '@/lib/api';
import type { RateLimitError } from '@/lib/types';
import { mockAuthSession } from '../helpers/mockSupabase';
import { mockSession } from '../helpers/testFixtures';

const sampleEquipment = {
  grill: { name: 'Big Joe III', brand: 'Kamado Joe', model: 'Big Joe III', type: 'kamado' },
  accessories: [{ name: 'Joetisserie', type: 'rotisserie' }],
};

const sampleGenerateParams = {
  equipment: sampleEquipment,
  request: 'Smoke a brisket for 8 people',
  clarifications: [{ question: 'Skill level?', answer: 'Intermediate' }],
};

const sampleClarificationParams = {
  userInput: 'I want to smoke a brisket',
  equipment: sampleEquipment,
};

// ─── Helpers for mocking fetch with real Response objects ─

function createStreamResponse(chunks: string[], status = 200) {
  const encoder = new TextEncoder();
  let idx = 0;

  // Create a mock reader that returns chunks sequentially
  const mockReader = {
    read: jest.fn(async () => {
      if (idx < chunks.length) {
        const chunk = chunks[idx];
        idx++;
        return { done: false, value: encoder.encode(chunk) };
      }
      return { done: true, value: undefined };
    }),
  };

  // Create a mock body with getReader
  const mockBody = {
    getReader: () => mockReader,
  };

  // Return a response-like object with the properties generateRecipe uses
  return {
    ok: status >= 200 && status < 300,
    status,
    body: mockBody,
    json: async () => ({}),
  } as unknown as Response;
}

function createJsonResponse(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

let fetchSpy: jest.SpyInstance;

beforeEach(() => {
  // Disable jest-fetch-mock for this entire test file and use native fetch spy
  fetchMock.disableMocks();
  fetchSpy = jest.spyOn(global, 'fetch');
});

afterEach(() => {
  jest.restoreAllMocks();
  fetchMock.enableMocks();
});

// ─── isRateLimitError ───────────────────────────────────

describe('isRateLimitError', () => {
  it('returns true for a valid RateLimitError shape', () => {
    const error: RateLimitError = {
      error: 'Rate limit exceeded',
      message: 'You have hit your monthly limit',
      resetDate: '2024-04-01T00:00:00Z',
      limit: 15,
      remaining: 0,
    };
    expect(isRateLimitError(error)).toBe(true);
  });

  it('returns false for a standard Error', () => {
    expect(isRateLimitError(new Error('something went wrong'))).toBe(false);
  });

  it('returns false for null', () => {
    expect(isRateLimitError(null)).toBe(false);
  });

  it('returns false for undefined', () => {
    expect(isRateLimitError(undefined)).toBe(false);
  });

  it('returns false for a string', () => {
    expect(isRateLimitError('Rate limit exceeded')).toBe(false);
  });

  it('returns false for an object with different error message', () => {
    expect(isRateLimitError({ error: 'Not found' })).toBe(false);
  });
});

// ─── formatResetDate ────────────────────────────────────

describe('formatResetDate', () => {
  it('formats a date string as "Month Day"', () => {
    const result = formatResetDate('2024-04-15T12:00:00Z');
    expect(result).toContain('April');
    expect(result).toContain('15');
  });

  it('formats another date', () => {
    const result = formatResetDate('2024-12-25T12:00:00Z');
    expect(result).toContain('December');
    expect(result).toContain('25');
  });
});

// ─── getAuthHeader ──────────────────────────────────────

describe('getAuthHeader', () => {
  it('returns Bearer token when session exists', async () => {
    mockAuthSession(mockSession);
    const header = await getAuthHeader();
    expect(header).toBe('Bearer mock-jwt-token');
  });

  it('returns null when there is no session', async () => {
    mockAuthSession(null);
    const header = await getAuthHeader();
    expect(header).toBeNull();
  });
});

// ─── generateRecipe ─────────────────────────────────────

describe('generateRecipe', () => {
  it('calls onError with "Not authenticated" when there is no session', async () => {
    mockAuthSession(null);

    const onChunk = jest.fn();
    const onComplete = jest.fn();
    const onError = jest.fn();

    await generateRecipe(sampleGenerateParams, onChunk, onComplete, onError);

    expect(onError).toHaveBeenCalledTimes(1);
    expect(onError.mock.calls[0][0]).toBeInstanceOf(Error);
    expect(onError.mock.calls[0][0].message).toBe('Not authenticated');
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it('sends correct auth header and payload', async () => {
    mockAuthSession(mockSession);
    fetchSpy.mockResolvedValue(createStreamResponse(['data: [DONE]\n']));

    const onChunk = jest.fn();
    const onComplete = jest.fn();
    const onError = jest.fn();

    await generateRecipe(sampleGenerateParams, onChunk, onComplete, onError);

    expect(fetchSpy).toHaveBeenCalledTimes(1);
    const [url, options] = fetchSpy.mock.calls[0];
    expect(url).toContain('/functions/v1/generate-recipe');
    expect(options?.method).toBe('POST');
    expect(options?.headers?.Authorization).toBe('Bearer mock-jwt-token');
    expect(JSON.parse(options?.body as string)).toEqual(sampleGenerateParams);
  });

  it('parses SSE data lines and calls onChunk for each text fragment', async () => {
    mockAuthSession(mockSession);
    fetchSpy.mockResolvedValue(
      createStreamResponse(['data: {"text":"Hello "}\ndata: {"text":"world"}\ndata: [DONE]\n'])
    );

    const onChunk = jest.fn();
    const onComplete = jest.fn();
    const onError = jest.fn();

    await generateRecipe(sampleGenerateParams, onChunk, onComplete, onError);

    expect(onChunk).toHaveBeenCalledWith('Hello ');
    expect(onChunk).toHaveBeenCalledWith('world');
    expect(onChunk).toHaveBeenCalledTimes(2);
    expect(onComplete).toHaveBeenCalledTimes(1);
    expect(onError).not.toHaveBeenCalled();
  });

  it('calls onComplete when [DONE] signal is received', async () => {
    mockAuthSession(mockSession);
    fetchSpy.mockResolvedValue(createStreamResponse(['data: {"text":"chunk"}\ndata: [DONE]\n']));

    const onComplete = jest.fn();
    await generateRecipe(sampleGenerateParams, jest.fn(), onComplete, jest.fn());

    expect(onComplete).toHaveBeenCalledTimes(1);
  });

  it('calls onError with RateLimitError on 429 response', async () => {
    mockAuthSession(mockSession);
    const rateLimitBody: RateLimitError = {
      error: 'Rate limit exceeded',
      message: 'Monthly limit reached',
      resetDate: '2024-04-01T00:00:00Z',
      limit: 15,
      remaining: 0,
    };
    fetchSpy.mockResolvedValue(createJsonResponse(rateLimitBody, 429));

    const onChunk = jest.fn();
    const onComplete = jest.fn();
    const onError = jest.fn();

    await generateRecipe(sampleGenerateParams, onChunk, onComplete, onError);

    expect(onError).toHaveBeenCalledTimes(1);
    expect(isRateLimitError(onError.mock.calls[0][0])).toBe(true);
    expect(onChunk).not.toHaveBeenCalled();
    expect(onComplete).not.toHaveBeenCalled();
  });

  it('calls onError with Error for non-rate-limit error responses', async () => {
    mockAuthSession(mockSession);
    fetchSpy.mockResolvedValue(createJsonResponse({ error: 'Internal server error' }, 500));

    const onError = jest.fn();
    await generateRecipe(sampleGenerateParams, jest.fn(), jest.fn(), onError);

    expect(onError).toHaveBeenCalledTimes(1);
    expect(onError.mock.calls[0][0]).toBeInstanceOf(Error);
    expect(onError.mock.calls[0][0].message).toBe('Internal server error');
  });

  it('calls onComplete when stream ends without explicit [DONE]', async () => {
    mockAuthSession(mockSession);
    fetchSpy.mockResolvedValue(createStreamResponse(['data: {"text":"partial"}\n']));

    const onChunk = jest.fn();
    const onComplete = jest.fn();
    const onError = jest.fn();

    await generateRecipe(sampleGenerateParams, onChunk, onComplete, onError);

    expect(onChunk).toHaveBeenCalledWith('partial');
    expect(onComplete).toHaveBeenCalledTimes(1);
    expect(onError).not.toHaveBeenCalled();
  });

  it('ignores lines that do not start with "data: "', async () => {
    mockAuthSession(mockSession);
    fetchSpy.mockResolvedValue(
      createStreamResponse(['event: message\ndata: {"text":"valid"}\nretry: 3000\ndata: [DONE]\n'])
    );

    const onChunk = jest.fn();
    const onComplete = jest.fn();

    await generateRecipe(sampleGenerateParams, onChunk, onComplete, jest.fn());

    expect(onChunk).toHaveBeenCalledTimes(1);
    expect(onChunk).toHaveBeenCalledWith('valid');
    expect(onComplete).toHaveBeenCalledTimes(1);
  });
});

// ─── askClarification ───────────────────────────────────

describe('askClarification', () => {
  it('sends correct POST payload and auth header', async () => {
    mockAuthSession(mockSession);
    const responseBody = {
      questions: [
        { id: 'q1', question: 'Skill level?', type: 'choice', options: ['Beginner', 'Advanced'] },
      ],
      ready: false,
    };
    fetchSpy.mockResolvedValue(createJsonResponse(responseBody));

    await askClarification(sampleClarificationParams);

    expect(fetchSpy).toHaveBeenCalledTimes(1);
    const [url, options] = fetchSpy.mock.calls[0];
    expect(url).toContain('/functions/v1/ask-clarification');
    expect(options?.method).toBe('POST');
    expect(options?.headers?.Authorization).toBe('Bearer mock-jwt-token');
    expect(JSON.parse(options?.body as string)).toEqual(sampleClarificationParams);
  });

  it('returns parsed ClarificationResponse on success', async () => {
    mockAuthSession(mockSession);
    const responseBody = {
      questions: [
        { id: 'q1', question: 'How many servings?', type: 'number' },
        { id: 'q2', question: 'Any preferences?', type: 'text' },
      ],
      ready: false,
    };
    fetchSpy.mockResolvedValue(createJsonResponse(responseBody));

    const result = await askClarification(sampleClarificationParams);

    expect(result).toEqual(responseBody);
    expect(result.questions).toHaveLength(2);
    expect(result.ready).toBe(false);
  });

  it('throws "Not authenticated" when there is no session', async () => {
    mockAuthSession(null);

    await expect(askClarification(sampleClarificationParams)).rejects.toThrow('Not authenticated');
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it('throws with error message from response on non-ok status', async () => {
    mockAuthSession(mockSession);
    fetchSpy.mockResolvedValue(
      createJsonResponse({ error: 'Bad request: missing userInput' }, 400)
    );

    await expect(askClarification(sampleClarificationParams)).rejects.toThrow(
      'Bad request: missing userInput'
    );
  });

  it('throws with default message when error response has no error field', async () => {
    mockAuthSession(mockSession);
    fetchSpy.mockResolvedValue(createJsonResponse({}, 500));

    await expect(askClarification(sampleClarificationParams)).rejects.toThrow(
      'Failed to get clarification questions'
    );
  });
});
