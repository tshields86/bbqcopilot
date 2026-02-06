import { renderHook, act } from '@testing-library/react-native';
import { CookProvider, useCook } from '@/contexts/CookContext';
import * as api from '@/lib/api';
import type { RateLimitError } from '@/lib/types';
import { mockGrill, mockClarificationQuestions, mockRecipeData } from '../helpers/testFixtures';

// Mock dependencies
jest.mock('@/lib/api');
jest.mock('@/hooks', () => ({
  useProfile: jest.fn(() => ({ data: null })),
}));
jest.mock('posthog-react-native', () => ({
  usePostHog: jest.fn(() => ({
    capture: jest.fn(),
  })),
}));

const mockAskClarification = api.askClarification as jest.MockedFunction<
  typeof api.askClarification
>;
const mockGenerateRecipe = api.generateRecipe as jest.MockedFunction<typeof api.generateRecipe>;

// Get reference to mocked hooks
const { useProfile: mockUseProfile } = require('@/hooks') as { useProfile: jest.Mock };

function wrapper({ children }: { children: React.ReactNode }) {
  return <CookProvider>{children}</CookProvider>;
}

beforeEach(() => {
  jest.clearAllMocks();
});

// ─── Initial State ────────────────────────────────────────

describe('CookContext initial state', () => {
  it('has correct initial values', () => {
    const { result } = renderHook(() => useCook(), { wrapper });

    expect(result.current.step).toBe('input');
    expect(result.current.selectedGrill).toBeNull();
    expect(result.current.userInput).toBe('');
    expect(result.current.questions).toEqual([]);
    expect(result.current.answers).toEqual([]);
    expect(result.current.isAskingQuestions).toBe(false);
    expect(result.current.isGenerating).toBe(false);
    expect(result.current.streamedContent).toBe('');
    expect(result.current.recipe).toBeNull();
    expect(result.current.error).toBeNull();
    expect(result.current.rateLimitError).toBeNull();
  });
});

// ─── useCook outside provider ─────────────────────────────

describe('useCook outside provider', () => {
  it('throws when used outside CookProvider', () => {
    // Suppress console.error for this test
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    expect(() => {
      renderHook(() => useCook());
    }).toThrow('useCook must be used within a CookProvider');

    consoleSpy.mockRestore();
  });
});

// ─── setSelectedGrill / setUserInput ──────────────────────

describe('setSelectedGrill', () => {
  it('updates selectedGrill state', () => {
    const { result } = renderHook(() => useCook(), { wrapper });

    act(() => {
      result.current.setSelectedGrill(mockGrill);
    });

    expect(result.current.selectedGrill).toEqual(mockGrill);
  });

  it('can set grill to null', () => {
    const { result } = renderHook(() => useCook(), { wrapper });

    act(() => {
      result.current.setSelectedGrill(mockGrill);
    });
    act(() => {
      result.current.setSelectedGrill(null);
    });

    expect(result.current.selectedGrill).toBeNull();
  });
});

describe('setUserInput', () => {
  it('updates userInput state', () => {
    const { result } = renderHook(() => useCook(), { wrapper });

    act(() => {
      result.current.setUserInput('Smoke a brisket');
    });

    expect(result.current.userInput).toBe('Smoke a brisket');
  });
});

// ─── startClarification ───────────────────────────────────

describe('startClarification', () => {
  it('sets error when no grill is selected', async () => {
    const { result } = renderHook(() => useCook(), { wrapper });

    act(() => {
      result.current.setUserInput('Smoke a brisket');
    });

    await act(async () => {
      await result.current.startClarification();
    });

    expect(result.current.error).toBe('Please select a grill and enter what you want to cook');
    expect(mockAskClarification).not.toHaveBeenCalled();
  });

  it('sets error when userInput is empty', async () => {
    const { result } = renderHook(() => useCook(), { wrapper });

    act(() => {
      result.current.setSelectedGrill(mockGrill);
    });

    await act(async () => {
      await result.current.startClarification();
    });

    expect(result.current.error).toBe('Please select a grill and enter what you want to cook');
  });

  it('calls askClarification with equipment profile', async () => {
    mockAskClarification.mockResolvedValue({
      questions: mockClarificationQuestions,
      ready: false,
    });

    const { result } = renderHook(() => useCook(), { wrapper });

    act(() => {
      result.current.setSelectedGrill(mockGrill);
      result.current.setUserInput('Smoke a brisket');
    });

    await act(async () => {
      await result.current.startClarification();
    });

    expect(mockAskClarification).toHaveBeenCalledWith({
      userInput: 'Smoke a brisket',
      equipment: {
        grill: {
          name: mockGrill.name,
          brand: mockGrill.brand,
          model: mockGrill.model,
          type: mockGrill.grill_type,
        },
        accessories: mockGrill.accessories?.map((a) => ({
          name: a.name,
          type: a.accessory_type,
        })),
      },
    });
  });

  it('populates questions when ready=false', async () => {
    mockAskClarification.mockResolvedValue({
      questions: mockClarificationQuestions,
      ready: false,
    });

    const { result } = renderHook(() => useCook(), { wrapper });

    act(() => {
      result.current.setSelectedGrill(mockGrill);
      result.current.setUserInput('Smoke a brisket');
    });

    await act(async () => {
      await result.current.startClarification();
    });

    expect(result.current.step).toBe('clarifying');
    expect(result.current.questions).toEqual(mockClarificationQuestions);
    expect(result.current.isAskingQuestions).toBe(false);
  });

  it('skips to generating when ready=true', async () => {
    mockAskClarification.mockResolvedValue({
      questions: [],
      ready: true,
    });

    const { result } = renderHook(() => useCook(), { wrapper });

    act(() => {
      result.current.setSelectedGrill(mockGrill);
      result.current.setUserInput('Smoke a brisket');
    });

    await act(async () => {
      await result.current.startClarification();
    });

    expect(result.current.step).toBe('generating');
  });

  it('sets step to error on API failure', async () => {
    mockAskClarification.mockRejectedValue(new Error('Network error'));

    const { result } = renderHook(() => useCook(), { wrapper });

    act(() => {
      result.current.setSelectedGrill(mockGrill);
      result.current.setUserInput('Smoke a brisket');
    });

    await act(async () => {
      await result.current.startClarification();
    });

    expect(result.current.step).toBe('error');
    expect(result.current.error).toBe('Network error');
  });

  it('pre-populates skill_level from profile', async () => {
    // Set up profile mock BEFORE rendering
    mockUseProfile.mockReturnValue({
      data: { skill_level: 'intermediate' },
    });

    mockAskClarification.mockResolvedValue({
      questions: mockClarificationQuestions,
      ready: false,
    });

    const { result } = renderHook(() => useCook(), { wrapper });

    act(() => {
      result.current.setSelectedGrill(mockGrill);
      result.current.setUserInput('Smoke a brisket');
    });

    await act(async () => {
      await result.current.startClarification();
    });

    const skillAnswer = result.current.answers.find((a) => a.question.id === 'skill_level');
    expect(skillAnswer?.answer).toBe('Intermediate');

    // Reset mock for other tests
    mockUseProfile.mockReturnValue({ data: null });
  });
});

// ─── answerQuestion ───────────────────────────────────────

describe('answerQuestion', () => {
  it('adds a new answer', async () => {
    mockAskClarification.mockResolvedValue({
      questions: mockClarificationQuestions,
      ready: false,
    });

    const { result } = renderHook(() => useCook(), { wrapper });

    act(() => {
      result.current.setSelectedGrill(mockGrill);
      result.current.setUserInput('Smoke a brisket');
    });

    await act(async () => {
      await result.current.startClarification();
    });

    act(() => {
      result.current.answerQuestion(mockClarificationQuestions[0], 'Beginner');
    });

    expect(result.current.answers).toHaveLength(1);
    expect(result.current.answers[0].answer).toBe('Beginner');
  });

  it('updates existing answer by id', async () => {
    mockAskClarification.mockResolvedValue({
      questions: mockClarificationQuestions,
      ready: false,
    });

    const { result } = renderHook(() => useCook(), { wrapper });

    act(() => {
      result.current.setSelectedGrill(mockGrill);
      result.current.setUserInput('Smoke a brisket');
    });

    await act(async () => {
      await result.current.startClarification();
    });

    act(() => {
      result.current.answerQuestion(mockClarificationQuestions[0], 'Beginner');
    });
    act(() => {
      result.current.answerQuestion(mockClarificationQuestions[0], 'Advanced');
    });

    expect(result.current.answers).toHaveLength(1);
    expect(result.current.answers[0].answer).toBe('Advanced');
  });
});

// ─── submitAnswers ────────────────────────────────────────

describe('submitAnswers', () => {
  it('sends answers and marks ready when response.ready=true', async () => {
    mockAskClarification
      .mockResolvedValueOnce({
        questions: mockClarificationQuestions,
        ready: false,
      })
      .mockResolvedValueOnce({
        questions: [],
        ready: true,
      });

    const { result } = renderHook(() => useCook(), { wrapper });

    act(() => {
      result.current.setSelectedGrill(mockGrill);
      result.current.setUserInput('Smoke a brisket');
    });

    await act(async () => {
      await result.current.startClarification();
    });

    act(() => {
      result.current.answerQuestion(mockClarificationQuestions[0], 'Intermediate');
    });

    await act(async () => {
      await result.current.submitAnswers();
    });

    expect(result.current.step).toBe('generating');
  });

  it('appends new questions when response.ready=false', async () => {
    const moreQuestions = [
      { id: 'q3', question: 'Wood type?', type: 'choice' as const, options: ['Oak', 'Hickory'] },
    ];

    mockAskClarification
      .mockResolvedValueOnce({
        questions: mockClarificationQuestions,
        ready: false,
      })
      .mockResolvedValueOnce({
        questions: moreQuestions,
        ready: false,
      });

    const { result } = renderHook(() => useCook(), { wrapper });

    act(() => {
      result.current.setSelectedGrill(mockGrill);
      result.current.setUserInput('Smoke a brisket');
    });

    await act(async () => {
      await result.current.startClarification();
    });

    act(() => {
      result.current.answerQuestion(mockClarificationQuestions[0], 'Intermediate');
    });

    await act(async () => {
      await result.current.submitAnswers();
    });

    expect(result.current.questions).toHaveLength(4); // 3 original + 1 new
    expect(result.current.step).toBe('clarifying');
  });

  it('sets error on failure', async () => {
    mockAskClarification
      .mockResolvedValueOnce({
        questions: mockClarificationQuestions,
        ready: false,
      })
      .mockRejectedValueOnce(new Error('Submit failed'));

    const { result } = renderHook(() => useCook(), { wrapper });

    act(() => {
      result.current.setSelectedGrill(mockGrill);
      result.current.setUserInput('Smoke a brisket');
    });

    await act(async () => {
      await result.current.startClarification();
    });

    await act(async () => {
      await result.current.submitAnswers();
    });

    expect(result.current.error).toBe('Submit failed');
  });
});

// ─── generateRecipeFromAnswers ────────────────────────────

describe('generateRecipeFromAnswers', () => {
  it('sets isGenerating and step to generating', async () => {
    mockGenerateRecipe.mockImplementation(async (_, onChunk, onComplete) => {
      onChunk('{"title":"Brisket"}');
      onComplete();
    });

    const { result } = renderHook(() => useCook(), { wrapper });

    act(() => {
      result.current.setSelectedGrill(mockGrill);
      result.current.setUserInput('Smoke a brisket');
    });

    await act(async () => {
      await result.current.generateRecipeFromAnswers();
    });

    expect(result.current.step).toBe('complete');
  });

  it('accumulates streamed content', async () => {
    mockGenerateRecipe.mockImplementation(async (_, onChunk, onComplete) => {
      onChunk('{"title":');
      onChunk('"Brisket"}');
      onComplete();
    });

    const { result } = renderHook(() => useCook(), { wrapper });

    act(() => {
      result.current.setSelectedGrill(mockGrill);
      result.current.setUserInput('Smoke a brisket');
    });

    await act(async () => {
      await result.current.generateRecipeFromAnswers();
    });

    expect(result.current.streamedContent).toBe('{"title":"Brisket"}');
  });

  it('parses JSON from streamed content', async () => {
    const recipeJson = JSON.stringify(mockRecipeData);
    mockGenerateRecipe.mockImplementation(async (_, onChunk, onComplete) => {
      onChunk(recipeJson);
      onComplete();
    });

    const { result } = renderHook(() => useCook(), { wrapper });

    act(() => {
      result.current.setSelectedGrill(mockGrill);
      result.current.setUserInput('Smoke a brisket');
    });

    await act(async () => {
      await result.current.generateRecipeFromAnswers();
    });

    expect(result.current.recipe).toEqual(mockRecipeData);
    expect(result.current.step).toBe('complete');
  });

  it('handles markdown code blocks', async () => {
    const recipeJson = JSON.stringify(mockRecipeData);
    mockGenerateRecipe.mockImplementation(async (_, onChunk, onComplete) => {
      onChunk('```json\n' + recipeJson + '\n```');
      onComplete();
    });

    const { result } = renderHook(() => useCook(), { wrapper });

    act(() => {
      result.current.setSelectedGrill(mockGrill);
      result.current.setUserInput('Smoke a brisket');
    });

    await act(async () => {
      await result.current.generateRecipeFromAnswers();
    });

    expect(result.current.recipe).toEqual(mockRecipeData);
  });

  it('handles rate limit error', async () => {
    const rateLimitError: RateLimitError = {
      error: 'Rate limit exceeded',
      message: 'Monthly limit reached',
      resetDate: '2024-04-01T00:00:00Z',
      limit: 15,
      remaining: 0,
    };

    mockGenerateRecipe.mockImplementation(async (_, __, ___, onError) => {
      onError(rateLimitError);
    });

    const { result } = renderHook(() => useCook(), { wrapper });

    act(() => {
      result.current.setSelectedGrill(mockGrill);
      result.current.setUserInput('Smoke a brisket');
    });

    await act(async () => {
      await result.current.generateRecipeFromAnswers();
    });

    expect(result.current.step).toBe('error');
    expect(result.current.rateLimitError).toEqual(rateLimitError);
  });

  it('handles general error', async () => {
    mockGenerateRecipe.mockImplementation(async (_, __, ___, onError) => {
      onError(new Error('Generation failed'));
    });

    const { result } = renderHook(() => useCook(), { wrapper });

    act(() => {
      result.current.setSelectedGrill(mockGrill);
      result.current.setUserInput('Smoke a brisket');
    });

    await act(async () => {
      await result.current.generateRecipeFromAnswers();
    });

    expect(result.current.step).toBe('error');
    expect(result.current.error).toBe('Generation failed');
  });

  it('guards against double-calls', async () => {
    let callCount = 0;
    let storedOnComplete: (() => void) | null = null;

    mockGenerateRecipe.mockImplementation(async (_, onChunk, onComplete) => {
      callCount++;
      onChunk('{"title":"Brisket"}');
      // Store onComplete to call later, simulating async generation
      storedOnComplete = onComplete;
    });

    const { result } = renderHook(() => useCook(), { wrapper });

    act(() => {
      result.current.setSelectedGrill(mockGrill);
      result.current.setUserInput('Smoke a brisket');
    });

    // Call twice rapidly - the second call should be guarded by the ref
    await act(async () => {
      result.current.generateRecipeFromAnswers();
      result.current.generateRecipeFromAnswers();
    });

    // Now complete the generation
    act(() => {
      storedOnComplete?.();
    });

    expect(callCount).toBe(1);
  });

  it('captures PostHog event on successful generation', async () => {
    const { usePostHog } = require('posthog-react-native');
    const mockCapture = jest.fn();
    (usePostHog as jest.Mock).mockReturnValue({ capture: mockCapture });

    const recipeJson = JSON.stringify(mockRecipeData);
    mockGenerateRecipe.mockImplementation(async (_, onChunk, onComplete) => {
      onChunk(recipeJson);
      onComplete();
    });

    const { result } = renderHook(() => useCook(), { wrapper });

    act(() => {
      result.current.setSelectedGrill(mockGrill);
      result.current.setUserInput('Smoke a brisket');
    });

    await act(async () => {
      await result.current.generateRecipeFromAnswers();
    });

    expect(mockCapture).toHaveBeenCalledWith(
      'recipe_generated',
      expect.objectContaining({
        protein: mockRecipeData.title,
        grill_type: mockGrill.grill_type,
      })
    );
  });
});

// ─── reset ────────────────────────────────────────────────

describe('reset', () => {
  it('restores initial state', async () => {
    mockAskClarification.mockResolvedValue({
      questions: mockClarificationQuestions,
      ready: false,
    });

    const { result } = renderHook(() => useCook(), { wrapper });

    act(() => {
      result.current.setSelectedGrill(mockGrill);
      result.current.setUserInput('Smoke a brisket');
    });

    await act(async () => {
      await result.current.startClarification();
    });

    act(() => {
      result.current.reset();
    });

    expect(result.current.step).toBe('input');
    expect(result.current.selectedGrill).toBeNull();
    expect(result.current.userInput).toBe('');
    expect(result.current.questions).toEqual([]);
    expect(result.current.answers).toEqual([]);
  });
});
