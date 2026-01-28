import { createContext, useContext, useState, useCallback, useRef, type ReactNode } from 'react';
import { generateRecipe, askClarification } from '@/lib/api';
import type { Grill, RecipeData, ClarificationQuestion, RateLimitError } from '@/lib/types';

interface ClarificationAnswer {
  question: ClarificationQuestion;
  answer: string;
}

interface CookState {
  // Step tracking
  step: 'input' | 'clarifying' | 'generating' | 'complete' | 'error';

  // Input
  selectedGrill: Grill | null;
  userInput: string;

  // Clarification
  questions: ClarificationQuestion[];
  answers: ClarificationAnswer[];
  isAskingQuestions: boolean;

  // Generation
  isGenerating: boolean;
  streamedContent: string;
  recipe: RecipeData | null;

  // Errors
  error: string | null;
  rateLimitError: RateLimitError | null;
}

interface CookContextValue extends CookState {
  // Actions
  setSelectedGrill: (grill: Grill | null) => void;
  setUserInput: (input: string) => void;
  startClarification: () => Promise<void>;
  answerQuestion: (question: ClarificationQuestion, answer: string) => void;
  submitAnswers: () => Promise<void>;
  generateRecipeFromAnswers: () => Promise<void>;
  reset: () => void;
}

const initialState: CookState = {
  step: 'input',
  selectedGrill: null,
  userInput: '',
  questions: [],
  answers: [],
  isAskingQuestions: false,
  isGenerating: false,
  streamedContent: '',
  recipe: null,
  error: null,
  rateLimitError: null,
};

const CookContext = createContext<CookContextValue | null>(null);

export function CookProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<CookState>(initialState);
  // Ref to track generation in progress - more reliable than checking state in closures
  const isGeneratingRef = useRef(false);

  const setSelectedGrill = useCallback((grill: Grill | null) => {
    setState((prev) => ({ ...prev, selectedGrill: grill }));
  }, []);

  const setUserInput = useCallback((input: string) => {
    setState((prev) => ({ ...prev, userInput: input }));
  }, []);

  const buildEquipmentProfile = useCallback(() => {
    if (!state.selectedGrill) {
      throw new Error('No grill selected');
    }

    return {
      grill: {
        name: state.selectedGrill.name,
        brand: state.selectedGrill.brand || '',
        model: state.selectedGrill.model || '',
        type: state.selectedGrill.grill_type,
      },
      accessories: (state.selectedGrill.accessories || []).map((a) => ({
        name: a.name,
        type: a.accessory_type,
      })),
    };
  }, [state.selectedGrill]);

  const startClarification = useCallback(async () => {
    if (!state.selectedGrill || !state.userInput.trim()) {
      setState((prev) => ({ ...prev, error: 'Please select a grill and enter what you want to cook' }));
      return;
    }

    setState((prev) => ({
      ...prev,
      step: 'clarifying',
      isAskingQuestions: true,
      error: null,
      rateLimitError: null,
    }));

    try {
      const equipment = buildEquipmentProfile();
      const response = await askClarification({
        userInput: state.userInput,
        equipment,
      });

      if (response.ready) {
        // No clarification needed, go directly to generation
        setState((prev) => ({
          ...prev,
          isAskingQuestions: false,
          step: 'generating',
        }));
        // Will trigger generation
      } else {
        setState((prev) => ({
          ...prev,
          isAskingQuestions: false,
          questions: response.questions,
        }));
      }
    } catch (error) {
      setState((prev) => ({
        ...prev,
        isAskingQuestions: false,
        step: 'error',
        error: error instanceof Error ? error.message : 'Failed to get clarification questions',
      }));
    }
  }, [state.selectedGrill, state.userInput, buildEquipmentProfile]);

  const answerQuestion = useCallback((question: ClarificationQuestion, answer: string) => {
    setState((prev) => {
      const existingIndex = prev.answers.findIndex((a) => a.question.id === question.id);
      const newAnswers = [...prev.answers];

      if (existingIndex >= 0) {
        newAnswers[existingIndex] = { question, answer };
      } else {
        newAnswers.push({ question, answer });
      }

      return { ...prev, answers: newAnswers };
    });
  }, []);

  const submitAnswers = useCallback(async () => {
    setState((prev) => ({ ...prev, isAskingQuestions: true }));

    try {
      const equipment = buildEquipmentProfile();
      const existingAnswers = state.answers.map((a) => ({
        question: a.question.question,
        answer: a.answer,
      }));

      const response = await askClarification({
        userInput: state.userInput,
        equipment,
        existingAnswers,
      });

      if (response.ready) {
        // Ready to generate
        setState((prev) => ({
          ...prev,
          isAskingQuestions: false,
          step: 'generating',
        }));
      } else {
        // More questions
        setState((prev) => ({
          ...prev,
          isAskingQuestions: false,
          questions: [...prev.questions, ...response.questions],
        }));
      }
    } catch (error) {
      setState((prev) => ({
        ...prev,
        isAskingQuestions: false,
        error: error instanceof Error ? error.message : 'Failed to submit answers',
      }));
    }
  }, [state.userInput, state.answers, buildEquipmentProfile]);

  const generateRecipeFromAnswers = useCallback(async () => {
    // Guard against double-calls using ref for reliable state
    if (isGeneratingRef.current) {
      return;
    }
    isGeneratingRef.current = true;

    setState((prev) => ({
      ...prev,
      step: 'generating',
      isGenerating: true,
      streamedContent: '',
      error: null,
      rateLimitError: null,
    }));

    try {
      const equipment = buildEquipmentProfile();
      const clarifications = state.answers.map((a) => ({
        question: a.question.question,
        answer: a.answer,
      }));

      await generateRecipe(
        {
          equipment,
          request: state.userInput,
          clarifications,
        },
        // onChunk
        (text) => {
          setState((prev) => ({
            ...prev,
            streamedContent: prev.streamedContent + text,
          }));
        },
        // onComplete
        () => {
          isGeneratingRef.current = false;
          setState((prev) => {
            // Try to parse the streamed content as JSON
            let recipe: RecipeData | null = null;
            try {
              // Find JSON in the response (handle markdown code blocks)
              const jsonMatch = prev.streamedContent.match(/```json\s*([\s\S]*?)```/) ||
                               prev.streamedContent.match(/({[\s\S]*})/);
              if (jsonMatch) {
                recipe = JSON.parse(jsonMatch[1]);
              }
            } catch {
              // If parsing fails, we'll show the raw content
            }

            return {
              ...prev,
              isGenerating: false,
              step: 'complete',
              recipe,
            };
          });
        },
        // onError
        (error) => {
          isGeneratingRef.current = false;
          if ('error' in error && error.error === 'Rate limit exceeded') {
            setState((prev) => ({
              ...prev,
              isGenerating: false,
              step: 'error',
              rateLimitError: error as RateLimitError,
            }));
          } else {
            setState((prev) => ({
              ...prev,
              isGenerating: false,
              step: 'error',
              error: error instanceof Error ? error.message : 'Failed to generate recipe',
            }));
          }
        }
      );
    } catch (error) {
      isGeneratingRef.current = false;
      setState((prev) => ({
        ...prev,
        isGenerating: false,
        step: 'error',
        error: error instanceof Error ? error.message : 'Failed to generate recipe',
      }));
    }
  }, [state.userInput, state.answers, buildEquipmentProfile]);

  const reset = useCallback(() => {
    isGeneratingRef.current = false;
    setState(initialState);
  }, []);

  return (
    <CookContext.Provider
      value={{
        ...state,
        setSelectedGrill,
        setUserInput,
        startClarification,
        answerQuestion,
        submitAnswers,
        generateRecipeFromAnswers,
        reset,
      }}
    >
      {children}
    </CookContext.Provider>
  );
}

export function useCook() {
  const context = useContext(CookContext);
  if (!context) {
    throw new Error('useCook must be used within a CookProvider');
  }
  return context;
}
