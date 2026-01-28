import { supabase } from './supabase';
import type { RateLimitError } from './types';

const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL!;
const SUPABASE_ANON_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!;

/**
 * Check if an error is a rate limit error
 */
export function isRateLimitError(error: unknown): error is RateLimitError {
  return (
    typeof error === 'object' &&
    error !== null &&
    'error' in error &&
    (error as RateLimitError).error === 'Rate limit exceeded'
  );
}

/**
 * Format a reset date for display
 */
export function formatResetDate(resetDate: string): string {
  const date = new Date(resetDate);
  return date.toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
  });
}

/**
 * Get the authorization header for API calls
 */
export async function getAuthHeader(): Promise<string | null> {
  const {
    data: { session },
  } = await supabase.auth.getSession();
  return session?.access_token ? `Bearer ${session.access_token}` : null;
}

interface GenerateRecipeParams {
  equipment: {
    grill: {
      name: string;
      brand: string;
      model: string;
      type: string;
    };
    accessories: Array<{
      name: string;
      type: string;
    }>;
  };
  request: string;
  clarifications: Array<{
    question: string;
    answer: string;
  }>;
  preferences?: {
    skillLevel?: string;
    timeAvailable?: string;
    servings?: number;
    flavorProfile?: string;
  };
}

/**
 * Call the generate-recipe Edge Function with streaming
 */
export async function generateRecipe(
  params: GenerateRecipeParams,
  onChunk: (text: string) => void,
  onComplete: () => void,
  onError: (error: Error | RateLimitError) => void
): Promise<void> {
  const authHeader = await getAuthHeader();

  if (!authHeader) {
    onError(new Error('Not authenticated'));
    return;
  }

  try {
    const response = await fetch(`${SUPABASE_URL}/functions/v1/generate-recipe`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: authHeader,
        apikey: SUPABASE_ANON_KEY,
      },
      body: JSON.stringify(params),
    });

    if (!response.ok) {
      const errorData = await response.json();
      if (isRateLimitError(errorData)) {
        onError(errorData);
        return;
      }
      throw new Error(errorData.error || 'Failed to generate recipe');
    }

    const reader = response.body?.getReader();
    if (!reader) {
      throw new Error('No response body');
    }

    const decoder = new TextDecoder();

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const chunk = decoder.decode(value);
      const lines = chunk.split('\n');

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const data = line.slice(6);
          if (data === '[DONE]') {
            onComplete();
            return;
          }
          try {
            const parsed = JSON.parse(data);
            if (parsed.text) {
              onChunk(parsed.text);
            }
          } catch {
            // Ignore parse errors for partial chunks
          }
        }
      }
    }

    onComplete();
  } catch (error) {
    onError(error instanceof Error ? error : new Error('Unknown error'));
  }
}

interface AskClarificationParams {
  userInput: string;
  equipment: {
    grill: {
      name: string;
      brand: string;
      model: string;
      type: string;
    };
    accessories: Array<{
      name: string;
      type: string;
    }>;
  };
  existingAnswers?: Array<{
    question: string;
    answer: string;
  }>;
}

interface ClarificationResponse {
  questions: Array<{
    id: string;
    question: string;
    type: 'choice' | 'text' | 'number';
    options?: string[];
  }>;
  ready: boolean;
}

/**
 * Call the ask-clarification Edge Function
 */
export async function askClarification(
  params: AskClarificationParams
): Promise<ClarificationResponse> {
  const authHeader = await getAuthHeader();

  if (!authHeader) {
    throw new Error('Not authenticated');
  }

  const response = await fetch(`${SUPABASE_URL}/functions/v1/ask-clarification`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: authHeader,
      apikey: SUPABASE_ANON_KEY,
    },
    body: JSON.stringify(params),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'Failed to get clarification questions');
  }

  return response.json();
}
