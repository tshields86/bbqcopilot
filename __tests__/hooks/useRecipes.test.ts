import { renderHook, waitFor, act } from '@testing-library/react-native';
import { useRecipes, useRecipe, useSaveRecipe, useDeleteRecipe } from '@/hooks/useRecipes';
import { supabase } from '@/lib/supabase';
import { posthog } from '@/lib/posthog';
import { createTestQueryWrapper } from '../helpers/testQueryWrapper';
import { mockAuthUser, mockSupabaseFrom } from '../helpers/mockSupabase';
import { mockRecipe, mockRecipe2, mockRecipeData, mockUser } from '../helpers/testFixtures';

beforeEach(() => {
  jest.clearAllMocks();
  mockAuthUser(mockUser);
});

describe('useRecipes', () => {
  it('fetches recipes sorted by date', async () => {
    mockSupabaseFrom([mockRecipe, mockRecipe2]);

    const { result } = renderHook(() => useRecipes(), {
      wrapper: createTestQueryWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(supabase.from).toHaveBeenCalledWith('recipes');
    expect(result.current.data).toEqual([mockRecipe, mockRecipe2]);
  });

  it('throws when not authenticated', async () => {
    mockAuthUser(null);

    const { result } = renderHook(() => useRecipes(), {
      wrapper: createTestQueryWrapper(),
    });

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.error?.message).toBe('Not authenticated');
  });
});

describe('useRecipe', () => {
  it('fetches a single recipe by ID', async () => {
    const builder = mockSupabaseFrom(mockRecipe);

    const { result } = renderHook(() => useRecipe('recipe-1'), {
      wrapper: createTestQueryWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual(mockRecipe);
  });

  it('does not fetch when id is undefined', () => {
    const { result } = renderHook(() => useRecipe(undefined), {
      wrapper: createTestQueryWrapper(),
    });

    expect(result.current.fetchStatus).toBe('idle');
  });
});

describe('useSaveRecipe', () => {
  it('saves a recipe and captures analytics', async () => {
    mockSupabaseFrom(mockRecipe);

    const { result } = renderHook(() => useSaveRecipe(), {
      wrapper: createTestQueryWrapper(),
    });

    await act(async () => {
      result.current.mutate({
        title: 'Smoked Brisket',
        recipeData: mockRecipeData,
        grillId: 'grill-1',
      });
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(posthog.capture).toHaveBeenCalledWith('recipe_saved', { recipe_id: 'recipe-1' });
  });

  it('throws when not authenticated', async () => {
    mockAuthUser(null);

    const { result } = renderHook(() => useSaveRecipe(), {
      wrapper: createTestQueryWrapper(),
    });

    await act(async () => {
      result.current.mutate({
        title: 'Test',
        recipeData: mockRecipeData,
      });
    });

    await waitFor(() => expect(result.current.isError).toBe(true));
  });
});

describe('useDeleteRecipe', () => {
  it('optimistically removes recipe from cache', async () => {
    // Pre-populate cache with recipes
    const wrapper = createTestQueryWrapper();
    const { result: listResult } = renderHook(() => useRecipes(), { wrapper });

    // Mock initial fetch
    mockSupabaseFrom([mockRecipe, mockRecipe2]);
    await waitFor(() => expect(listResult.current.isSuccess).toBe(true));

    // Now mock successful delete
    mockSupabaseFrom(null);

    const { result: deleteResult } = renderHook(() => useDeleteRecipe(), { wrapper });

    await act(async () => {
      deleteResult.current.mutate('recipe-1');
    });

    await waitFor(() => expect(deleteResult.current.isSuccess).toBe(true));
  });
});
