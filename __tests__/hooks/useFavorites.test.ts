import { renderHook, waitFor, act } from '@testing-library/react-native';
import { useFavorites, useIsFavorite, useToggleFavorite } from '@/hooks/useFavorites';
import { supabase } from '@/lib/supabase';
import { posthog } from '@/lib/posthog';
import { createTestQueryWrapper } from '../helpers/testQueryWrapper';
import { mockAuthUser, mockSupabaseFrom } from '../helpers/mockSupabase';
import { mockRecipe, mockUser } from '../helpers/testFixtures';

beforeEach(() => {
  jest.clearAllMocks();
  mockAuthUser(mockUser);
});

describe('useFavorites', () => {
  it('fetches favorite recipes', async () => {
    mockSupabaseFrom([{ recipe: mockRecipe }]);

    const { result } = renderHook(() => useFavorites(), {
      wrapper: createTestQueryWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(supabase.from).toHaveBeenCalledWith('favorites');
  });

  it('throws when not authenticated', async () => {
    mockAuthUser(null);

    const { result } = renderHook(() => useFavorites(), {
      wrapper: createTestQueryWrapper(),
    });

    await waitFor(() => expect(result.current.isError).toBe(true));
  });
});

describe('useIsFavorite', () => {
  it('returns true when recipe is favorited', async () => {
    mockSupabaseFrom({ id: 'fav-1' });

    const { result } = renderHook(() => useIsFavorite('recipe-1'), {
      wrapper: createTestQueryWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toBe(true);
  });

  it('returns false when recipe is not favorited', async () => {
    // Simulate PGRST116 (no rows) — single() returns null data with error code
    const builder = mockSupabaseFrom(null);
    builder.single.mockResolvedValue({
      data: null,
      error: { code: 'PGRST116', message: 'No rows found' },
    });

    const { result } = renderHook(() => useIsFavorite('recipe-99'), {
      wrapper: createTestQueryWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toBe(false);
  });

  it('does not fetch when recipeId is undefined', () => {
    const { result } = renderHook(() => useIsFavorite(undefined), {
      wrapper: createTestQueryWrapper(),
    });

    expect(result.current.fetchStatus).toBe('idle');
  });
});

describe('useToggleFavorite', () => {
  it('adds favorite and captures analytics when not favorited', async () => {
    mockSupabaseFrom(null);

    const { result } = renderHook(() => useToggleFavorite(), {
      wrapper: createTestQueryWrapper(),
    });

    await act(async () => {
      result.current.mutate({ recipeId: 'recipe-1', isFavorite: false });
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(posthog.capture).toHaveBeenCalledWith('recipe_favorited', { recipe_id: 'recipe-1' });
  });

  it('removes favorite without analytics when already favorited', async () => {
    mockSupabaseFrom(null);

    const { result } = renderHook(() => useToggleFavorite(), {
      wrapper: createTestQueryWrapper(),
    });

    await act(async () => {
      result.current.mutate({ recipeId: 'recipe-1', isFavorite: true });
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(posthog.capture).not.toHaveBeenCalled();
  });

  it('returns the new favorite state', async () => {
    mockSupabaseFrom(null);

    const { result } = renderHook(() => useToggleFavorite(), {
      wrapper: createTestQueryWrapper(),
    });

    await act(async () => {
      result.current.mutate({ recipeId: 'recipe-1', isFavorite: false });
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toBe(true); // toggled from false to true
  });
});
