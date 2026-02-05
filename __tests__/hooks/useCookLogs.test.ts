import { renderHook, waitFor, act } from '@testing-library/react-native';
import {
  useCookLogs,
  useCookLog,
  useCookLogsForRecipe,
  useCreateCookLog,
  useUpdateCookLog,
  useDeleteCookLog,
  getAverageRating,
} from '@/hooks/useCookLogs';
import { supabase } from '@/lib/supabase';
import { createTestQueryWrapper } from '../helpers/testQueryWrapper';
import { mockAuthUser, mockSupabaseFrom } from '../helpers/mockSupabase';
import {
  mockCookLog,
  mockCookLog2,
  mockCookLogNoRating,
  mockUser,
} from '../helpers/testFixtures';

beforeEach(() => {
  jest.clearAllMocks();
  mockAuthUser(mockUser);
});

// ─── Pure helper ─────────────────────────────────────────

describe('getAverageRating', () => {
  it('returns null for empty array', () => {
    expect(getAverageRating([])).toBeNull();
  });

  it('returns null when all ratings are null', () => {
    expect(getAverageRating([mockCookLogNoRating])).toBeNull();
  });

  it('calculates average for rated logs', () => {
    expect(getAverageRating([mockCookLog, mockCookLog2])).toBe(4.5);
  });

  it('ignores null ratings in average', () => {
    expect(getAverageRating([mockCookLog, mockCookLogNoRating])).toBe(4);
  });
});

// ─── Query hooks ─────────────────────────────────────────

describe('useCookLogs', () => {
  it('fetches all cook logs', async () => {
    mockSupabaseFrom([mockCookLog, mockCookLog2]);

    const { result } = renderHook(() => useCookLogs(), {
      wrapper: createTestQueryWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(supabase.from).toHaveBeenCalledWith('cook_logs');
    expect(result.current.data).toEqual([mockCookLog, mockCookLog2]);
  });

  it('throws when not authenticated', async () => {
    mockAuthUser(null);

    const { result } = renderHook(() => useCookLogs(), {
      wrapper: createTestQueryWrapper(),
    });

    await waitFor(() => expect(result.current.isError).toBe(true));
  });
});

describe('useCookLog', () => {
  it('fetches a single cook log by ID', async () => {
    mockSupabaseFrom(mockCookLog);

    const { result } = renderHook(() => useCookLog('log-1'), {
      wrapper: createTestQueryWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual(mockCookLog);
  });

  it('does not fetch when id is undefined', () => {
    const { result } = renderHook(() => useCookLog(undefined), {
      wrapper: createTestQueryWrapper(),
    });

    expect(result.current.fetchStatus).toBe('idle');
  });
});

describe('useCookLogsForRecipe', () => {
  it('fetches cook logs filtered by recipe ID', async () => {
    mockSupabaseFrom([mockCookLog, mockCookLog2]);

    const { result } = renderHook(() => useCookLogsForRecipe('recipe-1'), {
      wrapper: createTestQueryWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual([mockCookLog, mockCookLog2]);
  });

  it('does not fetch when recipeId is undefined', () => {
    const { result } = renderHook(() => useCookLogsForRecipe(undefined), {
      wrapper: createTestQueryWrapper(),
    });

    expect(result.current.fetchStatus).toBe('idle');
  });
});

// ─── Mutation hooks ──────────────────────────────────────

describe('useCreateCookLog', () => {
  it('creates a cook log', async () => {
    mockSupabaseFrom(mockCookLog);

    const { result } = renderHook(() => useCreateCookLog(), {
      wrapper: createTestQueryWrapper(),
    });

    await act(async () => {
      result.current.mutate({
        recipeId: 'recipe-1',
        rating: 4,
        notes: 'Great cook!',
      });
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
  });
});

describe('useUpdateCookLog', () => {
  it('updates a cook log', async () => {
    mockSupabaseFrom({ ...mockCookLog, rating: 5 });

    const { result } = renderHook(() => useUpdateCookLog(), {
      wrapper: createTestQueryWrapper(),
    });

    await act(async () => {
      result.current.mutate({ id: 'log-1', rating: 5 });
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
  });
});

describe('useDeleteCookLog', () => {
  it('deletes a cook log', async () => {
    mockSupabaseFrom(null);

    const { result } = renderHook(() => useDeleteCookLog(), {
      wrapper: createTestQueryWrapper(),
    });

    await act(async () => {
      result.current.mutate('log-1');
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
  });
});
